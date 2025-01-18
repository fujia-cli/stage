import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';

import { GITEE_BASE_URL } from './constants';

export default class GiteeRequest {
  service: AxiosInstance;
  constructor(public token: string) {
    this.token = token;
    this.service = axios.create({
      baseURL: GITEE_BASE_URL,
      timeout: 5000,
    });
    this.service.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response && error.response.data) {
          return error.response;
        } else {
          return Promise.reject(error);
        }
      },
    );
  }

  get(url: string, params = {}, headers?: AxiosRequestHeaders) {
    return this.service({
      url,
      params: {
        ...params,
        access_token: this.token,
      },
      method: 'get',
      headers,
    });
  }

  post(url: string, data: unknown, headers?: AxiosRequestHeaders) {
    return this.service({
      url,
      params: {
        access_token: this.token,
      },
      data,
      method: 'post',
      headers,
    });
  }
}
