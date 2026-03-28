import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { Lightning } from 'phosphor-react-native'

interface SparkBadgeProps {
  style?: object
}

export function SparkBadge({ style }: SparkBadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Lightning size={14} weight="fill" color="#D4A843" />
      <Text style={styles.text}>Spark</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 168, 67, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4A843',
  },
})
