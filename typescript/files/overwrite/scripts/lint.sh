#!/bin/bash

echo "Linting..."

format='compact'

eslint -f ${format} --cache --ext .ts,.js src --fix
