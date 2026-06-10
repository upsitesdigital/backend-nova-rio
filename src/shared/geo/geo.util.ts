export interface Coordinates {
  latitude: number;
  longitude: number;
}

export class GeoUtil {
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static calculateDistanceKm(from: Coordinates, to: Coordinates): number {
    const earthRadiusKm = 6371;
    const dLat = GeoUtil.toRadians(to.latitude - from.latitude);
    const dLon = GeoUtil.toRadians(to.longitude - from.longitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(GeoUtil.toRadians(from.latitude)) *
        Math.cos(GeoUtil.toRadians(to.latitude)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  static isWithinRadius(center: Coordinates, point: Coordinates, radiusKm: number): boolean {
    return GeoUtil.calculateDistanceKm(center, point) <= radiusKm;
  }
}
