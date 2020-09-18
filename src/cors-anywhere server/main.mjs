import cors from 'cors-anywhere'

const host = process.env.host || '0.0.0.0'
const port = process.env.port || 8080

cors.createServer({
    originWhiteList: [],
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, () => 
    console.log(`Running CORS anywhere on ${host}:${port}`))