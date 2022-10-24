import prompts from 'prompts'
import { CreateApp } from '..'
import { updateFile, updateJson } from '../../helpers'
import { execSync } from 'child_process'

const createApp: CreateApp = async () => {
  const answers = await askQuestions()

  execSync(`cd apps && npx nuxi init ${answers.name}`, { stdio: 'inherit' })

  const appPath = `apps/${answers.name}`
  await updatePackageJson(appPath, answers)
  await updateEslint(appPath)
  await updateFile(`${appPath}/nuxt.config.ts`, { '})': '  ssr: false })' })

  execSync('npm install', { stdio: 'inherit' })
  execSync(`npm run lint -w ${answers.name}`, { stdio: 'inherit' })
  execSync(`npm i eslint eslint-plugin-vue -D -w ${answers.name}`, { stdio: 'inherit' })
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
      initial: 2000,
      validate: (value: string) => (Number.isInteger(value) ? true : 'Invalid app port'),
    },
  ])
}

const updatePackageJson = async (appPath: string, answers: Record<string, unknown> = {}) => {
  await updateJson(
    `${appPath}/package.json`,
    {
      'scripts.dev': 'nuxi dev' + (answers.port ? ` --port ${answers.port}` : ''),
      'scripts.lint': 'eslint --ext .ts,.vue --fix && prettier --write .',
    },
    []
  )
}

const updateEslint = async (appPath: string) => {
  //await removeFiles([`${appPath}/.eslintrc.js`,`${appPath}/.prettierrc`])

  await updateJson(`${appPath}/.eslintrc.json`, {
    extends: ['../../.eslintrc.json'],
    ignorePatterns: [],
    overrides: [
      {
        files: ['*.ts', '*.vue'],
        extends: ['plugin:vue/vue3-recommended'],
        rules: {},
      },
    ],
  })
}

export default createApp
