/**
 * ValidatedForm — React Hook Form wrapper with Zod schema validation,
 * form-level shake on submit failure, and typed render-prop children.
 *
 * Usage:
 *   <ValidatedForm schema={mySchema} onSubmit={handleSubmit}>
 *     {({ control, errors, handleSubmit }) => (
 *       <>
 *         <Controller
 *           name="email"
 *           control={control}
 *           render={({ field }) => (
 *             <LustreInput
 *               {...field}
 *               onChangeText={field.onChange}
 *               error={errors.email?.message}
 *             />
 *           )}
 *         />
 *         <LustreButton onPress={handleSubmit}>Submit</LustreButton>
 *       </>
 *     )}
 *   </ValidatedForm>
 */

import React, { useCallback } from 'react'
import { View } from 'react-native'
import Animated from 'react-native-reanimated'
import {
  useForm,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodSchema } from 'zod'
import { useFormShake } from '@/hooks/useFormShake'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ValidatedFormChildProps<T extends FieldValues> {
  control: UseFormReturn<T>['control']
  errors: UseFormReturn<T>['formState']['errors']
  handleSubmit: (onValid: SubmitHandler<T>) => () => void
  reset: UseFormReturn<T>['reset']
  watch: UseFormReturn<T>['watch']
}

export interface ValidatedFormProps<T extends FieldValues> {
  /** Zod schema used for validation via @hookform/resolvers/zod */
  schema: ZodSchema<T>
  /** Called on successful validation with the parsed form values */
  onSubmit: SubmitHandler<T>
  /** Optional: called when validation fails (after shake is triggered) */
  onError?: SubmitErrorHandler<T>
  /** Default field values */
  defaultValues?: DefaultValues<T>
  /** Render prop — receives form utilities */
  children: (props: ValidatedFormChildProps<T>) => React.ReactNode
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ValidatedForm<T extends FieldValues>({
  schema,
  onSubmit,
  onError,
  defaultValues,
  children,
}: ValidatedFormProps<T>) {
  const { shake, animatedStyle } = useFormShake()

  const { control, handleSubmit, formState, reset, watch } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  const handleSubmitWithShake = useCallback(
    (onValid: SubmitHandler<T>) =>
      handleSubmit(onValid, (errors, event) => {
        shake()
        onError?.(errors, event)
      }),
    [handleSubmit, shake, onError],
  )

  return (
    <Animated.View style={animatedStyle}>
      <View>
        {children({
          control,
          errors: formState.errors,
          handleSubmit: handleSubmitWithShake,
          reset,
          watch,
        })}
      </View>
    </Animated.View>
  )
}
