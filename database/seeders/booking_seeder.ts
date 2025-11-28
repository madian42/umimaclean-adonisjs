import Booking from '#bookings/models/booking'
import User from '#users/models/user'
import Address from '#users/models/address'
import Roles from '#users/enums/role_enum'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import BookingStatus from '#bookings/models/booking_status'
import BookingStatuses from '#core/enums/booking_status_enum'

export default class BookingSeeder extends BaseSeeder {
  async run() {
    // Find a user with roleId = USER (which is 3)
    const user = await User.query().where('roleId', Roles.USER).first()
    if (!user) {
      throw new Error('Seeder requires at least one user with roleId = USER')
    }
    const userId = user.id

    // Find or create an address for the bookings
    let address = await Address.query().where('userId', userId).first()
    if (!address) {
      // If no address exists, create a default one
      address = await Address.create({
        userId: userId,
        name: 'Home Address',
        phone: '1234567890',
        street: '123 Main St, Sample City',
        latitude: -6.9555305,
        longitude: 107.6540353,
        radius: 0,
        note: null,
      })
    }
    const addressId = address.id

    // Define statuses to seed (excluding process_completed and onwards)
    const statusesToSeed = [
      BookingStatuses.WAITING_DEPOSIT,
      BookingStatuses.PICKUP_SCHEDULED,
      BookingStatuses.PICKUP_PROGRESS,
      BookingStatuses.INSPECTION,
    ]

    // Create bookings for each status (5 bookings per status = 30 total)
    let dayCounter = 1
    for (const status of statusesToSeed) {
      for (let i = 1; i <= 5; i++) {
        const date = new Date(2025, 0, dayCounter) // January 2025
        const booking = await Booking.create({
          userId: userId,
          addressId: addressId,
          date: date,
        })

        await BookingStatus.create({
          bookingId: booking.id,
          name: status,
        })

        dayCounter++
      }
    }
  }
}
