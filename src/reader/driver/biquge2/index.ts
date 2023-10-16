import * as cheerio from 'cheerio';
import request from '../../../utils/request';
import { TreeNode, defaultTreeNode } from '../../../explorer/TreeNode';
import { ReaderDriver as ReaderDriverImplements } from '../../../@types';

const DOMAIN = 'https://www.egyguard.com';

class ReaderDriver implements ReaderDriverImplements {
  public hasChapter() {
    return true;
  }

  public async search(keyword: string): Promise<TreeNode[]> {
    const result: TreeNode[] = [];
    try {
      const res = await request.send(DOMAIN + '/s?q=' + keyword);
      const $ = cheerio.load(res.body);
      console.log(res.body);
      $('.box').each(function (i, elem) {
        const title = $(elem).find('a').text();
        const author = $(elem).find('.author').text();
        let path = $(elem).find('a').attr('href') as string;
        path = DOMAIN + path;
        console.log(title, author, path);
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
      // console.log(res);
      console.log(res.body);
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
