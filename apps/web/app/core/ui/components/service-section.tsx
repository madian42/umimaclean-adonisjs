import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@umimaclean/ui/components/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@umimaclean/ui/components/carousel'
import { useEffect, useState } from 'react'

export default function ServiceSection() {
  const SERVICES = [
    {
      id: 'mild',
      name: 'Mild',
      price: 'Rp60.000',
      description: 'Cuci ringan untuk sepatu kotor biasa',
    },
    {
      id: 'medium',
      name: 'Medium',
      price: 'Rp65.000',
      description: 'Cuci menyeluruh untuk noda membandel',
    },
    {
      id: 'hard',
      name: 'Hard',
      price: 'Rp70.000',
      description: 'Treatment khusus untuk sepatu sangat kotor',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'Mulai Rp120.000',
      description: 'Restorasi lengkap sepatu mewah',
    },
    {
      id: 'kids',
      name: 'Kids',
      price: 'Mulai Rp40.000',
      description: 'Khusus sepatu anak-anak',
    },
    {
      id: 'just-for-her',
      name: 'Just for Her',
      price: 'Rp45.000',
      description: 'Perawatan khusus sepatu wanita',
    },
    {
      id: 'unyellowing',
      name: 'Unyellowing',
      price: 'Mulai Rp30.000',
      description: 'Hilangkan kuning pada sole putih',
    },
  ]

  const [api, setApi] = useState<CarouselApi | null>(null)
  const [current, setCurrent] = useState<number>(0)
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    if (!api) return

    const updateCarouselState = () => {
      setCurrent(api.selectedScrollSnap())
      setCount(api.scrollSnapList().length)
    }

    updateCarouselState()

    api.on('select', updateCarouselState)

    return () => {
      api.off('select', updateCarouselState)
    }
  }, [api])

  function scrollToIndex(index: number) {
    if (!api) return
    api.scrollTo(index)
  }

  return (
    <section className="px-4 py-10">
      <div>
        <h3 className="mb-4 text-center text-3xl font-bold">Layanan Kami</h3>
        <p className="mb-8 text-center text-muted-foreground">
          Perawatan sepatu dengan teknologi terdepan
        </p>

        <Carousel setApi={setApi} opts={{ slidesToScroll: 'auto' }}>
          <CarouselContent>
            {SERVICES.map((service) => (
              <CarouselItem key={service.id} className="basis-1/2">
                <Card className="gradient-card flex h-52 flex-col justify-between gap-0 border-2 border-primary/30 transition-all duration-300 hover:border-primary/50 hover:shadow-xl">
                  <div>
                    <CardHeader className="rounded-t-lg bg-primary/5">
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-2">
                      <CardDescription className="text-base leading-relaxed">
                        {service.description}
                      </CardDescription>
                    </CardContent>
                  </div>
                  <CardFooter className="mt-auto flex bg-primary/5 text-end text-lg font-semibold">
                    {service.price}
                  </CardFooter>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-2 flex justify-center space-x-2 py-2">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-3 w-3 rounded-full ${i === current ? 'bg-black' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
