import { redirect } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';

import { BASE_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export async function GET({ url, locals, cookies }) {
  console.log('callback');
  const code = url.searchParams.get('code');
  console.log({ code });
  console.log('getting access token', code);
  const accessToken = await getAccessToken(code);
  console.log('getting user', accessToken);
  const user = await getUser(accessToken);
  console.log({ accessToken, user });

  // Set on request locals to be read in `handle` hook
  locals.accessToken = accessToken;
  locals.user = user.login;

  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: BASE_URL.startsWith('https://')
  } as CookieSerializeOptions;

  cookies.set('user', user.login || '', cookieOptions);
  cookies.set('accessToken', accessToken || '', cookieOptions);

  throw redirect(302, '/');
}

/**
 * Get accessToken from authorize code
 */
async function getAccessToken(code: string) {
  const response = await fetch(`https://github.com/login/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code
    })
  });
  const { access_token, scope, token_type } = await response.json();
  return access_token;
}

/**
 * Get user info from Github API using accessToken
 */
async function getUser(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`
    }
  });
  const user = await response.json();
  return user;
}
