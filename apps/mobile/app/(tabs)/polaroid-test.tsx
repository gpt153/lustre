import React from 'react'
import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { PolaroidCard } from '@lustre/ui/src/PolaroidCard'
import { PolaroidStack } from '@lustre/ui/src/PolaroidStack'
import { PolaroidAvatar } from '@lustre/ui/src/PolaroidAvatar'

const PHOTOS = [
  'https://picsum.photos/id/1011/400/400',
  'https://picsum.photos/id/1012/400/400',
  'https://picsum.photos/id/1025/400/400',
  'https://picsum.photos/id/1074/400/400',
]

export default function PolaroidTestScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Polaroid Component Test</Text>

      <Text style={styles.label}>PolaroidCard (280px)</Text>
      <View style={styles.center}>
        <PolaroidCard
          cardWidth={280}
          imageUrl={PHOTOS[0]}
          caption="Brad, 61"
          rotation={-2}
        />
      </View>

      <Text style={styles.label}>PolaroidStack (280px, 4 photos)</Text>
      <View style={styles.center}>
        <PolaroidStack
          images={PHOTOS.map(url => ({ uri: url }))}
          cardWidth={280}
          captions={['Brad', 'Angelina', 'Cat', 'Test']}
        />
      </View>

      <Text style={styles.label}>PolaroidAvatar (54px default)</Text>
      <View style={[styles.center, { flexDirection: 'row', gap: 16 }]}>
        <PolaroidAvatar imageUrl={PHOTOS[0]} name="Brad" showStack rotation={-2} />
        <PolaroidAvatar imageUrl={PHOTOS[1]} name="Angie" showStack rotation={3} />
        <PolaroidAvatar imageUrl={PHOTOS[2]} name="Cat" rotation={-1} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF8F3' },
  content: { padding: 24, paddingBottom: 100, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#211a17', marginBottom: 32 },
  label: { fontSize: 16, fontWeight: '600', color: '#894d0d', marginTop: 32, marginBottom: 16 },
  center: { alignItems: 'center' },
})
