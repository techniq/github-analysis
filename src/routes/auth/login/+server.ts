import { redirect } from '@sveltejs/kit';
import { baseUrl, clientId } from '../_config';

export function GET() {
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('scope', 'read:user repo');
  params.append('redirect_uri', `${baseUrl}/auth/callback`);

  throw redirect(302, `https://github.com/login/oauth/authorize?${params}`);
}
