import Role from '../models/Role.js';

// 获取角色列表
export const getRoleList = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: '获取角色列表失败', error });
  }
};

// 获取角色详情
export const getRoleDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: '获取角色详情失败', error });
  }
};

// 创建角色
export const createRole = async (req, res) => {
  try {
    const { roleName, roleType, rights } = req.body;
    
    // 生成唯一ID
    const id = Math.random().toString(36).substr(2, 4);
    
    const newRole = await Role.create({
      id,
      roleName,
      roleType,
      rights
    });
    
    res.status(201).json({ message: '角色创建成功', role: newRole });
  } catch (error) {
    res.status(500).json({ message: '角色创建失败', error });
  }
};

// 更新角色
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleName, roleType, rights } = req.body;
    
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    
    await role.update({
      roleName,
      roleType,
      rights
    });
    
    res.status(200).json({ message: '角色更新成功', role });
  } catch (error) {
    res.status(500).json({ message: '角色更新失败', error });
  }
};

// 删除角色
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    
    await role.destroy();
    res.status(200).json({ message: '角色删除成功' });
  } catch (error) {
    res.status(500).json({ message: '角色删除失败', error });
  }
};