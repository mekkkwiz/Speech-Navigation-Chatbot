
import React, { useEffect, useState } from "react";
import { Card, Typography } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import Image from 'next/image';

const { Title, Text } = Typography;

type Weather = {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    icon: string;
    description: string;
  }[];
};

type Props = {
  latitude: number;
  longitude: number;
};

function WeatherCard({ latitude, longitude }: Props) {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    const API_KEY = "d5f48b6e1364b0d26d4fbdaadadc75a3";

    async function fetchWeather() {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=th`
        );
        const data = await response.json();
        setWeather(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchWeather();
  }, [latitude, longitude]);

  if (!weather) {
    return <p>กำลังโหลดข้อมูลอากาศ...</p>;
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}.png`;

  return (
    <Card className="w-full border-black">
      <div className="flex items-center mb-4">
        <CloudOutlined className="text-4xl" />
        <Title level={2} className="ml-2 mb-0">{weather.name}</Title>
      </div>
      <div className="flex items-center mb-4">
        <Image src={iconUrl} alt={weather.weather?.[0]?.description} width={64} height={64} />
        <Text className="ml-2 mb-0">{weather.weather?.[0]?.description}</Text>
      </div>
      <div className="flex items-center">
        <Title level={2} className="mb-0">{Math.round(weather.main?.temp)}°C</Title>
        <div className="flex flex-col ml-2">
          <Text className="mb-0">รู้สึกเหมือน: {Math.round(weather.main?.feels_like)}°C</Text>
          <Text className="mb-0">ความชื้น: {weather.main?.humidity}%</Text>
        </div>
      </div>
    </Card>
  );
}

export default WeatherCard;

