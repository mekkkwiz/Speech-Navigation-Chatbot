"use client";

import React, { useEffect, useState } from "react";
import { Typography } from "antd";
import { RobotOutlined } from "@ant-design/icons";
import Chatbot from "./Chatbot/Chatbot.js";
import Head from "next/head";
import WeatherCard from "./WeatherCard/WeatherCard.js";

const { Title } = Typography;

function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const API_KEY = "d5f48b6e1364b0d26d4fbdaadadc75a3";
    const CITY_NAME = "เชียงใหม่";

    async function fetchWeather() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        setWeather(data);
        setLoading(false);
      } catch (error) {
        setError(error as any);
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return <p>Loading weather data...</p>;
  }

  if (error) {
    return <p>Error fetching weather data: {error}</p>;
  }

  if (!weather) {
    return null;
  }

  return <WeatherCard weather={weather} />;
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="max-w-screen mx-auto">
      <Head>
        <title>The Best Chatbot Ever!</title>
      </Head>
      <div className="flex flex-wrap">
        {/* left side of homepage */}
        <div className="w-full md:w-2/6 h-screen p-4 md:border-r-2">
          <div className="flex justify-center">
            <Title level={3}>
              <span
                dangerouslySetInnerHTML={{
                  __html: currentTime.toLocaleTimeString(),
                }}
              />
            </Title>
          </div>
          <div className="flex justify-center mt-4">
            <Weather />
          </div>
        </div>
        {/* right side of homepage */}
        <div className="w-full md:w-4/6 p-4">
          <div className="flex justify-center">
            <Title className="text-xl md:text-3xl">
              CHAT BOT APP{" "}
              <RobotOutlined className="inline-block align-middle" />
            </Title>
          </div>
          <div className="flex justify-center">
            <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );

}
