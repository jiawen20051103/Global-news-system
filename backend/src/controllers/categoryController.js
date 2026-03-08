import Category from '../models/Category.js';


// 获取分类列表
export const getCategoryList = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: '获取分类列表失败', error });
  }
};

// 获取分类详情
export const getCategoryDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: '获取分类详情失败', error });
  }
};

// 创建分类
export const createCategory = async (req, res) => {
  try {
    const { title, value } = req.body;
    
    // 生成唯一ID
    const id = Math.random().toString(36).substr(2, 4);
    
    const newCategory = await Category.create({
      id,
      title,
      value
    });
    
    res.status(201).json({ message: '分类创建成功', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: '分类创建失败', error });
  }
};

// 更新分类
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value } = req.body;
    
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    
    await category.update({
      title,
      value
    });
    
    res.status(200).json({ message: '分类更新成功', category });
  } catch (error) {
    res.status(500).json({ message: '分类更新失败', error });
  }
};

// 删除分类
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' });
    }
    
    await category.destroy();
    res.status(200).json({ message: '分类删除成功' });
  } catch (error) {
    res.status(500).json({ message: '分类删除失败', error });
  }
};