import { CronJob } from 'cron';

import { Fetch } from '@dustinrouillard/fastify-utilities/modules/fetch';
import { Log, Debug } from '@dustinrouillard/fastify-utilities/modules/logger';

import { FetchStatistics } from 'helpers/stats';
import { FormatSeconds } from 'modules/utils/time';
import { GithubConfig } from 'modules/config';
import { GenerateTable } from 'modules/utils/table';

const CRON = '*/5 * * * *';

async function UpdateStatisticsGist(): Promise<void> {
  // Map out variables
  const stats = await FetchStatistics();
  const development_hours = FormatSeconds(stats.development_seconds);
  const total_commands = stats.commands_ran.toLocaleString();
  const total_builds = stats.builds_ran.toLocaleString();

  // Generate the fancy table
  const stats_table = GenerateTable(development_hours, total_commands, total_builds);

  // Update github gist
  try {
    const files: { [key: string]: { content: string } } = {};
    files[GithubConfig.Filename] = { content: stats_table };

    // Fetch the current gist contents
    const github_gist = await Fetch(`https://api.github.com/gists/${GithubConfig.Gist}`, { headers: { authorization: `Bearer ${GithubConfig.Token}` } });

    // Ignore the change if the contents is the same
    if (github_gist.files[GithubConfig.Filename] && github_gist.files[GithubConfig.Filename].content == stats_table) return;

    // Update the contents of the gist
    await Fetch(`https://api.github.com/gists/${GithubConfig.Gist}`, {
      method: 'patch',
      headers: { authorization: `Bearer ${GithubConfig.Token}` },
      json: { description: `Last 7 days statistics - ${new Date().toLocaleDateString()}`, files },
    });
  } catch (error) {
    Debug('Error with updating statistics', error);
  }
}

const Job = new CronJob(CRON, UpdateStatisticsGist, null, true, 'America/Los_Angeles');

export async function Activate(): Promise<void> {
  Log(`Starting task runner for updating gist(s) [${CRON}]`);
  UpdateStatisticsGist();
  Job.start();
  return;
}
