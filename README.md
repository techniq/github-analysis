# github-analyzer

## Environment

- Create [Github OAuth app](https://github.com/settings/developers)
  - Set `Authorization callback URL` to `{VITE_BASE_URL}/auth/callback`
  - Capture `Client ID` and `Client secret` to be used next step
- Local development
  - Create `.env` file in root of project with the following keys:
    - `BASE_URL` (ex. `http://localhost:3000`)
    - `GITHUB_CLIENT_ID` (see above)
    - `GITHUB_CLIENT_SECRET` (see above)
- Vercel
  - Add to `Environment Variables` via interface
    - `BASE_URL` (ex. `https://github-analysis.vercel.app`)
    - `GITHUB_CLIENT_ID` (see above)
    - `GITHUB_CLIENT_SECRET` (see above)
