import { trpc } from '@lustre/api'

export function useProducts(params?: { q?: string; limit?: number; offset?: number }) {
  return trpc.shop.product.list.useQuery({
    q: params?.q,
    limit: params?.limit ?? 20,
    offset: params?.offset ?? 0,
  })
}

export function useProduct(id: string) {
  return trpc.shop.product.get.useQuery({ id }, { enabled: !!id })
}

export function useAddToCart() {
  const utils = trpc.useUtils()
  return trpc.shop.cart.add.useMutation({
    onSuccess: () => {
      utils.shop.product.list.invalidate()
    },
  })
}

export function useCheckout() {
  return trpc.shop.cart.checkout.useMutation()
}
