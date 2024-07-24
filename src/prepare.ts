import type { PrepareContext } from 'semantic-release'

import { Docker } from './docker.js'
import { getError } from './error.js'
import type { PluginConfig } from './types.js'

export async function prepare(pluginConfig: PluginConfig, context: PrepareContext): Promise<void> {
    if (!pluginConfig.buildImage) {
        context.logger.log('No "buildImage" command provided, skipping prepare step')

        return
    }

    const [command, ...commandOptions] = pluginConfig.buildImage.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []

    if (!command) {
        throw new AggregateError([getError('ECOMMAND')])
    }

    context.logger.log('Found "buildImage" command, building docker image')

    const docker = new Docker()
    const dockerBuild = await docker.build([command, commandOptions])

    if (!dockerBuild) {
        throw new AggregateError([getError('EBUILD')])
    }

    context.logger.log('Successfully built docker image')
}
