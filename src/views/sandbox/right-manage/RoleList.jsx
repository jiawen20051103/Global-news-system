import { Button, Table,Modal,Tree} from "antd";
import request from '@/util/request.js'
import { useState,useEffect } from "react";
import { DeleteOutlined,UnorderedListOutlined,ExclamationCircleFilled } from '@ant-design/icons'
import { createStyles } from 'antd-style';
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

export default function RoleList() {
  const { styles } = useStyle();
  const [dataSource,setDataSource] = useState([])
  const [rightList,setRightList] = useState([])
  const [currentRights,setCurrentRights] = useState([])
  const [currentId,setCurrentId] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    console.log(currentRights);
    setIsModalOpen(false);
    // 同步dataSource
    setDataSource(dataSource.map(item => {
      if(item.id === currentId){
        return {
          ...item,
          rights:currentRights
        }
      }
      return item
    }))

    // patch
    request.patch(`/roles/${currentId}`,{
      rights:currentRights
    })
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onCheck = (checkedKeys, info) => {
    // console.log('onCheck', checkedKeys, info);
    setCurrentRights(checkedKeys.checked)
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
      title: '角色名称',
      dataIndex: 'roleName',
    },
    {
      title: '操作',
      render:(item) => {
        return <div>
          <Button danger shape="circle" icon={<DeleteOutlined/>} onClick={()=>showConfirm(item)}/>
          <Button 
            type="primary" shape="circle" icon={<UnorderedListOutlined />} 
            onClick={()=>{
              showModal()
              setCurrentRights(item.rights)
              setCurrentId(item.id)
            }} 
          />
        </div>
      }
    },
  ]

  useEffect(()=>{
    request.get('/roles').then(res=>{
      // console.log(res.data);
      setDataSource(res.data)
    })
  },[])

  useEffect(()=>{
    request.get('/rights?_embed=children').then(res=>{
      // console.log(res.data);
      setRightList(res.data)
    })
  },[])

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

  const deleteMethod = (item) => {
    console.log(item);
    setDataSource(dataSource.filter(data => data.id !== item.id))
    request.delete(`/roles/${item.id}`) 
  }

  return (
    <div>
      <Table 
        className={styles.customTable}
        dataSource={dataSource} 
        columns={columns} 
        rowKey={(item)=>item.id}
        ></Table>

        <Modal
          title="权限分配"
          closable={{ 'aria-label': 'Custom Close Button' }}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Tree
            checkable
            checkedKeys={currentRights}
            treeData={rightList}
            onCheck={onCheck}
            checkStrictly = {true}
          />
        </Modal>
    </div>
  )
}
