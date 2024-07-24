import { exec, execSync, spawn } from 'node:child_process'

import type { PublishContext } from 'semantic-release'

import type { DockerConfigType, DockerImageType } from './docker.types.js'
import { getError } from './error.js'
import type { PluginConfig } from './types.js'

export class Docker {
    public static loadConfig(pluginConfig: PluginConfig, context: PublishContext): DockerConfigType {
        const tags: string[] = []
        const rawTags: string[] = [context.nextRelease.version]

        if (pluginConfig.tags) {
            rawTags.push(...pluginConfig.tags)
        }

        for (const rawTag of rawTags) {
            const tag = rawTag.startsWith('$') ? context.env[rawTag.slice(1)] : rawTag

            if (tag) {
                tags.push(rawTag)
            }
        }

        return {
            imageName: pluginConfig.imageName,
            imageTags: tags,
        }
    }

    public async build(command: [string, string[]]): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const [cmd, cmdOptions] = command
            const childProcess = spawn(cmd, cmdOptions, { shell: true })

            childProcess.stdout?.pipe(process.stdout)
            childProcess.stderr?.pipe(process.stderr)

            childProcess.once('close', (code) => {
                if (code === 0) {
                    resolve(true)
                } else {
                    reject(new Error(`Process exited with code ${code}`))
                }
            })

            childProcess.once('error', (error) => {
                reject(error)
            })
        })
    }

    public async login(username: string, password: string, registry: string): Promise<boolean> {
        return new Promise((resolve) => {
            const childProcess = exec(
                `docker login ${registry} --username ${username} --password-stdin`,
                (error, stdout) => {
                    if (error) {
                        resolve(false)
                    } else {
                        resolve(stdout.startsWith('Login Succeeded'))
                    }
                },
            )

            childProcess.stdin?.write(password)
            childProcess.stdin?.end()
        })
    }

    public async push(name: string, tags: string[], registry: string): Promise<boolean> {
        const image = this.getImage(name)
        const [, serverAddress] = registry.split('://')

        if (!image) {
            throw new AggregateError([getError('ENOIMAGE')])
        }

        for (const tag of tags) {
            const imageRepository = `${serverAddress}/${image.Repository}:${tag}`

            execSync(`docker tag ${image.ID} ${imageRepository}`)

            await new Promise<void>((resolve, reject) => {
                const childProcess = exec(`docker push ${imageRepository}`, (error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve()
                    }
                })

                childProcess.stdout?.pipe(process.stdout)
                childProcess.stderr?.pipe(process.stderr)
            })

            execSync(`docker rmi ${imageRepository}`)
        }

        return true
    }

    private getImage(name: string): DockerImageType | undefined {
        const stdout = execSync('docker images --format "{{json . }}"').toString('utf-8').match(/.+/gu)

        if (!stdout) {
            return
        }

        return stdout.map<DockerImageType>((value) => JSON.parse(value)).find((image) => image.Repository === name)
    }
}
