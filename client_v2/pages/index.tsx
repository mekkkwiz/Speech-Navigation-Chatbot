"use client";

import React, { useEffect, useState } from "react";
import { GetServerSideProps } from 'next';
import { Typography } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import Chatbot from "./Chatbot/Chatbot";
import Head from "next/head";
import WeatherCard from "./WeatherCard/WeatherCard";
import PollutionReportCard from "./PollutionReportCard/PollutionReportCard";

const { Title } = Typography;

type Props = {
  currentTime: string;
};

export const getServerSideProps: GetServerSideProps<Props> = async (): Promise<{props: Props}> => {
  return {
    props: {
      currentTime: new Date().toLocaleTimeString(),
    },
  };
};


function Home({ currentTime }: Props) {
  const [currentTimeState, setCurrentTimeState] = useState(currentTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTimeState(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Chiang Mai, Thailand
  const geolocation = {
    latitude: 18.7883,
    longitude: 98.9867,
  };

  return (
    <div className="max-w-screen mx-auto">
      <Head>
        <title>The Best Chatbot Ever!</title>
      </Head>
      <div className="flex flex-wrap">
        {/* left side of homepage */}
        <div className="w-full md:w-2/6 h-screen p-4 md:border-r-2">
          <div className="flex justify-center">
            <Title >{currentTimeState}</Title>
          </div>
          <div className="flex justify-center mt-4">
            <WeatherCard latitude={geolocation.latitude} longitude={geolocation.longitude} />
          </div>
          <div className="flex justify-center">
            <PollutionReportCard latitude={geolocation.latitude} longitude={geolocation.longitude} />
          </div>
        </div>
        {/* right side of homepage */}
        <div className="w-full md:w-4/6 p-4">
          <div className="flex justify-center">
            <Title className="text-xl md:text-3xl">
              Building Access Navigation Program{" "}
              <RobotOutlined className="inline-block align-middle" />
            </Title>
          </div>
          <div className="flex justify-center mt-4">
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;