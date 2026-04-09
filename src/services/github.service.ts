/**
 * GitHub API service.
 * Provides typed helpers for the most commonly used GitHub REST API v3 endpoints.
 * Reads VITE_GITHUB_TOKEN from the environment when available to raise the
 * unauthenticated rate-limit (60 req/h → 5 000 req/h).
 */

import { get, post, ApiRequestOptions } from "./api.service";

const GITHUB_API_BASE = "https://api.github.com";

/** Returns shared options (base URL + optional auth token). */
function githubOptions(): ApiRequestOptions {
  const token = import.meta.env.VITE_GITHUB_TOKEN as string | undefined;
  return {
    baseUrl: GITHUB_API_BASE,
    token,
    headers: { Accept: "application/vnd.github+json" },
  };
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  private: boolean;
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  updated_at: string;
  default_branch: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  html_url: string;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
  labels: Array<{ name: string; color: string }>;
}

export interface GitHubPullRequest extends GitHubIssue {
  merged_at: string | null;
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
}

export interface GitHubCommit {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

/**
 * Fetches a GitHub user's public profile.
 * @param username - GitHub login name.
 */
export const getUser = (username: string) =>
  get<GitHubUser>(`users/${username}`, githubOptions());

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------

/**
 * Lists public repositories for a user or organisation.
 * @param owner   - GitHub login name.
 * @param perPage - Page size (max 100, default 30).
 * @param page    - 1-based page number.
 */
export const listRepos = (owner: string, perPage = 30, page = 1) =>
  get<GitHubRepo[]>(
    `users/${owner}/repos?per_page=${perPage}&page=${page}&sort=updated`,
    githubOptions(),
  );

/**
 * Fetches a single repository.
 * @param owner - Repository owner.
 * @param repo  - Repository name.
 */
export const getRepo = (owner: string, repo: string) =>
  get<GitHubRepo>(`repos/${owner}/${repo}`, githubOptions());

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

/**
 * Lists issues for a repository.
 * @param owner  - Repository owner.
 * @param repo   - Repository name.
 * @param state  - Issue state filter.
 */
export const listIssues = (
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
) =>
  get<GitHubIssue[]>(
    `repos/${owner}/${repo}/issues?state=${state}&per_page=30`,
    githubOptions(),
  );

/**
 * Creates a new issue.
 * @param owner - Repository owner.
 * @param repo  - Repository name.
 * @param title - Issue title.
 * @param body  - Optional issue body.
 */
export const createIssue = (
  owner: string,
  repo: string,
  title: string,
  body?: string,
) =>
  post<GitHubIssue>(
    `repos/${owner}/${repo}/issues`,
    { title, body },
    githubOptions(),
  );

// ---------------------------------------------------------------------------
// Pull Requests
// ---------------------------------------------------------------------------

/**
 * Lists pull requests for a repository.
 * @param owner  - Repository owner.
 * @param repo   - Repository name.
 * @param state  - PR state filter.
 */
export const listPullRequests = (
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
) =>
  get<GitHubPullRequest[]>(
    `repos/${owner}/${repo}/pulls?state=${state}&per_page=30`,
    githubOptions(),
  );

// ---------------------------------------------------------------------------
// Commits
// ---------------------------------------------------------------------------

/**
 * Lists commits for a repository branch.
 * @param owner   - Repository owner.
 * @param repo    - Repository name.
 * @param branch  - Branch name (defaults to the repo's default branch).
 * @param perPage - Page size (max 100, default 30).
 */
export const listCommits = (
  owner: string,
  repo: string,
  branch?: string,
  perPage = 30,
) => {
  const branchParam = branch ? `&sha=${encodeURIComponent(branch)}` : "";
  return get<GitHubCommit[]>(
    `repos/${owner}/${repo}/commits?per_page=${perPage}${branchParam}`,
    githubOptions(),
  );
};

export const githubService = {
  getUser,
  listRepos,
  getRepo,
  listIssues,
  createIssue,
  listPullRequests,
  listCommits,
};
