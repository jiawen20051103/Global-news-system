import './index.css';
import { useEffect, useState,useCallback  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import request from '../../util/request';
import { Layout, Menu, Modal } from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  UploadOutlined,
  AuditOutlined,
  CloudUploadOutlined,
  ProductOutlined,
  // 根据需要添加其他图标
} from '@ant-design/icons';
import { connect  } from 'react-redux';
import { checkLogin, getGuestRights } from '@/util/checkLogin';

const { Sider } = Layout;

// 图标映射表，根据接口返回的key匹配对应的图标
const iconMap = {
  '/home': <UserOutlined />,
  '/user-manage': <VideoCameraOutlined />,
  '/user-manage/list': <UserOutlined />,
  '/right-manage': <UploadOutlined />,
  '/right-manage/role/list': <UserOutlined />,
  '/right-manage/right/list': <UserOutlined />,
  '/audit-manage': <AuditOutlined />,
  '/publish-manage': <CloudUploadOutlined />,
  '/news-manage': <ProductOutlined />,
  // 可以根据需要添加更多图标映射
};

const SideMenu=(props)=> {
  const [menu, setMenu] = useState([]);
  const [rights, setRights] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const transformMenuData = useCallback((items) => {
    if (!Array.isArray(items)) {
      return []
    }

    return items.map(item => {
      // 权限检查：使用组件内部的rights状态
      const checkPermission = () => {
        const pagePerm = Number(item.pagepermisson);

        // 当本地没有权限信息时，默认根据 pagepermisson 放行
        if (!Array.isArray(rights) || rights.length === 0) {
          return pagePerm === 1;
        }

        // 有权限信息时，必须同时满足：页面允许显示 + 当前角色拥有该路由 key
        return pagePerm === 1 && rights.includes(item.key);
      };

      if (!checkPermission()) {
        return null; // 无权限则不生成该菜单项
      }

      // 构建菜单项
      const menuItem = {
        key: item.key,
        label: item.title,
        icon: iconMap[item.key] || null,
        pagepermisson: item.pagepermisson,
        grade: item.grade,
      };

      // 递归处理子菜单
      if (item.children && item.children.length > 0) {
        const filteredChildren = transformMenuData(item.children).filter(Boolean);
        if (filteredChildren.length > 0) {
          menuItem.children = filteredChildren;
        }
      }

      return menuItem;
    }).filter(Boolean); // 过滤掉null（无权限的项）
  },[rights])

  // 1. 根据当前登录状态和路由，计算权限（登录后切页也会刷新一次）
  useEffect(() => {
    const getRights = () => {
      try {
        const isLogin = checkLogin();
        if (isLogin) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            setRights(user?.role?.rights || []); // 安全获取rights
          } else {
            setRights([]);
          }
        } else {
          // 未登录用户使用区域编辑的权限（只读）
          setRights(getGuestRights());
        }
      } catch (error) {
        console.error('解析用户信息失败:', error);
        setRights(getGuestRights());
      }
    };

    getRights();
  }, [location.pathname]);

  // 2. 当rights变化时，重新获取并转换菜单数据
  useEffect(() => {
    // 分别获取 rights 和 children，然后在前端合并
    Promise.all([
      request.get('/rights').catch(() => ({ data: [] })),
      request.get('/children').catch(() => ({ data: [] })),
    ])
      .then(([rightsRes, childrenRes]) => {
        const rightsData = Array.isArray(rightsRes.data) ? rightsRes.data : (rightsRes.data?.list || [])
        const childrenData = Array.isArray(childrenRes.data) ? childrenRes.data : (childrenRes.data?.list || [])
        
        // 将 children 按 rightId 分组，然后合并到 rights 中
        const childrenByRightId = {}
        childrenData.forEach(child => {
          if (child.rightId) {
            if (!childrenByRightId[child.rightId]) {
              childrenByRightId[child.rightId] = []
            }
            childrenByRightId[child.rightId].push(child)
          }
        })
        
        // 将 children 添加到对应的 right 中
        const data = rightsData.map(right => ({
          ...right,
          children: childrenByRightId[right.id] || []
        }))
        
        // console.log('获取到的菜单数据:', data)
        // console.log('当前用户权限:', rights)
        const formattedMenu = transformMenuData(data);
        // console.log('格式化后的菜单:', formattedMenu)
        setMenu(formattedMenu);
      })
      .catch((error) => {
        console.error('获取菜单失败:', error)
        setMenu([])
      })
  }, [rights,transformMenuData]); 

  const onClick = e => {
    const targetPath = e.key;
    // 如果当前有未保存的新闻编辑/更新内容，先提醒
    if (typeof window !== 'undefined' && window.__NEWS_EDIT_DIRTY) {
      Modal.confirm({
        title: '当前内容未保存',
        content: '确定要离开当前页面吗？未保存的内容将会丢失。',
        okText: '仍要离开',
        cancelText: '取消',
        onOk: () => {
          window.__NEWS_EDIT_DIRTY = false;
          navigate(targetPath);
        },
      });
      return;
    }
    navigate(targetPath);
  };

  const openKeys = ['/' + location.pathname.split('/')[1]]

  return (
    <Sider trigger={null} collapsible collapsed={props.isCollapsed} className="sider-container">
      <div className="sider-content">
        <div className="demo-logo-vertical">全球新闻发布管理系统</div>
        <div className='menu-scroll-container'>
          <Menu
            onClick={onClick}
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}  // 使用实际存在的key
            defaultOpenKeys={openKeys}
            items={menu}  // 使用转换后的菜单数据
          /> 
        </div> 
      </div>
    </Sider>
  );
}

const mapStateToProps = ({CollapsedReducer:{isCollapsed}}) => ({
    isCollapsed
})

export default connect(mapStateToProps)(SideMenu)
