export type DockerConfigType = {
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
    imageTags: string[]
}

export type DockerImageType = {
    /**
     * Docker image ID
     *
     * @default ""
     */
    ID: string
    /**
     * Docker repository where ICD image will be pushed
     *
     * @default ""
     */
    Repository: string
    /**
     * Mutable named reference for docker image
     *
     * @default ""
     */
    Tag: string
}
