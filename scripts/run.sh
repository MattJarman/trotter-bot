#!/usr/bin/env bash

docker-compose run --rm --user "$(id -u)":"$(id -g)" -w /home/node trot_node "$@"