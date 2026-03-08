import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import request from '@/util/request.js'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import Login from '../views/login/Login.jsx'
import Register from '../views/login/Register.jsx'
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
import { checkLogin, getGuestRights } from '@/util/checkLogin'

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
  // 允许未登录用户访问，但使用区域编辑的权限（只读模式）
  return <NewsSandBox />
}

export default function IndexRouter() {
  NProgress.start()
  useEffect(() => {
    NProgress.done()
  })

  const [BackRouterList, setBackRouterList] = useState([])
  useEffect(() => {
    Promise.all([
      request.get('/rights').catch(() => ({ data: [] })),
      request.get('/children').catch(() => ({ data: [] })),
    ])
      .then(([rightsRes, childrenRes]) => {
        // 后端可能返回 { total, list } 或数组格式
        const rights = Array.isArray(rightsRes.data) ? rightsRes.data : (rightsRes.data?.list || [])
        const children = Array.isArray(childrenRes.data) ? childrenRes.data : (childrenRes.data?.list || [])
        const allRoutes = [...rights, ...children]
        // console.log('获取到的路由配置:', allRoutes)
        setBackRouterList(allRoutes)
      })
      .catch((error) => {
        console.error('获取路由配置失败:', error)
        setBackRouterList([])
      })
  }, [])

  const token = getTokenInfo()
  const isLogin = checkLogin()
  
  // 如果未登录，使用区域编辑的权限（只读模式）
  let role = { rights: [] }
  if (isLogin && token && token.role) {
    role = { rights: [], ...token.role }
  } else if (!isLogin) {
    // 未登录用户使用区域编辑的权限
    role = { rights: getGuestRights() }
  }

  const checkRoute = (item) => {
    return LocalRouterMap[item.key] && (item.pagepermisson || item.routepermisson)
  }

  const checkUserPermission = (item) => {
    if (!Array.isArray(role.rights) || role.rights.length === 0) {
      // 当本地 token 中没有权限信息时，默认放行（避免线上权限不同步导致整页空白）
      return true
    }
    
    // 直接匹配
    if (role.rights.includes(item.key)) {
      return true
    }
    
    // 支持父级权限：如果有父级路由权限，允许访问子路由
    // 例如：如果有 /news-manage 权限，允许访问 /news-manage/add, /news-manage/draft 等
    const parentKey = item.key.split('/').slice(0, 2).join('/')
    if (parentKey && parentKey !== item.key && role.rights.includes(parentKey)) {
      return true
    }
    
    return false
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/news" element={<News />} />
        <Route path="/detail/:id" element={<Detail />} />
        
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<Navigate to="/home" replace />} />
          
          {/* 手动注册带动态参数的路由，这些路由需要始终可访问 */}
          <Route path="news-manage/preview/:id" element={<NewsPreview />} />
          <Route path="news-manage/update/:id" element={<NewsUpdate />} />
          
          {/* 如果后端没有返回路由配置，使用默认路由 */}
          {BackRouterList.length > 0 ? (
            BackRouterList.map((item) => {
              const Component = LocalRouterMap[item.key]
              if (!Component) {
                // console.warn(`路由 ${item.key} 没有对应的组件`)
                return null
              }
              if (checkRoute(item) && checkUserPermission(item)) {
                // 嵌套路由路径需要去掉开头的 /
                const routePath = item.key.startsWith('/') ? item.key.slice(1) : item.key
                // console.log(`注册路由: ${routePath} -> ${item.key}`)
                return <Route path={routePath} key={item.key} element={<Component />} />
              } else {
                // console.log(`路由 ${item.key} 被过滤: checkRoute=${checkRoute(item)}, checkUserPermission=${checkUserPermission(item)}`)
              }
              return null
            })
          ) : (
            // 默认路由：如果后端没有数据，至少显示这些基本路由
            <>
              <Route path="home" element={<Home />} />
              <Route path="news-manage/add" element={<NewsAdd />} />
              <Route path="news-manage/draft" element={<NewsDraft />} />
              <Route path="news-manage/category" element={<NewsCategory />} />
              <Route path="audit-manage/audit" element={<Audit />} />
              <Route path="audit-manage/list" element={<AuditList />} />
              <Route path="publish-manage/unpublished" element={<Unpublished />} />
              <Route path="publish-manage/published" element={<Published />} />
              <Route path="publish-manage/sunset" element={<Sunset />} />
              <Route path="user-manage/list" element={<UserList />} />
              <Route path="right-manage/role/list" element={<RoleList />} />
              <Route path="right-manage/right/list" element={<RightList />} />
            </>
          )}
          <Route path="*" element={<NoPermission />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}