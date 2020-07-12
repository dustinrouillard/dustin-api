# dustin.rest

This is my personal api, it has many uses but was originally made to update my github gist, then github release profile readmes, and of course I had to innovate.

Hosted version: [**dustin.rest**](https://dustin.rest)

## Features

Right now this api does only useful things to me, well.. Maybe somewhat useful to me, and as a good reference if you want do something similar.

- Spotify Current Playing [[**/spotify**](https://dustin.rest/spotify)]
- Current State (Sleeping, music playing, ect) [[**/state**](https://dustin.rest/state)]
- Current Stats (Hours writing code, commands run, docker builds, ect) [[**/stats**](https://dustin.rest/stats)]
- Auto updating github profile [**README**](https://github.com/dustinrouillard)
- Auto updating github [**gist**](https://dstn.to/stats-gist)
- Twitter follower history tracking
- Spotify listening history
- Wakatime development time

## Tech used

- Fastify (HTTP Server)
- Redis (Caching)
- Cassandra (Database)
- Kubernetes (Deployment)
- JWT (Internal Authentication)
- Google Cloud Storage (Image/file hosting)
