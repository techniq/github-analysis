import { redirect } from '@sveltejs/kit';
import { BASE_URL, GITHUB_CLIENT_ID } from '$env/static/private';

export function GET() {
  const params = new URLSearchParams();
  params.append('client_id', GITHUB_CLIENT_ID);
  params.append('scope', 'read:user repo');
  params.append('redirect_uri', `${BASE_URL}/auth/callback`);

  redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
