import { Link, useRouter } from '@tuyau/inertia/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { toast } from 'sonner'
import AuthLayout from '../components/auth-layout'
import { Head } from '@inertiajs/react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Checkbox } from '@/components/checkbox'
import { Spinner } from '@/components/spinner'
import { LoginPayload, loginSchema } from '#auth/validators/auth_validator'

export default function Login({ errors: serverErrors = {} }: { errors?: Record<string, string> }) {
  const [done, setDone] = useState<boolean>(true)

  const router = useRouter()

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

    const limiterError = localStorage.getItem('limiter_errors')
    if (limiterError) {
      setDone(false)
      startTimer()
    }
  }, [serverErrors, form])

  function startTimer() {
    setDone(false)
    setTimeout(() => {
      setDone(true)
      localStorage.removeItem('limiter_errors')
    }, 120000) // 2 minutes
  }

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
                      disabled={!done}
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
                      disabled={!done}
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
                <a href={'/auth/google'} className="mt-4 w-full">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <g clipPath="url(#clip0_17_40)">
                      <path
                        d="M19.805 10.23c0-.68-.06-1.36-.18-2H10v3.79h5.48c-.24 1.28-1.02 2.36-2.18 3.08v2.56h3.52c2.06-1.9 3.24-4.7 3.24-7.43z"
                        fill="#4285F4"
                      />
                      <path
                        d="M10 20c2.7 0 4.97-.89 6.63-2.41l-3.52-2.56c-.98.66-2.23 1.05-3.61 1.05-2.77 0-5.12-1.87-5.96-4.39H.92v2.75C2.57 17.98 6.03 20 10 20z"
                        fill="#34A853"
                      />
                      <path
                        d="M4.04 12.69c-.23-.66-.36-1.36-.36-2.09s.13-1.43.36-2.09V5.76H.92A9.98 9.98 0 000 10c0 1.64.39 3.19 1.08 4.24l2.96-2.55z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10 3.96c1.47 0 2.79.51 3.83 1.51l2.87-2.87C14.97 1.01 12.7 0 10 0 6.03 0 2.57 2.02.92 5.76l3.12 2.75C4.88 6.83 7.23 3.96 10 3.96z"
                        fill="#EA4335"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_17_40">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
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
