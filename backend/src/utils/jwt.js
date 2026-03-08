import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// 生成JWT令牌
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    roleId: user.roleId
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// 验证JWT令牌
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};