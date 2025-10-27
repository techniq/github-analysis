import { parse } from '@layerstack/utils';

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
  parse?<T>(data: string): T;
};

export async function api<Data = any>(origin: string, resource: string, options: ApiOptions = {}) {
  let url = `${origin}/${resource}`;
  const method = options?.method ?? 'GET';

  if (method === 'GET' && options?.data) {
    url += `?${new URLSearchParams(options.data)}`;
  }

  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...(method === 'POST' &&
      options?.data && {
        body: JSON.stringify(options.data)
      })
  }).then(async (response) => {
    const text = await response.text();
    return options.parse ? options.parse<Data>(text) : parse<Data>(text);
  });
}

export async function graphql<Data = any>(
  endpoint: string,
  query: string,
  variables: Record<string, any> = {},
  options: ApiOptions = {}
) {
  return fetch(endpoint, {
    method: options?.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify({
      query,
      variables,
      ...options.data
    })
  })
    .then(async (response) => {
      const text = await response.text();
      return options.parse ? options.parse(text) : parse(text);
    })
    .then((json) => json.data as Data);
}
