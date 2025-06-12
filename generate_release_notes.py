import os
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel('gemini-2.0-flash')

commit_messages = os.environ["COMMIT_MESSAGES"]

prompt = f"""
You are an expert software release manager.
Generate clear, concise, and user-friendly release notes based on the following commit messages.
Categorize changes into "Features", "Bug Fixes", and "Improvements" (or similar relevant categories).
Exclude any internal-only or insignificant commits (e.g., CI/CD updates, minor refactorings that don't affect users).
Use a professional yet engaging tone.
Ensure that the release notes are easy to read and understand for users.

Commit Messages:
{commit_messages}

Release Notes:
"""

response = model.generate_content(prompt)
release_notes = response.text

# Save release notes to a file for the GitHub Action
with open("RELEASE_NOTES.md", "w") as f:
    f.write(release_notes)

print("Release notes generated and saved to RELEASE_NOTES.md")
