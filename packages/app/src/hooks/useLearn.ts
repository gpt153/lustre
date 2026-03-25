import { trpc } from '@lustre/api'

export function useLearn() {
  const listQuery = trpc.module.list.useQuery()
  return {
    modules: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
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
