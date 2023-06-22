export class Github {
  accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async graphql<Data = any>(query: string, variables: Record<string, any> = {}) {
    return fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`
      },
      body: JSON.stringify({
        query,
        variables
      })
    })
      .then((response) => response.json())
      .then((json) => json.data as Data);
  }
}
