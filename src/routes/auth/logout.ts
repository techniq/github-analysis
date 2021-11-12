import * as cookie from 'cookie';
import type { CookieSerializeOptions } from 'cookie';

import { baseUrl } from './_config';

export async function get() {
	const cookieOptions = {
		maxAge: -1, // delete cookie
		path: '/',
		httpOnly: true,
		secure: baseUrl.startsWith('https://')
	} as CookieSerializeOptions;

	return {
		status: 302,
		headers: {
			'Set-Cookie': [
				cookie.serialize('user', '', cookieOptions),
				cookie.serialize('accessToken', '', cookieOptions)
			],
			Location: '/'
		}
	};
}
