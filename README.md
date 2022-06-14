# Algolia Logs Exporter
Algolia has a very limited logs export functionality, you can not subscribe to a log stream, export logs in CSV or something like that.
The only way to get logs from Algolia is via an [API call](https://www.algolia.com/doc/api-reference/api-methods/get-logs/).

This app makes periodic calls to Algolia API to get logs and pushes retrieved logs to Redis.
In order to avoid log entry duplicates, app uses Redis HyperLogLog data structure.

## Quick Start
You can use [docker-compose.yml](example/docker-compose.yml) to see how it works in tandem with [vector.dev](https://vector.dev/):
1. Clone the repo
2. Navigate to `example` directory
3. Copy `.docker.env.example` to `.docker.env`
4. Update `ALGOLIA_APP_ID` and `ALGOLIA_API_KEY` with your secret values
5. Lauch the stack with `docker compose up`