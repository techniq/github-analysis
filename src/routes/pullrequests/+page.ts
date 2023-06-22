import { Github } from '$lib/github.js';
// import type { User } from '@octokit/graphql-schema';

export async function load({ parent }) {
  const { accessToken } = await parent();
  return {
    pullRequests: fetchPullRequests(accessToken)
  };
}

async function fetchPullRequests(accessToken: string) {
  const github = new Github(accessToken);

  // Reference: https://gist.github.com/MichaelCurrin/f8a7a11451ce4ec055d41000c915b595
  const { viewer } = await github.graphql<{ viewer: any }>(
    `
      query ($first: Int!) {
        viewer {
          pullRequests(
            first: $first
            # states: MERGED
            orderBy: { field: UPDATED_AT, direction: DESC }
          ) {
            nodes {
              id
              number
              title
              state
              repository {
                nameWithOwner
                isPrivate
              }
            }
          }

          repositories(first: 5) {
            nodes {
              name
              pullRequests(last: 5) {
                nodes {
                  id
                  number
                  url
                  state
                  reviews(last: 100) {
                    nodes {
                      author {
                        login
                      }
                      state
                    }
                  }
                }
              }
            }
          }
        }

        # search(
        # 	# query: "is:merged is:pr is:public archived:false author:techniq -user:techniq"
        # 	query: "is:merged is:pr author:techniq"
        # 	type: ISSUE
        # 	first: 100
        # ) {
        # 	issueCount
        # 	edges {
        # 		node {
        # 			... on PullRequest {
        # 				number
        # 				title
        # 				repository {
        # 					nameWithOwner
        # 				}
        # 				createdAt
        # 				mergedAt
        # 				url
        # 				changedFiles
        # 				additions
        # 				deletions
        # 			}
        # 		}
        # 	}
        # }
    }
    `,
    {
      first: 10
    }
  );
  return viewer.pullRequests;
}
