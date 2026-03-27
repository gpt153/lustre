import React from 'react'
import Svg, { Circle, Path, Line } from 'react-native-svg'

interface Props {
  size?: number
}

export function NoResults({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* Magnifying glass circle */}
      <Circle
        cx={52}
        cy={50}
        r={26}
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
      />
      {/* Magnifying glass handle */}
      <Line
        x1={70}
        y1={68}
        x2={88}
        y2={88}
        stroke="#2C2421"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Inner circle accent — copper */}
      <Circle
        cx={52}
        cy={50}
        r={16}
        stroke="#B87333"
        strokeWidth={1.5}
        fill="none"
        strokeOpacity={0.4}
      />
      {/* X mark inside glass */}
      <Line
        x1={44}
        y1={42}
        x2={60}
        y2={58}
        stroke="#B87333"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Line
        x1={60}
        y1={42}
        x2={44}
        y2={58}
        stroke="#B87333"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  )
}
