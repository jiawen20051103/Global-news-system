import express from 'express';
import userRoutes from './user.js';
import newsRoutes from './news.js';
import roleRoutes from './role.js';
import rightRoutes from './right.js';
import categoryRoutes from './category.js';
import regionRoutes from './region.js';
import authRoutes from './auth.js';
import childRoutes from './child.js';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/news', newsRoutes);
router.use('/roles', roleRoutes);
router.use('/rights', rightRoutes);
router.use('/categories', categoryRoutes);
router.use('/regions', regionRoutes);
router.use('/auth', authRoutes);
router.use('/children', childRoutes);

export default router;