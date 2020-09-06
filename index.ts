import * as http from 'http'
import { IncomingMessage, ServerResponse, } from 'http'
import * as fs from 'fs'
import * as p from 'path'
import * as url from 'url'

const server = http.createServer()
//__dirname 当前文件所在目录
const publicDir = p.resolve(__dirname, 'public')

let cacheAge = 3600 * 24 * 265

server.on('request', (request: IncomingMessage, response: ServerResponse) => {
  const { method, url: path, headers, } = request
  const { pathname, search } = url.parse(path)

  if (method !== 'GET') {
    response.statusCode = 405
    response.end('this response is not real')
    return
  }

  let filename = pathname.substr(1)
  if (!filename) {
    filename = 'index.html'
  }
  fs.readFile(p.resolve(publicDir, filename), (error, data) => {
    if (error) {
      if (error.errno === -2) {
        fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
          response.statusCode = 404
          response.end(data)
        })
      } else {
        response.statusCode = 500
        response.end('system busy !')
      }
    } else {
      response.setHeader('Cache-Control', `public, max-age=${cacheAge}`)
      response.end(data)
    }
  })
})

server.listen(7777)