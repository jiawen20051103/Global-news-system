import React, { useEffect, useState } from 'react'
import { Descriptions } from 'antd';
import { useParams  } from 'react-router-dom';
import request from '@/util/request.js';
import moment from 'moment';
import {HeartTwoTone} from '@ant-design/icons';

export default function Detail() {
  const [newsInfo,setNewsInfo] = useState(null)
  const { id } = useParams();

  useEffect(()=>{
    // console.log(id);
    request.get(`/news/${id}?_embed=category&_embed=role`).then(res=>{
      // console.log('请求成功，返回数据：', res.data);
      setNewsInfo({
        ...res.data,
        view:res.data.view + 1
      })
      // 同步后端
      return res.data
    }).then(res=>{
      request.patch(`/news/${id}`,{
        view:res.view + 1
      })
    })
  },[id])

  if (!newsInfo) {
    return <div>加载中...</div>; // 显示加载状态
  }

  const items = [
    {
      key: '1',
      label: '创建者',
      children: <span>{newsInfo.author}</span>,
    },
    {
      key: '10',
      label: '新闻类型',
      children: <span>{newsInfo.category.title}</span>,
    },
    {
      key: '3',
      label: '发布时间',
      children: newsInfo.publishTime?<span>{moment(newsInfo.publishTime).format('YYYY/MM/DD HH:mm:ss')}</span>:'-',
    },
    {
      key: '4',
      label: '区域',
      children: <span>{newsInfo.region}</span>,
    },
    {
      key: '7',
      label: '访问数量',
      children: <span>{newsInfo.view}</span>,
    },
    {
      key: '8',
      label: '点赞数量',
      children: <span>{newsInfo.star}</span>,
    },
    {
      key: '9',
      label: '评论数量',
      children: 0,
    },
  ];

  const handleStar = () => {
    setNewsInfo({
      ...newsInfo,
      star:newsInfo.star + 1
    })
    request.patch(`/news/${id}`,{
      star:newsInfo.star + 1
    })
  }

  return (
    <div>
      <Descriptions 
        title={newsInfo?.title} 
        items={newsInfo?items:null} 
        style={{margin:'30px'}} 
        extra={<HeartTwoTone twoToneColor="#eb2f96" onClick={()=>handleStar()}/>}
      />

      <div dangerouslySetInnerHTML={{
        __html:newsInfo.content
      }} style={{marginLeft:'30px',border:'1px solid gray'}}>

      </div>
    </div>
  )
}
