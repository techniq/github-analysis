import { api, type ApiOptions } from './base';

function parse<T>(data: string): T {
  // Keep date strings as-is as they will be parsed client-side (treated as local time)
  return JSON.parse(data) as T;
}

// https://github.com/npm/registry/blob/master/docs/download-counts.md
export class Npm {
  async api<Data = any>(resource: string, options?: ApiOptions) {
    return api<Data>('https://api.npmjs.org', resource, {
      ...options,
      parse
    });
  }
}
