import type { Config } from 'semantic-release'

export type WithoutNullableKeysType<TType> = {
    [Key in keyof TType]-?: WithoutNullableKeysType<NonNullable<TType[Key]>>
}

export interface PluginConfig extends Config {
    /**
     * Docker command to build and image from dockerfile
     *
     * @default ""
     */
    buildImage?: string
    /**
     * The name of the image to push to the ECR
     *
     * @default ""
     */
    imageName: string
    /**
     * Additional values which will be used to tag image
     *
     * @default ""
     */
    tags?: string[]
}
