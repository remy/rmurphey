#!/bin/bash

node server compile
git add www
git commit -m 'deploy to heroku'
git push heroku master

