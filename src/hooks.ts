import type { GetSession, Handle } from '@sveltejs/kit';
import cookie from 'cookie';

export const handle: Handle = async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');

	// Before each endpoint or page, read cookies into request.locals to access in session / frontend
	event.locals.user = cookies.user;
	event.locals.accessToken = cookies.accessToken;

	const response = await resolve(event);

	return response;
};

export const getSession: GetSession = async (event) => {
	return {
		user: event.locals.user,
		accessToken: event.locals.accessToken
	};
};
