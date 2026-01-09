import request from '@/util/request.js'
import React,{useState,useEffect} from 'react'
import { Table,Button,notification } from 'antd'
import { createStyles } from 'antd-style';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { checkLogin } from '@/util/checkLogin';
import { showLoginModal } from '@/components/common/LoginModal';

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

export default function Audit() {
  const [dataSource,setDataSource] = useState([])
  const { styles } = useStyle();
  const navigate = useNavigate()
  const location = useLocation()
  const isLogin = checkLogin()
  const token = isLogin ? JSON.parse(localStorage.getItem('token')) : null
  const roleId = token?.roleId || null
  const region = token?.region || ''
  const username = token?.username || ''

  useEffect(()=>{
    // 未登录用户不显示审核列表
    if (!isLogin) {
      setDataSource([])
      return
    }
    
    const roleObj = {
      '1': 'superadmin',
      '2': 'admin',
      '3': 'editor'
    }
    request.get(`/news?auditState=1&_embed=category`).then(res=>{
      const list = res.data
      setDataSource(roleObj[roleId] === 'superadmin'?list:[
        // ...list.filter(item=>item.author === username),
        ...list.filter(item=>item.region === region && roleObj[item.roleId]=== 'editor'),
      ])
    })
  },[roleId,region,username,isLogin])

  const handleAudit = (item,auditState,publishState) => {
    // 检查是否登录
    if (!isLogin) {
      showLoginModal(navigate, location.pathname);
      return;
    }
    
    setDataSource(dataSource.filter(data=>data.id !== item.id))
    request.patch(`/news/${item.id}`,{
      auditState,
      publishState
    }).then(res=>{
      notification.info({
        message: `通知`,
        description:
          '您可到[审核管理/审核列表]中查看您的新闻的审核状态',
        placement: 'bottomRight',
      });
    })
  }

  const columns = [
    {
      title: '新闻标题',
      dataIndex: 'title',
      render:(title,item) => {
        return <Link to={`/news-manage/preview/${item.id}`}>{title}</Link>
      },
    },
    {
      title: '作者',
      dataIndex: 'author',
    },
    {
      title: '新闻分类',
      dataIndex: 'categoryId',
      render:(value,record)=>{
        if(value){
          return <div>{value}</div>
        }
        return <div>{record.category?.title || ''}</div>
      }
    },
    {
      title: '操作',
      render:(item) => {
        return <div>
          <Button type='primary' onClick={()=>handleAudit(item,2,1)}>通过</Button> 
          <Button danger onClick={()=>handleAudit(item,3,0)}>驳回</Button> 
        </div>
      }
    },
  ];

  return (
    <div>
      <Table 
        className={styles.customTable}
        dataSource={dataSource} 
        columns={columns} 
        pagination={{ pageSize: 5 }}
        scroll={{ y: 50 * 6 }}
        rowKey={(item)=>item.id}
      />
    </div>
  )
}
