import { Buffer } from 'node:buffer'

import { ECRClient, GetAuthorizationTokenCommand } from '@aws-sdk/client-ecr'
import type { VerifyConditionsContext } from 'semantic-release'

import type { AWSConfigType, AWSLoginValueType } from './aws.types.js'
import { getError } from './error.js'

export class AWS {
    public static loadConfig(context: VerifyConditionsContext): AWSConfigType {
        let region: string | null = null
        let accessKeyId: string | null = null
        let secretAccessKey: string | null = null
        let sessionToken: string | null = null

        if (context.env.AWS_DEFAULT_REGION) {
            region = context.env.AWS_DEFAULT_REGION
        }

        if (context.env.AWS_ACCESS_KEY_ID) {
            accessKeyId = context.env.AWS_ACCESS_KEY_ID
        }

        if (context.env.AWS_SECRET_ACCESS_KEY) {
            secretAccessKey = context.env.AWS_SECRET_ACCESS_KEY
        }

        if (context.env.AWS_SESSION_TOKEN) {
            sessionToken = context.env.AWS_SESSION_TOKEN
        }

        return {
            accessKeyId,
            region,
            secretAccessKey,
            sessionToken,
        }
    }

    public readonly awsEcr: InstanceType<typeof ECRClient>

    constructor(accessKeyId: string, region: string, secretAccessKey: string, sessionToken: string) {
        this.awsEcr = new ECRClient({
            credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken,
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

        const { authorizationToken, proxyEndpoint } = authorization

        if (!authorizationToken || !proxyEndpoint) {
            throw new AggregateError([getError('ENOAUTHORIZATION')])
        }

        const [username, password] = Buffer.from(authorizationToken, 'base64').toString('utf-8').split(':')

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
