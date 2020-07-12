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

interface Stats {
  hours: string;
  commands: string;
  builds: string;
}

export function GenerateGithubTable(dayStats: Stats, weekStats: Stats, monthStats: Stats): string {
  const { hours: dayHours, commands: dayCommands, builds: dayBuilds } = dayStats;
  const { hours: weekHours, commands: weekCommands, builds: weekBuilds } = weekStats;
  const { hours: monthHours, commands: monthCommands, builds: monthBuilds } = monthStats;

  const dailyHoursDisplay = `**${dayHours}**`;
  const dailyCommandsDisplay = `**${dayCommands}**`;
  const dailyBuildsDisplay = `**${dayBuilds}**`;

  const weeklyHoursDisplay = `**${weekHours}**`;
  const weeklyCommandsDisplay = `**${weekCommands}**`;
  const weeklyBuildsDisplay = `**${weekBuilds}**`;

  const monthlyHoursDisplay = `**${monthHours}**`;
  const monthlyCommandsDisplay = `**${monthCommands}**`;
  const monthlyBuildsDisplay = `**${monthBuilds}**`;

  const dailyStats = [dailyHoursDisplay, dailyCommandsDisplay, dailyBuildsDisplay];
  const weeklyStats = [weeklyHoursDisplay, weeklyCommandsDisplay, weeklyBuildsDisplay];
  const monthlyStats = [monthlyHoursDisplay, monthlyCommandsDisplay, monthlyBuildsDisplay];

  // TODO: Will make this look better next time I get around to it.
  let table = `| Title                                       | ${SpaceByMax('24-hours', false, dailyStats)} | ${SpaceByMax('7-days', false, weeklyStats)} | ${SpaceByMax(
    'Month',
    false,
    monthlyStats
  )} |`;
  table += `\n| :------------------------------------------ | ${SpaceByMax('-', true, dailyStats)}: | ${SpaceByMax('-', true, weeklyStats)}: | ${SpaceByMax('-', true, monthlyStats)}: |`;

  table += `\n| ${TitleSpace(':hourglass_flowing_sand: Hours Spent Coding')} | ${SpaceByMax(dailyHoursDisplay, false, dailyStats, true)} | ${SpaceByMax(
    weeklyHoursDisplay,
    false,
    weeklyStats,
    true
  )} | ${SpaceByMax(monthlyHoursDisplay, false, monthlyStats, true)} |`;

  table += `\n| ${TitleSpace(':computer: Commands')} | ${SpaceByMax(dailyCommandsDisplay, false, dailyStats, true)} | ${SpaceByMax(weeklyCommandsDisplay, false, weeklyStats, true)} | ${SpaceByMax(
    monthlyCommandsDisplay,
    false,
    monthlyStats,
    true
  )} |`;

  table += `\n| ${TitleSpace(':hammer: Docker Builds')} | ${SpaceByMax(dailyBuildsDisplay, false, dailyStats, true)} | ${SpaceByMax(weeklyBuildsDisplay, false, weeklyStats, true)} | ${SpaceByMax(
    monthlyBuildsDisplay,
    false,
    monthlyStats,
    true
  )} |`;
  return table;
}
