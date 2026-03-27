import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { toastStore } from '@lustre/app'
import { Toast } from './Toast'

/**
 * ToastContainer
 *
 * Renders up to 3 toasts absolutely positioned below the safe area top inset.
 * Mount as the LAST child in the root layout so toasts render above all other UI.
 */
export function ToastContainer() {
  const insets = useSafeAreaInsets()
  const toasts = toastStore((state) => state.toasts)
  const dismiss = toastStore((state) => state.dismiss)

  if (toasts.length === 0) return null

  return (
    <View
      style={[styles.container, { top: insets.top + 8 }]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
    pointerEvents: 'box-none',
  },
})
