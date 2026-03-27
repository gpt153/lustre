/**
 * AccessibleModal
 *
 * A focus-managed modal wrapper for VoiceOver (iOS) and TalkBack (Android).
 *
 * Focus management:
 * - When opened:  moves screen-reader focus to the first focusable element
 *                 inside the modal via AccessibilityInfo.setAccessibilityFocus()
 * - When closed:  returns focus to the element that triggered the modal
 *                 (pass a ref to the trigger via triggerRef)
 *
 * Accessibility attributes:
 * - accessibilityViewIsModal={true} — prevents VoiceOver from reading content
 *   outside the modal while it is open
 *
 * Usage:
 *   const triggerRef = useRef<View>(null)
 *   const [visible, setVisible] = useState(false)
 *
 *   <AnimatedPressable ref={triggerRef} onPress={() => setVisible(true)} ...>
 *     Open modal
 *   </AnimatedPressable>
 *
 *   <AccessibleModal
 *     visible={visible}
 *     onClose={() => setVisible(false)}
 *     triggerRef={triggerRef}
 *   >
 *     <Text>Modal content</Text>
 *   </AccessibleModal>
 */

import React, { useEffect, useRef } from 'react'
import {
  AccessibilityInfo,
  findNodeHandle,
  Modal,
  ModalProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

export interface AccessibleModalProps extends Omit<ModalProps, 'visible'> {
  /** Controls modal visibility. */
  visible: boolean
  /** Called when the modal requests to be closed (back button, overlay tap, etc.). */
  onClose: () => void
  /**
   * Ref to the element that triggered the modal open.
   * Focus is returned to this element when the modal closes.
   */
  triggerRef?: React.RefObject<View | null>
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

export function AccessibleModal({
  visible,
  onClose,
  triggerRef,
  style,
  children,
  ...modalProps
}: AccessibleModalProps) {
  const firstElementRef = useRef<View>(null)

  // Move screen-reader focus into the modal when it opens.
  useEffect(() => {
    if (visible && firstElementRef.current) {
      // Defer one frame so the modal is fully mounted before we shift focus.
      const timer = setTimeout(() => {
        const node = findNodeHandle(firstElementRef.current)
        if (node !== null) {
          AccessibilityInfo.setAccessibilityFocus(node)
        }
      }, 50)
      return () => clearTimeout(timer)
    }

    // Return focus to the trigger element when the modal closes.
    if (!visible && triggerRef?.current) {
      const node = findNodeHandle(triggerRef.current)
      if (node !== null) {
        AccessibilityInfo.setAccessibilityFocus(node)
      }
    }

    return undefined
  }, [visible, triggerRef])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      {...modalProps}
    >
      {/*
       * accessibilityViewIsModal tells VoiceOver / TalkBack that elements
       * outside this view should not be accessible while the modal is open.
       */}
      <View
        style={[styles.overlay, style]}
        accessibilityViewIsModal
        accessible={false}
      >
        {/* Anchor for initial focus — wrap the first interactive child here. */}
        <View ref={firstElementRef} accessible={false}>
          {children}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
})
