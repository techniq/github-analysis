import cookie from 'cookie';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ request, resolve }) {
	const cookies = cookie.parse(request.headers.cookie || '');

	// Before each endpoint or page, read cookies into request.locals to access in session / frontend
	request.locals.user = cookies.user;
	request.locals.accessToken = cookies.accessToken;

	const response = await resolve(request);

	return response;
}

export async function getSession(request) {
	return {
		user: request.locals.user,
		accessToken: request.locals.accessToken
	};
}
