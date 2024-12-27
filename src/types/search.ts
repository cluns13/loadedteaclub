import type { LoadedTeaClub } from './models';

export type SearchResult = LoadedTeaClub & {
  placeId?: string;
};

export interface SearchProps {
  onSearchResults: (results: SearchResult[]) => void;
  initialCity?: string;
  initialState?: string;
}

export interface SearchState {
  location: string;
  loading: boolean;
  error: string | null;
  resultCount: number | null;
}
