import 'regenerator-runtime/runtime';
import React from 'react';
import './css/global.css';
import 'antd/dist/antd.css'; 
import { Layout, Breadcrumb, Menu, Button } from "antd";
import Router from './routes';
import { Link } from 'react-router-dom'
import { UploadOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useLocation } from "react-router";
const { Header, Content, Footer } = Layout;

export default function App({isSignedIn, nftMarketplace, wallet}) {
  const location = useLocation();

  return (
    <>
    <Layout className="layout">
      <Header>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={[location.pathname]}
        >
          <Menu.Item key="/" icon={<VideoCameraOutlined />}>
              <Link to={"/"}> Market Place </Link>
          </Menu.Item>
          <Menu.Item key="/myNft" icon={<UserOutlined />}>
              <Link to={"/myNft"}> Collectibles </Link>
          </Menu.Item>
          <Menu.Item key="/mintNft" icon={<UploadOutlined />}>
              <Link to={"/mintNft"}> Mint NFT </Link>
          </Menu.Item>
        </Menu>
        {
          isSignedIn ? 
          <Button onClick={() => {wallet.signOut()}}>
            Logout {wallet.accountId}
          </Button>:
          <Button onClick={() => {wallet.signIn()}}>
            Login with NEAR
          </Button>
        }
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 100 }}>
        <Router isSignedIn={isSignedIn} nftMarketplace={nftMarketplace} wallet={wallet} />
      </Content>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
    </Layout>
    </>
  );
}
