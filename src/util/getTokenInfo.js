const getTokenInfo = () => {
  const tokenStr = localStorage.getItem('token');
  if (!tokenStr) return {};

  try {
    return JSON.parse(tokenStr);
  } catch (err) {
    console.error('token 解析失败', err);
    localStorage.removeItem('token');
    return {};
  }
};

export default getTokenInfo;

