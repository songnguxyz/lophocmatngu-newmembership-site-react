// src/components/Nhanvat/NhanvatStats.jsx
import React, { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./RadarStats.module.css";
const defaultStats = {
  "Sức mạnh": 5,
  "Trí lực": 5,
  "Bền bỉ": 5,
  "May mắn": 5,
  "Nhanh nhẹn": 5,
  "Uy tín": 5,
  "Khéo léo": 5,
};

// Cố định thứ tự trục RadarChart
const STAT_ORDER = [
  "Sức mạnh",
  "Trí lực",
  "Bền bỉ",
  "May mắn",
  "Nhanh nhẹn",
  "Uy tín",
  "Khéo léo",
];

const NhanvatStats = ({ stats, color = "#ffffff", fontFamily = "inherit" }) => {
  const [chartData, setChartData] = useState([]);

  const displayStats =
    stats && Object.keys(stats).length === STAT_ORDER.length
      ? stats
      : defaultStats;

  useEffect(() => {
    const data = STAT_ORDER.map((key) => ({
      subject: key,
      value: displayStats[key] ?? 0,
      fullMark: 10,
    }));
    setChartData(data);
  }, [displayStats]);

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }

  // 1. Custom Tick component nhận style từ closure
  const RadarAxisTick = ({ x, y, payload, cx, cy }) => {
    // tỉ lệ đẩy ra ngoài (1 = tại đường lưới, >1 = đẩy ra)
    const offsetRatio = 1.1;
    // vector từ tâm ra tới vị trí nhãn ban đầu
    const vx = x - cx;
    const vy = y - cy;
    return (
      <text
        x={cx + vx * offsetRatio}
        y={cy + vy * offsetRatio}
        textAnchor="middle"
        dy={4}
        style={{
          fontFamily: fontFamily,
          fill: color,
          fontSize: 13,
        }}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div className={styles.statsContainer}>
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            outerRadius="80%"
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <PolarGrid stroke={`rgba(${hexToRgb(color)}, 0.2)`} />
            <PolarAngleAxis
              dataKey="subject"
              axisLine={false}
              tickLine={false}
              // 2. Chuyển hẳn component vào đây
              tick={<RadarAxisTick />}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tickCount={6}
              axisLine={false}
              tick={false}
            />
            +{" "}
            <Tooltip
              // cho mobile click mới hiện
              triggerOn="click"
              // style hộp ngoài
              contentStyle={{
                backgroundColor: "#222",
                border: "none",
                padding: "8px",
              }}
              // style từng dòng luôn trắng
              itemStyle={{
                color: "#fff",
                fontSize: "0.85rem",
              }}
              // nếu có label (tên nhóm), cũng trắng
              labelStyle={{
                color: "#fff",
                fontSize: "0.75rem",
              }}
              formatter={(value, name) => [`${value}/10`]}
            />
            <Radar
              name="Chỉ số"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.6}
              isAnimationActive
              animationDuration={1400}
              // bật dot để dễ click/touch
              dot={{ fill: color, r: 2 }}
              activeDot={{ r: 6 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default NhanvatStats;
