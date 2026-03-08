import express from 'express';
import { 
  getRightList, 
  getRightDetail, 
  createRight, 
  updateRight, 
  deleteRight 
} from '../controllers/rightController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取权限列表（公开接口，路由配置需要）
router.get('/', getRightList);

// 获取权限详情
router.get('/:id', authMiddleware, getRightDetail);

// 创建权限
router.post('/', authMiddleware, createRight);

// 更新权限
router.put('/:id', authMiddleware, updateRight);

// 删除权限
router.delete('/:id', authMiddleware, deleteRight);

export default router;