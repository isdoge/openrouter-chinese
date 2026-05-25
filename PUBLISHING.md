# Publishing

## Release Checklist

1. Update `src/openrouter-chinese.user.js` metadata version.
2. Update `package.json` version.
3. Update `CHANGELOG.md`.
4. Run:

```powershell
npm test
```

5. Verify `dist/openrouter-chinese.user.js` contains the same version.
6. Commit `src/`, `dist/`, `scripts/`, `README.md`, `CHANGELOG.md`, `PUBLISHING.md`, `LICENSE`, `.gitignore`, and `package.json`.
7. Push to GitHub.
8. Install or update from:

```text
https://raw.githubusercontent.com/isdoge/openrouter-chinese/main/dist/openrouter-chinese.user.js
```

## Local Browser Acceptance

Use the existing logged-in Chrome/Tampermonkey profile. Do not create a fresh browser profile for account-backed OpenRouter pages.

Safe verification actions:

- Open pages and inspect visible text.
- Open non-destructive menus, dropdowns, popovers, and dialogs.
- Use browser snapshots to confirm `window.__openrouterWorkspacesZh.version` and `document.documentElement.lang`.

Do not click final state-changing actions such as `Save`, `Create`, `Delete`, `Regenerate`, account/payment/API-key submissions, or permission-changing confirmations.
