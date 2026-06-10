import { GeoUtil } from './geo.util.js';

describe('geo.util', () => {
  describe('calculateDistanceKm', () => {
    it('should return 0 for the same point', () => {
      const point = { latitude: -22.9068, longitude: -43.1729 };
      expect(GeoUtil.calculateDistanceKm(point, point)).toBe(0);
    });

    it('should calculate distance between two known points', () => {
      const centro = { latitude: -22.9068, longitude: -43.1729 };
      const copacabana = { latitude: -22.9711, longitude: -43.1826 };
      const distance = GeoUtil.calculateDistanceKm(centro, copacabana);
      expect(distance).toBeGreaterThan(6);
      expect(distance).toBeLessThan(8);
    });
  });

  describe('isWithinRadius', () => {
    const center = { latitude: -22.9068, longitude: -43.1729 };

    it('should return true for a point within radius', () => {
      const nearby = { latitude: -22.91, longitude: -43.175 };
      expect(GeoUtil.isWithinRadius(center, nearby, 5)).toBe(true);
    });

    it('should return false for a point outside radius', () => {
      const farAway = { latitude: -23.5505, longitude: -46.6333 };
      expect(GeoUtil.isWithinRadius(center, farAway, 5)).toBe(false);
    });
  });
});
