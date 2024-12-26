#! /bin/bash

# remove all node_modules recursively
find . -type d -name "node_modules" -exec sudo rm -rf {} \;

# find and remove dist folders
find . -type d -name "dist" -exec sudo rm -rf {} \;

pnpm store prune
