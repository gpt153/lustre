import React from 'react'
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg'

interface Props {
  size?: number
}

export function EmptyFeed({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* Feed card shape */}
      <Rect
        x={22}
        y={24}
        width={76}
        height={72}
        rx={8}
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
      />
      {/* Placeholder image area */}
      <Rect
        x={30}
        y={32}
        width={60}
        height={36}
        rx={4}
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeOpacity={0.3}
      />
      {/* Mountain / landscape placeholder inside image */}
      <Path
        d="M30 62 L46 44 L58 58 L66 50 L90 68"
        stroke="#B87333"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sun / circle in image */}
      <Circle cx={76} cy={40} r={6} stroke="#B87333" strokeWidth={1.5} fill="none" />
      {/* Text line placeholders */}
      <Line
        x1={30}
        y1={78}
        x2={80}
        y2={78}
        stroke="#2C2421"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeOpacity={0.25}
      />
      <Line
        x1={30}
        y1={86}
        x2={62}
        y2={86}
        stroke="#2C2421"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeOpacity={0.25}
      />
      {/* Decorative plus icon — "add content" suggestion */}
      <Circle cx={60} cy={104} r={7} stroke="#B87333" strokeWidth={1.5} fill="none" />
      <Line
        x1={60}
        y1={100}
        x2={60}
        y2={108}
        stroke="#B87333"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Line
        x1={56}
        y1={104}
        x2={64}
        y2={104}
        stroke="#B87333"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  )
}
