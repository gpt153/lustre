import { Stack } from 'expo-router'

export default function LearnLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#2C2421' },
        headerTintColor: '#F5EDE4',
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Learn', headerShown: true }} />
      <Stack.Screen name="[moduleId]" options={{ title: 'Module', headerShown: true }} />
      <Stack.Screen name="[moduleId]/lesson/[lessonId]" options={{ title: 'Lesson', headerShown: true }} />
      <Stack.Screen name="achievements" options={{ title: 'Achievements', headerShown: true }} />
      <Stack.Screen name="sexual-health" options={{ title: 'Sexual Health', headerShown: true }} />
      <Stack.Screen name="article/[articleId]" options={{ title: 'Article', headerShown: true }} />
      <Stack.Screen name="topic/[slug]" options={{ title: 'Topic', headerShown: true }} />
      <Stack.Screen name="coach" options={{ title: 'Coach', headerShown: false }} />
    </Stack>
  )
}
