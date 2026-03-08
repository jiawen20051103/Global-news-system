import News from '../models/News.js';
import Category from '../models/Category.js';
import { Op } from 'sequelize';

// 获取新闻列表
export const getNewsList = async (req, res) => {
  try {
    const query = req.query;
    
    // 支持 json-server 风格的查询参数
    const { 
      page = 1, 
      pageSize = 10, 
      auditState, 
      publishState, 
      author, 
      categoryId,
      _sort,
      _order = 'DESC',
      _limit,
      _embed
    } = query;
    
    const where = {};
    
    // 处理 auditState（支持 auditState_ne 表示不等于）
    if (auditState) {
      if (auditState.includes('_ne')) {
        const value = auditState.replace('_ne', '');
        where.auditState = { [Op.ne]: parseInt(value) };
      } else {
        where.auditState = parseInt(auditState);
      }
    }
    
    // 处理 publishState（支持 publishState_lte 表示小于等于）
    if (publishState) {
      if (publishState.includes('_lte')) {
        const value = publishState.replace('_lte', '');
        where.publishState = { [Op.lte]: parseInt(value) };
      } else {
        where.publishState = parseInt(publishState);
      }
    }
    
    if (author) {
      where.author = author;
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    // 处理排序
    let order = [['createTime', 'DESC']];
    if (_sort) {
      const sortField = _sort.startsWith('-') ? _sort.slice(1) : _sort;
      const sortOrder = _sort.startsWith('-') ? 'DESC' : (_order === 'ASC' ? 'ASC' : 'DESC');
      order = [[sortField, sortOrder]];
    }
    
    // 处理分页
    const limit = _limit ? parseInt(_limit) : parseInt(pageSize);
    const offset = _limit ? 0 : (parseInt(page) - 1) * parseInt(pageSize);
    
    const { count, rows } = await News.findAndCountAll({
      where,
      offset,
      limit,
      order
    });
    
    // 如果需要关联分类信息，手动查询并添加
    let result = rows;
    if (_embed === 'category' || _embed?.includes('category')) {
      const categoryIds = [...new Set(rows.map(news => news.categoryId).filter(Boolean))];
      if (categoryIds.length > 0) {
        const categories = await Category.findAll({
          where: { id: { [Op.in]: categoryIds } }
        });
        const categoryMap = {};
        categories.forEach(cat => {
          categoryMap[cat.id] = cat;
        });
        
        result = rows.map(news => {
          const newsData = news.toJSON ? news.toJSON() : news;
          if (newsData.categoryId && categoryMap[newsData.categoryId]) {
            newsData.category = categoryMap[newsData.categoryId];
          }
          return newsData;
        });
      } else {
        result = rows.map(news => news.toJSON ? news.toJSON() : news);
      }
    } else {
      result = rows.map(news => news.toJSON ? news.toJSON() : news);
    }
    
    // 如果前端期望数组格式（兼容旧代码），返回数组；否则返回分页格式
    const isArrayFormat = !page && !pageSize && !_limit;
    
    if (isArrayFormat) {
      res.status(200).json(result);
    } else {
      res.status(200).json({
        total: count,
        list: result
      });
    }
  } catch (error) {
    console.error('获取新闻列表错误:', error);
    res.status(500).json({ message: '获取新闻列表失败', error: error.message });
  }
};

// 获取新闻详情
export const getNewsDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);
    
    if (!news) {
      return res.status(404).json({ message: '新闻不存在' });
    }
    
    // 增加浏览量
    news.view += 1;
    await news.save();
    
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ message: '获取新闻详情失败', error });
  }
};

// 创建新闻
export const createNews = async (req, res) => {
  try {
    const { title, categoryId, summary, content, region, author, roleId } = req.body;
    
    // 生成唯一ID
    const id = Math.random().toString(36).substr(2, 4);
    
    const newNews = await News.create({
      id,
      title,
      categoryId,
      summary,
      content,
      region,
      author,
      roleId,
      auditState: 0, // 待审核
      publishState: 0, // 未发布
      createTime: Date.now(),
      publishTime: 0,
      star: 0,
      view: 0
    });
    
    res.status(201).json({ message: '新闻创建成功', news: newNews });
  } catch (error) {
    res.status(500).json({ message: '新闻创建失败', error });
  }
};

// 更新新闻
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, categoryId, summary, content, region } = req.body;
    
    const news = await News.findByPk(id);
    
    if (!news) {
      return res.status(404).json({ message: '新闻不存在' });
    }
    
    // 更新新闻
    await news.update({
      title,
      categoryId,
      summary,
      content,
      region,
      auditState: 0 // 重新审核
    });
    
    res.status(200).json({ message: '新闻更新成功', news });
  } catch (error) {
    res.status(500).json({ message: '新闻更新失败', error });
  }
};

// 删除新闻
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findByPk(id);
    
    if (!news) {
      return res.status(404).json({ message: '新闻不存在' });
    }
    
    await news.destroy();
    res.status(200).json({ message: '新闻删除成功' });
  } catch (error) {
    res.status(500).json({ message: '新闻删除失败', error });
  }
};

// 审核新闻
export const auditNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { auditState } = req.body;
    
    const news = await News.findByPk(id);
    
    if (!news) {
      return res.status(404).json({ message: '新闻不存在' });
    }
    
    await news.update({ auditState });
    res.status(200).json({ message: '新闻审核成功', news });
  } catch (error) {
    res.status(500).json({ message: '新闻审核失败', error });
  }
};

// 发布新闻
export const publishNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { publishState } = req.body;
    
    const news = await News.findByPk(id);
    
    if (!news) {
      return res.status(404).json({ message: '新闻不存在' });
    }
    
    await news.update({
      publishState,
      publishTime: publishState === 2 ? Date.now() : 0
    });
    
    res.status(200).json({ message: '新闻发布状态更新成功', news });
  } catch (error) {
    res.status(500).json({ message: '新闻发布状态更新失败', error });
  }
};