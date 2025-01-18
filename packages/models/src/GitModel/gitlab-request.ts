import axios, {
  AxiosHeaders,
  AxiosInstance,
  RawAxiosRequestHeaders,
} from 'axios';

import { GITLAB_BASE_URL } from './constants';

export default class GitlabRequest {
  service: AxiosInstance;
  constructor(public token: string) {
    this.token = token;

    this.service = axios.create({
      baseURL: GITLAB_BASE_URL,
      timeout: 5000,
    });

    this.service.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `token ${this.token}`;
        return config;
      },
      (error) => {
        Promise.reject(error);
      },
    );

    this.service.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.data) {
          return error.response;
        }

        return Promise.reject(error);
      },
    );
  }

  get(
    url: string,
    params = {},
    headers?: RawAxiosRequestHeaders | AxiosHeaders,
  ) {
    return this.service({
      url,
      params,
      method: 'get',
      headers,
    });
  }

  post(
    url: string,
    data: unknown,
    headers?: RawAxiosRequestHeaders | AxiosHeaders,
  ) {
    return this.service({
      url,
      data,
      method: 'post',
      headers,
    });
  }
}
