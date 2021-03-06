// @ts-ignore
import { cursor, erase } from 'sisteransi';
import tc from 'turbocolor';
import { createApp, prepareStarter } from './create-app';
import { STARTERS, Starter, getStarterRepo } from './starters';
import { prompt } from './vendor/prompts';

export async function runInteractive(starterName: string | undefined, autoRun: boolean) {
  process.stdout.write(erase.screen);
  process.stdout.write(cursor.to(0, 1));

  // Get starter's repo
  if (!starterName) {
    starterName = await askStarterName();
  }
  const starter = getStarterRepo(starterName);

  // start downloading in the background
  prepareStarter(starter);

  // Get project name
  const projectName = await askProjectName();

  // Ask for confirmation
  const confirm = await askConfirm(starter, projectName);
  if (confirm) {
    await createApp(starter, projectName, autoRun);
  } else {
    console.log('\n  aborting...');
  }
}

async function askStarterName(): Promise<string> {
  const { starterName } = await prompt([
    {
      type: 'select',
      name: 'starterName',
      message: 'Pick a starter',
      choices: getChoices(),
    },
    {
      type: (prev: any) => prev === null ? 'text' : null,
      name: 'starterName',
      message: 'Type a custom starter',
    }
  ]);
  if (!starterName) {
    throw new Error(`No starter was provided, try again.`);
  }
  return starterName;
}

function getChoices() {
  const maxLength = Math.max(...STARTERS.map(s => s.name.length)) + 1;
  return [
    ...STARTERS
      .filter(s => s.hidden !== true)
      .map(s => {
        const description = s.description ? tc.dim(s.description) : '';
        return {
          title: `${padEnd(s.name, maxLength)}   ${description}`,
          value: s.name
        };
      })
  ];
}

async function askProjectName() {
  const { projectName } = await prompt([{
    type: 'text',
    name: 'projectName',
    message: 'Project name',
  }]);
  if (!projectName) {
    throw new Error(`No project name was provided, try again.`);
  }
  return projectName;
}

async function askConfirm(starter: Starter, projectName: string) {
  const { confirm } = await prompt([{
    type: 'confirm',
    name: 'confirm',
    message: 'Confirm?',
    initial: true
  }]);
  return confirm;
}

function padEnd(str: string, targetLength: number, padString = ' ') {
  targetLength = targetLength >> 0;
  if (str.length > targetLength) {
    return str;
  }

  targetLength = targetLength - str.length;
  if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
  }

  return String(str) + padString.slice(0, targetLength);
}
