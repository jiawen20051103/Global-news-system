import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';

// 获取用户列表
export const getUserList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, username, region, roleId } = req.query;
    
    const where = {};
    
    if (username) {
      where.username = username;
    }
    
    if (region) {
      where.region = region;
    }
    
    if (roleId) {
      where.roleId = roleId;
    }
    
    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);
    
    const { count, rows } = await User.findAndCountAll({
      where,
      offset,
      limit
    });
    
    res.status(200).json({
      total: count,
      list: rows
    });
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败', error });
  }
};

// 获取用户详情
export const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户详情失败', error });
  }
};

// 创建用户
export const createUser = async (req, res) => {
  try {
    const { username, password, region, roleId } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 生成唯一ID
    const id = Math.random().toString(36).substr(2, 4);
    
    const newUser = await User.create({
      id,
      username,
      password: hashPassword(password),
      region,
      roleId,
      roleState: true,
      default: false
    });
    
    res.status(201).json({ message: '用户创建成功', user: newUser });
  } catch (error) {
    res.status(500).json({ message: '用户创建失败', error });
  }
};

// 更新用户
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, region, roleId, roleState } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 更新用户
    const updateData = {
      username,
      region,
      roleId,
      roleState
    };
    
    if (password) {
      updateData.password = hashPassword(password);
    }
    
    await user.update(updateData);
    res.status(200).json({ message: '用户更新成功', user });
  } catch (error) {
    res.status(500).json({ message: '用户更新失败', error });
  }
};

// 删除用户
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    await user.destroy();
    res.status(200).json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ message: '用户删除失败', error });
  }
};