import { Card, Col, Row,List,Avatar,Drawer } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import _ from 'lodash'
import request from '../../../util/request';
import { ThemeProvider } from '../../../context/ThemeContext';
import { useTheme } from '@/context/ThemeContext.jsx';
const { Meta } = Card;

export default function Home() {
  const { isDarkMode,appStyles } = useTheme();
  const [viewList,setViewList] = useState([])
  const [starList,setStarList] = useState([])
  const [allList,setAllList] = useState([])
  const [open, setOpen] = useState(false);
  const [pieChart, setPieChart] = useState(null);
  const barRef = useRef()
  const pieRef = useRef()

  useEffect(()=>{
    request.get(`/news?publishState=2&_embed=category&_sort=-view&_order=desc&_limit=6`)
      .then(res=>{
        const data = Array.isArray(res.data) ? res.data : []
        setViewList(data)
      })
      .catch(err => {
        console.error('获取浏览量榜单失败:', err)
        setViewList([])
      })
  },[])

  useEffect(()=>{
    request.get(`/news?publishState=2&_embed=category&_sort=-star&_order=desc&_limit=6`)
      .then(res=>{
        const data = Array.isArray(res.data) ? res.data : []
        setStarList(data)
      })
      .catch(err => {
        console.error('获取点赞榜单失败:', err)
        setStarList([])
      })
  },[])

  useEffect(()=>{
    request.get(`/news?publishState=2&_embed=category`)
      .then(res=>{
        const data = Array.isArray(res.data) ? res.data : []
        const grouped = _.groupBy(data,item=>item.category?.title || '未分类');
        renderBarView(grouped);
        setAllList(data)
      })
      .catch(err => {
        console.error('获取全部新闻失败:', err)
        setAllList([])
      })

    return ()=>{
      window.onresize = null
    }
  },[])

  useEffect(() => {
    if (open && allList.length > 0) { 
      const timer = setTimeout(() => {
        renderPieView();
      }, 0);
      return () => clearTimeout(timer); 
    }

    if (!open && pieChart) {
      pieChart.dispose(); // 销毁实例
      setPieChart(null); // 重置 pieChart 状态，下次打开重新初始化
    }
  }, [open, allList]); 

  const renderBarView = (obj) => {
    let myChart = echarts.init(barRef.current);

    // 指定图表的配置项和数据
    let option = {
      title: {
        text: '新闻分类图示'
      },
      tooltip: {},
      legend: {
        data: ['数量']
      },
      xAxis: {
        data: Object.keys(obj)
      },
      yAxis: {
        minInterval: 1
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          data: Object.values(obj).map(item=>item.length)
        }
      ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

    window.onresize = () => {
      // console.log('resize');
      myChart.resize()
    }
  }

  const renderPieView = () => {
    if (!pieRef.current) {
      console.warn("饼图 DOM 尚未渲染，跳过初始化");
      return;
    }

    const safeAllList = Array.isArray(allList) ? allList : []
    let currentList = safeAllList.filter(item=>item.author===username)
    let groupObj = _.groupBy(currentList,item=>item.category?.title || '未分类')
    // console.log(groupObj);

    let list = []
    for(let i in groupObj){
      list.push({
        name:i,
        value:groupObj[i].length
      })
    }
    
    let myChart;
    if(!pieChart){
      myChart = echarts.init(pieRef.current)
      setPieChart(myChart)
    }else{
      myChart = pieChart
    }
    let option;

    option = {
      title: {
        text: '当前用户新闻分类图示',
        // subtext: 'Fake Data',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '发布数量',
          type: 'pie',
          radius: '50%',
          data: list,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    option && myChart.setOption(option);
  }

  const tokenStr = localStorage.getItem('token')
  const token = tokenStr ? JSON.parse(tokenStr) : {}
  const username = token?.username || ''
  const region = token?.region || ''
  const roleName = token?.role?.roleName || ''

  return (
    <ThemeProvider>
    <div style={isDarkMode?appStyles.card: {}}>
      <Row gutter={16}>
        <Col span={8}>
          <Card title={
            <div style={isDarkMode ? { color: '#fff' } : {}}>
              用户点赞最多
            </div>
          } variant="outlined" style={isDarkMode?appStyles.card: {}}>
            <List
              style={isDarkMode?appStyles.card: {}}
              size="small"
              // bordered
              dataSource={Array.isArray(viewList) ? viewList : []}
              renderItem={item => <List.Item>
                <a href={`/detail/${item.id}`}>{item.title}</a>
              </List.Item>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title={
            <div style={isDarkMode ? { color: '#fff' } : {}}>
              用户浏览最多
            </div>
          } variant="outlined" style={isDarkMode?appStyles.card: {}}>
            <List
              style={isDarkMode?appStyles.card: {}}
              size="small"
              // bordered
              dataSource={Array.isArray(starList) ? starList : []}
              renderItem={item => <List.Item>
                <a href={`/detail/${item.id}`}>{item.title}</a>
              </List.Item>}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            style={isDarkMode?appStyles.card: {}}
            cover={
              <img
                alt="example"
                src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
              />
            }
            actions={[
              <SettingOutlined key="setting" onClick={()=>{
                  setOpen(true)
              }}/>,
              <EditOutlined key="edit" />,
              <EllipsisOutlined key="ellipsis" />,
            ]}
          >
            <Meta
              style={isDarkMode?appStyles.card: {}}
              avatar={<Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=8" />}
              title={username}
              description={
                <div style={isDarkMode?appStyles.card: {}}>
                  <b>{region?region : '全球'}</b>
                  <span style={{paddingLeft:'30px'}}>{roleName}</span>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      <Drawer
        width='500px'
        title="个人新闻分类"
        closable={{ 'aria-label': 'Close Button' }}
        onClose={()=>{
          setOpen(false)
        }}
        open={open}
      >
        <div ref={pieRef} style={{
        height:"400px",
        marginTop:'30px'
      }}></div>
      </Drawer>

      <div ref={barRef} 
        style={isDarkMode?{height:"400px",marginTop:'30px',color:'white'}: {height:"400px",marginTop:'30px'}}
      ></div>
    </div>
    </ThemeProvider>
  )
}
