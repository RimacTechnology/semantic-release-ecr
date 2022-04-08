import AggregateError from 'aggregate-error'
import type { Context } from 'semantic-release'

import { AWS } from './aws'
import type { AWSConfig } from './aws.types'
import { Docker } from './docker'
import { getError } from './error'
import type {
    PluginConfig,
    WithoutNullableKeys,
} from './types'

export async function publish(pluginConfig: PluginConfig, context: Context): Promise<void> {
    const awsConfig = AWS.loadConfig(context) as WithoutNullableKeys<AWSConfig>
    const aws = new AWS(
        awsConfig.accessKeyId,
        awsConfig.region,
        awsConfig.secretAccessKey
    )

    const awsLoginValue = await aws.login()

    context.logger.log(`Successfully logged in to ${awsLoginValue.registry}`)

    const docker = new Docker()
    const dockerLogin = await docker.login(
        awsLoginValue.username,
        awsLoginValue.password,
        awsLoginValue.registry
    )

    if (!dockerLogin) {
        throw new AggregateError([getError('ENOAUTHENTICATION')])
    }

    const dockerConfig = Docker.loadConfig(pluginConfig, context)

    // eslint-disable-next-line max-len
    context.logger.log(`Pushing ${pluginConfig.imageName} with tags [${dockerConfig.imageTags.join(', ')}] to ${awsLoginValue.registry}`)

    const dockerPush = await docker.push(
        dockerConfig.imageName,
        dockerConfig.imageTags,
        awsLoginValue.registry,
    )

    if (!dockerPush) {
        throw new AggregateError([getError('EDEPLOY')])
    }

    // eslint-disable-next-line max-len
    context.logger.log(`Successfully pushed ${pluginConfig.imageName} with tags [${dockerConfig.imageTags.join(', ')}] to ${awsLoginValue.registry}`)
}
