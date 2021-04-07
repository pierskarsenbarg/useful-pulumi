"""A Python Pulumi program"""

from pulumi_docker import Image, DockerBuild, RemoteImage, CacheFrom

base_builder = RemoteImage("baseBuilder",
                        name=f'pierskarsenbarg/dockercache-python:builder'
                        )
cache_from=CacheFrom()
cache_from.stages = ["builder"]

runtime_image = Image("runtime_image",
                    image_name=f'pierskarsenbarg/dockercache-python:latest',
                    build=DockerBuild(target=f'runtime', 
                                    context=f'./app',
                                    cache_from=cache_from))