"""A Python Pulumi program"""

from pulumi_docker import Image, DockerBuild

my_image = Image("image",
                image_name=f'pierskarsenbarg/dockercache-python:builder',
                build=DockerBuild(target=f'builder',
                                dockerfile=f'./app/Dockerfile', 
                                context=f'./app'))


"""
const builderImage = new docker.Image("baseImage", {
    imageName: "pierskarsenbarg/piers-test:builder",
    build: {
        target: "builder",
        dockerfile: "./app/Dockerfile",
        context: "./app"
    },
});
"""