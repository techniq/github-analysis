import cookie, { CookieSerializeOptions } from 'cookie';
import { baseUrl, clientId, clientSecret } from './_config';

export async function get(req) {
	const code = req.url.searchParams.get('code');
	const accessToken = await getAccessToken(code);
	const user = await getUser(accessToken);

	// Set on request locals to be read in `handle` hook
	req.locals.accessToken = accessToken;
	req.locals.user = user.login;

	const cookieOptions = {
		path: '/',
		httpOnly: true,
		secure: baseUrl.startsWith('https://')
	} as CookieSerializeOptions;

	return {
		status: 302,
		headers: {
			'Set-Cookie': [
				cookie.serialize('user', user.login || '', cookieOptions),
				cookie.serialize('accessToken', accessToken || '', cookieOptions)
			],
			Location: '/'
		}
		// body: JSON.stringify({ accessToken, user })
	};
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
