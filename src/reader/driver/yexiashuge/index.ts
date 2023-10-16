import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';

const DOMAIN = 'https://www.yexiashuge.xyz/';

class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    const domain = 'https://yexiashugecom.allxiaoshuo.com/';
    try {
      const res = await request.send(domain + 'search_' + encodeURI(keyword) + '.html');
      const $ = cheerio.load(res.body);
      $('ul li').each(function (i, elem) {
        const title = $(elem).find('.h1').text();
        const author = $(elem).find('.b1').text();
        let path = $(elem).find('a').attr('href') as string;
        path = path.replace('http://m.', 'http://');
        if (title && author) {
          result.push(
            new TreeNode(
              Object.assign({}, defaultTreeNode, {
                type: '.yexiashuge',
                name: `${title} - ${author}`,
                isDirectory: true,
                path
              })
            )
          );
        }
      });
    } catch (error) {
      console.warn(error);
    }
    return result;
  }

  public async getChapter(pathStr: string): Promise<TreeNode[]> {
    let result: TreeNode[] = [];
    try {
      const res = await request.send(pathStr);
      const $ = cheerio.load(res.body);
      $('.listmain dl dd').each(function (i: number, elem: any) {
        const name = $(elem).find('a').text();
        //@ts-ignore
        const path = $(elem).find('a').attr().href;
        result.push(
          new TreeNode(
            Object.assign({}, defaultTreeNode, {
              type: '.yexiashuge',
              name,
              isDirectory: false,
              path: pathStr + path
            })
          )
        );
      });
      result = result.splice(18);
    } catch (error) {
      console.warn(error);
    }
    return result;
  }

  public async getContent(pathStr: string): Promise<string> {
    let result = '';
    try {
      const res = await request.send(pathStr);
      const $ = cheerio.load(res.body);
      const html = $('#content').html();
      result = html ? html : '';
    } catch (error) {
      console.warn(error);
    }
    return result;
  }
}

export const readerDriver = new ReaderDriver();
