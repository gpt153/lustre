import React from 'react'
import Svg, { Circle, Path, Line } from 'react-native-svg'

interface Props {
  size?: number
}

export function NoBadges({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* Medal circle */}
      <Circle
        cx={60}
        cy={68}
        r={28}
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
      />
      {/* Medal ribbon left */}
      <Path
        d="M48 42 L42 28"
        stroke="#B87333"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Medal ribbon right */}
      <Path
        d="M72 42 L78 28"
        stroke="#B87333"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Ribbon connector bar */}
      <Line
        x1={42}
        y1={28}
        x2={78}
        y2={28}
        stroke="#B87333"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Inner medal circle accent */}
      <Circle
        cx={60}
        cy={68}
        r={20}
        stroke="#B87333"
        strokeWidth={1.5}
        fill="none"
        strokeOpacity={0.5}
      />
      {/* Star inside — dashed / incomplete */}
      <Path
        d="M60 54 L62.8 62 L71.4 62 L64.7 67 L67.4 75 L60 70.5 L52.6 75 L55.3 67 L48.6 62 L57.2 62 Z"
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 2"
        strokeOpacity={0.4}
      />
    </Svg>
  )
}
