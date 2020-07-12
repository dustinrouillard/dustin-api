import { CassandraClient, Types } from '@dustinrouillard/database-connectors/cassandra';
import { Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

export async function IncrementTotalCommandCount(): Promise<boolean> {
  const current_date = new Date();
  current_date.setUTCMinutes(0, 0, 0);

  // Get last entry
  const current_commands = await CassandraClient.execute('SELECT commands FROM daily_commands_run WHERE date = ? ALLOW FILTERING;', [current_date]);

  let new_commands = 1;
  if (current_commands.rowLength > 0 && current_commands.rows[0].commands && current_commands.rows[0].commands.low) new_commands = current_commands.rows[0].commands.low + 1;

  // Insert the row
  await CassandraClient.execute('INSERT INTO daily_commands_run (date, commands) VALUES (?, ?)', [current_date, Types.Long.fromNumber(new_commands)]);

  return true;
}

export async function IncrementTotalBuildCount(): Promise<boolean> {
  const current_date = new Date();
  current_date.setUTCMinutes(0, 0, 0);

  // Get last entry
  const current_builds = await CassandraClient.execute('SELECT builds FROM daily_docker_builds WHERE date = ? ALLOW FILTERING;', [current_date]);

  let new_builds = 1;
  if (current_builds.rowLength > 0 && current_builds.rows[0].builds && current_builds.rows[0].builds.low) new_builds = current_builds.rows[0].builds.low + 1;

  // Insert the row
  await CassandraClient.execute('INSERT INTO daily_docker_builds (date, builds) VALUES (?, ?)', [current_date, Types.Long.fromNumber(new_builds)]);

  return true;
}

interface Stats {
  start: Date;
  end: Date;

  development_seconds: number;
  commands_ran: number;
  builds_ran: number;
}

async function GetDevelopmentHours(start: Date, end: Date): Promise<number> {
  // Fetch daily development hours
  const DailyDevelopmentHoursStats = await CassandraClient.execute('SELECT * FROM daily_development_hours WHERE date >= ? AND date <= ? ALLOW FILTERING;', [start, end]);

  const weekly_development = DailyDevelopmentHoursStats.rows.sort((a: Types.Row, b: Types.Row) => b.date - a.date);
  if (weekly_development.length <= 0) return 0;

  const reduced = weekly_development.reduce((a: Types.Row, b: Types.Row) => {
    return { ...a, seconds: a.seconds + b.seconds };
  });

  return Number(reduced.seconds);
}

async function GetCommandsRan(start: Date, end: Date): Promise<number> {
  const current_commands = await CassandraClient.execute('SELECT date, commands FROM daily_commands_run WHERE date >= ? AND date <= ? ALLOW FILTERING;', [start, end]);

  const weekly_commands = current_commands.rows.sort((a: Types.Row, b: Types.Row) => b.date - a.date);
  if (weekly_commands.length <= 0) return 0;

  const reduced = weekly_commands.reduce((a: Types.Row, b: Types.Row) => {
    return { ...a, commands: Number(a.commands) + Number(b.commands) };
  });

  return Number(reduced.commands);
}

async function GetBuildsRan(start: Date, end: Date): Promise<number> {
  const current_builds = await CassandraClient.execute('SELECT date, builds FROM daily_docker_builds WHERE date >= ? AND date <= ? ALLOW FILTERING;', [start, end]);

  const weekly_builds = current_builds.rows.sort((a: Types.Row, b: Types.Row) => b.date - a.date);
  if (weekly_builds.length <= 0) return 0;

  const reduced = weekly_builds.reduce((a: Types.Row, b: Types.Row) => {
    return { ...a, builds: Number(a.builds) + Number(b.builds) };
  });

  return Number(reduced.builds);
}

export async function FetchStatistics(): Promise<Stats> {
  const start = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
  const end = new Date();

  // Get development time over the range
  const development_seconds = await GetDevelopmentHours(start, end);

  // Get commands ran over the range
  const commands_ran = await GetCommandsRan(start, end);

  // Get development time over the range
  const builds_ran = await GetBuildsRan(start, end);

  return {
    start,
    end,
    development_seconds,
    commands_ran,
    builds_ran
  };
}

export async function FetchMonthlyStatistics(): Promise<Stats> {
  const start = new Date(new Date().setMonth(new Date().getMonth() - 1));
  const end = new Date();

  // Get development time over the range
  const development_seconds = await GetDevelopmentHours(start, end);

  // Get commands ran over the range
  const commands_ran = await GetCommandsRan(start, end);

  // Get development time over the range
  const builds_ran = await GetBuildsRan(start, end);

  return {
    start,
    end,
    development_seconds,
    commands_ran,
    builds_ran
  };
}

export async function FetchDailyStatistics(): Promise<Stats> {
  const start = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const end = new Date();

  // Get development time over the range
  const development_seconds = await GetDevelopmentHours(start, end);

  // Get commands ran over the range
  const commands_ran = await GetCommandsRan(start, end);

  // Get development time over the range
  const builds_ran = await GetBuildsRan(start, end);

  return {
    start,
    end,
    development_seconds,
    commands_ran,
    builds_ran
  };
}
