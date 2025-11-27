import { RegisterPayload, registerSchema } from '#auth/validators/auth_validator'
import { Head, usePage } from '@inertiajs/react'
import { Link, useRouter } from '@tuyau/inertia/react'
import { useForm } from 'react-hook-form'
import { vineResolver } from '@hookform/resolvers/vine'
import { toast } from 'sonner'
import { useEffect } from 'react'
import AuthLayout from '../components/auth-layout'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/form'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import { Spinner } from '@/components/spinner'
import GoogleIcon from '../components/google'
import { SharedData } from '#core/types/type'

export default function Register() {
  const router = useRouter()
  const { errors: serverErrors } = usePage<SharedData>().props

  const form = useForm<RegisterPayload>({
    resolver: vineResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
  })

  async function onSubmit(data: RegisterPayload) {
    router.visit(
      { route: 'register.handle' },
      {
        method: 'post',
        data,
        fresh: true,
        onSuccess: () => {
          form.reset()
          toast.success('Berhasil daftar!')
        },
        onError: (errors) => {
          if (errors?.general_errors) {
            toast.error(errors.general_errors)
          }
        },
      }
    )
  }

  useEffect(() => {
    if (serverErrors.validation_errors && typeof serverErrors.validation_errors === 'object') {
      Object.entries(serverErrors.validation_errors).forEach(([field, message]) => {
        form.setError(field as keyof RegisterPayload, {
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
    <AuthLayout title="Buat akun" description="Masukkan detail Anda di bawah untuk membuat akun">
      <Head title="Registrasi" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      autoComplete="name"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Masukkan alamat email"
                      autoComplete="email"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kata Sandi</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Masukkan kata sandi"
                      autoComplete="new-password"
                      tabIndex={3}
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
                      tabIndex={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                tabIndex={5}
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && <Spinner />}
                Buat akun
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
            Sudah punya akun?{' '}
            <Link route="login.show" className="underline text-black" tabIndex={6}>
              Masuk
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}
