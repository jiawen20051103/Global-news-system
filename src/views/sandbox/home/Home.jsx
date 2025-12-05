import { Card, Col, Row,List,Avatar,Drawer } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
  const [categoriesMap, setCategoriesMap] = useState({}) // 存储分类映射
  const [open, setOpen] = useState(false);
  const [pieChart, setPieChart] = useState(null);
  const barRef = useRef()
  const pieRef = useRef()

  // 获取分类数据并建立映射
  useEffect(() => {
    request.get('/categories')
      .then(res => {
        const categories = Array.isArray(res.data) ? res.data : []
        const map = {}
        categories.forEach(cat => {
          if (cat && cat.id) {
            map[cat.id] = cat.title || cat.value || '未分类'
          }
        })
        setCategoriesMap(map)
      })
      .catch(err => {
        console.error('获取分类数据失败:', err)
        setCategoriesMap({})
      })
  }, [])

  useEffect(()=>{
    request.get(`/news?publishState=2&_sort=-view&_order=desc&_limit=6`)
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
    request.get(`/news?publishState=2&_sort=-star&_order=desc&_limit=6`)
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
    request.get(`/news?publishState=2`)
      .then(res=>{
        const data = Array.isArray(res.data) ? res.data : []
        // 使用 categoryId 查找分类名称
        const grouped = _.groupBy(data, item => {
          if (item.category && item.category.title) {
            return item.category.title
          }
          if (item.categoryId && categoriesMap[item.categoryId]) {
            return categoriesMap[item.categoryId]
          }
          return '未分类'
        });
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
  },[categoriesMap, renderBarView])

  // 安全获取 token 信息，处理 SSR 环境
  const tokenStr = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, [])
  
  const token = useMemo(() => {
    if (!tokenStr) return {};
    try {
      return JSON.parse(tokenStr);
    } catch (e) {
      return {};
    }
  }, [tokenStr])
  
  const username = useMemo(() => token?.username || '', [token])
  const region = useMemo(() => token?.region || '', [token])
  const roleName = useMemo(() => token?.role?.roleName || '', [token])

  const renderBarView = useCallback((obj) => {
    if (!barRef.current) {
      return;
    }
    
    let myChart = echarts.init(barRef.current);
    const keys = Object.keys(obj);
    const values = Object.values(obj).map(item => item.length);

    // 如果没有数据，显示提示
    if (keys.length === 0) {
      keys.push('暂无数据');
      values.push(0);
    }

    // 指定图表的配置项和数据
    let option = {
      title: {
        text: '新闻分类图示'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['数量']
      },
      xAxis: {
        data: keys,
        axisLabel: {
          rotate: keys.some(k => k.length > 6) ? -15 : 0 // 如果分类名过长，旋转标签
        }
      },
      yAxis: {
        minInterval: 1,
        type: 'value'
      },
      series: [
        {
          name: '数量',
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#1890ff'
          }
        }
      ]
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

    window.onresize = () => {
      myChart.resize()
    }
  }, [])

  const renderPieView = useCallback(() => {
    if (!pieRef.current) {
      console.warn("饼图 DOM 尚未渲染，跳过初始化");
      return;
    }

    const safeAllList = Array.isArray(allList) ? allList : []
    let currentList = safeAllList.filter(item=>item.author===username)
    
    // 如果当前用户没有数据，使用全部数据
    if (currentList.length === 0) {
      currentList = safeAllList
    }
    
    // 使用 categoryId 查找分类名称
    let groupObj = _.groupBy(currentList, item => {
      if (item.category && item.category.title) {
        return item.category.title
      }
      if (item.categoryId && categoriesMap[item.categoryId]) {
        return categoriesMap[item.categoryId]
      }
      return '未分类'
    })

    let list = []
    for(let i in groupObj){
      list.push({
        name:i,
        value:groupObj[i].length
      })
    }
    
    // 如果没有数据，显示提示
    if (list.length === 0) {
      list.push({
        name: '暂无数据',
        value: 1
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
        text: currentList.length === safeAllList.length ? '全部新闻分类图示' : '当前用户新闻分类图示',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
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
  }, [allList, username, categoriesMap, pieChart])

  useEffect(() => {
    if (open && allList.length > 0 && Object.keys(categoriesMap).length > 0) { 
      const timer = setTimeout(() => {
        renderPieView();
      }, 0);
      return () => clearTimeout(timer); 
    }

    if (!open && pieChart) {
      pieChart.dispose(); // 销毁实例
      setPieChart(null); // 重置 pieChart 状态，下次打开重新初始化
    }
  }, [open, allList, categoriesMap, renderPieView, pieChart]);

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
