import { CronJob } from 'cron';

import { Fetch } from '@dustinrouillard/fastify-utilities/modules/fetch';
import { Log, Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { FetchStatistics, FetchDailyStatistics, FetchMonthlyStatistics } from 'helpers/stats';
import { FormatSeconds } from 'modules/utils/time';
import { GithubConfig } from 'modules/config';
import { GenerateGithubTable, GenerateInformationTable } from 'modules/utils/table';
import { GetCurrentPlaying } from 'modules/helpers/spotify';
import { GetSleepingState } from 'modules/helpers/state';

const CRON = '*/3 * * * *';

export async function UpdateGitHubReadme(): Promise<void> {
  // Map out variables
  const daily_db_stats = await FetchDailyStatistics();
  const weekly_db_stats = await FetchStatistics();
  const monthly_db_stats = await FetchMonthlyStatistics();

  const daily_stats = {
    hours: FormatSeconds(daily_db_stats.development_seconds),
    commands: daily_db_stats.commands_ran.toLocaleString(),
    builds: daily_db_stats.builds_ran.toLocaleString()
  };

  const weekly_stats = {
    hours: FormatSeconds(weekly_db_stats.development_seconds),
    commands: weekly_db_stats.commands_ran.toLocaleString(),
    builds: weekly_db_stats.builds_ran.toLocaleString()
  };

  const monthly_stats = {
    hours: FormatSeconds(monthly_db_stats.development_seconds),
    commands: monthly_db_stats.commands_ran.toLocaleString(),
    builds: monthly_db_stats.builds_ran.toLocaleString()
  };

  // Get current sleeping status
  const sleeping = await GetSleepingState();

  // Get current spotify playing status
  const spotify_playing = await GetCurrentPlaying();

  // Generate the fancy table
  const stats_table = GenerateGithubTable(daily_stats, weekly_stats, monthly_stats);

  const information_table = GenerateInformationTable({ music_playing: spotify_playing.is_playing, sleeping });

  let change = true;

  try {
    // Fetch the current gist contents
    const readme_md = await Fetch(`https://api.github.com/repos/${GithubConfig.Username}/${GithubConfig.Username}/readme`, {
      method: 'get',
      headers: { authorization: `Bearer ${GithubConfig.Token}` }
    });

    // Decode the old readme
    const github_readme = Buffer.from(readme_md.content, 'base64').toString();

    // Find the old stats table
    const stats_table_check = '| Title' + github_readme.split('| Title')[1];
    if (!stats_table_check) change = true;
    const old_stats_table = stats_table_check.split('\n\n######')[0];
    if (!old_stats_table) change = true;

    // Find the old information table
    const information_table_check = '| Information' + github_readme.split('| Information')[1];
    if (!information_table_check) change = true;
    const old_information_table = information_table_check.split('\n\n######')[0];
    if (!old_information_table) change = true;

    /// If the stats table is the same as the current change don't make the change
    if (old_information_table == information_table && old_stats_table == stats_table) change = false;

    // Ignore the change if the contents is the same
    if (!change) return;

    let new_readme = github_readme.replace(old_stats_table, stats_table);
    new_readme = new_readme.replace(old_information_table, information_table);

    // Update the contents of the gist
    await Fetch(`https://api.github.com/repos/${GithubConfig.Username}/${GithubConfig.Username}/contents/README.md`, {
      method: 'put',
      headers: { authorization: `Bearer ${GithubConfig.Token}` },
      json: {
        message: 'Updating recent statistics',
        content: Buffer.from(new_readme, 'utf8').toString('base64'),
        sha: readme_md.sha,
        author: {
          name: 'dustin.rest - API Automation',
          email: 'code@dustin.sh'
        }
      }
    });
  } catch (error) {
    Debug('Error with updating statistics', error);
  }
}

export async function Activate(): Promise<void> {
  const Job = new CronJob(CRON, UpdateGitHubReadme, null, true, 'America/Los_Angeles');
  Log(`Starting task runner for updating readme [${CRON}]`);
  UpdateGitHubReadme();
  Job.start();
  return;
}
