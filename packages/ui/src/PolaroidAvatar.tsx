import React from 'react'
import { View, Image, Text, type ViewStyle } from 'react-native'

export interface PolaroidAvatarProps {
  imageUrl: string
  name?: string
  size?: number
  rotation?: number
  showStack?: boolean
  style?: ViewStyle
}

export function PolaroidAvatar({
  imageUrl,
  name,
  size = 54,
  rotation = 0,
  showStack = false,
  style,
}: PolaroidAvatarProps) {
  const scale = size / 54
  const w = 54 * scale
  const h = 66 * scale
  const padTop = 4 * scale
  const padSide = 3 * scale
  const padBottom = 14 * scale
  const imgW = w - padSide * 2
  const imgH = h - padTop - padBottom

  return (
    <View style={[{
      width: w, height: h,
      backgroundColor: '#FFFFFF',
      paddingTop: padTop, paddingLeft: padSide, paddingRight: padSide, paddingBottom: padBottom,
      shadowColor: '#2E1500', shadowOffset: { width: 0, height: 4 * scale }, shadowOpacity: 0.12, shadowRadius: 12 * scale, elevation: 3,
      transform: [{ rotate: `${rotation}deg` }],
      flexShrink: 0,
    }, style]}>
      {showStack && (
        <>
          <View style={{
            position: 'absolute', top: 0, left: 0, width: w, height: h,
            backgroundColor: '#FDF8F3', borderWidth: 0.5, borderColor: '#EEDFDA',
            transform: [{ rotate: '-3deg' }], zIndex: -1,
          }} />
          <View style={{
            position: 'absolute', top: 0, left: 0, width: w, height: h,
            backgroundColor: '#FDF8F3', borderWidth: 0.5, borderColor: '#EEDFDA',
            transform: [{ rotate: '4deg' }], zIndex: -2,
          }} />
        </>
      )}
      <Image
        source={{ uri: imageUrl }}
        style={{ width: imgW, height: imgH, borderRadius: 1 }}
        resizeMode="cover"
      />
      {name != null && (
        <Text
          numberOfLines={1}
          style={{
            position: 'absolute',
            bottom: 1 * scale, left: 3 * scale,
            fontFamily: 'Caveat_400Regular',
            fontSize: 8 * scale,
            color: '#78716c',
          }}
        >
          {name}
        </Text>
      )}
    </View>
  )
}
