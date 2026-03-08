import User from '../models/User.js';
import Role from '../models/Role.js';
import { generateToken } from '../utils/jwt.js';
import { verifyPassword, hashPassword, isBcryptHash } from '../utils/password.js';

// 登录
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 验证密码
    const storedPassword = user.password;
    const passwordOk = verifyPassword(password, storedPassword);
    if (!passwordOk) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 登录成功后：如果是历史明文密码，自动升级为 bcrypt 哈希
    if (storedPassword && !isBcryptHash(storedPassword)) {
      try {
        await user.update({ password: hashPassword(password) });
      } catch (e) {
        // 升级失败不影响登录，只记录日志
        console.warn('密码自动升级失败:', e?.message || e);
      }
    }
    
    // 获取角色信息
    let role = null;
    if (user.roleId) {
      role = await Role.findByPk(user.roleId);
    }
    
    // 生成令牌
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        roleId: user.roleId,
        roleState: user.roleState,
        default: user.default,
        region: user.region,
        role: role ? {
          id: role.id,
          roleName: role.roleName,
          roleType: role.roleType,
          rights: role.rights
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error });
  }
};

// 注册
export const register = async (req, res) => {
  try {
    const { username, password, region, roleId } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 生成唯一ID
    const id = Math.random().toString(36).substr(2, 4);
    
    // 创建新用户
    const newUser = await User.create({
      id,
      username,
      password: hashPassword(password),
      region,
      roleId,
      roleState: true,
      default: false
    });
    
    res.status(201).json({ message: '注册成功', user: newUser });
  } catch (error) {
    res.status(500).json({ message: '注册失败', error });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      roleId: user.roleId,
      roleState: user.roleState,
      default: user.default,
      region: user.region
    });
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error });
  }
};