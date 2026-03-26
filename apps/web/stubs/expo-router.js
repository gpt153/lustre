export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
    back: () => {},
    canGoBack: () => false,
  }
}
export function useLocalSearchParams() { return {} }
export function useSegments() { return [] }
export function usePathname() { return '' }
export function Link({ children }) { return children }
export function Redirect() { return null }
export function Stack() { return null }
Stack.Screen = () => null
export function Tabs() { return null }
Tabs.Screen = () => null
export default {}
