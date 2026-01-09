import { useEffect, useMemo, useState } from "react";
import { Form,Input,Button, message } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserOutlined,LockOutlined } from '@ant-design/icons'
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"; 
import './Login.css'
import request from '@/util/request.js';

export default function Login() {
  const [init, setInit] = useState(false);
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    // console.log(container);
  };

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: "#0d47a1",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 6,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 200,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  // if (init) {
  //   return (
  //     <Particles
  //       id="tsparticles"
  //       particlesLoaded={particlesLoaded}
  //       options={options}
  //     />
  //   );
  // }

  const onFinish = values => {
    // console.log('Received values of form: ', values);

    request.get(`/users?username=${values.username}&password=${values.password}&roleState=true&_embed=role`)
      .then(res=>{
        // console.log(res.data);
        if(res.data.length === 0){
          message.error('用户名或密码不匹配')
        }else{
          localStorage.setItem('token',JSON.stringify(res.data[0]))
          // 如果是从其他页面跳转过来的，返回原页面，否则跳转到首页
          const from = location.state?.from?.pathname || '/home'
          navigate(from, { replace: true })
        }
    })
  };

  return (
    <div style={{background:'rgb(35,39,65)',height:'100vh'}}>
      {/* 粒子组件背景 */}
        {init && (
          <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={options}
            style={{
              position: 'absolute', // 绝对定位覆盖整个父容器
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0 // 粒子层级设为 0（背景）
            }}
          />
      )}
      <div className='fromContainer'>
        <div className='logintitle'>全球新闻发布管理系统</div>
        <Form
          name="login"
          style={{ maxWidth: 360 }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Username" style={{width:'500px'}}/>
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input prefix={<LockOutlined />} type="password" placeholder="Password" style={{width:'500px'}}/>
          </Form.Item>

          <Form.Item>
            <Button block type="primary" htmlType="submit" style={{width:'500px'}}>
              登录
            </Button>
          </Form.Item>
          <Form.Item>
            <Button 
              type="link" 
              onClick={() => navigate('/register')}
              style={{width:'500px', textAlign:'center'}}
            >
              没有账号？去注册
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}
