import { CronJob } from 'cron';

import { Fetch } from '@dustinrouillard/fastify-utilities/modules/fetch';
import { Log, Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { FetchStatistics, FetchDailyStatistics, FetchMonthlyStatistics } from 'helpers/stats';
import { FormatSeconds } from 'modules/utils/time';
import { GithubConfig } from 'modules/config';
import { GenerateGithubTable } from 'modules/utils/table';

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

  // Generate the fancy table
  const stats_table = GenerateGithubTable(daily_stats, weekly_stats, monthly_stats);

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

    // If the stats table is the same as the current change don't make the change
    if (old_stats_table == stats_table) change = false;
    if (!change) return;

    const new_readme = github_readme.replace(old_stats_table, stats_table);

    // Update the contents of the gist
    await Fetch(`https://api.github.com/repos/${GithubConfig.Username}/${GithubConfig.Username}/contents/README.md`, {
      method: 'put',
      headers: { authorization: `Bearer ${GithubConfig.Token}` },
      json: {
        message: 'Updating recent statistics',
        content: Buffer.from(new_readme, 'utf8').toString('base64'),
        sha: readme_md.sha,
        author: {
          name: 'dstn.to - API Automation',
          email: 'api@dstn.to'
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
