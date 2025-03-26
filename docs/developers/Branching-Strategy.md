# Branching strategy and code quality

## Branching strategy

This project uses the Trunk Based Development branching strategy.
This strategy seeks to avoid long-running feature/release branches and all work is based on ```main```.

When picking up a piece of work, you should create a new branch from ```main``` with a descriptive name and prefixed one
of the following:
- ```feat/``` - For new features or changes to existing features.
- ```fix/``` - For bug fixes.
- ```chore/``` - For small tweaks or changes that don't affect the main functionality.
- ```docs/``` - For documentation changes.

## Approving and merging pull requests

This repo makes use of GitHub Codeowners functionality to ensure that changes are reviewed by the correct people.
When you raise a pull request, the relevant codeowners will be notified and asked to review your changes. Pushes to main
from non-codeowners are restricted.

If you are a codeowner, another codeowner should approve your changes. 
Small tweaks and chore work can be done directly on ```main``` but more complex features should still make use of PRs.

## Code quality and rules

Before pushing to main/raising a pull request, ensure the following:
- The build is passing and any relevant tests are passing.
- The code is formatted correctly.
- Errant comments and debug code are removed.

Various validation checks run depending which part of the repo has been modified. You must resolve any issues this 
check raises before a PR can be approved/merged.