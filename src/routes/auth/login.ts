import { baseUrl, clientId } from './_config';

export function get() {
	const params = new URLSearchParams();
	params.append('client_id', clientId);
	params.append('scope', 'read:user');
	params.append('redirect_uri', `${baseUrl}/auth/callback`);

	return {
		status: 302,
		headers: {
			Location: `https://github.com/login/oauth/authorize?${params}`
		}
	};
}
