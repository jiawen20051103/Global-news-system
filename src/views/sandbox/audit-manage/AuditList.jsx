import request from '@/util/request.js'
import { Button, Table,Tag,notification  } from "antd";
import React, { useEffect,useState } from 'react'
import { createStyles } from 'antd-style';
import { useNavigate, Link } from 'react-router-dom';

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

export default function AuditList() {
  const { styles } = useStyle();
  const navigate = useNavigate()
  const [dataSource,setDataSource] = useState([])
  const {username} = JSON.parse(localStorage.getItem('token'))

  useEffect(()=>{
    request.get(`/news?author=${username}&auditState_ne=0&publishState_lte=1`)
      .then(res=>{
        // console.log(res.data);
        setDataSource(res.data)
      })
  },[username])

  const handleRevert = (item) => {
    setDataSource(dataSource.filter(data=>data.id !== item.id))
    request.patch(`/news/${item.id}`,{
      auditState: 0
    }).then(res=>{
      notification.info({
        message: `通知`,
        description:
          '您可到草稿箱中查看您的新闻',
        placement: 'bottomRight',
      });
    })
  }
  
  const handleUpdate = (item) => {
    navigate(`/news-manage/update/${item.id}`)
  }

  const handlePublish = (item) => {
    request.patch(`/news/${item.id}`,{
      publishState: 2,
      publishTime: Date.now()
    }).then(res=>{
      navigate(`/publish-manage/published`)
      notification.info({
        message: `通知`,
        description:
          '您可到【发布管理/已发布】中查看您的新闻',
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
    },
    {
      title: '审核状态',
      dataIndex: 'auditState',
      render:(auditState) => {
        const colorList = ['','orange','green','red']
        const auditList = ['草稿箱','审核中','已通过','未通过']
        return <Tag color={colorList[auditState]}>{auditList[auditState]}</Tag>
      }
    },
    {
      title: '操作',
      render:(item) => {
        return <div>
          {
            item.auditState === 1 && <Button type='primary' onClick={()=>handleRevert(item)}>撤销</Button>
          }
          {
            item.auditState === 2 && <Button type='primary'  onClick={()=>handlePublish(item)}>发布</Button>
          }
          {
            item.auditState === 3 && <Button type='primary' onClick={()=>handleUpdate(item)}>更新</Button>
          }
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
