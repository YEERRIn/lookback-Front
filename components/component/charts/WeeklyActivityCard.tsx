'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from "axios";

interface ActivityResponse {
  [key: string]: number;
}

// 차트 데이터 타입 정의
interface ChartData {
  name: string;
  value: number;
}

// 백엔드 API 호출 함수 
const weeklyActivityFetch = async (): Promise<ActivityResponse> => {
  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.href = "/login";
    throw new Error("로그인이 필요합니다.");
  }

  try {
    const response = await axios.post(
      "https://api.look-back.site/api/v1/calendar/dashboard-spendingTime",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`HTTP 상태 코드 오류: ${response.status}`);
    }

    return response.data.spendingTime;
  } catch (err) {
    console.error("API 호출 중 오류:", err);
    throw new Error("API 호출 중 오류가 발생했습니다.");
  }
};

// 라인 차트 컴포넌트
function ActivityLineChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 40,
          bottom: 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="name"
          padding={{ left: 10, right: 10 }}
          tick={{ fontSize: 12 }}
          tickMargin={16}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickMargin={16}
          width={40}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// 차트 컨테이너 컴포넌트
function ActivityChartContainer({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [chartData, setChartData] = React.useState<ChartData[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await weeklyActivityFetch();
        
        const transformedData = Object.entries(data).map(([key, value]) => ({
          name: key,
          value: value,
        }));

        setChartData(transformedData);
        setError(null);
      } catch (err) {
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-[300px]">로딩 중...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-[300px] text-red-500">Error: {error}</div>;
  }

  return (
    <div className={className}>
      <ActivityLineChart data={chartData} />
    </div>
  );
}

// 메인 카드 컴포넌트
export function WeeklyActivityCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>이번 주 이하윤님의 활동</CardTitle>
        <CardDescription>Tasks Completed</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <ActivityChartContainer className="w-full h-full" />
      </CardContent>
    </Card>
  );
}

export default WeeklyActivityCard;