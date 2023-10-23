import { parse } from 'svelte-ux';

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
};

// https://github.com/npm/registry/blob/master/docs/download-counts.md
export class Npm {
  async api<Data = any>(resource: string, options?: ApiOptions) {
    let url = `https://api.npmjs.org${resource}`;
    const method = options?.method ?? 'GET';

    if (method === 'GET' && options?.data) {
      url += `?${new URLSearchParams(options.data)}`;
    }

    return fetch(url, {
      method: options?.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      ...(method === 'POST' &&
        options?.data && {
          body: JSON.stringify(options.data)
        })
    }).then(async (response) => {
      const text = await response.text();
      return parse<Data>(text);
    });
  }
}
