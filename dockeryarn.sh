#!/bin/bash

docker run --rm -it --volume $(pwd):/app --workdir /app --user $(id -u ${USER}):$(id -g ${USER}) -p 3000:3000 node:15.8.0 yarn $*
