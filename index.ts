import * as http from "http"
import { IncomingMessage, ServerResponse } from 'http'
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';


const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public')  // 这就能获取public的绝对路径
const cacheAge = 3600 * 24 * 265;

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    /** 测试代码开始**/
    // // console.log('url',request.url)
    // // console.log('headers',request.headers)
    // // console.log('method',request.method)
    // const array = []
    // request
    //     // 请求时为什么非要片段上传？因为跟TCP 的底层原理有关
    //     .on('data', (chunk:Buffer) => {   // 上传的数据可以说一定是Buffer
    //         array.push(chunk)
    //     })
    //     .on('end',()=>{
    //         const body = Buffer.concat(array).toString() // 把请求体连接    
    //         console.log('body',body)
    //         // response.statusCode = 404
    //         // response.setHeader('Content-Type','image/png')  // 请求头中的都可以修改，也可以新增响应头
    //         // response.write()方法可以响应多次
    //         response.write('1  \n')
    //         response.write('2  \n')
    //         response.write('3  \n')
    //         response.end()  // 请求处理完了才能响应
    //     });
    /** 测试代码结束**/
    const { method, url: path, headers } = request; // 这样引入的话，只能url:path这样改

    // 对methd进行过滤,对于非get请求进行处理
    if(method !== 'GET'){
        response.statusCode = 405 // 不允许发起请求
        response.end('not allowed')
        return;
    }

    const obj = url.parse(path)   // 已经弃用，获取对象
    const { pathname, search } = obj
    // 目标三：匹配任意文件
    let fileName = pathname.substring(1);
    if(fileName === ''){
        fileName = 'index.html'
    }
    fs.readFile(p.resolve(publicDir, fileName), (error, data) => {
        if (error) {
            if (error.errno === -4058) {
                response.statusCode = 404
                fs.readFile(p.resolve(publicDir,'err.html'),(err,data)=>{
                    if(err) throw err
                    response.end(data)
                })
            }else if(error.errno === 4068){
                response.statusCode = 403 // 无权访问
                response.end('无权访问！')
            } else {
                response.statusCode = 500
                response.end('服务器繁忙，请稍后重试')
            }
        } else {
            // 添加缓存机制
            response.setHeader('Cache-Control',`public, max-age=${cacheAge}`);
            response.end(data)
        }
    })
    // 目标一 ———— 根据url返回不同的文件
    // switch (pathname) {
    //     case '/index.html':
    //         response.setHeader('Content-Type', 'text/html;charset=utf-8')
    //         fs.readFile(p.resolve(publicDir, 'index.html'), (error, data) => {
    //             if (error) throw error;
    //             response.end(data.toString())
    //         });
    //         break;
    //     case '/style.css':
    //         response.setHeader('Content-Type', 'text/css;charset=utf-8')   // 声明类型
    //         fs.readFile(p.resolve(publicDir, 'style.css'), (error, data) => {
    //             if (error) throw error;
    //             response.end(data.toString())
    //         });
    //         break;
    //     case '/main.js':
    //         response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
    //         fs.readFile(p.resolve(publicDir, 'main.js'), (error, data) => {
    //             if (error) throw error;
    //             response.end(data.toString())
    //         });
    //         break;
    //     default:
    //         response.statusCode = 404
    //         response.end()
    // }
});

server.listen(8888);