# github-commit-analyzer

## Environment

- Create [Github OAuth app](https://github.com/settings/developers)
  - Set `Authorization callback URL` to `{VITE_BASE_URL}/auth/callback`
  - Capture `Client ID` and `Client secret` to be used next step
- Local development
  - Create `.env` file in root of project with the following keys:
    - `VITE_BASE_URL` (ex. `http://localhost:3000`)
    - `VITE_GITHUB_CLIENT_ID` (see above)
    - `VITE_GITHUB_CLIENT_SECRET` (see above)
- Netlify
  - Add to `Environment Variables` in UI
    - `VITE_BASE_URL` (ex. `https://commit-analyzer.netlify.app`)
    - `VITE_GITHUB_CLIENT_ID` (see above)
    - `VITE_GITHUB_CLIENT_SECRET` (see above)
