import { Buffer } from 'buffer'

import AggregateError from 'aggregate-error'
import aws from 'aws-sdk'
import type { Context } from 'semantic-release'

import type {
    AWSConfig,
    AWSLoginValue,
} from './aws.types'
import { getError } from './error'

export class AWS {
    public static loadConfig(context: Context): AWSConfig {
        let region: string | null = null
        let accessKeyId: string | null = null
        let secretAccessKey: string | null = null

        if (context.env.AWS_DEFAULT_REGION) {
            region = context.env.AWS_DEFAULT_REGION
        }

        if (context.env.AWS_ACCESS_KEY_ID) {
            accessKeyId = context.env.AWS_ACCESS_KEY_ID
        }

        if (context.env.AWS_SECRET_ACCESS_KEY) {
            secretAccessKey = context.env.AWS_SECRET_ACCESS_KEY
        }

        return {
            accessKeyId,
            region,
            secretAccessKey,
        }
    }

    public readonly awsEcr: InstanceType<typeof aws.ECR>

    constructor(accessKeyId: string, region: string, secretAccessKey: string) {
        this.awsEcr = new aws.ECR({
            accessKeyId,
            region,
            secretAccessKey,
        })
    }

    public async login(): Promise<AWSLoginValue> {
        const { authorizationData } = await this.awsEcr.getAuthorizationToken().promise()

        if (!authorizationData || !authorizationData.length) {
            throw new AggregateError([getError('ENOAUTHORIZATION')])
        }

        const [{
            authorizationToken,
            proxyEndpoint,
        }] = authorizationData

        if (!authorizationToken || !proxyEndpoint) {
            throw new AggregateError([getError('ENOAUTHORIZATION')])
        }

        const [username, password] = Buffer.from(authorizationToken, 'base64')
            .toString('utf-8')
            .split(':')

        return {
            password,
            registry: proxyEndpoint,
            username,
        }
    }
}
