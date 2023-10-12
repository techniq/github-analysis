import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
  // Redirect to repositories until a home page is available
  throw redirect(302, '/repositories');
}
