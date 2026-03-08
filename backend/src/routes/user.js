import express from 'express';
import { 
  getUserList, 
  getUserDetail, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取用户列表
router.get('/', authMiddleware, getUserList);

// 获取用户详情
router.get('/:id', authMiddleware, getUserDetail);

// 创建用户
router.post('/', authMiddleware, createUser);

// 更新用户
router.put('/:id', authMiddleware, updateUser);

// 删除用户
router.delete('/:id', authMiddleware, deleteUser);

export default router;