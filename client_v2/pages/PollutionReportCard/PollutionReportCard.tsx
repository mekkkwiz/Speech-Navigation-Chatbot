
import React, { useState, useEffect } from "react";
import { Card, Statistic } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";

type Props = {
  latitude: number;
  longitude: number;
};

interface PollutionData {
  city: string;
  state: string;
  country: string;
  location: {
    type: string;
    coordinates: number[];
  },
  current: {
    pollution: {
      aqius: number;
      mainus: string;
      aqicn: number;
      maincn: string;
    }
  }
}

function PollutionReportCard({ latitude, longitude }: Props) {
  const [pollutionData, setPollutionData] = useState<PollutionData | null>(
    null
  );

  useEffect(() => {
    const fetchPollutionData = async () => {
      try {
        const url = `https://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=a5a4f94c-09bf-4489-bcea-b76272537f75`;
        const response = await fetch(url);
        const { data } = await response.json();
        setPollutionData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPollutionData();
  }, [latitude, longitude]);

  if (!pollutionData) {
    return null;
  }

  const { city, current } = pollutionData;
  const aqius = current?.pollution?.aqius;

  const airQualityCategory =
    aqius <= 50
    ? "ดี"
    : aqius <= 100
    ? "ปานกลาง"
    : aqius <= 150
    ? "ไม่ดีสำหรับกลุ่มที่เป็นโรคประจำตัว"
    : aqius <= 200
    ? "ไม่ดีต่อสุขภาพ"
    : aqius <= 300
    ? "แย่มาก"
    : "อันตราย";

  return (
    <Card title={
      <div className="flex items-center">
          <EnvironmentOutlined className="text-lg mr-2"/>
          <span>{city == "Chiang Mai" ? "เชียงใหม่" : city}</span>
      </div>
      }
      className="my-4 w-full border-black">
      <div className="flex justify-between">
        <div>
          <Statistic title="ดัชนีคุณภาพอากาศ" value={aqius} />
          <div className="text-xs mt-1">
            <span
              className={`inline-block px-2 py-1 rounded-md text-white font-medium
                  ${airQualityCategory === "ดี"
                  ? "bg-green-500"
                  : airQualityCategory === "ปานกลาง"
                  ? "bg-yellow-500"
                  : airQualityCategory ===
                  "ไม่ดีสำหรับกลุ่มที่เป็นโรคประจำตัว"
                  ? "bg-yellow-800"
                  : airQualityCategory === "ไม่ดีต่อสุขภาพ"
                  ? "bg-red-500"
                  : airQualityCategory === "แย่มาก"
                  ? "bg-purple-500"
                  : "bg-maroon-500"
                }`}
            >
              {airQualityCategory}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default PollutionReportCard;

