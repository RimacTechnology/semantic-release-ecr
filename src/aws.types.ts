export type AWSConfigType = {
    /**
     * AWS access key id
     *
     * @default ""
     */
    accessKeyId: string | null
    /**
     * AWS region
     *
     * @default ""
     */
    region: string | null
    /**
     * AWS secret key
     *
     * @default ""
     */
    secretAccessKey: string | null

    /**
     * (optional) AWS session token for the provided credentials
     *
     * @default ""
     */
    sessionToken: string | null
}

export type AWSLoginValueType = {
    /**
     * Password value decoded from authorization token
     * Documentation: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ecr/get-authorization-token.html#output
     *
     * @default ""
     */
    password: string
    /**
     * The registry URL to use in a docker login command
     *
     * @default ""
     */
    registry: string
    /**
     * User value decoded from AWS authorization token
     * Documentation: https://awscli.amazonaws.com/v2/documentation/api/latest/reference/ecr/get-authorization-token.html#output
     *
     * @default ""
     */
    username: string
}
