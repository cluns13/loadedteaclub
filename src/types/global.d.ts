declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      MONGODB_DB: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      SENTRY_DSN?: string;
      REDIS_URL?: string;
      SQUARE_ACCESS_TOKEN?: string;
      SQUARE_LOCATION_ID?: string;
    }
  }

  interface Window {
    google?: {
      maps: {
        places: {
          PlacesService: google.maps.places.PlacesService;
          PlacesServiceStatus: typeof google.maps.places.PlacesServiceStatus;
        };
      };
    };
  }

  type Nullable<T> = T | null | undefined;
  type Optional<T> = T | undefined;

  namespace google {
    namespace maps {
      class Map {
        constructor(element: HTMLElement);
      }

      namespace places {
        interface PlacesService {
          nearbySearch(
            request: PlaceSearchRequest, 
            callback: (results: PlaceResult[] | null, status: PlacesServiceStatus) => void
          ): void;
        }

        interface PlaceSearchRequest {
          location: LatLng;
          radius: number;
          type?: string;
        }

        interface PlaceResult {
          place_id?: string;
          name?: string;
          formatted_address?: string;
          geometry?: {
            location?: LatLng;
          };
          photos?: Array<{
            getUrl(): string;
          }>;
          rating?: number;
          user_ratings_total?: number;
          opening_hours?: {
            isOpen(): boolean;
            periods?: Array<{
              open?: { day: number; time: string };
              close?: { day: number; time: string };
            }>;
          };
          types?: string[];
        }

        enum PlacesServiceStatus {
          OK = 'OK',
          ZERO_RESULTS = 'ZERO_RESULTS',
          ERROR = 'ERROR',
          INVALID_REQUEST = 'INVALID_REQUEST'
        }
      }

      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }
    }
  }
}

export {};
