# Hub mockups working copy

This directory is the working copy of https://github.com/willadiym/Hub-mockups.
The parent directory contains a separate, unrelated application; do not add its files to this repository.

The user wants completed changes maintained both locally and in this GitHub repository, with a persistent GitHub Pages preview.

- Make requested edits in this working copy. Check Git status and remote changes before synchronizing; preserve any concurrent user work.
- Use Node.js 24 and pnpm as pinned in package.json; retain pnpm-lock.yaml.
- Validate the affected behavior and run pnpm build. Also build with VITE_BASE_PATH=/Hub-mockups/ when changing navigation, assets, or deployment.
- After completing an authorized task, commit the relevant changes and push them to origin. Updates to main automatically publish the stand via .github/workflows/pages.yml. Do not force-push or overwrite remote history.
- If main is protected, use a codex/ branch and a pull request, and report that publication awaits merging.
- Use src/paths.js for internal page and public asset URLs, so both localhost and GitHub Pages work.
- Never commit credentials, node_modules, dist, logs, or machine-specific LaunchAgent configuration. GitHub Actions builds dist itself.
- Report whether changes are only local, pushed, or deployed. Do not describe a prepared workflow or a running deployment as an already published site.

The prototype has no backend or real sign-in/mail delivery. Browser storage is local to each visitor and is not shared through GitHub Pages.
