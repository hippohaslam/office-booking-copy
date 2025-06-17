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

def get_full_commit_messages(from_ref, to_ref, no_merges=False):
    """
    Returns a list of full git log messages between two git refs.
    Each message is a separate element in the list.
    """
    # Use %B to get the full raw body of the commit.
    # Use %x00 (the null byte) as a unique, unambiguous separator.
    command = ["git", "log", f"{from_ref}..{to_ref}", "--pretty=format:%B%x00"]
    if no_merges:
        command.append("--no-merges")
    
    output = subprocess.check_output(command).decode("utf-8")
    # Split the output by the null byte and filter out any empty strings.
    return [msg for msg in output.split("\x00") if msg.strip()]

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
    handled_issue_numbers = set()

    # --- 1. Get data from Pull Requests and their linked issues ---
    # We still need the fuller log to find merge commits by their titles
    full_log_with_merges = get_full_commit_messages(previous_tag, current_tag)
    pr_and_issue_details = []
    pr_merge_commit_pattern = re.compile(r'Merge pull request #(\d+)')
    
    # We search the full log text for PR merge commits
    for commit_message in full_log_with_merges:
        match = pr_merge_commit_pattern.search(commit_message)
        if match:
            pr_number = int(match.group(1))
            try:
                pr = repo.get_pull(pr_number)
                pr_body = pr.body if pr.body else ""
                details_for_pr = f"- PR #{pr.number}: {pr.title} ({pr.html_url})\n  Body: {pr_body}\n"
                
                issue_numbers = re.findall(r'(?:closes|fixes|resolves) #(\d+)', pr_body, re.IGNORECASE)
                if issue_numbers:
                    details_for_pr += "  Linked Issues:\n"
                    for issue_num_str in set(issue_numbers):
                        issue_num = int(issue_num_str)
                        handled_issue_numbers.add(issue_num) # Mark issue as handled
                        try:
                            issue = repo.get_issue(number=issue_num)
                            issue_body = issue.body if issue.body else ""
                            details_for_pr += f"    - Issue #{issue.number}: {issue.title} ({issue.html_url})\n      Body: {issue_body}\n"
                        except Exception as e:
                            print(f"Could not fetch issue #{issue_num} from PR: {e}")
                pr_and_issue_details.append(details_for_pr)
            except Exception as e:
                print(f"Could not fetch PR #{pr_number}: {e}")

    # --- 2. Get data from standalone commits linked to issues ---
    direct_commit_issue_details = []
    non_merge_commit_log = get_full_commit_messages(previous_tag, current_tag, no_merges=True)
    
    # Combine the text of non-merge commits to search for issue numbers
    non_merge_text = "\n".join(non_merge_commit_log)
    issue_numbers_in_commits = re.findall(r'#(\d+)', non_merge_text)
    
    unhandled_issue_nums = set(map(int, issue_numbers_in_commits)) - handled_issue_numbers
    
    if unhandled_issue_nums:
        details_for_prompt = ""
        for issue_num in unhandled_issue_nums:
            try:
                issue = repo.get_issue(number=issue_num)
                issue_body = issue.body if issue.body else ""
                details_for_prompt += f"- Standalone commit links to Issue #{issue.number}: {issue.title} ({issue.html_url})\n  Body: {issue_body}\n"
            except Exception as e:
                print(f"Could not fetch issue #{issue_num} from commit: {e}")
        if details_for_prompt:
             direct_commit_issue_details.append(details_for_prompt)


    # --- 3. Generate the prompt for the AI ---
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    # Format the raw commit log for better presentation to the AI
    formatted_secondary_data = "\n---\n".join(non_merge_commit_log)


    prompt = f"""
    You are an expert technical writer for the project {repo.name}.
    Your goal is to generate insightful, human-readable release notes for version {current_tag}.

    **Core Task:** Synthesize all provided information into a coherent narrative. Start with a high-level summary paragraph, then provide categorized details.

    **Primary Data (from Pull Requests):**
    {''.join(pr_and_issue_details) if pr_and_issue_details else "No data from pull requests."}

    **Primary Data (from Commits Linked to Issues):**
    {''.join(direct_commit_issue_details) if direct_commit_issue_details else "No data from standalone commits."}

    **Secondary Data (Raw log for context ONLY, e.g., identifying breaking changes. Do NOT quote from it):**
    {formatted_secondary_data}

    **Critical Output Rules:**
    1.  **Summary First:** Begin with a high-level summary of the release in one or two paragraphs.
    2.  **Strict Categories:** After the summary, use this exact markdown structure. Omit any empty sections:
        - ### Breaking Changes
        - ### New Features
        - ### Bug Fixes
        - ### Other Changes
    3.  **No Commit-Speak:** You are strictly forbidden from using phrases like "[various commits]" or mentioning commit SHAs. All output must be user-friendly.
    4.  **Bullet Point Format:** Each bullet point MUST start with a bolded, concise summary of the change, followed by a more detailed explanation of the change and its impact. For example: `* **Improved User Onboarding:** The sign-up process has been streamlined to require fewer steps, making it easier for new users to get started. (#123)`
    5.  **Link Everything:** Every bullet point MUST end with a markdown link to the relevant Issue or Pull Request, like `(#123)`. Prioritize linking to Issues if they are available.
    """

    # Log the full prompt being sent to the AI for debugging purposes
    print("\n" + "="*80)
    print("PROMPT BEING SENT TO GEMINI:")
    print("="*80)
    print(prompt)
    print("="*80 + "\n")


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
