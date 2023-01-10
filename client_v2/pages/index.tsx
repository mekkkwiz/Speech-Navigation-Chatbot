'use client';

import React from "react";
import { Divider, Typography } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import Chatbot from "./Chatbot/Chatbot.js"


const { Title } = Typography || {};

export default function Home() {
  return (
    <main>
      <div>
        <div style = {{display: 'flex', justifyContent: 'center', marginTop: '2rem'}}>
          <Title level={1}>CHAT BOT APP <RobotOutlined style={{display: 'inline-block',verticalAlign: 'middle',}}/></Title>
        </div>
        <div style= {{ display: 'flex', justifyContent: 'center'}}>
          <Chatbot />
        </div>
      </div>
    </main>
    );
}