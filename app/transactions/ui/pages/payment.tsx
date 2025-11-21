import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#common/ui/components/card'
import { QrCode, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Badge } from '#common/ui/components/badge'
import { formatIDR } from '#common/ui/lib/utils'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { transmit } from '#core/ui/app/transmit'
import { useEffect } from 'react'
import { useRouter } from '@tuyau/inertia/react'

export default function PaymentPage({ transaction }: { transaction: any }) {
  console.log('Transaction Data:', transaction)
  const router = useRouter()

  useEffect(() => {
    // Create subscription
    const sub = transmit.subscription(`payments/${transaction.booking.number}/dp`)

    sub.create().catch(console.error)

    // Listen for messages
    const stop = sub.onMessage((data) => {
      console.log('Realtime payment update:', data)

      // example: reload page or update local state
      router.visit({ route: 'bookings.show', params: { id: transaction.booking.number } })
    })

    return () => {
      stop() // Remove message listener
      sub.delete().catch(() => {})
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-center">Down Payment</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Payment Info */}
        <Card className="border-orange-200 bg-orange-50 gap-0">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Mengapa Perlu Down Payment?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Mengkonfirmasi keseriusan pesanan</li>
              <li>• Menghindari pembatalan mendadak</li>
              <li>• Memastikan slot pickup tersedia</li>
              <li>• DP akan dipotong dari total biaya akhir</li>
            </ul>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="gap-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ringkasan Pesanan</span>
              <Badge variant="outline">ID: {transaction.booking.bookingNumber}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pickup:</span>
              <span className="font-medium text-right">
                {format(transaction.booking.date, 'd MMM yyyy H:mm', { locale: id })}
                <br />
                {transaction.booking.scheduledTime}
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="font-medium">Down Payment:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatIDR(transaction.downPayment)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* QRIS Payment */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Bayar dengan QRIS
            </CardTitle>
            <CardDescription className="text-blue-600">
              Scan QR Code dengan aplikasi e-wallet atau mobile banking Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Display */}
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-blue-300">
              <div className="text-center">
                <div className="mx-auto w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <img
                    src={`https://api.sandbox.midtrans.com/v2/qris/${transaction.midtransDownPaymentId}/qr-code`}
                    alt="QRIS QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 mb-2">Scan dengan aplikasi pembayaran</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    GoPay
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    OVO
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    DANA
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ShopeePay
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    LinkAja
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Cara Pembayaran QRIS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <p className="text-sm">Buka aplikasi e-wallet atau mobile banking</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <p className="text-sm">Pilih menu "Scan QR" atau "QRIS"</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <p className="text-sm">Scan QR Code di atas</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  4
                </div>
                <p className="text-sm">
                  Konfirmasi pembayaran sebesar {formatIDR(transaction.downPayment)}
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                </div>
                <p className="text-sm">Screenshot bukti pembayaran dan kirim ke WhatsApp</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
