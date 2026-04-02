import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function TrendingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Trending</Text>
      <Text style={styles.sub}>Kommer snart</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8f6', alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: 'Manrope_700Bold', fontSize: 20, fontWeight: '700', color: '#1d1b19' },
  sub: { fontFamily: 'Manrope_500Medium', fontSize: 14, fontWeight: '500', color: '#857467', marginTop: 8 },
})
