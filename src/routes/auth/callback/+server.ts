import { redirect } from '@sveltejs/kit';
import type { CookieSerializeOptions } from 'cookie';

import { baseUrl, clientId, clientSecret } from '../_config';

export async function GET({ url, locals, cookies }) {
	const code = url.searchParams.get('code');
	const accessToken = await getAccessToken(code);
	const user = await getUser(accessToken);

	// Set on request locals to be read in `handle` hook
	locals.accessToken = accessToken;
	locals.user = user.login;

	const cookieOptions = {
		path: '/',
		httpOnly: true,
		secure: baseUrl.startsWith('https://')
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
			client_id: clientId,
			client_secret: clientSecret,
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
