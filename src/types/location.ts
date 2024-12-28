export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationDetails {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: Coordinates;
}
