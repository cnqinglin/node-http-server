# node-http-server
Node.js实现http静态服务器


# 1. 实现最简单的Node.js服务器并访问：
```
    第一步：yarn init -y    // 生成package.json 文件
    第二步:新建 index.ts文件
    第三步： 执行 yarn add --dev @types/node    //安装 node.js 所有模块的声明文件
    第四步：http.createServer()           // http创建server
    第五步：监听 server 的request事件
    第六步：server.listen(8888)  // 监听8888端口
    第七步-get请求：另起一个终端，curl -v http://localhost:8888/xxxx   访问这个最简单的服务器,这是get请求
    第七步-post请求：另起一个终端，curl -v -d "name:qinglin" http://localhost:8888/xxxx  访问这个最简单的服务器,这是post请求
    
```

--------------------------------

# 2. http 模块 request对象：
* 代码中 **server** 是http.Server类的一个实例，class server extends http.Server,因此，这个 server 有了几个事件和方法，比如代码中的'request'和'listen'事件。
* **http.createServer([options],[requestListener])** 
    
    * options中包含多个选项：
        
        * IncomingMassage —— 是由http.Server/http.ClientRequest创建，并作为第一个参数传给'request'和'response'事件，他可以用于访问响应状态、消息头、以及数据。
        * serverResponse —— 此对象由http服务器在内部创建，而不是由用户创建，作为第二个参数传给'request'事件。
        * inscureHTTPParser —— true/false,true时可以接受无效的http请求头，应避免使用不安全的解析器。
        * maxHeaderSize —— 请求头的最大长度，以字节为单位，默认长度为 16384字节(16KB)。
    * requestListener —— 监听请求服务器的端口号
    * 返回一个新的http.Server 实例：
        
        * 此类中有很多事件，比如：

            * 'request'事件，返回值两个参数：request/response —— 分别由IncomingMessage和ServerResponse两个累构造出来的。

* **http.Server**继承自 net.Server 

    * 因此server拥有几个事件和方法：比如：close事件、error事件、listen事件等。
    
--------------------------------

# 3.使用 Node.js获取请求内容

##  1.get请求：

   表示客户端向服务器获取资源时使用，特点为无请求体、靠地址栏传递查询字符串
   ```
   curl -v http://localhost:8888/xxxx
   ```

## 2. get 请求的组成：，（post 请求也差不多。） 
   * 1. 请求行：GET /xxxx HTTP/1.1
   * 2. 请求头：
       * 1. Host: localhost:8888  // 请求哪一个主机
       * 2. Connection:keep-alive  // 告诉服务器需要持久连接
       * 3. User-Agent:curl/7.75.0  // 告诉服务器浏览器的类型
       * 4. Accept-Languge:zh-cn  // 告诉服务器自己能接纳的自然语言
       * 5. Accept-Encoding:gzip  // 告诉服务器自己能接纳的数据压缩类型
       * 6. Referer: http:localhost/Day01/login.html // 请求来自哪一个页面
   * 3. 请求体：get请求体为空,post 请求体不为空


## 2. post 请求：
   表示想服务器传递数据时使用，特点是有请求体。

    ```
     curl -v -d "name:qinglin" http://localhost:8888/xxxx
    ```
* 获取请求消息体的内容，就要监听data事件：

    // 请求体会一小段一小段的传过去，这时候会一直监听data事件,知道请求结束
        request.on('data',(chunk) => {
            console.log(chunk);
        })
    // 当请求结束时，会触发end事件
    request.on('end',()=>{
        // 把上面的chunk连接起来
        Buffer.concat(chunk).toString()
    })
    ```
# 4. http 模块 response对象 —— 
 拥有getHeader\setHeader\end\write等多种方法;也有statusCode 属性，默认200 OK;继承了Stream.
* 响应头可以新增或修改，比如
    ```
    response.setHeader('Content-Type','image/png')  // 前面是key，后面是value
    ```
    响应体里面新增数据可以通过response.write()方法实现:,可以响应多次
    ```
        response.write('1 \n')
        response.write('2 \n')
    ```

# 5. 五个任务：
  * 目标一 —— 根据不同的url ，返回不同的文件
  * 目标二：查询字符串
  * 目标三：匹配任意文件
  * 目标四：处理不存在的文件
  * 目标五：完成其他目标

    * 处理非get请求(静态服务器是不允许发起post请求的)
    * 添加缓存选项，如果后面的请求内容跟之前的一样的请求，就不需要再次请求了，Cache-Control,除了首页其他的都不需要再次请求。
* 一般静态文件放到 static文件中。
