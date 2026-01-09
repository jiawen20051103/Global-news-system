/**
 * 检查用户是否登录
 * @returns {boolean} 是否已登录
 */
export const checkLogin = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * 获取区域编辑的默认权限（用于未登录用户）
 * @returns {Array} 权限列表
 */
export const getGuestRights = () => {
  // 区域编辑的完整权限列表（只读视图，实际操作由业务代码拦截）
  // 与 db.json 中 id 为 3 的角色权限保持一致
  return [
    "/home",
    "/audit-manage",
    "/audit-manage/list",
    "/audit-manage",
    "/audit-manage/list",
    "/publish-manage",
    "/publish-manage/unpublished",
    "/publish-manage/published",
    "/publish-manage/sunset",
    "/news-manage",
    "/news-manage/list",
    "/news-manage/add",
    "/news-manage/update/:id",
    "/news-manage/preview/:id",
    "/news-manage/draft",
  ];
};

