import { ObjectId } from 'mongodb';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationDetails = {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: Coordinates;
};
