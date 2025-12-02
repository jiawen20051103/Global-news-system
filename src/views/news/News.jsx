import request from '@/util/request.js'
import React,{useEffect, useState} from 'react'
import { Card, Col, Row,List } from 'antd';
import _ from 'lodash'

export default function News() {
  const [list,setList] = useState([])

  useEffect(()=>{
    request.get('/news?publishState=2&_embed=category')
      .then(res=>{
        // console.log(Object.entries(_.groupBy(res.data,item=>item.category.title)));
        setList(Object.entries(_.groupBy(res.data,item=>item.category.title)))
      })
  },[])

  return (
    <div style={{
      width:'95%',
      margin:'0 auto'
    }}>
      <div>
        <h2 style={{float:'left',margin:'20px'}}>全球大新闻</h2>
        <span style={{lineHeight:'75px',color:'grey'}}>查看新闻</span>
      </div>

      <Row gutter={[16,16]} style={{marginTop:'8px'}}>
        {
          list.map(item=>
            <Col span={8} key={item[0]}>
              <Card title={item[0]} variant="outlined" hoverable='true'>
                <List
                  size="small"
                  dataSource={item[1]}
                  pagination={{pageSize:3}}
                  renderItem={data => <List.Item><a href={`http://localhost:5173/detail/${data.id}`}>{data.title}</a></List.Item>}
                />
              </Card>
            </Col>
          )
        }
      </Row>
    </div>
  )
}
