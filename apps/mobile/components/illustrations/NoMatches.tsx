import React from 'react'
import Svg, { Circle, Path, Line } from 'react-native-svg'

interface Props {
  size?: number
}

export function NoMatches({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* Outer circle — charcoal structure */}
      <Circle
        cx={60}
        cy={60}
        r={42}
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />
      {/* Heart left lobe */}
      <Path
        d="M48 52 C48 46 40 46 40 52 C40 58 48 64 48 64"
        stroke="#B87333"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Heart right lobe */}
      <Path
        d="M48 52 C48 46 56 46 56 52 C56 58 48 64 48 64"
        stroke="#B87333"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cross — left-to-right diagonal */}
      <Line
        x1={66}
        y1={46}
        x2={78}
        y2={58}
        stroke="#2C2421"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Cross — right-to-left diagonal */}
      <Line
        x1={78}
        y1={46}
        x2={66}
        y2={58}
        stroke="#2C2421"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* Small decorative dots */}
      <Circle cx={60} cy={80} r={2} fill="#B87333" />
      <Circle cx={52} cy={80} r={1.5} fill="#2C2421" fillOpacity={0.3} />
      <Circle cx={68} cy={80} r={1.5} fill="#2C2421" fillOpacity={0.3} />
    </Svg>
  )
}
