const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../db.json');

if (!fs.existsSync(dbPath)) {
  console.error('db.json not found at:', dbPath);
}

const server = jsonServer.create();
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults({
  static: path.join(__dirname, '../public'),
});

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

server.use(middlewares);
server.use(router);

module.exports = (req, res) => {
  const originalUrl = req.url || '';

  // Vercel 重写到 /api/server.js 时，请求路径可能是：
  // - /api/rights
  // - /api/news
  // - /api/server/rights（旧规则）
  // 这里统一去掉前缀 /api/server 或 /api，再交给 json-server 处理
  if (originalUrl.startsWith('/api/server')) {
    req.url = originalUrl.replace('/api/server', '') || '/';
  } else if (originalUrl.startsWith('/api')) {
    req.url = originalUrl.replace('/api', '') || '/';
  }

  if (!req.url || req.url === '') {
    req.url = '/';
  }

  server(req, res);
};
