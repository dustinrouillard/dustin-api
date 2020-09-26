import { PostgresClient } from '@dustinrouillard/database-connectors/postgres';

import { Location, Locations } from 'modules/interfaces/ILocation';

export async function MarkLocation(location: Locations): Promise<Location> {
  const since = new Date();

  // Get last location, so we can remove it
  const last_location: Location | null = await PostgresClient.oneOrNone('SELECT place, since, "left" FROM location_history ORDER BY since DESC LIMIT 1');

  if (last_location && !last_location.left && location == 'nowhere')
    return (await PostgresClient.one('UPDATE location_history SET "left" = $1 WHERE since = $2 AND place = $3 RETURNING place, "left", since', [
      since,
      last_location.since,
      last_location.place
    ])) as Location;
  else if (last_location && last_location.left && location == 'nowhere') throw { code: 'already_nowhere' };

  if (last_location && last_location.place == location) throw { code: 'same_place_as_last_entry' };
  if (last_location) await PostgresClient.none('UPDATE location_history SET "left" = $1 WHERE since = $2 AND place = $3', [since, last_location.since, last_location.place]);

  // Store the entry in the database
  const record: Location = await PostgresClient.one('INSERT INTO location_history (place, since) VALUES ($1, $2) RETURNING place, "left", since', [location, since]);

  return record;
}

export async function GetLocation(): Promise<Location> {
  // Get entry
  const last_location: Location = await PostgresClient.one('SELECT place, since, "left" FROM location_history ORDER BY since DESC LIMIT 1');

  return last_location;
}
