## TODO

### Users

#### Followers, starred repositories, ...

```gql
query {
	user(login: "techniq") {
		login

		followers {
			totalCount
		}

		following {
			totalCount
		}

		starredRepositories {
			totalCount
		}
	}
}
```

#### User contributations

```gql
query {
	user(login: "techniq") {
		login
		contributionsCollection(from: "2021-11-07T00:00:00", to: "2021-11-13T23:59:59") {
			startedAt
			endedAt
			hasAnyContributions
			hasActivityInThePast
			commitContributionsByRepository {
				repository {
					nameWithOwner
				}
				contributions(first: 100) {
					totalCount
					nodes {
						commitCount
						occurredAt
					}
				}
				url
			}
		}
	}
}
```

### Repositories

#### Stargazers

```gql
query {
	repository(owner: "sveltejs", name: "svelte") {
		stargazers(last: 10) {
			totalCount
			nodes {
				login
			}
		}
	}
}
```
