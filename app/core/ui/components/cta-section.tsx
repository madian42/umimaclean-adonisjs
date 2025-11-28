import { Link } from '@tuyau/inertia/react'
import { Button } from '@/components/button'

export default function CtaSection() {
  return (
    <section className="bg-accent/10 px-4 py-10">
      <div className="text-center">
        <h3 className="mb-4 text-3xl font-bold">Siap Memulai?</h3>
        <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
          Bergabunglah dengan ribuan pelanggan yang mempercayakan sepatu favorit mereka kepada kami.
        </p>

        <Link route="login.show">
          <Button
            size="lg"
            className="w-full cursor-pointer bg-primary py-7 text-lg font-semibold shadow-lg hover:bg-primary/90"
          >
            Jadwalkan Penjemputan Sekarang
          </Button>
        </Link>
      </div>
    </section>
  )
}
