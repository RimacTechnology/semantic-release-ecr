import AggregateError from 'aggregate-error'
import type { Context } from 'semantic-release'

import { AWS } from './aws'
import { getError } from './error'
import type { PluginConfig } from './types'

export function verifyConditions(pluginConfig: PluginConfig, context: Context): void {
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
