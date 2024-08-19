# Useful commands

## Delete environments from GitHub
gh api "repos/harryy94/hippo-booking/deployments?environment=test" \
| jq -r ".[].id" \
| xargs -n 1 -I % sh -c "
gh api -X POST -F state=inactive repos/harryy94/hippo-booking/deployments/%/statuses
gh api -X DELETE repos/harryy94/hippo-booking/deployments/%
"