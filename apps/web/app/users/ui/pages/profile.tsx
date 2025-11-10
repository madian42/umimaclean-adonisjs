import { SharedData } from '#core/types/type'
import { usePage } from '@inertiajs/react'
import ProfileLayout from '../components/profile-layout'
import { AlertTriangle, KeyRound, User } from '@umimaclean/ui/lib/icons'
import { useRouter } from '@tuyau/inertia/react'
import { useForm, vineResolver } from '@umimaclean/ui/hooks/use-form'
import {
  UpdateNamePayload,
  updateNameSchema,
  UpdatePasswordPayload,
  updatePasswordSchema,
} from '#users/validators/profile'
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
import { toast } from '@umimaclean/ui/hooks/use-toast'
import { useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@umimaclean/ui/components/accordion'

export default function Profile({
  accordionState,
  errors: serverErrors = {},
}: {
  accordionState?: string
  errors?: Record<string, string>
}) {
  const { auth } = usePage<SharedData>().props
  const router = useRouter()

  const nameForm = useForm<UpdateNamePayload>({
    resolver: vineResolver(updateNameSchema),
    defaultValues: {
      name: auth.user?.name || '',
    },
    mode: 'onChange',
  })

  const passwordForm = useForm<UpdatePasswordPayload>({
    resolver: vineResolver(updatePasswordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
    mode: 'onChange',
  })

  async function onSubmitName(data: UpdateNamePayload) {
    router.visit(
      { route: 'profile.update' },
      {
        method: 'post',
        data,
        fresh: true,
        onSuccess: () => {
          nameForm.reset()
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

  async function onSubmitPassword(data: UpdatePasswordPayload) {
    router.visit(
      { route: 'profile.change_password.handle' },
      {
        method: 'post',
        data,
        fresh: true,
        onSuccess: () => {
          nameForm.reset()
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
        nameForm.setError(field as keyof UpdateNamePayload, {
          type: 'server',
          message: message as string,
        })

        passwordForm.setError(field as keyof UpdatePasswordPayload, {
          type: 'server',
          message: message as string,
        })
      })
    }
  }, [serverErrors, nameForm, passwordForm])

  return (
    <ProfileLayout>
      <div className="flex flex-col gap-4">
        {(nameForm.formState.isDirty || passwordForm.formState.isDirty) && (
          <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Anda memiliki perubahan yang belum disimpan
            </span>
          </div>
        )}

        <Accordion
          className="-space-y-px w-full max-w-md"
          collapsible
          defaultValue={accordionState || 'user-profile'}
          type="single"
        >
          <AccordionItem
            className="overflow-hidden border bg-background px-4 first:rounded-t-lg last:rounded-b-lg last:border-b"
            value="user-profile"
          >
            <AccordionTrigger className="group cursor-pointer">
              <div className="flex items-center gap-2">
                <User className="size-4 stroke-2 text-muted-foreground" />
                <span>Informasi Akun</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Form {...nameForm}>
                <form
                  onSubmit={nameForm.handleSubmit(onSubmitName)}
                  className="flex flex-col gap-6"
                >
                  <div className="grid gap-5">
                    <FormField
                      control={nameForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Masukkan nama lengkap"
                              autoComplete="name"
                              tabIndex={1}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      tabIndex={4}
                      disabled={nameForm.formState.isSubmitting}
                    >
                      {nameForm.formState.isSubmitting && <Spinner />}
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            className="overflow-hidden border bg-background px-4 first:rounded-t-lg last:rounded-b-lg last:border-b"
            value="change-password"
          >
            <AccordionTrigger className="group cursor-pointer">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 stroke-2 text-muted-foreground" />
                <span>Ubah Kata Sandi</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                  className="flex flex-col gap-6"
                >
                  <div className="grid gap-5">
                    <FormField
                      control={passwordForm.control}
                      name="current_password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kata Sandi Saat ini</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Masukkan kata sandi saat ini"
                              autoComplete="current-password"
                              tabIndex={1}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kata Sandi Baru</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Masukkan kata sandi baru"
                              autoComplete="new-password"
                              tabIndex={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="password_confirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konfirmasi Kata Sandi Baru</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Konfirmasi kata sandi baru"
                              autoComplete="new-password"
                              tabIndex={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      tabIndex={4}
                      disabled={passwordForm.formState.isSubmitting}
                    >
                      {passwordForm.formState.isSubmitting && <Spinner />}
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </Form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </ProfileLayout>
  )
}
