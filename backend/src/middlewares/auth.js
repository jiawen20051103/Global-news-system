import { verifyToken } from '../utils/jwt.js';

// 认证中间件
export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ message: '无效的认证令牌' });
  }
  
  req.user = decoded;
  next();
};