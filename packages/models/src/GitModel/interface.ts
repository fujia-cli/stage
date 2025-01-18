import Gitee from './gitee';
import Github from './github';
import Gitlab from './gitlab';

export type GitPlatformType = 'github' | 'gitlab' | 'gitee';

export type GitServer<T> = T extends 'github'
  ? Github
  : T extends 'gitlab'
    ? Gitlab
    : Gitee;

export type BranchType = 'release' | 'feature' | 'develop';

export type UpgradeVersionType = 'major' | 'minor' | 'patch';

export interface GithubUserInfo {
  id: string;
  login: string;
  node_id: string;
  avatar_url: string;
  gravatar_id?: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: string;
  name: string;
  company?: string;
  blog: string;
  location?: string;
  email: string;
  hireable?: string;
  bio?: string;
  twitter_username?: string;
  public_repos: string;
  public_gists: string;
  followers: string;
  following: string;
  created_at: Date;
  updated_at: Date;
}

export interface GithubOrgInfo {
  login: string;
  id: string;
  node_id: string;
  url: string;
  repos_url: string;
  events_url: string;
  hooks_url: string;
  issues_url: string;
  members_url: string;
  public_members_url: string;
  avatar_url: string;
  description: string;
}

// const userInfo = {
//   login: 'fushenguang',
//   id: '22734981',
//   node_id: 'MDQ6VXNlcjIyNzM0OTgx',
//   avatar_url: 'https://avatars.githubusercontent.com/u/22734981?v=4',
//   gravatar_id: '',
//   url: 'https://api.github.com/users/fushenguang',
//   html_url: 'https://github.com/fushenguang',
//   followers_url: 'https://api.github.com/users/fushenguang/followers',
//   following_url: 'https://api.github.com/users/fushenguang/following{/other_user}',
//   gists_url: 'https://api.github.com/users/fushenguang/gists{/gist_id}',
//   starred_url: 'https://api.github.com/users/fushenguang/starred{/owner}{/repo}',
//   subscriptions_url: 'https://api.github.com/users/fushenguang/subscriptions',
//   organizations_url: 'https://api.github.com/users/fushenguang/orgs',
//   repos_url: 'https://api.github.com/users/fushenguang/repos',
//   events_url: 'https://api.github.com/users/fushenguang/events{/privacy}',
//   received_events_url: 'https://api.github.com/users/fushenguang/received_events',
//   type: 'User',
//   site_admin: 'false',
//   name: 'fujia',
//   company: 'null',
//   blog: 'www.fujia.site',
//   location: 'null',
//   email: 'fujia.site@outlook.com',
//   hireable: 'null',
//   bio: ' fujia - Software Engineer',
//   twitter_username: 'null',
//   public_repos: '61',
//   public_gists: '0',
//   followers: '0',
//   following: '13',
//   created_at: '2016-10-10T01:04:42Z',
//   updated_at: '2021-12-01T12:24:52Z',
// }

// const orgInfo = {
//   login: 'fujia-site',
//   id: 40052918,
//   node_id: 'MDEyOk9yZ2FuaXphdGlvbjQwMDUyOTE4',
//   url: 'https://api.github.com/orgs/fujia-site',
//   repos_url: 'https://api.github.com/orgs/fujia-site/repos',
//   events_url: 'https://api.github.com/orgs/fujia-site/events',
//   hooks_url: 'https://api.github.com/orgs/fujia-site/hooks',
//   issues_url: 'https://api.github.com/orgs/fujia-site/issues',
//   members_url: 'https://api.github.com/orgs/fujia-site/members{/member}',
//   public_members_url: 'https://api.github.com/orgs/fujia-site/public_members{/member}',
//   avatar_url: 'https://avatars.githubusercontent.com/u/40052918?v=4',
//   description: ''
// }
