import express from 'express';
import { 
  getRoleList, 
  getRoleDetail, 
  createRole, 
  updateRole, 
  deleteRole 
} from '../controllers/roleController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取角色列表
router.get('/', authMiddleware, getRoleList);

// 获取角色详情
router.get('/:id', authMiddleware, getRoleDetail);

// 创建角色
router.post('/', authMiddleware, createRole);

// 更新角色
router.put('/:id', authMiddleware, updateRole);

// 删除角色
router.delete('/:id', authMiddleware, deleteRole);

export default router;