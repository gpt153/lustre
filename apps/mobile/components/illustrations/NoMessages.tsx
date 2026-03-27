import React from 'react'
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg'

interface Props {
  size?: number
}

export function NoMessages({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* Chat bubble outline */}
      <Path
        d="M28 36 C28 32 31 29 35 29 L85 29 C89 29 92 32 92 36 L92 68 C92 72 89 75 85 75 L64 75 L52 87 L52 75 L35 75 C31 75 28 72 28 68 Z"
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Envelope flap — copper accent */}
      <Path
        d="M38 42 L60 56 L82 42"
        stroke="#B87333"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Message lines */}
      <Line
        x1={40}
        y1={62}
        x2={66}
        y2={62}
        stroke="#2C2421"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeOpacity={0.4}
      />
      <Line
        x1={40}
        y1={68}
        x2={55}
        y2={68}
        stroke="#2C2421"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeOpacity={0.4}
      />
      {/* Small copper dot */}
      <Circle cx={60} cy={96} r={2} fill="#B87333" />
    </Svg>
  )
}
