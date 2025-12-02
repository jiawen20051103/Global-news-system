import SideMenu from "../../components/sandbox/SideMenu"
import TopHeader from "../../components/sandbox/TopHeader"
import './NewsSandBox.css'
import { Outlet } from 'react-router-dom'; 
import { Layout,theme,Spin } from "antd";
import { connect  } from 'react-redux';
import { ThemeProvider } from "../../context/ThemeContext";
import { useTheme } from "@/context/ThemeContext.jsx";
const { Content } = Layout

const NewsSandBox=(props)=> {
  const { isDarkMode } = useTheme();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <ThemeProvider>
    <Layout>
      <SideMenu></SideMenu>
      <Layout>
        <TopHeader></TopHeader>
        <Content
          style={isDarkMode?
          {
            margin: '16px',
            padding: 24,
            minHeight: 280,
            overflow: 'initial',
            background: '#2d2d2d',
            borderRadius: borderRadiusLG,
          }:
          {
            margin: '16px',
            padding: 24,
            minHeight: 280,
            overflow: 'initial',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Spin size="large" spinning={props.isLoading}>
            <Outlet/>
          </Spin>
        </Content>
      </Layout>
    </Layout>
    </ThemeProvider>
  )
}

const mapStateToProps = ({LoadingReducer:{isLoading}}) => ({
  isLoading
})

export default connect(mapStateToProps)(NewsSandBox)
