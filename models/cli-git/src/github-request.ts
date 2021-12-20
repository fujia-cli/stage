import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';

import { GITHUB_BASE_URL } from './constants';

export default class GithubRequest {
  service: AxiosInstance;
  constructor(public token: string) {
    this.token = token;

    this.service = axios.create({
      baseURL: GITHUB_BASE_URL,
      timeout: 5000
    });

    this.service.interceptors.request.use(
      config => {
        config.headers = {
          ...(config.headers || {}),
          Authorization: `token ${this.token}`
        };
        return config;
      },
      error => {
        Promise.reject(error);
      }
    );

    this.service.interceptors.response.use(
      response => response,
      error => {
        if (error?.response?.data) {
          return error.response;
        }

        return Promise.reject(error);
      }
    );
  }

  get<T>(
    url: string,
    params = {},
    headers?: AxiosRequestHeaders
  ) {
    return this.service.request<T>({
      url,
      params,
      method: 'get',
      headers
    });
  }

  post(
    url: string,
    data: unknown,
    headers?: AxiosRequestHeaders
  ) {
    return this.service({
      url,
      data,
      method: 'post',
      headers
    });
  }
}
