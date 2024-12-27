import { IGeolocationService } from './locationInterfaces';

export class BrowserGeolocationService implements IGeolocationService {
  async getCurrentLocation(): Promise<GeolocationCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        reject
      );
    });
  }
}
