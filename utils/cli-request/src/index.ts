/*
 * @Author: fujia
 * @Date: 2021-12-09 16:44:32
 * @LastEditTime: 2021-12-09 17:48:01
 * @LastEditors: fujia(as default)
 * @Description: An universal request library built on axios.
 * @FilePath: /stage/utils/cli-request/src/index.ts
 */
import axios from 'axios';

const BASE_URL_MAP = {
  development: 'http://192.168.31.102:7001',
  test: 'http://192.168.31.102:7001',
  pre: "",
  production: '',
};

const env = (process.env.NODE_ENV as keyof typeof BASE_URL_MAP) || 'development';

const request = axios.create({
  baseURL: BASE_URL_MAP[env],
  timeout: 5000,
});

request.interceptors.response.use(
  res => {
    if (res.status === 200) {
      // return res.data;
      return res;
    }
  },
  err => {
    return Promise.reject(err);
  }
);

export type {
  Axios,
  AxiosPromise,
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  AxiosResponseHeaders,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosDefaults,
} from 'axios'

export default request;
