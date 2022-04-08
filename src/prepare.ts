import AggregateError from 'aggregate-error'
import type { Context } from 'semantic-release'

import { Docker } from './docker'
import { getError } from './error'
import type { PluginConfig } from './types'

export async function prepare(pluginConfig: PluginConfig, context: Context): Promise<void> {
    if (!pluginConfig.buildImage) {
        context.logger.log('No "buildImage" command provided, skipping prepare step')

        return
    }

    context.logger.log('Found "buildImage" command, building docker image')

    const docker = new Docker()
    const dockerBuild = await docker.build(pluginConfig.buildImage)

    if (!dockerBuild) {
        throw new AggregateError([getError('EBUILD')])
    }

    context.logger.log('Successfully built docker image')
}
