import { trpc } from '@lustre/api'
import { useCallback } from 'react'

export function useLearn() {
  const listQuery = trpc.module.list.useQuery()
  const toggleSpicyModeMutation = trpc.profile.toggleSpicyMode.useMutation()
  const queryClient = trpc.useContext()

  const modules = listQuery.data ?? []
  const vanillaModules = modules.filter((m) => !m.isSpicy)
  const spicyModules = modules.filter((m) => m.isSpicy)

  const toggleSpicyMode = useCallback(
    async (enabled: boolean) => {
      await toggleSpicyModeMutation.mutateAsync({ enabled })
      // Invalidate modules list to refetch
      await queryClient.module.list.invalidate()
    },
    [toggleSpicyModeMutation, queryClient]
  )

  return {
    modules,
    vanillaModules,
    spicyModules,
    isLoading: listQuery.isLoading,
    toggleSpicyMode,
  }
}

export function useLearnModule(moduleId: string) {
  const moduleQuery = trpc.module.get.useQuery({ moduleId }, { enabled: !!moduleId })
  const startLessonMutation = trpc.module.startLesson.useMutation()
  const completeLessonMutation = trpc.module.completeLesson.useMutation()

  return {
    module: moduleQuery.data ?? null,
    isLoading: moduleQuery.isLoading,
    startLesson: (lessonId: string) => startLessonMutation.mutateAsync({ lessonId }),
    completeLesson: (lessonId: string, passed: boolean, feedback?: string) =>
      completeLessonMutation.mutateAsync({ lessonId, passed, feedback }),
  }
}
