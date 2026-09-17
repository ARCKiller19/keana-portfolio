# Portfolio workflow

- `main` is the default and production branch. Do not use it for normal iteration.
- `dev` is the working branch. Start/sync it from the latest `main` before making changes.
- Batch related work on `dev`; avoid temporary/test commits or files.
- Vercel production deploys from `main` automatically. Do not manually deploy, and keep `dev` deployments disabled/ignored.
- Merge `dev` -> `main` only when the user explicitly asks to deploy/release. Before merging, review the full diff and run the relevant build/checks.
- Before any write, re-read the target branch and affected files so newer user pushes are not overwritten.
- For an explicit urgent production hotfix, `main` may be changed directly; sync `dev` from `main` afterward.
- After changes, report what changed, what was verified, what failed, and what was not run.
