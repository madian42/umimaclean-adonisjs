import { Card, CardContent } from "@umimaclean/ui/components/card";
import { Star } from "lucide-react";

export default function ReviewSection() {
  return (
    <section className="gradient-hero -background px-4 py-10">
      <div className="text-center">
        <h3 className="mb-4 text-3xl font-bold">Dipercaya Ribuan Pelanggan</h3>
        <p className="-background/80 mb-8">Testimoni nyata dari pelanggan setia kami</p>

        <div className="mb-12 grid gap-8">
          <div className="flex flex-col items-center">
            <div className="mb-2 text-5xl font-bold">4.9</div>
            <div className="mb-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent" />
              ))}
            </div>
            <div className="-background/80 text-lg">Rating Rata-rata</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="mb-2 text-5xl font-bold">2-4</div>
            <div className="-background/80 text-lg">Hari Pengerjaan</div>
          </div>
        </div>

        <Card className="mx-auto bg-background text-background shadow-xl">
          <CardContent>
            <div className="mb-4 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-black" />
              ))}
            </div>
            <p className="mb-4 text-base leading-relaxed text-muted-foreground italic">
              "Rekomend bangettt, kemaren abis cuci di sini bersih bangettt"
            </p>
            <p className="text-base text-foreground font-semibold">- Rika Rahayu</p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
