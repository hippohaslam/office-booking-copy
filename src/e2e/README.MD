# Playwright E2E Testing

The end-to-end tests are used to test realistic user journeys through the service, acting on and asserting the UI through a browser.

For this we're using Playwright with Nunit as the test runner.

## Writing tests

- For each different user journey a new test file should be created in the 'tests' directory within this project.
- For every new page a Page Object Model should be created in the 'Pages' directory.

## Running tests

### Restore packages

Ensure that packages have restored for the project before attempting to run the tests.

### Run the service

To run the tests locally or in a hosted environment, ensure that the service and APIs are running.

### Run the tests using the Rider / VS test runner

The e2e tests are picked up by Rider/VS as unit tests so can be run from the test runner panel as usual.

### Run the tests from CLI

To run the tests from CLI you can run the following command from the project:

`dotnet test`

To run the tests across a specific, or multiple browsers, run the following command from the project:

`dotnet test --settings:chromium.runsettings`
`dotnet test --settings:firefox.runsettings`
`dotnet test --settings:webkit.runsettings`