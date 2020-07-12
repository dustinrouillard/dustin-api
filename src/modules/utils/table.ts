const LINE_CHAR = '―';
const TABLE_SIZE = 54;
const TABLE_HEAD_FOOT = LINE_CHAR.repeat(TABLE_SIZE);

const MAX_TITLE_SIZE = 43;

export function SpaceOut(leading: string, content: string): string {
  return `${leading} ${' '.repeat(TABLE_SIZE - leading.length - content.length - 2)} ${content}`;
}

export function TitleSpace(content: string): string {
  return `${content}${' '.repeat(MAX_TITLE_SIZE - content.length)}`;
}

export function SpaceByMax(text: string, seperator: boolean, items: string[], bold = false): string {
  const highest_length = items.reduce((a, b) => {
    return a.length > b.length ? a : b;
  });
  const spaces = highest_length.length;

  const repeat = seperator ? spaces - text.length - 1 : spaces - text.length;

  return `${(seperator ? text : ' ').repeat(repeat >= 1 ? repeat : 0)}${text}`;
}

export function GenerateTable(hours: string, commands: string, builds: string): string {
  let table = TABLE_HEAD_FOOT;
  table += `\n${SpaceOut('Hours writing code', hours)}`;
  table += `\n${SpaceOut('Terminal Commands', commands)}`;
  table += `\n${SpaceOut('Docker Builds', builds)}\n`;
  table += TABLE_HEAD_FOOT;
  return table;
}

export function GenerateGithubTable(dayStats: { hours: string; commands: string; builds: string }, weekStats: { hours: string; commands: string; builds: string }): string {
  const { hours: dayHours, commands: dayCommands, builds: dayBuilds } = dayStats;
  const { hours, commands, builds } = weekStats;

  const dailyHoursDisplay = `**${dayHours}**`;
  const dailyCommandsDisplay = `**${dayCommands}**`;
  const dailyBuildsDisplay = `**${dayBuilds}**`;
  const weeklyHoursDisplay = `**${hours}**`;
  const weeklyCommandsDisplay = `**${commands}**`;
  const weeklyBuildsDisplay = `**${builds}**`;

  const stats = [weeklyHoursDisplay, weeklyCommandsDisplay, weeklyBuildsDisplay];
  const dailyStats = [dailyHoursDisplay, dailyCommandsDisplay, dailyBuildsDisplay];

  let table = `| Title                                       | ${SpaceByMax('24-hours', false, dailyStats)} | ${SpaceByMax('7-days', false, stats)} |`;
  table += `\n| :------------------------------------------ | ${SpaceByMax('-', true, dailyStats)}: | ${SpaceByMax('-', true, stats)}: |`;
  table += `\n| ${TitleSpace(':hourglass_flowing_sand: Hours Spent Coding')} | ${SpaceByMax(dailyHoursDisplay, false, dailyStats, true)} | ${SpaceByMax(weeklyHoursDisplay, false, stats, true)} |`;
  table += `\n| ${TitleSpace(':computer: Commands')} | ${SpaceByMax(dailyCommandsDisplay, false, dailyStats, true)} | ${SpaceByMax(weeklyCommandsDisplay, false, stats, true)} |`;
  table += `\n| ${TitleSpace(':hammer: Docker Builds')} | ${SpaceByMax(dailyBuildsDisplay, false, dailyStats, true)} | ${SpaceByMax(weeklyBuildsDisplay, false, stats, true)} |`;
  return table;
}
