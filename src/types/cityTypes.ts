import { LoadedTeaClub } from './models';

export interface CityData {
  businesses: LoadedTeaClub[];
  totalBusinesses: number;
  averageRating: number;
  cityStats: {
    totalReviews: number;
  };
  popularItems: string[];
  topRated: LoadedTeaClub[];
  recentlyAdded: LoadedTeaClub[];
  nearbyCities: {
    name: string;
    state: string;
    distance: number;
  }[];
}

export interface LocationSummary {
  name: string;
  state: string;
  count: number;
}
