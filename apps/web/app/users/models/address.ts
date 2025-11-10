import { belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import env from '#start/env'
import Tables from '#core/enums/table_enum'
import BaseModel from '#common/models/base_model'

export default class Address extends BaseModel {
  static table = Tables.ADDRESSES

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare name: string

  @column()
  declare phone: string

  @column()
  declare street: string

  @column()
  declare latitude: number

  @column()
  declare longitude: number

  @column()
  declare radius: number

  @column()
  declare note: string | null

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  /**
   * Validate if booking location is within service area with directional limits
   * North: 30km, South: 10km, East: 30km, West: 20km
   */
  public static async validateRadius(latitude: number, longitude: number) {
    try {
      // Get business/service center coordinates
      const serviceCenterLat = env.get('SERVICE_CENTER_LATITUDE')
      const serviceCenterLng = env.get('SERVICE_CENTER_LONGITUDE')

      // Service area limits in kilometers
      const limits = {
        north: 30,
        south: 10,
        east: 30,
        west: 20,
      }

      const result = this.checkDirectionalLimits(
        serviceCenterLat,
        serviceCenterLng,
        latitude,
        longitude,
        limits
      )

      return result.isWithinArea
    } catch (error) {
      throw new Error('Gagal memvalidasi radius booking')
    }
  }

  /**
   * Check if location is within directional service limits
   */
  private static checkDirectionalLimits(
    centerLat: number,
    centerLng: number,
    targetLat: number,
    targetLng: number,
    limits: { north: number; south: number; east: number; west: number }
  ) {
    // Calculate distances in each direction
    const latDiff = targetLat - centerLat
    const lngDiff = targetLng - centerLng

    // Determine primary direction and calculate distance
    let direction: string
    let distance: number
    let limit: number

    if (Math.abs(latDiff) > Math.abs(lngDiff)) {
      // Primary movement is North/South
      if (latDiff > 0) {
        direction = 'north'
        limit = limits.north
        distance = this.calculateDistance(centerLat, centerLng, targetLat, centerLng)
      } else {
        direction = 'south'
        limit = limits.south
        distance = this.calculateDistance(centerLat, centerLng, targetLat, centerLng)
      }
    } else {
      // Primary movement is East/West
      if (lngDiff > 0) {
        direction = 'east'
        limit = limits.east
        distance = this.calculateDistance(centerLat, centerLng, centerLat, targetLng)
      } else {
        direction = 'west'
        limit = limits.west
        distance = this.calculateDistance(centerLat, centerLng, centerLat, targetLng)
      }
    }

    // For more accurate validation, also check if the total distance respects the limits
    // This handles diagonal movements better
    const totalDistance = this.calculateDistance(centerLat, centerLng, targetLat, targetLng)
    const maxAllowedDistance = this.calculateMaxAllowedDistance(latDiff, lngDiff, limits)

    const isWithinArea = totalDistance <= maxAllowedDistance

    return {
      direction,
      distance: totalDistance,
      limit: maxAllowedDistance,
      isWithinArea,
    }
  }

  /**
   * Calculate maximum allowed distance based on direction ratios
   */
  private static calculateMaxAllowedDistance(
    latDiff: number,
    lngDiff: number,
    limits: { north: number; south: number; east: number; west: number }
  ) {
    // Calculate ratios for each direction
    const totalLatDiff = Math.abs(latDiff)
    const totalLngDiff = Math.abs(lngDiff)
    const totalDiff = totalLatDiff + totalLngDiff

    if (totalDiff === 0) return Math.max(...Object.values(limits))

    const latRatio = totalLatDiff / totalDiff
    const lngRatio = totalLngDiff / totalDiff

    // Determine effective limits based on direction
    const verticalLimit = latDiff >= 0 ? limits.north : limits.south
    const horizontalLimit = lngDiff >= 0 ? limits.east : limits.west

    // Calculate weighted maximum distance
    const maxDistance = Math.sqrt(
      Math.pow(verticalLimit * latRatio, 2) + Math.pow(horizontalLimit * lngRatio, 2)
    )

    return maxDistance
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return Math.round(distance * 100) / 100 // Round to 2 decimal places
  }

  /**
   * Convert degrees to radians
   */
  private static toRadians(degrees: number) {
    return degrees * (Math.PI / 180)
  }
}
