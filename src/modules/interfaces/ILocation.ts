export type Locations = 'house' | 'office' | 'nowhere';

export interface Location {
  place: Locations;
  since: string;
  left: string | null;
}
