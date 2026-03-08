// src/routes/child.js
import express from 'express';
import { getChildList } from '../controllers/childController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取子权限列表（公开接口，路由配置需要）
router.get('/', getChildList);

export default router;