import os
import argparse
import re
import subprocess
import google.generativeai as genai
from github import Github

def get_git_tags():
    """Returns a list of all git tags, sorted by date."""
    tags = subprocess.check_output(
        ["git", "tag", "--sort=-creatordate"]
    ).decode("utf-8").split()
    return tags

def get_full_commit_messages(from_ref, to_ref):
    """Returns the full git log messages between two git refs."""
    # Using --pretty=fuller to get the full message and author details
    return subprocess.check_output(
        ["git", "log", f"{from_ref}..{to_ref}", "--pretty=fuller"]
    ).decode("utf-8")

def generate_release_notes(
    github_token, gemini_api_key, repo_name, current_tag, previous_tag
):
    """
    Generates release notes using Gemini AI by synthesizing information from PRs and linked issues.

    Args:
        github_token: The GitHub token to use for API calls.
        gemini_api_key: The Gemini API key.
        repo_name: The name of the repository.
        current_tag: The current git tag.
        previous_tag: The previous git tag.

    Returns:
        The generated release notes as a string.
    """
    g = Github(github_token)
    repo = g.get_repo(repo_name)

    # Get full commit messages for better context, especially for breaking changes
    full_log = get_full_commit_messages(previous_tag, current_tag)
    pr_and_issue_details = []

    # Regex to find "Merge pull request #<number>"
    pr_merge_commit_pattern = re.compile(r'Merge pull request #(\d+)')

    # Find PR numbers from the full log
    for commit_match in pr_merge_commit_pattern.finditer(full_log):
        pr_number = int(commit_match.group(1))
        try:
            pr = repo.get_pull(pr_number)
            pr_body = pr.body if pr.body else ""
            
            # Start building details for this PR
            details_for_pr = f"- PR #{pr.number}: {pr.title} ({pr.html_url})\n  Body: {pr_body}\n"
            
            # Find and fetch linked issues from the PR body (e.g., "closes #123")
            issue_numbers = re.findall(r'(?:closes|fixes|resolves) #(\d+)', pr_body, re.IGNORECASE)
            if issue_numbers:
                details_for_pr += "  Linked Issues:\n"
                for issue_num_str in set(issue_numbers): # Use set to avoid duplicates
                    issue_num = int(issue_num_str)
                    try:
                        issue = repo.get_issue(number=issue_num)
                        details_for_pr += f"    - Issue #{issue.number}: {issue.title} ({issue.html_url})\n"
                    except Exception as e:
                        print(f"Could not fetch issue #{issue_num}: {e}")
            pr_and_issue_details.append(details_for_pr)

        except Exception as e:
            print(f"Could not fetch PR #{pr_number}: {e}")

    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    prompt = f"""
    You are an expert technical writer for the project {repo.name}.
    Your goal is to generate insightful, human-readable release notes for version {current_tag}, based on changes since {previous_tag}.
    Do not just list commit messages. Synthesize the information from the provided pull requests and issues into a coherent narrative.

    First, write a high-level summary of the release in a paragraph or two. What was the main focus? What are the key takeaways for users?

    Then, generate the detailed notes.

    Here is the detailed information about pull requests and their linked issues. This is your primary source of information:
    {''.join(pr_and_issue_details) if pr_and_issue_details else "No pull request details found."}

    Here is the raw commit log. Use this as a secondary source, primarily to identify breaking changes (look for "BREAKING CHANGE:" in footers) or to find changes not associated with a pull request.
    {full_log}

    **Output Format Rules:**
    1.  Start with the high-level summary paragraph.
    2.  After the summary, use the following markdown structure for the detailed changes. The order MUST be precise:
        - ### 💥 Breaking Changes
        - ### 🚀 New Features
        - ### 🐛 Bug Fixes
        - ### 🛠️ Other Changes
    3.  If a section has no relevant changes, omit the section and its header entirely.
    4.  Each bullet point should be a user-friendly description of a change.
    5.  **Crucially, end each bullet point with a markdown link to the relevant PR or Issue, like `(#123)` or `(PR #456)`. Prioritize linking to issues if they are available.**
    6.  Do NOT include commit SHAs or any generic text like "various commits".
    """

    print("Generating release notes with Gemini...")
    response = model.generate_content(prompt)
    return response.text


def create_github_release(github_token, repo_name, tag, release_notes):
    """
    Creates a new release on GitHub.

    Args:
        github_token: The GitHub token to use for API calls.
        repo_name: The name of the repository.
        tag: The git tag to create the release for.
        release_notes: The release notes to include in the release.
    """
    g = Github(github_token)
    repo = g.get_repo(repo_name)
    repo.create_git_release(
        tag=tag,
        name=f"Release {tag}",
        message=release_notes,
        prerelease=False
    )
    print(f"Successfully created release for tag {tag}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate release notes using Gemini AI.")
    parser.add_argument("--token", required=True, help="GitHub token")
    parser.add_argument("--gemini-api-key", required=True, help="Gemini API Key")
    args = parser.parse_args()

    repo_name = os.environ["GITHUB_REPOSITORY"]
    current_tag = os.environ["GITHUB_REF"].split("/")[-1]
    tags = get_git_tags()

    if len(tags) > 1:
        # The most recent tag is at index 0, so the previous one is at index 1
        previous_tag = tags[1]
    else:
        # If there's only one tag, get all commits from the beginning (initial commit)
        previous_tag = subprocess.check_output(
            ["git", "rev-list", "--max-parents=0", "HEAD"]
        ).decode("utf-8").strip()

    release_notes = generate_release_notes(
        args.token, args.gemini_api_key, repo_name, current_tag, previous_tag
    )
    print("\n--- Generated Release Notes ---\n")
    print(release_notes)
    print("\n-------------------------------\n")

    create_github_release(args.token, repo_name, current_tag, release_notes)
