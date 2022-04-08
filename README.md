# @rimac-automobili/semantic-release-ecr

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to publish a docker image to the AWS
Elastic Container Registry

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Conventional Changelog](https://img.shields.io/badge/changelog-conventional-brightgreen.svg)](http://conventional-changelog.github.io)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-conventionalcommits-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

| Step               | Description                                                                                                                                                 |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `verifyConditions` | Verify the presence of the `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_DEFAULT_REGION` environment variables and docker `imageName` plugin option |
| `publish`          | [Publish the docker image](https://docs.aws.amazon.com/AmazonECR/latest/userguide/docker-push-ecr-image.html) to the aws ecr.                               |

## Install

```bash
# For npm users
$ npm install --save-dev @rimac-automobili/semantic-release-ecr

# For yarn users
$ yarn add --dev @rimac-automobili/semantic-release-ecr
```

## Usage

The plugin can be configured in the [**
semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
    "plugins": [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/npm",
        [
            "@rimac-automobili/semantic-release-ecr",
            {
                "imageName": "my-ecr-image"
            }
        ]
    ]
}
```

## Prerequisites

To use this plugin you need to set up an ECR container registry if you don't already have on. Here is
a [AWS ECR Getting started](https://docs.aws.amazon.com/AmazonECR/latest/userguide/ECR_GetStarted.html) guide from AWS
on how to set up a new registry.

**IMPORTANT!** This plugin expects the docker image to be built already, or you can build it with "dockerImage"
configuration option

## Configuration

### Environment variables

| Variable                     | Description       |
|------------------------------|-------------------|
| `AWS_ACCESS_KEY_ID` (**)     | AWS access key id |
| `AWS_SECRET_ACCESS_KEY` (**) | AWS secret key    |
| `AWS_DEFAULT_REGION` (**)    | AWS region        |

_(**) = required variable._

### Options

| Options          | Description                                                                                                                                                                                                                                                                                                 | Default               |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `buildImage`     | Docker command which will build an image                                                                                                                                                                                                                                                                    | `.`                   |
| `imageName` (**) | The name of the image to push to the ECR. The name should be the same as your ECR repository name (example: `my-ecr-image`). Remember that you don't need to add your registry URL in front of the image name, the plugin will fetch this URL from AWS and add it for you. Don't add tag in the `imageName` | `.`                   |
| `tags`           | Array of string which can be static values like `latest` or environment variables like `$NODE_ENV`                                                                                                                                                                                                          | `nextRelease.version` |

_(**) = required option._

### Example

```json
{
    "plugins": [
        "@semantic-release/commit-analyzer",
        "@semantic-release/release-notes-generator",
        "@semantic-release/npm",
        [
            "@rimac-automobili/semantic-release-ecr",
            {
                "buildImage": "docker build . -t my-ecr-image",
                "imageName": "my-ecr-image",
                "tags": ["latest", "$NODE_ENV"]
            }
        ]
    ]
}
```
