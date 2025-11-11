import { CheckCircle, Clock, Sparkles, Truck } from 'lucide-react'

export default function HowToSection() {
  return (
    <section className="bg-secondary/20 px-4 py-10">
      <div>
        <h3 className="mb-4 text-center text-3xl font-bold">Cara Kerja Kami</h3>
        <p className="mb-8 text-center text-muted-foreground">
          Proses mudah dalam 4 langkah sederhana
        </p>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl shadow-lg">
              <Clock className="h-8 w-8" />
            </div>

            <div>
              <h3 className="mb-1 text-lg font-bold text-gray-900">Jadwalkan</h3>
              <p className="text-gray-600">Pilih tanggal dan waktu penjemputan</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl shadow-lg">
              <Truck className="h-8 w-8" />
            </div>

            <div>
              <h3 className="mb-1 text-lg font-bold text-gray-900">Penjemputan</h3>
              <p className="text-gray-600">Kami jemput sepatu Anda di rumah</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>

            <div>
              <h3 className="mb-1 text-lg font-bold text-gray-900">Pencucian</h3>
              <p className="text-gray-600">Kami cuci sepatu Anda hingga bersih</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl shadow-lg">
              <CheckCircle className="h-8 w-8" />
            </div>

            <div>
              <h3 className="mb-1 text-lg font-bold text-gray-900">Pengantaran</h3>
              <p className="text-gray-600">Kami antar sepatu Anda setelah dicuci</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
