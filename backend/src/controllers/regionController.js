import Region from '../models/Region.js';

// 获取地区列表
export const getRegionList = async (req, res) => {
  try {
    const regions = await Region.findAll();
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ message: '获取地区列表失败', error });
  }
};

// 获取地区详情
export const getRegionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const region = await Region.findByPk(id);
    
    if (!region) {
      return res.status(404).json({ message: '地区不存在' });
    }
    
    res.status(200).json(region);
  } catch (error) {
    res.status(500).json({ message: '获取地区详情失败', error });
  }
};

// 创建地区
export const createRegion = async (req, res) => {
  try {
    const { title, value } = req.body;
    
    // 生成唯一ID
    const id = Math.random().toString(36).substr(2, 4);
    
    const newRegion = await Region.create({
      id,
      title,
      value
    });
    
    res.status(201).json({ message: '地区创建成功', region: newRegion });
  } catch (error) {
    res.status(500).json({ message: '地区创建失败', error });
  }
};

// 更新地区
export const updateRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, value } = req.body;
    
    const region = await Region.findByPk(id);
    
    if (!region) {
      return res.status(404).json({ message: '地区不存在' });
    }
    
    await region.update({
      title,
      value
    });
    
    res.status(200).json({ message: '地区更新成功', region });
  } catch (error) {
    res.status(500).json({ message: '地区更新失败', error });
  }
};

// 删除地区
export const deleteRegion = async (req, res) => {
  try {
    const { id } = req.params;
    const region = await Region.findByPk(id);
    
    if (!region) {
      return res.status(404).json({ message: '地区不存在' });
    }
    
    await region.destroy();
    res.status(200).json({ message: '地区删除成功' });
  } catch (error) {
    res.status(500).json({ message: '地区删除失败', error });
  }
};