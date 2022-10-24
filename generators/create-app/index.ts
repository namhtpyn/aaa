//get list of files in this directory except for index.ts
import fs from 'fs/promises'
import prompts from 'prompts'

export type CreateApp = () => Promise<void>

const getDirs = (path: string) => {
  return fs
    .readdir(path, { withFileTypes: true })
    .then(files => files.filter(file => file.isDirectory()).map(file => file.name))
}

const run = async () => {
  const options = await getDirs(__dirname)
  const response = await prompts([
    {
      type: 'select',
      name: 'appType',
      message: 'Pick one',
      choices: options.map(option => ({ title: option, value: option })),
    },
  ])
  if (!response.appType) throw new Error('No app type selected')

  const createApp = await import(`./${response.appType}`).then(module => module.default as CreateApp)
  createApp()
}
run()
