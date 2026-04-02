import { View, Text, StyleSheet } from 'react-native'

export default function CommunityHub() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>Tiles hub coming in Wave 3</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff8f6' },
  title: { fontSize: 24, fontWeight: '700', color: '#211a17' },
  subtitle: { fontSize: 14, color: '#857467', marginTop: 8 },
})
