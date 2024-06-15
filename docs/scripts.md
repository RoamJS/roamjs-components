# Script Management

https://github.com/RoamJS/roamjs-components/blob/main/src/scripts

The `https://github.com/RoamJS/roamjs-components/blob/main/src/scripts` directory contains two main files: [`index.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/index.ts#L0) and [`publishToRoamDepot.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L0).

- The [`index.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/dom/index.ts#L0) file serves as an entry point for the `@samepage/scripts/cli` module. This module provides command-line interface (CLI) functionality for the project.

- The [`publishToRoamDepot.ts`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L0) file contains the [`publishToRoamDepot`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L15) function, which is responsible for publishing a Roam extension to the Roam Depot. The function performs several key tasks:
  - Checks for existing pull requests for the current branch in the Roam Depot repository using the GitHub API.
  - Clones the Roam Depot repository using [`execSync()`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L5).
  - Determines the path to the extension manifest file based on provided [`proxy`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L19) and [`repo`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L17) parameters.
  - Retrieves the author's name and email from the GitHub API or falls back to [`package.json`](/roamjs-components/package.json#L109) if the API call fails.
  - Configures Git user information using [`execSync()`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L5).
  - Adds the Roam Depot repository as a remote and pulls the latest changes from the [`main`](/roamjs-components/package.json#L5) branch.
  - If an existing pull request is found, it checks out the branch, rebases it against [`main`](/roamjs-components/package.json#L5), updates the [`source_commit`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L70) field in the manifest file, commits the changes, and pushes the updated branch.
  - If no existing pull request is found, it creates a new branch, creates the extension manifest file if it doesn't exist, populates it with necessary information, commits the changes, and pushes the new branch.
  - Creates a new pull request in the Roam Depot repository using the GitHub API and logs the URL of the created or updated pull request.

The [`publishToRoamDepot`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L15) function uses several utility functions and libraries, such as the GitHub API and [`execSync()`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L5) from the [`child_process`](https://github.com/RoamJS/roamjs-components/blob/main/src/scripts/publishToRoamDepot.ts#L5) module, to perform its tasks. It handles both the creation of new pull requests and the update of existing ones, making it a versatile tool for publishing Roam extensions.
