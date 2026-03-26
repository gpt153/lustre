import { TRPCError } from '@trpc/server'

const MEDUSA_BASE_URL =
  process.env.MEDUSA_INTERNAL_URL ?? 'http://medusa:9000'
const MEDUSA_PUBLISHABLE_KEY = process.env.MEDUSA_PUBLISHABLE_KEY ?? ''

async function medusaFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${MEDUSA_BASE_URL}${path}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Medusa API error',
    })
  }

  return response.json() as Promise<T>
}

export interface MedusaProduct {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  images: Array<{ id: string; url: string }>
  variants: Array<{
    id: string
    title: string
    calculated_price?: { calculated_amount: number; currency_code: string }
  }>
}

export interface MedusaCart {
  id: string
  items: Array<{
    id: string
    variant_id: string
    quantity: number
    unit_price: number
    title: string
    thumbnail: string | null
  }>
  total: number
  currency_code: string
}

export const medusaClient = {
  async getProducts(params?: {
    q?: string
    limit?: number
    offset?: number
  }): Promise<{ products: MedusaProduct[]; count: number }> {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.limit !== undefined) qs.set('limit', String(params.limit))
    if (params?.offset !== undefined) qs.set('offset', String(params.offset))
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return medusaFetch(`/store/products${query}`)
  },

  async getProduct(id: string): Promise<{ product: MedusaProduct }> {
    return medusaFetch(`/store/products/${id}`)
  },

  async createCart(): Promise<{ cart: MedusaCart }> {
    return medusaFetch('/store/carts', { method: 'POST', body: JSON.stringify({}) })
  },

  async getCart(cartId: string): Promise<{ cart: MedusaCart }> {
    return medusaFetch(`/store/carts/${cartId}`)
  },

  async addLineItem(
    cartId: string,
    variantId: string,
    quantity: number,
  ): Promise<{ cart: MedusaCart }> {
    return medusaFetch(`/store/carts/${cartId}/line-items`, {
      method: 'POST',
      body: JSON.stringify({ variant_id: variantId, quantity }),
    })
  },

  async removeLineItem(
    cartId: string,
    lineItemId: string,
  ): Promise<{ cart: MedusaCart }> {
    return medusaFetch(`/store/carts/${cartId}/line-items/${lineItemId}`, {
      method: 'DELETE',
    })
  },

  async completeCart(cartId: string): Promise<{ type: string; data: { id: string } }> {
    return medusaFetch(`/store/carts/${cartId}/complete`, { method: 'POST', body: JSON.stringify({}) })
  },
}
