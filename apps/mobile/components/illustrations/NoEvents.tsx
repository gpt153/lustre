import React from 'react'
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg'

interface Props {
  size?: number
}

export function NoEvents({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* Calendar border */}
      <Rect
        x={24}
        y={32}
        width={72}
        height={60}
        rx={6}
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Calendar header bar */}
      <Rect
        x={24}
        y={32}
        width={72}
        height={18}
        rx={6}
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="#B87333"
        fillOpacity={0.15}
      />
      {/* Top binding pegs */}
      <Line
        x1={40}
        y1={26}
        x2={40}
        y2={38}
        stroke="#B87333"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1={80}
        y1={26}
        x2={80}
        y2={38}
        stroke="#B87333"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Grid divider line */}
      <Line
        x1={24}
        y1={50}
        x2={96}
        y2={50}
        stroke="#2C2421"
        strokeWidth={1}
        strokeOpacity={0.3}
      />
      {/* Empty day dots — sparse to convey emptiness */}
      <Circle cx={38} cy={62} r={2} fill="#2C2421" fillOpacity={0.2} />
      <Circle cx={54} cy={62} r={2} fill="#2C2421" fillOpacity={0.2} />
      <Circle cx={70} cy={62} r={2} fill="#2C2421" fillOpacity={0.2} />
      <Circle cx={86} cy={62} r={2} fill="#2C2421" fillOpacity={0.2} />
      <Circle cx={38} cy={76} r={2} fill="#2C2421" fillOpacity={0.2} />
      <Circle cx={54} cy={76} r={2} fill="#2C2421" fillOpacity={0.2} />
      {/* Copper star accent — "no events" symbol */}
      <Path
        d="M60 58 L62 64 L68 64 L63 68 L65 74 L60 70 L55 74 L57 68 L52 64 L58 64 Z"
        stroke="#B87333"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
