import React from "react";
import { Card, Typography } from 'antd';
import { CloudOutlined } from '@ant-design/icons';
import Image from 'next/image';

const { Title, Text } = Typography;

function WeatherCard({ weather }) {
    const iconUrl = `https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}.png`;

  return (
    <Card className="w-full">
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
          <Text className="mb-0">Feels like: {Math.round(weather.main?.feels_like)}°C</Text>
          <Text className="mb-0">Humidity: {weather.main?.humidity}%</Text>
        </div>
      </div>
    </Card>
  );
}

export default WeatherCard;
