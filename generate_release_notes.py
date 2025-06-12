import os
import argparse
import subprocess
import google.generativeai as genai
from github import Github

def get_git_tags():
    """Returns a list of all git tags, sorted by date."""
    tags = subprocess.check_output(
        ["git", "tag", "--sort=-creatordate"]
    ).decode("utf-8").split()
    return tags

def get_commit_messages(from_ref, to_ref):
    """Returns a list of commit messages between two git refs."""
    return subprocess.check_output(
        ["git", "log", "--oneline", f"{from_ref}..{to_ref}"]
    ).decode("utf-8")

def generate_release_notes(
    github_token, gemini_api_key, repo_name, current_tag, previous_tag
):
    """
    Generates release notes using Gemini AI.

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

    commits = get_commit_messages(previous_tag, current_tag)

    pr_details = []
    # A simple way to find PR numbers in commit messages
    for commit in commits.splitlines():
        if "Merge pull request #" in commit:
            pr_number_str = commit.split("#")[1].split(" ")[0]
            if pr_number_str.isdigit():
                pr_number = int(pr_number_str)
                try:
                    pr = repo.get_pull(pr_number)
                    pr_details.append(f"  - PR #{pr.number}: {pr.title}\n    {pr.body}\n")
                except Exception as e:
                    print(f"Could not fetch PR #{pr_number}: {e}")


    genai.configure(api_key=gemini_api_key)
    model = genai.GenerativeModel('gemini-pro')

    prompt = f"""
    You are an expert technical writer for the project {repo.name}.
    Generate a set of release notes for the version {current_tag}.
    The release is based on the changes between {previous_tag} and {current_tag}.

    Here is a summary of the commits:
    {commits}

    And here are the details of the pull requests that were merged:
    {''.join(pr_details) if pr_details else "No pull request details found."}

    Please generate the release notes in a clear and concise format.
    Use markdown for formatting.
    Categorize the changes into 'New Features', 'Bug Fixes', and 'Other Changes' if possible.
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
        previous_tag = tags[1]
    else:
        # If there's only one tag, get all commits from the beginning
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
