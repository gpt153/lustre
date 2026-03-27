import React from 'react'
import Svg, { Circle, Path, Line } from 'react-native-svg'

interface Props {
  size?: number
}

export function ErrorState({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* Warning triangle */}
      <Path
        d="M60 22 L96 86 L24 86 Z"
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner triangle — subtle copper fill suggestion */}
      <Path
        d="M60 30 L90 80 L30 80 Z"
        stroke="#B87333"
        strokeWidth={1}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={0.3}
      />
      {/* Exclamation — vertical bar */}
      <Line
        x1={60}
        y1={46}
        x2={60}
        y2={68}
        stroke="#B87333"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Exclamation — dot */}
      <Circle cx={60} cy={76} r={2.5} fill="#B87333" />
    </Svg>
  )
}
