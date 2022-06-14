# Algolia Logs Exporter
Algolia has a very limited logs export functionality, you can not subscribe to a log stream, export logs in CSV or something like that.
The only way to get logs from Algolia is via an [API call](https://www.algolia.com/doc/api-reference/api-methods/get-logs/).

This app makes periodic calls to Algolia API to get logs and pushes retrieved logs to Redis.
In order to avoid log entry duplicates, app uses Redis HyperLogLog data structure.

## Quick Start
The easiest way is to run the app:
```shell
docker run -e ALGOLIA_APP_ID=YOUR_APP_ID -e ALGOLIA_API_KEY=YOUR_API_KEY -e REDIS_HOST=redis -e ALGOLIA_LOGS_TYPE=error -e ALGOLIA_LOGS_COUNT=100 -e TIMER_INTERVAL=10 docker pull ghcr.io/juroteam/algolia-logs-exporter:latest
```

You can also use [docker-compose.yml](example/docker-compose.yml) to see how it works in tandem with [vector.dev](https://vector.dev/):
1. Clone the repo
2. Navigate to `example` directory
3. Copy `.docker.env.example` to `.docker.env`
4. Update `ALGOLIA_APP_ID` and `ALGOLIA_API_KEY` with your secret values
5. Lauch the stack with `docker compose up`