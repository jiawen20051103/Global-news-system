import { Button, Table,Tag,Modal,Popover, Switch } from "antd";
import request from '@/util/request.js'
import { useState,useEffect } from "react";
import { DeleteOutlined,EditOutlined,ExclamationCircleFilled } from '@ant-design/icons'
import { createStyles } from 'antd-style';
import '@ant-design/v5-patch-for-react-19';
const { confirm } = Modal;
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

export default function RightList() {
  const { styles } = useStyle();
  const [dataSource,setDataSource] = useState([])

  useEffect(()=>{
    request.get('/rights?_embed=children')
      .then(res=>{
        const list = Array.isArray(res.data) ? res.data : []
        list.forEach(item => {
          if (item.children && item.children.length === 0) {
            item.children = null;
          }
        });
        setDataSource(list)
      })
      .catch((error) => {
        console.error('获取权限列表失败:', error)
        setDataSource([])
      })
  },[])

  const deleteMethod = (item) => {
    console.log(item);
    
    // 当前页面同步状态 + 后端同步
    if(item.grade === 1){
      setDataSource(dataSource.filter(data => data.id !== item.id))
      request.delete(`/rights/${item.id}`)
    }else{
      console.log(item.rightId);
      let list = dataSource.filter(data => data.id === item.rightId)
      list[0].children = list[0].children.filter(data => data.id !== item.id)
      console.log(list);
      setDataSource([...dataSource])
      request.delete(`/rights/${item.id}`)
    }
    
  }

  const showConfirm = (item) => {
    confirm({
      title: '你确定要删除吗？',
      icon: <ExclamationCircleFilled />,
      // content: 'Some descriptions',
      onOk() {
        // console.log('OK');
        deleteMethod(item)
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render:(id) => {
        return <b>{id}</b>
      },
    },
    {
      title: '权限名称',
      dataIndex: 'title',
    },
    {
      title: '权限路径',
      dataIndex: 'key',
      render:(key) => {
        return <Tag color="orange">{key}</Tag>
      }
    },
    {
      title: '操作',
      render:(item) => {
        return <div>
          <Button danger shape="circle" icon={<DeleteOutlined/>} onClick={()=>showConfirm(item)}/>
          <Popover 
            content={
              <div>
                <Switch checked={item.pagepermisson} onChange={()=>switchMethod(item)}></Switch>
              </div>
            } 
            title="配置项" trigger={item.pagepermisson===undefined?'':'click'}
          >
            <Button type="primary" shape="circle" icon={<EditOutlined/>} disabled={item.pagepermisson===undefined}/>
          </Popover>
        </div>
      }
    },
  ];

  const switchMethod = (item) => {
    item.pagepermisson = item.pagepermisson === 1? 0:1
    // console.log(item);
    setDataSource([...dataSource])
    if(item.grade ===1){
      request.patch(`/rights/${item.id}`,{
        pagepermisson:item.pagepermisson
      })
    }else{
      request.patch(`/children/${item.id}`,{
        pagepermisson:item.pagepermisson
      })
    }
  }
  

  return (
    <Table 
      className={styles.customTable}
      dataSource={dataSource} 
      columns={columns} 
      pagination={{ pageSize: 5 }}
      scroll={{ y: 50 * 6 }}
    />
  )
}
