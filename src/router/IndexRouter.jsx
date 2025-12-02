import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import request from '@/util/request.js'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import Login from '../views/login/Login.jsx'
import NewsSandBox from '../views/sandbox/NewsSandBox.jsx'
import Home from '../views/sandbox/home/Home.jsx'
import UserList from '../views/sandbox/user-manage/UserList.jsx'
import RightList from '../views/sandbox/right-manage/RightList.jsx'
import RoleList from '../views/sandbox/right-manage/RoleList.jsx'
import NoPermission from '../views/sandbox/nopermission/NoPermission.jsx'
import NewsAdd from '../views/sandbox/news-manage/NewsAdd'
import NewsDraft from '../views/sandbox/news-manage/NewsDraft'
import NewsCategory from '../views/sandbox/news-manage/NewsCategory'
import Audit from '../views/sandbox/audit-manage/Audit.jsx'
import AuditList from '../views/sandbox/audit-manage/AuditList.jsx'
import Unpublished from '../views/sandbox/publish-manage/Unpublished.jsx'
import Published from '../views/sandbox/publish-manage/Published.jsx'
import Sunset from '../views/sandbox/publish-manage/Sunset.jsx'
import NewsPreview from '@/components/sandbox/news-manage/NewsPreview'
import NewsUpdate from '@/components/sandbox/news-manage/NewsUpdate'
import News from '@/views/news/News'
import Detail from '@/views/news/Detail'
import getTokenInfo from '@/util/getTokenInfo'

const LocalRouterMap = {
  '/home': Home,
  '/user-manage/list': UserList,
  '/right-manage/role/list': RoleList,
  '/right-manage/right/list': RightList,
  '/news-manage/add': NewsAdd,
  '/news-manage/draft': NewsDraft,
  '/news-manage/category': NewsCategory,
  '/news-manage/preview/:id': NewsPreview,
  '/news-manage/update/:id': NewsUpdate,
  '/audit-manage/audit': Audit,
  '/audit-manage/list': AuditList,
  '/publish-manage/unpublished': Unpublished,
  '/publish-manage/published': Published,
  '/publish-manage/sunset': Sunset,
}

const PrivateRoute = () => {
  // 先判断是否在浏览器环境
  const isBrowser = typeof window !== 'undefined';
  const isLogin = isBrowser ? !!localStorage.getItem('token') : false;
  return isLogin ? <NewsSandBox /> : <Navigate to="/login" replace />
}

export default function IndexRouter() {
  NProgress.start()
  useEffect(() => {
    NProgress.done()
  })

  const [BackRouterList, setBackRouterList] = useState([])
  useEffect(() => {
    Promise.all([
      request.get('/rights'),
      request.get('/children'),
    ])
      .then(([rightsRes, childrenRes]) => {
        const rights = Array.isArray(rightsRes.data) ? rightsRes.data : []
        const children = Array.isArray(childrenRes.data) ? childrenRes.data : []
        setBackRouterList([...rights, ...children])
      })
      .catch((error) => {
        console.error('获取路由配置失败:', error)
        setBackRouterList([])
      })
  }, [])

  const token = getTokenInfo()
  let role = { rights: [] }
  if (token && token.role) {
    role = { rights: [], ...token.role }
  }

  const checkRoute = (item) => {
    return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
  }

  const checkUserPermission = (item) => {
    return role.rights.includes(item.key)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/news" element={<News />} />
        <Route path="/detail/:id" element={<Detail />} />
        
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<Navigate to="/home" replace />} />
          
          {/* 手动注册带动态参数的路由，这些路由需要始终可访问 */}
          <Route path="news-manage/preview/:id" element={<NewsPreview />} />
          <Route path="news-manage/update/:id" element={<NewsUpdate />} />
          
          {BackRouterList.map((item) => {
            const Component = LocalRouterMap[item.key]
            if (checkRoute(item) && checkUserPermission(item)) {
              // 嵌套路由路径需要去掉开头的 /
              const routePath = item.key.startsWith('/') ? item.key.slice(1) : item.key
              return <Route path={routePath} key={item.key} element={<Component />} />
            }
            return null
          })}
          <Route path="*" element={<NoPermission />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}