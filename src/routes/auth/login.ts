const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID as string;
const baseUrl = import.meta.env.VITE_BASE_URL as string;

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
