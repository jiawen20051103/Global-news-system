const getTokenInfo = () => {
  // 从 localStorage 获取用户信息
  const userStr = localStorage.getItem('user');
  if (!userStr) return {};

  try {
    return JSON.parse(userStr);
  } catch (err) {
    console.error('用户信息解析失败', err);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return {};
  }
};

export default getTokenInfo;

