import prompts from 'prompts'
import { CreateApp } from '..'
import { execSync } from 'child_process'
import { removeFiles, updateFile, updateJson } from '../../helpers'

const createApp: CreateApp = async () => {
  const answers = await askQuestions()

  execSync(`cd apps && npx @nestjs/cli new ${answers.name} --strict -s -g -p npm`, { stdio: 'inherit' })

  const appPath = `apps/${answers.name}`
  await updatePackageJson(appPath)
  await updateEslint(appPath)
  await updateFile(`${appPath}/src/main.ts`, { 3000: answers.port.toString() })

  execSync('npm install', { stdio: 'inherit' })
  execSync(`npm run lint -w ${answers.name}`, { stdio: 'inherit' })
}

const askQuestions = () => {
  return prompts([
    {
      type: 'text',
      name: 'name',
      message: 'App name',
      validate: (value: string) => (/^[a-z0-9-]+$/.test(value) ? true : 'Invalid app name'),
    },
    {
      type: 'number',
      name: 'port',
      message: 'App default port',
      initial: 3000,
      validate: (value: string) => (Number.isInteger(value) ? true : 'Invalid app port'),
    },
  ])
}

const updatePackageJson = async (appPath: string) => {
  await updateJson(`${appPath}/package.json`, {
    scripts: {
      prebuild: 'rimraf dist',
      dev: 'nest start --watch',
      build: 'nest build',
      start: 'nest start',
      'start:debug': 'nest start --debug --watch',
      'start:prod': 'node dist/main',

      lint: 'eslint --ext .ts --fix && prettier --write .',

      test: 'jest',
      'test:watch': 'jest --watch',
      'test:cov': 'jest --coverage',
      'test:debug':
        'node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand',
      'test:e2e': 'jest --config ./test/jest-e2e.json',

      'gen:resource': 'nest g resource',

      'gen:module': 'nest g module',
      'gen:controller': 'nest g controller',
      'gen:resolver': 'nest g resolver',
      'gen:service': 'nest g service',

      'gen:decorator': 'nest g decorator',
      'gen:guard': 'nest g guard',
      'gen:provider': 'nest g provider',

      'gen:filter': 'nest g filter',
      'gen:interceptor': 'nest g interceptor',
      'gen:middleware': 'nest g middleware',
      'gen:pipe': 'nest g pipe',
    },
  })
}

const updateEslint = async (appPath: string) => {
  await removeFiles([`${appPath}/.eslintrc.js`, `${appPath}/.prettierrc`])

  await updateJson(`${appPath}/.eslintrc.json`, {
    extends: ['../../.eslintrc.json'],
    ignorePatterns: [],
    overrides: [
      {
        files: ['*.ts'],
        rules: {},
      },
    ],
  })
}

export default createApp
