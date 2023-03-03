'use client';

import React from "react";
import { Divider, Typography } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import Chatbot from "./Chatbot/Chatbot.js"
import Head from 'next/head';


const { Title } = Typography || {};

export default function Home() {
  return (
    <div>
      <Head>
        <title>the best chatbot ever!</title>
      </Head>
      <div>
        <div className="flex justify-center mt-8">
          <Title level={1}>CHAT BOT APP <RobotOutlined className="inline-block align-middle"/></Title>
        </div>
        <div className="flex justify-center">
          <Chatbot />
        </div>
      </div>
    </div>
    );
}