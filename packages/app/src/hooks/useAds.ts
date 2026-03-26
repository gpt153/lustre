import { trpc } from '@lustre/api'

export function useCampaigns() {
  return trpc.ad.getCampaigns.useQuery()
}

export function useCreateCampaign() {
  const utils = trpc.useUtils()
  return trpc.ad.createCampaign.useMutation({
    onSuccess: () => {
      utils.ad.getCampaigns.invalidate()
    },
  })
}

export function useUpdateTargeting() {
  return trpc.ad.updateTargeting.useMutation()
}

export function useAddCreative() {
  return trpc.ad.addCreative.useMutation()
}

export function useActivateCampaign() {
  const utils = trpc.useUtils()
  return trpc.ad.activateCampaign.useMutation({
    onSuccess: (_data, variables) => {
      utils.ad.getCampaigns.invalidate()
      utils.ad.getAnalytics.invalidate({ campaignId: variables.campaignId })
    },
  })
}

export function usePauseCampaign() {
  const utils = trpc.useUtils()
  return trpc.ad.pauseCampaign.useMutation({
    onSuccess: (_data, variables) => {
      utils.ad.getCampaigns.invalidate()
      utils.ad.getAnalytics.invalidate({ campaignId: variables.campaignId })
    },
  })
}

export function useAnalytics(campaignId: string) {
  return trpc.ad.getAnalytics.useQuery(
    { campaignId },
    { enabled: !!campaignId }
  )
}
