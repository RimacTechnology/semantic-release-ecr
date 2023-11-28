import { Buffer } from 'buffer'

import {
    ECRClient,
    GetAuthorizationTokenCommand,
} from '@aws-sdk/client-ecr'
import AggregateError from 'aggregate-error'
import type { VerifyConditionsContext } from 'semantic-release'

import type {
    AWSConfigType,
    AWSLoginValueType,
} from './aws.types'
import { getError } from './error'

export class AWS {
    public static loadConfig(context: VerifyConditionsContext): AWSConfigType {
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

    public readonly awsEcr: InstanceType<typeof ECRClient>

    constructor(accessKeyId: string, region: string, secretAccessKey: string) {
        this.awsEcr = new ECRClient({
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            region,
        })
    }

    public async login(): Promise<AWSLoginValueType> {
        const { authorizationData } = await this.awsEcr.send(new GetAuthorizationTokenCommand({}))

        const [authorization] = authorizationData ?? []

        if (!authorization) {
            throw new AggregateError([getError('ENOAUTHORIZATION')])
        }

        const {
            authorizationToken,
            proxyEndpoint,
        } = authorization

        if (!authorizationToken || !proxyEndpoint) {
            throw new AggregateError([getError('ENOAUTHORIZATION')])
        }

        const [username, password] = Buffer.from(authorizationToken, 'base64')
            .toString('utf-8')
            .split(':')

        if (!username || !password) {
            throw new AggregateError([getError('ENOAUTHORIZATION')])
        }

        return {
            password,
            registry: proxyEndpoint,
            username,
        }
    }
}
