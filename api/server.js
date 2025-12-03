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
  const originalUrl = req.url;
  
  if (originalUrl.startsWith('/api/server')) {
    req.url = originalUrl.replace('/api/server', '') || '/';
  }
  
  if (req.url === '/' || req.url === '') {
    req.url = '/';
  }
  
  server(req, res);
};
