import { Link } from '@tuyau/inertia/react'
import { Button } from '@/components/button'

export default function HeroSection() {
  return (
    <section className="gradient-card px-4 py-12">
      <div className="text-center">
        <h2 className="mb-6 text-4xl font-bold">
          Cuci Sepatu Premium
          <span className="mt-2 block text-3xl text-accent-foreground">Antar Jemput Gratis</span>
        </h2>

        <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
          Layanan cuci sepatu profesional yang datang ke rumah Anda. Jadwalkan penjemputan, kami
          bersihkan sepatu hingga sempurna, dan antar kembali dalam 2-4 hari.
        </p>

        <div className="mb-14">
          <div className="relative inline-block">
            <img
              src="/images/shoe-cleaning-showcase.png"
              alt="Layanan cuci sepatu profesional"
              className="mx-auto rounded-3xl border-4 border-[#FCD34D] shadow-2xl"
              style={{ height: '400px', objectFit: 'cover' }}
            />
            <div className="absolute -top-3 right-0 rounded-full border-2 border-[#FCD34D] bg-background px-5 py-2 text-sm font-bold text-accent-foreground shadow-lg">
              2-4 Hari
            </div>
          </div>
        </div>

        <Link route="login.show">
          <Button
            size="lg"
            className="cursor-pointer bg-primary px-12 py-7 text-lg font-semibold shadow-lg hover:bg-primary/90"
          >
            Jadwalkan Penjemputan
          </Button>
        </Link>
      </div>
    </section>
  )
}
