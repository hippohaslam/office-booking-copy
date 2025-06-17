import os
import argparse
import re
import subprocess
import google.generativeai as genai
from github import Github

def get_git_tags():
    """
    Returns a list of all git tags, sorted by version number in descending order.
    Pre-release tags (e.g., alpha, beta, rc) are filtered out.
    """
    # Use --sort=-v:refname to sort by version number (e.g., v1.10.0 comes before v1.2.0)
    all_tags = subprocess.check_output(
        ["git", "tag", "--sort=-v:refname"]
    ).decode("utf-8").split()
    
    # Filter out pre-release tags (alpha, beta, rc, etc.)
    stable_tags = [
        tag for tag in all_tags 
        if not any(prerelease in tag for prerelease in ["alpha", "beta", "rc"])
    ]
    
    return stable_tags

def get_full_commit_messages(from_ref, to_ref, no_merges=False):
    """
    Returns a list of full git log messages between two git refs.
    Each message is a separate element in the list.
    Routine dependency updates are filtered out unless they contain 'BREAKING CHANGE'.
    """
    # Use %B to get the full raw body of the commit.
    # Use %x00 (the null byte) as a unique, unambiguous separator.
    command = ["git", "log", f"{from_ref}..{to_ref}", "--pretty=format:%B%x00"]
    if no_merges:
        command.append("--no-merges")
    
    output = subprocess.check_output(command).decode("utf-8")
    all_messages = [msg.strip() for msg in output.split("\x00") if msg.strip()]

    # Patterns for commits that are typically just noise in release notes.
    ignore_patterns = [
        re.compile(r'^(chore|ci|build)\(deps\):', re.IGNORECASE), # Conventional commit for deps
        re.compile(r'^Update dependency', re.IGNORECASE),       # Common dep update message
        re.compile(r'bump .* from', re.IGNORECASE),              # Dependabot/Renovate style
        re.compile(r'\[dependabot skip\]', re.IGNORECASE),     # Dependabot skip flag
        re.compile(r'^Merge branch', re.IGNORECASE)              # Merge commits that aren't PRs
    ]

    filtered_messages = []
    for msg in all_messages:
        # If a message is a breaking change, always include it.
        if 'BREAKING CHANGE' in msg:
            filtered_messages.append(msg)
            continue
        
        # Check if the message matches any of the ignore patterns.
        is_ignorable = any(pattern.search(msg) for pattern in ignore_patterns)
        
        if not is_ignorable:
            filtered_messages.append(msg)

    return filtered_messages

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

    # --- 1. Get data from Pull Requests and their linked issues from GitHub API ---
    full_log_with_merges = get_full_commit_messages(previous_tag, current_tag)
    pr_and_issue_details = []
    pr_merge_commit_pattern = re.compile(r'Merge pull request #(\d+)')
    issue_link_pattern = re.compile(r'(?:closes|fixes|resolves)\s+#(\d+)', re.IGNORECASE)
    
    for commit_message in full_log_with_merges:
        match = pr_merge_commit_pattern.search(commit_message)
        if match:
            pr_number = int(match.group(1))
            try:
                pr = repo.get_pull(pr_number)
                pr_body = pr.body if pr.body else ""
                details_for_pr = f"- PR #{pr.number}: {pr.title} ({pr.html_url})\n  Body: {pr_body}\n"
                
                issue_matches = issue_link_pattern.finditer(pr_body)
                if issue_matches:
                    details_for_pr += "  Linked Issues:\n"
                    for issue_match in issue_matches:
                        issue_num = int(issue_match.group(1))
                        handled_issue_numbers.add(issue_num)
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
    generic_issue_pattern = re.compile(r'#(\d+)')

    for commit_message in non_merge_commit_log:
        # Find all issue numbers mentioned in the commit message
        issue_matches = generic_issue_pattern.finditer(commit_message)
        for match in issue_matches:
            issue_num = int(match.group(1))
            if issue_num not in handled_issue_numbers:
                details = ""
                try:
                    # Try to fetch the issue from GitHub for rich details
                    issue = repo.get_issue(number=issue_num)
                    issue_body = issue.body if issue.body else ""
                    details = f"- Standalone commit links to Issue #{issue.number}: {issue.title} ({issue.html_url})\n  Commit Message: {commit_message.splitlines()[0]}\n  Issue Body: {issue_body}\n"
                except Exception as e:
                    # If issue can't be fetched (e.g., historical), use the commit message itself
                    print(f"Could not fetch issue #{issue_num} from GitHub (it may be historical): {e}")
                    details = f"- Standalone commit (unlinked) refers to issue #{issue_num}\n  Commit Message: {commit_message}\n"
                
                direct_commit_issue_details.append(details)
                handled_issue_numbers.add(issue_num) # Mark as handled

    # --- 3. Generate the prompt for the AI ---
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    formatted_commit_data = "\n---\n".join(non_merge_commit_log)

    prompt = f"""
    You are an expert technical writer for the project {repo.name}.
    Your goal is to generate insightful, human-readable release notes for version {current_tag}.

    **Core Task:** Synthesize ALL of the information provided below into a coherent narrative. Start with a high-level summary paragraph, then provide categorized details.

    **Source of Information:**
    Below is a comprehensive list of changes for this release. It includes detailed information for Pull Requests found on GitHub, as well as the raw commit log for historical changes that may not exist on the GitHub API. You should use ALL provided sources to build the release notes.

    **Data from GitHub (Pull Requests & Linked Issues):**
    {''.join(pr_and_issue_details) if pr_and_issue_details else "No pull requests with linked issues were found on GitHub."}
    
    **Data from Commits Linked Directly to Issues (may be on GitHub or historical):**
    {''.join(direct_commit_issue_details) if direct_commit_issue_details else "No standalone commits linking to issues were found."}

    **Data from Git History (Raw Commit Messages for additional context and changes without linked issues):**
    --- START OF RAW COMMIT LOG ---
    {formatted_commit_data}
    --- END OF RAW COMMIT LOG ---

    **Critical Output Rules:**
    1.  **NO EMPTY SECTIONS:** This is the most important rule. If a category like "Bug Fixes" or "Breaking Changes" has no relevant items, you MUST NOT include its header in the final output. Your response should only contain headers for categories that have at least one bullet point.
    2.  **IDENTIFYING BREAKING CHANGES:** A breaking change should only be identified if a commit message explicitly contains the text `BREAKING CHANGE:`. Do not invent breaking changes. If none exist, omit the "Breaking Changes" section entirely as per Rule #1.
    3.  **IGNORE TRIVIAL UPDATES:** Do not include routine dependency updates (e.g., "chore(deps): update dependency...", "bump package from...") or merge commits in the release notes unless they are part of a significant `BREAKING CHANGE`.
    4.  **Summary First:** Begin with a high-level summary of the release in one or two paragraphs.
    5.  **Strict Categories:** After the summary, create sections using the following markdown headers. The order MUST be precise:
        - ### 💥 Breaking Changes
        - ### 🚀 New Features
        - ### 🐛 Bug Fixes
        - ### 🛠️ Other Changes
    6.  **Bullet Point Format:** Each bullet point MUST start with a bolded, concise summary of the change, followed by a more detailed explanation. For example: `* **Improved User Onboarding:** The sign-up process has been streamlined to require fewer steps, making it easier for new users to get started. (#123)`
    7.  **Link Everything:** Every bullet point MUST end with a markdown link to the relevant Issue or Pull Request, like `(#123)`. If a change comes from a commit that refers to an issue that couldn't be linked, still include the number in plain text, like `(#456)`.
    8.  **No Commit-Speak:** Do not use phrases like "[various commits]" or mention commit SHAs. All output must be user-friendly.
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
    
    # Ignore pre-release tags for release note generation
    if any(prerelease in current_tag for prerelease in ["alpha", "beta", "rc"]):
        print(f"Current tag '{current_tag}' is a pre-release. Skipping release note generation.")
        exit(0)

    # Get all stable tags sorted by version number
    tags = get_git_tags()

    previous_tag = None
    if len(tags) > 1:
        # The most recent tag is at index 0, so the previous one is at index 1
        previous_tag = tags[1]
        print(f"Found previous stable tag: {previous_tag}")
    else:
        # If there's only one stable tag, get all commits from the beginning (initial commit)
        print("No previous stable tag found. Assuming this is the first release.")
        previous_tag = subprocess.check_output(
            ["git", "rev-list", "--max-parents=0", "HEAD"]
        ).decode("utf-8").strip()
        print(f"Using initial commit as the starting point: {previous_tag}")


    release_notes = generate_release_notes(
        args.token, args.gemini_api_key, repo_name, current_tag, previous_tag
    )
    print("\n--- Generated Release Notes ---\n")
    print(release_notes)
    print("\n-------------------------------\n")

    create_github_release(args.token, repo_name, current_tag, release_notes)
