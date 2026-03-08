import Right from '../models/Right.js';

// 获取权限列表
export const getRightList = async (req, res) => {
  try {
    const rights = await Right.findAll();
    res.status(200).json(rights);
  } catch (error) {
    res.status(500).json({ message: '获取权限列表失败', error });
  }
};

// 获取权限详情
export const getRightDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const right = await Right.findByPk(id);
    
    if (!right) {
      return res.status(404).json({ message: '权限不存在' });
    }
    
    res.status(200).json(right);
  } catch (error) {
    res.status(500).json({ message: '获取权限详情失败', error });
  }
};

// 创建权限
export const createRight = async (req, res) => {
  try {
    const { title, key, pagepermisson, grade } = req.body;
    
    // 生成唯一ID
    const id = Math.random().toString(36).substr(2, 4);
    
    const newRight = await Right.create({
      id,
      title,
      key,
      pagepermisson,
      grade
    });
    
    res.status(201).json({ message: '权限创建成功', right: newRight });
  } catch (error) {
    res.status(500).json({ message: '权限创建失败', error });
  }
};

// 更新权限
export const updateRight = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, key, pagepermisson, grade } = req.body;
    
    const right = await Right.findByPk(id);
    
    if (!right) {
      return res.status(404).json({ message: '权限不存在' });
    }
    
    await right.update({
      title,
      key,
      pagepermisson,
      grade
    });
    
    res.status(200).json({ message: '权限更新成功', right });
  } catch (error) {
    res.status(500).json({ message: '权限更新失败', error });
  }
};

// 删除权限
export const deleteRight = async (req, res) => {
  try {
    const { id } = req.params;
    const right = await Right.findByPk(id);
    
    if (!right) {
      return res.status(404).json({ message: '权限不存在' });
    }
    
    await right.destroy();
    res.status(200).json({ message: '权限删除成功' });
  } catch (error) {
    res.status(500).json({ message: '权限删除失败', error });
  }
};