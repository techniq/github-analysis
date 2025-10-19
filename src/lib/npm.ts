import { api, type ApiOptions } from './base';

// https://github.com/npm/registry/blob/master/docs/download-counts.md
export class Npm {
  async api<Data = any>(resource: string, options?: ApiOptions) {
    return api<Data>('https://api.npmjs.org', resource, options);
  }
}
