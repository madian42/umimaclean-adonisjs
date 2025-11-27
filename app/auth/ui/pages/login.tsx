import { Link, useRouter } from '@tuyau/inertia/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { toast } from 'sonner'
import AuthLayout from '../components/auth-layout'
import { Head, usePage } from '@inertiajs/react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Spinner } from '@/components/spinner'
import { LoginPayload, loginSchema } from '#auth/validators/auth_validator'
import GoogleIcon from '../components/google'
import { SharedData } from '#core/types/type'

export default function Login() {
  const router = useRouter()
  const { errors: serverErrors } = usePage<SharedData>().props

  const form = useForm<LoginPayload>({
    resolver: vineResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember_me: false,
    },
    mode: 'onChange',
  })

  async function onSubmit(data: LoginPayload) {
    router.visit(
      { route: 'login.handle' },
      {
        method: 'post',
        data,
        fresh: true,
        onSuccess: () => {
          form.reset()
          toast.success('Berhasil masuk!')
        },
        onError: (errors) => {
          if (errors?.general_errors) {
            toast.error(errors.general_errors)
          }

          if (errors?.limiter_errors) {
            toast.error(errors.limiter_errors)
            localStorage.setItem('limiter_errors', true.toString())
          }
        },
      }
    )
  }

  useEffect(() => {
    if (serverErrors.validation_errors && typeof serverErrors.validation_errors === 'object') {
      Object.entries(serverErrors.validation_errors).forEach(([field, message]) => {
        form.setError(field as keyof LoginPayload, {
          type: 'server',
          message: message as string,
        })
      })
    }

    if (serverErrors.google_errors) {
      toast.error(serverErrors.google_errors)
    }
  }, [serverErrors, form])

  return (
    <AuthLayout
      title="Masuk ke akun Anda"
      description="Masukkan email dan kata sandi Anda di bawah ini untuk masuk"
    >
      <Head title="Masuk" />

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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center">
                    <FormLabel>Kata Sandi</FormLabel>
                    <Link
                      route="forgot_password.show"
                      className="ml-auto underline text-black text-sm"
                      tabIndex={5}
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Masukkan kata sandi"
                      autoComplete="current-password"
                      tabIndex={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remember_me"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} tabIndex={3} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ingat saya</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex flex-col">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                tabIndex={4}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Spinner />}
                Masuk
              </Button>
              <Button
                asChild
                className="flex w-full items-center justify-center border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <a href={'/auth/google/redirect'} className="mt-4 w-full">
                  <GoogleIcon />
                  Masuk dengan Google
                </a>
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun?{' '}
            <Link route="register.show" className="underline text-black" tabIndex={5}>
              Daftar
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
