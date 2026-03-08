import express from 'express';
import { 
  getRegionList, 
  getRegionDetail, 
  createRegion, 
  updateRegion, 
  deleteRegion 
} from '../controllers/regionController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取地区列表（公开接口，注册时需要）
router.get('/', getRegionList);

// 获取地区详情
router.get('/:id', authMiddleware, getRegionDetail);

// 创建地区
router.post('/', authMiddleware, createRegion);

// 更新地区
router.put('/:id', authMiddleware, updateRegion);

// 删除地区
router.delete('/:id', authMiddleware, deleteRegion);

export default router;