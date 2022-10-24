//create exec async function
import { exec } from 'child_process'
import fs from 'fs/promises'
import _ from 'lodash'

export const execAsync = (command: string) => {
  return new Promise<string>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error)

      resolve(stdout ? stdout : stderr)
    })
  })
}

export const updateJson = async (
  packageJsonPath: string,
  setter: Record<string, unknown> = {},
  unsetter: string[] = []
) => {
  const packageJson = await fs
    .readFile(packageJsonPath, 'utf-8')
    .then(JSON.parse)
    .catch(() => ({}))
  for (const key in setter) {
    _.set(packageJson, key, setter[key])
  }
  for (const key of unsetter) {
    _.unset(packageJson, key)
  }
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
}

export const removeFiles = async (filePaths: string[]) => {
  for (const filePath of filePaths) {
    await fs.unlink(filePath)
  }
}

export const updateFile = async (filePath: string, replacer: Record<string, string> = {}) => {
  let content = await fs.readFile(filePath, 'utf-8')
  for (const key in replacer) {
    content = content.replaceAll(key, replacer[key])
  }

  await fs.writeFile(filePath, content)
}
