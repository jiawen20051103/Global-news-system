// src/controllers/childController.js
import Child from '../models/Child.js';

// 获取子权限列表
export const getChildList = async (req, res) => {
  try {
    const children = await Child.findAll();
    res.status(200).json(children);
  } catch (error) {
    res.status(500).json({ message: '获取子权限列表失败', error });
  }
};

// 其他CRUD操作...