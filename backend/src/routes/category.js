import express from 'express';
import { 
  getCategoryList, 
  getCategoryDetail, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../controllers/categoryController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取分类列表（公开接口，首页需要）
router.get('/', getCategoryList);

// 获取分类详情
router.get('/:id', authMiddleware, getCategoryDetail);

// 创建分类
router.post('/', authMiddleware, createCategory);

// 更新分类
router.put('/:id', authMiddleware, updateCategory);

// 删除分类
router.delete('/:id', authMiddleware, deleteCategory);

export default router;