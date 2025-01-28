# Useful commands

## Delete environments from GitHub

```shell
gh api "repos/hippo-digital/office-booking/deployments?environment=test" \
| jq -r ".[].id" \
| xargs -n 1 -I % sh -c "
gh api -X POST -F state=inactive repos/hippo-digital/office-booking/deployments/%/statuses
gh api -X DELETE repos/hippo-digital/office-booking/deployments/%
"
```
