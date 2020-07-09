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

export function SpaceByMax(text: string, seperator: boolean, items: string[]): string {
  const highest_length = items.reduce((a, b) => {
    return a.length > b.length ? a : b;
  });
  const spaces = highest_length.length;

  return `${(seperator ? text : ' ').repeat(seperator ? spaces - text.length - 1 : spaces - text.length)}${text}`;
}

export function GenerateTable(hours: string, commands: string, builds: string): string {
  let table = TABLE_HEAD_FOOT;
  table += `\n${SpaceOut('Hours writing code', hours)}`;
  table += `\n${SpaceOut('Terminal Commands', commands)}`;
  table += `\n${SpaceOut('Docker Builds', builds)}\n`;
  table += TABLE_HEAD_FOOT;
  return table;
}

export function GenerateGithubTable(hours: string, commands: string, builds: string): string {
  const hour_title = ':hourglass_flowing_sand: Hours Spent Coding';
  const commands_title = ':computer: Commands';
  const builds_title = ':hammer: Docker Builds';

  const hour_display = `**${hours}**`;
  const commands_display = `**${commands}**`;
  const builds_display = `**${builds}**`;

  const stats = [hour_display, commands_display, builds_display];

  let table = `| Title                                       | ${SpaceByMax('Stat', false, stats)} |`;
  table += `\n| :------------------------------------------ | ${SpaceByMax('-', true, stats)}: |`;
  table += `\n| ${TitleSpace(hour_title)} | ${SpaceByMax(hour_display, false, stats)} |`;
  table += `\n| ${TitleSpace(commands_title)} | ${SpaceByMax(commands_display, false, stats)} |`;
  table += `\n| ${TitleSpace(builds_title)} | ${SpaceByMax(builds_display, false, stats)} |`;
  return table;
}
