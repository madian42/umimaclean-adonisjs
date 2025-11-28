export default function Footer() {
  return (
    <footer className="gradient-hero -foreground px-4 py-10">
      <div className="text-center">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <img src="/images/umima-logo.png" className="h-7 w-7" />
            <h1 className="text-2xl font-bold text-foreground">UmimaClean</h1>
          </div>
        </div>

        <p className="mb-6 text-lg leading-relaxed text-foreground/80">
          Layanan cuci sepatu profesional dengan antar jemput gratis
        </p>

        <div className="mb-4 grid grid-cols-[1fr_auto_1fr] justify-center gap-6 text-sm text-foreground/60">
          <div>
            <div>WhatsApp:</div>
            <div>+62 851-5790-0974</div>
          </div>
          <div className="flex items-center">•</div>
          <div>
            <div>Instagram:</div>
            <div>@umima.clean</div>
          </div>
        </div>

        <p className="mb-8 text-sm text-foreground/60">
          Jl. Margacinta No.132, Margasari, Kec. Buahbatu, Kota Bandung, Jawa Barat 40286
        </p>
        <p className="text-sm text-foreground/60">© 2024 UmimaClean. Hak cipta dilindungi.</p>
      </div>
    </footer>
  )
}
