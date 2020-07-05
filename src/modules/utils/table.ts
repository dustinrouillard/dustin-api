const LINE_CHAR = '―';
const TABLE_SIZE = 54;
const TABLE_HEAD_FOOT = LINE_CHAR.repeat(TABLE_SIZE);

export function SpaceOut(leading: string, content: string): string {
  return `${leading} ${' '.repeat(TABLE_SIZE - leading.length - content.length - 2)} ${content}`;
}

export function GenerateTable(hours: string, commands: string, builds: string): string {
  let table = TABLE_HEAD_FOOT;
  table += `\n${SpaceOut('Hours writing code', hours)}`;
  table += `\n${SpaceOut('Terminal Commands', commands)}`;
  table += `\n${SpaceOut('Docker Builds', builds)}\n`;
  table += TABLE_HEAD_FOOT;
  return table;
}
