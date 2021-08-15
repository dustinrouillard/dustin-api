# dustin.rest

This is my personal api, it has many uses but was originally made to update my github gist, then the github release profile readme, and of course I had to just keep going lol.

Hosted version: [**rest.dstn.to**](https://rest.dstn.to)

## Features

Right now this api does only useful things to me, well.. Maybe somewhat useful to me, and as a good reference if you want do something similar.

- Spotify Current Playing [[**/spotify**](https://rest.dstn.to/spotify)]
- Current State (Sleeping, music playing, ect) [[**/state**](https://rest.dstn.to/state)]
- Current Stats (Hours writing code, commands run, docker builds, ect) [[**/stats**](https://rest.dstn.to/stats)]
- Auto updating github profile [**README**](https://github.com/dustinrouillard)
- Auto updating github [**gist**](https://dstn.to/stats-gist)
- Twitter follower history tracking
- Spotify listening history [[**/spotify/history**](https://rest.dstn.to/spotify/history)]
- Wakatime development time

## Tech used

- Fastify (HTTP Server)
- Redis (Caching)
- Rabbit (Messaging to and from my Realtime Gateway)
- Cassandra (Database)
- Postgres (Database)
- Kubernetes (Deployment)
- JWT (Internal Authentication)
- Minio (S3) (Image/file hosting)
