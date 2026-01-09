import request from '@/util/request.js'
import {useEffect, useState} from 'react'
import {notification} from 'antd'
import { checkLogin } from '@/util/checkLogin';

function usePublish(type){
  const [dataSource,setDataSource] = useState([])
  const isLogin = checkLogin()
  const token = isLogin ? JSON.parse(localStorage.getItem('token')) : null
  const username = token?.username || ''
  
  useEffect(()=>{
    // 未登录用户不显示发布列表
    if (!isLogin) {
      setDataSource([])
      return
    }
    
    request.get(`/news?author=${username}&publishState=${type}&_embed=category`)
      .then(res=>{
        // console.log(res.data);
        setDataSource(res.data)
      })
  },[username,type,isLogin])

  const handlePublish = (id) => {
    if (!isLogin) {
      return;
    }
    console.log(id);
    setDataSource(dataSource.filter(item=>item.id !== id))
    request.patch(`/news/${id}`,{
      publishState:2,
      publishTime: Date.now()
    }).then(res=>{
      notification.info({
        message: `通知`,
        description:
          '您可到[发布管理/已发布]中查看您的新闻的审核状态',
        placement: 'bottomRight',
      });
    })
  }

  const handleSunset = (id) => {
    if (!isLogin) {
      return;
    }
    console.log(id);
    setDataSource(dataSource.filter(item=>item.id !== id))
    request.patch(`/news/${id}`,{
      publishState:3
    }).then(res=>{
      notification.info({
        message: `通知`,
        description:
          '您可到[发布管理/已下线]中查看您的新闻的审核状态',
        placement: 'bottomRight',
      });
    })
  }

  const handleDelete = (id) => {
    if (!isLogin) {
      return;
    }
    console.log(id);
    setDataSource(dataSource.filter(item=>item.id !== id))
    request.delete(`/news/${id}`).then(res=>{
      notification.info({
        message: `通知`,
        description:
          '您已删除了已下线的新闻',
        placement: 'bottomRight',
      });
    })
  }

  return {
    dataSource,
    handlePublish,
    handleSunset,
    handleDelete
  }
}

export default usePublish