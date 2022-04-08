import {
    exec,
    execSync,
} from 'child_process'

import AggregateError from 'aggregate-error'
import type { Context } from 'semantic-release'

import type {
    DockerConfig,
    DockerImage,
} from './docker.types'
import { getError } from './error'
import type { PluginConfig } from './types'

export class Docker {
    public static loadConfig(pluginConfig: PluginConfig, context: Context): DockerConfig {
        const tags: string[] = []
        const rawTags: string[] = []

        if (pluginConfig.tags) {
            rawTags.push(...pluginConfig.tags)
        }

        if (context.nextRelease) {
            rawTags.push(context.nextRelease.version)
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

    private getImage(name: string): DockerImage | undefined {
        const stdout = execSync('docker images --format "{{json . }}"')
            .toString('utf-8')
            .match(/.+/gu)

        if (!stdout) {
            return
        }

        return stdout
            .map<DockerImage>((value) => JSON.parse(value))
            .find((image) => image.Repository === name)
    }

    public async build(command: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const childProcess = exec(command, (error) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(true)
                }
            })

            childProcess.stdout?.pipe(process.stdout)
            childProcess.stderr?.pipe(process.stderr)
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
                    if (error){
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
                }
            )

            childProcess.stdin?.write(password)
            childProcess.stdin?.end()
        })
    }
}
