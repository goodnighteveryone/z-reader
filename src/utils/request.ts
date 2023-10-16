import got, { Agents } from 'got';
import * as tough from 'tough-cookie';
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent';
import workspaceConfiguration from './workspaceConfiguration';
import { showWarningMessage } from '../utils/notification';

interface cookiesConfig {
  url: string;
  cookie: string;
}

class Requset {
  cookieJar: tough.CookieJar;
  agent: Agents | undefined;
  headers: Record<string, string>;

  constructor() {
    this.cookieJar = new tough.CookieJar();
    // this.setAgent('http://127.0.0.1:8888');
    this.reLoadCookie();
    this.headers = {
      // 'User-Agent':
      //   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36 Edg/117.0.2045.60'
      'User-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW 64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36 QIHU 360SE'
    };
  }

  setAgent(proxy: string) {
    this.agent = {
      http: new HttpProxyAgent({
        proxy
      }),
      https: new HttpsProxyAgent({
        proxy
      })
    };
  }

  reLoadCookie() {
    this.cookieJar.removeAllCookiesSync();
    const cookies: cookiesConfig[] = workspaceConfiguration().get('cookies', []);
    if (typeof cookies === 'object') {
      cookies.forEach((cookie) => {
        cookie.cookie
          .split(';')
          .map((e) => tough.Cookie.parse(e))
          .forEach((e) => {
            e && this.cookieJar.setCookieSync(e, cookie.url);
          });
      });
    }
  }

  async send(options: any) {
    const requestOptions =
      typeof options === 'string'
        ? {
            url: options
          }
        : options;
    requestOptions.headers = { ...this.headers, ...requestOptions.headers };
    const res = await got({
      ...requestOptions,
      cookieJar: this.cookieJar,
      agent: this.agent
    }).catch((e) => {
      showWarningMessage('网络错误: ' + e.message);
      throw e;
    });
    return res;
  }
}

export default new Requset();
