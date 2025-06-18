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
    """
    # Use %B to get the full raw body of the commit.
    # Use %x00 (the null byte) as a unique, unambiguous separator.
    command = ["git", "log", f"{from_ref}..{to_ref}", "--pretty=format:%B%x00"]
    if no_merges:
        command.append("--no-merges")
    
    output = subprocess.check_output(command).decode("utf-8")
    # Split the output by the null byte and filter out any empty strings.
    return [msg.strip() for msg in output.split("\x00") if msg.strip()]


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
    
    # Use this set to track all issue numbers that have been fully handled
    # by a PR or a standalone commit whose details are now comprehensive.
    handled_issue_numbers = set() 
    
    # This list will store details for PRs, including their linked issues' titles/bodies
    pr_details_for_prompt = [] 

    ignore_patterns = [
        re.compile(r'^(chore|ci|build)\(deps\):', re.IGNORECASE),
        re.compile(r'^Update dependency', re.IGNORECASE),
        re.compile(r'^(bump|bumps)\s', re.IGNORECASE),
        re.compile(r'\[dependabot skip\]', re.IGNORECASE),
        re.compile(r'^Merge branch', re.IGNORECASE)
    ]

    # --- 1. Fetch all data and categorize it ---
    dependency_pr_details = []
    
    full_log_text_for_pr_find = subprocess.check_output(["git", "log", f"{previous_tag}..{current_tag}", "--pretty=format:%B%x00"]).decode("utf-8")
    pr_merge_commit_pattern = re.compile(r'Merge pull request #(\d+)')
    pr_numbers_in_log = set(pr_merge_commit_pattern.findall(full_log_text_for_pr_find))

    for pr_number_str in pr_numbers_in_log:
        pr_number = int(pr_number_str)
        try:
            pr = repo.get_pull(pr_number)
            pr_body = pr.body if pr.body else ""
            
            # Start building the comprehensive PR detail string
            current_pr_detail_string = f"- PR #{pr.number}: {pr.title} ({pr.html_url})\n  Body: {pr_body}\n"
            
            is_pr_ignorable = any(pattern.search(pr.title) for pattern in ignore_patterns)
            # A PR is not ignorable if it contains a breaking change, even if it matches an ignore pattern.
            if 'BREAKING CHANGE' in (pr_body or ""):
                is_pr_ignorable = False

            if is_pr_ignorable:
                dependency_pr_details.append(current_pr_detail_string)
                continue

            issue_link_pattern = re.compile(r'(?:closes|fixes|resolves)\s+#(\d+)', re.IGNORECASE)
            issue_matches = issue_link_pattern.finditer(pr_body)
            linked_issues_in_pr = []
            
            if issue_matches:
                current_pr_detail_string += "  Linked Issues:\n"
                for issue_match in issue_matches:
                    issue_num = int(issue_match.group(1))
                    linked_issues_in_pr.append(issue_num) # Track issues linked by this PR
                    handled_issue_numbers.add(issue_num) # Mark as handled by a PR
                    try:
                        issue = repo.get_issue(number=issue_num)
                        issue_body = issue.body if issue.body else ""
                        current_pr_detail_string += f"    - Issue #{issue.number}: {issue.title} ({issue.html_url})\n      Body: {issue_body}\n"
                    except Exception as e:
                        print(f"Could not fetch issue #{issue_num} from PR: {e}")
            
            # Add the full PR detail string (including linked issues' info) to the main list
            pr_details_for_prompt.append(current_pr_detail_string)

        except Exception as e:
            print(f"Could not fetch PR #{pr_number}: {e}")

    all_standalone_commits = get_full_commit_messages(previous_tag, current_tag, no_merges=True)
    meaningful_standalone_commits = []
    dependency_standalone_commits = []

    for commit in all_standalone_commits:
        is_ignorable = any(p.search(commit) for p in ignore_patterns)
        if 'BREAKING CHANGE' in commit:
            is_ignorable = False
        
        if is_ignorable:
            dependency_standalone_commits.append(commit)
        else:
            meaningful_standalone_commits.append(commit)

    direct_commit_issue_details = []
    generic_issue_pattern = re.compile(r'#(\d+)')
    
    # Process meaningful standalone commits, being careful not to duplicate issues
    for commit_message in meaningful_standalone_commits:
        issue_matches = generic_issue_pattern.finditer(commit_message)
        commit_links_to_handled_issue = False
        
        for match in issue_matches:
            issue_num = int(match.group(1))
            if issue_num in handled_issue_numbers:
                # This issue has already been fully covered by a PR. Skip it for this commit.
                commit_links_to_handled_issue = True
                break # No need to check other issues in this commit, if one is handled, the commit's relevance is diminished

        if commit_links_to_handled_issue:
            continue # Skip this commit entirely as its linked issue is already handled by a PR

        # If we reach here, this commit either links to an unhandled issue, or has no issue link.
        # We will add it to direct_commit_issue_details if it links to an unhandled issue,
        # or it will remain in meaningful_standalone_commits if it's just a general change.
        
        found_unhandled_issue_in_commit = False
        for match in generic_issue_pattern.finditer(commit_message):
            issue_num = int(match.group(1))
            if issue_num not in handled_issue_numbers:
                details = ""
                try:
                    issue = repo.get_issue(number=issue_num)
                    issue_body = issue.body if issue.body else ""
                    details = f"- Standalone commit links to Issue #{issue.number}: {issue.title} ({issue.html_url})\n  Commit Message: {commit_message.splitlines()[0]}\n  Issue Body: {issue_body}\n"
                    direct_commit_issue_details.append(details)
                    handled_issue_numbers.add(issue_num) # Mark this issue as handled now
                    found_unhandled_issue_in_commit = True
                    break # Only take the first unhandled issue linked by a commit to represent it
                except Exception as e:
                    # If issue fetch fails, still add a note about the commit linking to an issue
                    details = f"- Standalone commit (unlinked) refers to issue #{issue_num}\n  Commit Message: {commit_message.splitlines()[0]}\n"
                    direct_commit_issue_details.append(details)
                    handled_issue_numbers.add(issue_num) # Mark as handled to prevent further processing
                    found_unhandled_issue_in_commit = True
                    break

        # If a meaningful standalone commit does NOT link to any unhandled issues,
        # its content will be processed from the `commit_data_for_prompt` section.
        # We don't need to explicitly add it to direct_commit_issue_details unless it links to an *unhandled* issue.


    # --- 2. Decide what data to send to the AI ---
    # `pr_details_for_prompt` now contains only meaningful PRs with their integrated linked issue data.
    # `direct_commit_issue_details` contains only standalone commits linking to issues not covered by PRs.
    # `meaningful_standalone_commits` still contains commits not merged via PRs and not linking to *new* unhandled issues.

    has_meaningful_changes = bool(pr_details_for_prompt) or bool(direct_commit_issue_details) or bool(meaningful_standalone_commits)
    
    pr_data_for_prompt_str = ""
    commit_data_for_prompt = ""
    dependency_note = ""

    if not has_meaningful_changes and (dependency_pr_details or dependency_standalone_commits):
        print("No meaningful changes found. Including dependency updates in the release notes.")
        pr_data_for_prompt_str = ''.join(pr_details_for_prompt + dependency_pr_details) # Still include if they are the ONLY changes
        commit_data_for_prompt = "\n---\n".join(meaningful_standalone_commits + dependency_standalone_commits) # Same here
        dependency_note = "\nThis release consists primarily of routine dependency updates. No other significant changes were detected."
    else:
        pr_data_for_prompt_str = ''.join(pr_details_for_prompt) # Only meaningful PRs
        commit_data_for_prompt = "\n---\n".join(meaningful_standalone_commits) # Only meaningful standalone commits
        # If there are meaningful changes, we do not want the AI to include dependency notes.
        # The prompt will explicitly forbid it unless dependency_note is present.


    # --- 3. Generate the prompt for the AI ---
    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-2.0-flash')

    prompt = f"""
    You are an expert technical writer for the project {repo.name}.
    Your goal is to generate insightful, human-readable release notes for version {current_tag}. {dependency_note}

    **Core Task:** Synthesize ALL of the information provided below into a coherent narrative. Start with a high-level summary paragraph, then provide categorized details.

    **Source of Information:**
    Below is a comprehensive list of changes for this release. It includes detailed information for Pull Requests found on GitHub, as well as the raw commit log for historical changes that may not exist on the GitHub API. You should use ALL provided sources to build the release notes.

    **Data from GitHub (Pull Requests & Linked Issues):**
    {pr_data_for_prompt_str if pr_data_for_prompt_str else "No pull requests with linked issues were found on GitHub."}
    
    **Data from Commits Linked Directly to Issues (may be on GitHub or historical):**
    {''.join(direct_commit_issue_details) if direct_commit_issue_details else "No standalone commits linking to issues were found."}

    **Data from Git History (Raw Commit Messages for additional context and changes without linked issues):**
    --- START OF RAW COMMIT LOG ---
    {commit_data_for_prompt}
    --- END OF RAW COMMIT LOG ---

    **Critical Output Rules:**
    1.  **NO UNWANTED SECTIONS OR DEPENDENCY UPDATES:** This is the most important rule. You are strictly forbidden from including routine dependency updates (e.g., "chore(deps): update dependency...", "bump package from...", or similar) in the release notes. Only include a note about dependency updates if the provided "dependency_note" in the prompt explicitly mentions it, indicating there are no other significant changes. Furthermore, you MUST ONLY use the section headers listed in Rule #5. Do not create any other sections.
    2.  **NO EMPTY SECTIONS:** If a category like "Bug Fixes" or "Breaking Changes" has no relevant items, you MUST NOT include its header in the final output.
    3.  **IDENTIFYING BREAKING CHANGES:** A breaking change should only be identified if a commit message or PR body explicitly contains the text `BREAKING CHANGE:`. Do not invent breaking changes.
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
    
    if any(prerelease in current_tag for prerelease in ["alpha", "beta", "rc"]):
        print(f"Current tag '{current_tag}' is a pre-release. Skipping release note generation.")
        exit(0)

    tags = get_git_tags()

    previous_tag = None
    if len(tags) > 1:
        previous_tag = tags[1]
        print(f"Found previous stable tag: {previous_tag}")
    else:
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