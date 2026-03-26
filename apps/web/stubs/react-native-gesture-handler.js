export const Gesture = {
  Pan: () => ({
    onStart: () => Gesture.Pan(),
    onUpdate: () => Gesture.Pan(),
    onEnd: () => Gesture.Pan(),
    onChange: () => Gesture.Pan(),
    minDistance: () => Gesture.Pan(),
    activeOffsetX: () => Gesture.Pan(),
    activeOffsetY: () => Gesture.Pan(),
    failOffsetX: () => Gesture.Pan(),
    failOffsetY: () => Gesture.Pan(),
  }),
  Tap: () => ({
    onStart: () => Gesture.Tap(),
    onEnd: () => Gesture.Tap(),
    maxDuration: () => Gesture.Tap(),
    numberOfTaps: () => Gesture.Tap(),
  }),
}
export const GestureDetector = ({ children }) => children
export const GestureHandlerRootView = ({ children, style }) => children
export default {}
