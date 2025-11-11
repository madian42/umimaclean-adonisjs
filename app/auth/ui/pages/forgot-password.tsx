import { Head } from '@inertiajs/react'
import AuthLayout from '../components/auth-layout'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form'
import { Link, useRouter } from '@tuyau/inertia/react'
import { ForgotPasswordPayload, forgotPasswordSchema } from '#auth/validators/auth_validator'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Spinner } from '@/components/spinner'
import { useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const router = useRouter()

  const form = useForm<ForgotPasswordPayload>({
    resolver: vineResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  })

  async function onSubmit(data: ForgotPasswordPayload) {
    router.visit(
      { route: 'forgot_password.handle' },
      {
        method: 'post',
        data,
        fresh: true,
        onSuccess: () => {
          form.reset()
          toast.success('Tautan reset kata sandi telah dikirim ke email Anda!')
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
      title="Lupa kata sandi"
      description="Masukkan email Anda untuk menerima tautan reset kata sandi"
    >
      <Head title="Lupa kata sandi" />

      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Masukkan alamat email"
                        autoComplete="email"
                        autoFocus
                        tabIndex={1}
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
                  Kirim tautan reset kata sandi
                </Button>
              </div>
            </div>
          </form>
        </Form>

        <div className="text-center text-sm text-muted-foreground">
          Atau, kembali ke{' '}
          <Link route="login.show" className="underline text-black">
            Masuk
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}
