# Dynatrace ingester

This is a GitHub action for ingesting the information about a completed GitHub
Actions Workflow as a Business Event into Dynatrace Grail.

## Instructions

1. Create an Oauth token with the following permissions
   `storage:bizevents:write storage:buckets:read storage:events:write`.

2. Store the values as Github secrets.

3. For the `DT_ENVIRONMENT_ID` you will need to use your environment URL with
   the following format `https://xxxx.apps.dynatrace.com`. Notice that this
   format contains the .apps suffix after your environment ID.

Example pipeline:

```(yaml)
name: "dynatrace-ingest"
on:
  workflow_run:
    workflows: [*] # The Workflow to be ingested. If you leave like * it will run on any workflow trigger on the repository
    types:
      - completed

jobs:
  ingest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: drqc/github-actions-ingester-v2@main
        with:
          dt-client-id: ${{ secrets.DT_CLIENT_ID }} # Client ID of Dynatrace OAuth Client
          dt-client-secret: ${{ secrets.DT_CLIENT_SECRET }} # Client secret of Dynatrace OAuth Client
          dt-environment-id: ${{ vars.DT_ENVIRONMENT_ID }} # Dynatrace Environment ID
          dt-resource: ${{ secrets.DT_RESOURCE }} # Dynatrace Resource ID
```

> Note: If you are using an environment different from production you will need
> to add the following to the `with:` block.
> `dt-sso-url: ${{ vars.DT_SSO_URL }}` where the SSO_URL for sprint environments
> is `https://sso-sprint.dynatracelabs.com/sso/oauth2/token`.

## Development instructions

Run `npm install` and then `npm run package` and commit the files to see any
changes reflected.
