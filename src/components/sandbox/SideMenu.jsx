import './index.css';
import { useEffect, useState,useCallback  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import request from '../../util/request';
import { Layout, Menu } from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  UploadOutlined,
  // 根据需要添加其他图标
} from '@ant-design/icons';
import { connect  } from 'react-redux';

const { Sider } = Layout;

// 图标映射表，根据接口返回的key匹配对应的图标
const iconMap = {
  '/home': <UserOutlined />,
  '/user-manage': <VideoCameraOutlined />,
  '/user-manage/list': <UserOutlined />,
  '/right-manage': <UploadOutlined />,
  '/right-manage/role/list': <UserOutlined />,
  '/right-manage/right/list': <UserOutlined />,
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
        // 当本地 token 中没有权限信息时，默认根据 pagepermisson 放行
        if (!Array.isArray(rights) || rights.length === 0) {
          return item.pagepermisson === 1
        }
        return item.pagepermisson === 1 && rights.includes(item.key);
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

  // 1. 监听localStorage中token的变化，更新rights状态
  useEffect(() => {
    const getRights = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const { role } = JSON.parse(token);
          setRights(role?.rights || []); // 安全获取rights
        } else {
          setRights([]); // 无token时清空权限
        }
      } catch (error) {
        console.error('解析token失败:', error);
        setRights([]);
      }
    };

    getRights();

    // 监听localStorage变化（如登录后token更新）
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        getRights();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 清理监听
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 2. 当rights变化时，重新获取并转换菜单数据
  useEffect(() => {
    if (rights.length === 0) return; // 权限为空时不请求（避免无效请求）

    request.get('/rights?_embed=children')
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : []
        const formattedMenu = transformMenuData(data);
        setMenu(formattedMenu);
      })
      .catch((error) => {
        console.error('获取菜单失败:', error)
        setMenu([])
      })
  }, [rights,transformMenuData]); 

  const onClick = e => {
    // console.log('点击菜单项:', e);
    navigate(e.key);
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
