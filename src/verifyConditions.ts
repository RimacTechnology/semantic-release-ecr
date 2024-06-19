import type { VerifyConditionsContext } from 'semantic-release'

import { AWS } from './aws.js'
import { getError } from './error.js'
import type { PluginConfig } from './types.js'

export function verifyConditions(pluginConfig: PluginConfig, context: VerifyConditionsContext): void {
    const errors = []
    const awsConfig = AWS.loadConfig(context)

    if (!awsConfig.accessKeyId) {
        errors.push(getError('ENOACCESSKEYID'))
    }

    if (!awsConfig.secretAccessKey) {
        errors.push(getError('ENOSECRETACCESSKEY'))
    }

    if (!awsConfig.region) {
        errors.push(getError('ENOREGION'))
    }

    if (!pluginConfig.imageName) {
        errors.push(getError('ENOIMAGENAME'))
    }

    if (errors.length > 0) {
        throw new AggregateError(errors)
    }
}
