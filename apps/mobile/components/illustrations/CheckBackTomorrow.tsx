/**
 * CheckBackTomorrow
 *
 * SVG illustration shown when no Copper Pick is available.
 * Design: hourglass / clock motif with copper accents.
 */

import React from 'react'
import Svg, {
  Circle,
  Path,
  Line,
  Ellipse,
  Rect,
} from 'react-native-svg'

interface Props {
  size?: number
}

export function CheckBackTomorrow({ size = 120 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      accessible={false}
      importantForAccessibility="no"
    >
      {/* ---- Outer decorative circle ---- */}
      <Circle
        cx={60}
        cy={60}
        r={44}
        stroke="#2C2421"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeDasharray="4 4"
        strokeOpacity={0.2}
      />

      {/* ---- Hourglass frame top bar ---- */}
      <Rect
        x={38}
        y={30}
        width={44}
        height={5}
        rx={2.5}
        fill="#2C2421"
        fillOpacity={0.85}
      />

      {/* ---- Hourglass frame bottom bar ---- */}
      <Rect
        x={38}
        y={85}
        width={44}
        height={5}
        rx={2.5}
        fill="#2C2421"
        fillOpacity={0.85}
      />

      {/* ---- Hourglass upper triangle (sand above) ---- */}
      <Path
        d="M40 35 L80 35 L62 58 L58 58 Z"
        fill="#B87333"
        fillOpacity={0.9}
      />

      {/* ---- Hourglass lower triangle (sand below) ---- */}
      <Path
        d="M40 85 L80 85 L64 66 L56 66 Z"
        fill="#B87333"
        fillOpacity={0.35}
      />

      {/* ---- Neck connector ---- */}
      <Path
        d="M58 58 Q60 62 62 58 M58 66 Q60 62 62 66"
        stroke="#B87333"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
      />

      {/* ---- Sand grains falling ---- */}
      <Circle cx={60} cy={62} r={1.5} fill="#D4A574" />
      <Circle cx={60} cy={65} r={1} fill="#D4A574" fillOpacity={0.6} />

      {/* ---- Small decorative dots at bottom ---- */}
      <Circle cx={52} cy={100} r={1.5} fill="#B87333" fillOpacity={0.4} />
      <Circle cx={60} cy={102} r={2} fill="#B87333" fillOpacity={0.6} />
      <Circle cx={68} cy={100} r={1.5} fill="#B87333" fillOpacity={0.4} />

      {/* ---- Star sparkle top-right ---- */}
      <Path
        d="M88 28 L89.2 31.6 L93 31.6 L90 33.8 L91.2 37.4 L88 35.2 L84.8 37.4 L86 33.8 L83 31.6 L86.8 31.6 Z"
        fill="#B87333"
        fillOpacity={0.7}
        scale={0.55}
        origin="88, 32"
      />
    </Svg>
  )
}
