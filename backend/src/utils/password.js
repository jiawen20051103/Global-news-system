import bcrypt from 'bcryptjs';

// 判断是否为 bcrypt 哈希串（$2a$10$... / $2b$... / $2y$...）
export const isBcryptHash = (value) => {
  if (typeof value !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$/.test(value);
};

// 密码加密
export const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

// 密码验证
export const verifyPassword = (password, hashedPassword) => {
  // 兼容：历史数据可能是明文密码（不推荐，但允许登录一次后升级）
  if (!isBcryptHash(hashedPassword)) {
    return password === hashedPassword;
  }

  try {
    return bcrypt.compareSync(password, hashedPassword);
  } catch (e) {
    // 非法哈希串等情况
    return false;
  }
};