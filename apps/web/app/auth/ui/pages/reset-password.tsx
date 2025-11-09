import { Head } from '@inertiajs/react'
import AuthLayout from '../components/auth-layout'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@umimaclean/ui/components/form'
import { Input } from '@umimaclean/ui/components/input'
import { Button } from '@umimaclean/ui/components/button'
import { Spinner } from '@umimaclean/ui/components/spinner'
import { useRouter } from '@tuyau/inertia/react'
import { useForm, vineResolver } from '@umimaclean/ui/hooks/use-form'
import { ResetPasswordPayload, resetPasswordSchema } from '#auth/validators/validator'
import { toast } from '@umimaclean/ui/hooks/use-toast'

export default function ResetPassword({ token }: { token: string }) {
  const router = useRouter()

  const form = useForm<ResetPasswordPayload>({
    resolver: vineResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
  })

  async function onSubmit(data: ResetPasswordPayload) {
    router.visit(
      { route: 'reset_password.handle', params: { token } },
      {
        method: 'post',
        data: {
          ...data,
          token,
        },
        fresh: true,
        onSuccess: () => {
          form.reset()
          router.visit({ route: 'login.show' })
        },
        onError: (errors) => {
          if (errors?.general_errors) {
            toast.error(errors.general_errors)
          }
        },
      }
    )
  }

  return (
    <AuthLayout
      title="Reset kata sandi"
      description="Silakan masukkan kata sandi baru Anda di bawah ini"
    >
      <Head title="Reset Kata Sandi" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata Sandi</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Masukkan kata sandi"
                      autoComplete="new-password"
                      autoFocus
                      tabIndex={1}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Masukkan konfirmasi kata sandi"
                      autoComplete="new-password"
                      tabIndex={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-start">
              <Button
                className="w-full cursor-pointer"
                disabled={form.formState.isSubmitting || !form.formState.isDirty}
              >
                {form.formState.isSubmitting && <Spinner />}
                Reset kata sandi
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
