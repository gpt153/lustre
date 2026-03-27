import React from 'react'
import Svg, { Circle, Path, Line } from 'react-native-svg'

interface Props {
  size?: number
}

export function Offline({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* WiFi arc — outer (faded, disconnected) */}
      <Path
        d="M22 52 C34 38 50 30 60 30 C70 30 86 38 98 52"
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeOpacity={0.2}
      />
      {/* WiFi arc — middle (faded) */}
      <Path
        d="M32 62 C40 52 50 46 60 46 C70 46 80 52 88 62"
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeOpacity={0.2}
      />
      {/* WiFi arc — inner (faded) */}
      <Path
        d="M43 72 C47 66 53 62 60 62 C67 62 73 66 77 72"
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeOpacity={0.2}
      />
      {/* WiFi dot */}
      <Circle cx={60} cy={82} r={4} fill="#2C2421" fillOpacity={0.2} />
      {/* Diagonal slash — copper, marks offline */}
      <Line
        x1={32}
        y1={30}
        x2={88}
        y2={90}
        stroke="#B87333"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  )
}
