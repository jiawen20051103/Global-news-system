import express from 'express';
import { 
  getNewsList, 
  getNewsDetail, 
  createNews, 
  updateNews, 
  deleteNews, 
  auditNews, 
  publishNews 
} from '../controllers/newsController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 获取新闻列表（已发布的新闻可以公开访问）
router.get('/', (req, res, next) => {
  // 如果查询已发布的新闻（publishState=2），不需要认证
  if (req.query.publishState === '2') {
    return getNewsList(req, res, next);
  }
  // 其他情况需要认证
  return authMiddleware(req, res, () => getNewsList(req, res, next));
});

// 获取新闻详情（已发布的新闻可以公开访问）
router.get('/:id', async (req, res, next) => {
  try {
    // 先尝试获取新闻，检查是否已发布
    const News = (await import('../models/News.js')).default;
    const news = await News.findByPk(req.params.id);
    
    if (news && news.publishState === 2) {
      // 已发布的新闻可以公开访问
      return getNewsDetail(req, res, next);
    }
    // 其他情况需要认证
    return authMiddleware(req, res, () => getNewsDetail(req, res, next));
  } catch (error) {
    // 如果查询失败，需要认证
    return authMiddleware(req, res, () => getNewsDetail(req, res, next));
  }
});

// 创建新闻
router.post('/', authMiddleware, createNews);

// 更新新闻
router.put('/:id', authMiddleware, updateNews);

// 删除新闻
router.delete('/:id', authMiddleware, deleteNews);

// 审核新闻
router.put('/:id/audit', authMiddleware, auditNews);

// 发布新闻
router.put('/:id/publish', authMiddleware, publishNews);

export default router;