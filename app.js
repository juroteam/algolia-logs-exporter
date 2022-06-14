'use strict';

const Redis = require('ioredis');
const Algolia = require('algoliasearch');

const requiredEnv = [
    'TIMER_INTERVAL',
    'ALGOLIA_APP_ID', 'ALGOLIA_API_KEY',
    'ALGOLIA_LOGS_COUNT', 'ALGOLIA_LOGS_TYPE'
];

const unsetEnv = requiredEnv.filter((env) => !(typeof process.env[env] !== 'undefined'));
if (unsetEnv.length > 0) {
    throw new Error("Required ENV variables are not set: [" + unsetEnv.join(', ') + "]");
};

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT || '6379';
const REDIS_DB = process.env.REDIS_DB || '0';
const REDIS_LOGS_KEY = process.env.REDIS_LOGS_KEY || 'algolia-logs';
const SENTINELS = process.env.SENTINELS;
const SENTINEL_REDIS_MASTER = process.env.SENTINEL_REDIS_MASTER;
const TIMER_INTERVAL = process.env.TIMER_INTERVAL;
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;
const ALGOLIA_LOGS_TYPE = process.env.ALGOLIA_LOGS_TYPE;
const ALGOLIA_LOGS_COUNT = process.env.ALGOLIA_LOGS_COUNT;

let redisConfig;
if (SENTINELS === undefined) {
    redisConfig = {
        host: REDIS_HOST,
        port: REDIS_PORT,
        db: REDIS_DB,
    }
} else {
    redisConfig = {
        sentinels: SENTINELS.split(';').map((e) => {
            const entries = e.split(":");
            return { host: entries[0], port: entries[1] };
        }),
        name: SENTINEL_REDIS_MASTER,
        db: REDIS_DB,
    }
};

const redis = new Redis(redisConfig);
const algolia = Algolia(ALGOLIA_APP_ID, ALGOLIA_API_KEY);

const processLogs = async () => {
    const { logs } = await algolia.getLogs({
        offset: 0,
        length: ALGOLIA_LOGS_COUNT,
        type: ALGOLIA_LOGS_TYPE
    });

    for (const log of logs) {
        const logHash = log.sha1;
        const hllKey = `${REDIS_LOGS_KEY}-hll`;

        const hllResult = await redis.pfadd(hllKey, logHash);
        if (hllResult === 0) {
            console.log(`Log entry ${logHash} has already been processed`);
        } else {
            console.log(`Processing log entry ${logHash}`);
            redis.lpush(REDIS_LOGS_KEY, JSON.stringify(log));
        }
    }
};

async function main() {
    console.log(`Logs retrieval will run every ${TIMER_INTERVAL}s...`);
    setInterval(processLogs, 1000 * TIMER_INTERVAL);
};

process.on('SIGTERM', function onSigterm() {
    process.exit()
});

main();
