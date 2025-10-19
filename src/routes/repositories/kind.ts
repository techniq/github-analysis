import { de } from 'date-fns/locale';

export const REPO_KIND = {
  myTop: {
    label: 'My top',
    value: 'my-top',
    description:
      'Repositories the user has contributed to, ordered by contribution rank, plus repositories the user has created'
  },
  myOwned: {
    label: 'My owned',
    value: 'my-owned',
    description: 'A list of repositories that the user owns'
  },
  myForks: {
    label: 'My forks',
    value: 'my-forks',
    description: 'A list of repositories that the user forked'
  },
  myContributions: {
    label: 'My contributions',
    value: 'my-contributions',
    description: 'A list of repositories that the user recently contributed to'
  }
} as const;
