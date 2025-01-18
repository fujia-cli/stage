import log, { Logger } from 'npmlog';

export interface CliLog extends Logger {
  success: (prefix: string, message: string, ...args: any[]) => void;
}

// adjust level and support customization
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info';

// customize heading
log.heading = '[stage]';
// log.headingStyle = {
//   fg: 'blue',
//   bg: 'black'
// }

// add customized command
log.addLevel('success', 2000, {
  fg: 'green',
  bold: true,
});

export const enhanceLog = log as CliLog;
