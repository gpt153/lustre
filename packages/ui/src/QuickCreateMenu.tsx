import React, { useEffect, useRef } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

export interface QuickCreateMenuItem {
  id: string
  icon: string // MaterialIcons name
  label: string
}

export interface QuickCreateMenuProps {
  visible: boolean
  onClose: () => void
  onAction: (id: string) => void
  items?: QuickCreateMenuItem[]
}

const DEFAULT_ITEMS: QuickCreateMenuItem[] = [
  { id: 'new-post', icon: 'camera-alt', label: 'Nytt inlägg' },
  { id: 'new-message', icon: 'chat', label: 'Nytt meddelande' },
  { id: 'create-event', icon: 'event', label: 'Skapa event' },
  { id: 'new-group', icon: 'group-add', label: 'Ny grupp' },
  { id: 'safedate', icon: 'shield', label: 'SafeDate' },
  { id: 'update-intentions', icon: 'explore', label: 'Uppdatera intentioner' },
]

const SHEET_HEIGHT = 340
const SCREEN_HEIGHT = Dimensions.get('window').height

export function QuickCreateMenu({
  visible,
  onClose,
  onAction,
  items = DEFAULT_ITEMS,
}: QuickCreateMenuProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current
  const mounted = useRef(false)
  const [renderContent, setRenderContent] = React.useState(visible)

  useEffect(() => {
    if (visible) {
      setRenderContent(true)
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Skip animation on initial mount
      if (!mounted.current) {
        mounted.current = true
        return
      }
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: SHEET_HEIGHT,
          damping: 20,
          stiffness: 200,
          mass: 0.8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setRenderContent(false)
      })
    }
  }, [visible, overlayOpacity, sheetTranslateY])

  if (!renderContent && !visible) {
    return null
  }

  return (
    <View style={styles.container} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Dark backdrop */}
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Pressable style={styles.overlayPress} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
        {/* Handlebar */}
        <View style={styles.handlebarContainer}>
          <View style={styles.handlebar} />
        </View>

        {/* Header */}
        <Text style={styles.header}>Skapa</Text>

        {/* 2-column grid */}
        <View style={styles.grid}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.gridItem}
              onPress={() => onAction(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <View style={styles.iconCircle}>
                <MaterialIcons
                  name={item.icon as keyof typeof MaterialIcons.glyphMap}
                  size={24}
                  color="#894D0D"
                />
              </View>
              <Text style={styles.label} numberOfLines={2}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  overlayPress: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff8f6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(33,26,23,1)',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.08,
        shadowRadius: 32,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handlebarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  handlebar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8c3b4',
    opacity: 0.3,
  },
  header: {
    fontSize: 18,
    fontWeight: '700',
    color: '#894D0D',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#faebe5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#211a17',
    marginTop: 8,
    textAlign: 'center',
  },
})
