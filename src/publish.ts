import type { PublishContext } from 'semantic-release'

import { AWS } from './aws.js'
import type { AWSConfigType } from './aws.types.js'
import { Docker } from './docker.js'
import { getError } from './error.js'
import type { PluginConfig, WithoutNullableKeysType } from './types.js'

export async function publish(pluginConfig: PluginConfig, context: PublishContext): Promise<void> {
    const awsConfig = AWS.loadConfig(context) as WithoutNullableKeysType<AWSConfigType>
    const aws = new AWS(awsConfig.accessKeyId, awsConfig.region, awsConfig.secretAccessKey, awsConfig.sessionToken)

    const awsLoginValue = await aws.login()

    context.logger.log(`Successfully logged in to ${awsLoginValue.registry}`)

    const docker = new Docker()
    const dockerLogin = await docker.login(awsLoginValue.username, awsLoginValue.password, awsLoginValue.registry)

    if (!dockerLogin) {
        throw new AggregateError([getError('ENOAUTHENTICATION')])
    }

    const dockerConfig = Docker.loadConfig(pluginConfig, context)

    context.logger.log(
        `Pushing ${pluginConfig.imageName} with tags [${dockerConfig.imageTags.join(', ')}] to ${awsLoginValue.registry}`,
    )

    const dockerPush = await docker.push(dockerConfig.imageName, dockerConfig.imageTags, awsLoginValue.registry)

    if (!dockerPush) {
        throw new AggregateError([getError('EDEPLOY')])
    }

    context.logger.log(
        `Successfully pushed ${pluginConfig.imageName} with tags [${dockerConfig.imageTags.join(', ')}] to ${awsLoginValue.registry}`,
    )
}
