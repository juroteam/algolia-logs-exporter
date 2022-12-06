const dns = require('dns');
const zlib = require('zlib');
const Redis = require('ioredis');
const urllib = require('urllib');
const crypto = require('crypto');
const config = require('./config');
const readline = require('node:readline');

let redisConfig;
if (config.SENTINELS === undefined) {
    redisConfig = {
        db: config.REDIS_DB,
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
    }
} else {
    redisConfig = {
        db: config.REDIS_DB,
        name: config.SENTINEL_REDIS_PRIMARY,
        sentinels: config.SENTINELS.split(';').map((e) => {
            const entries = e.split(":");
            return { host: entries[0], port: entries[1] };
        }),
    }
};

const redis = new Redis(redisConfig);

const processAlgoliaLogs = async () => {
    const { status, data } = await urllib.request(config.ALGOLIA_API_URL, {
        headers: {
            'Content-Type': 'application/json',
            'X-Algolia-API-Key': config.ALGOLIA_API_KEY,
            'X-Algolia-Application-Id': config.ALGOLIA_APP_ID

        }
    });

    if (status !== 200) throw new Error('Algolia API request failed');
    const { logs } = JSON.parse(data);

    for (const log of logs) {
        const logHash = log.sha1;
        const hllKey = `${config.ALGOLIA_REDIS_LOGS_KEY}-hll`;

        const hllResult = await redis.pfadd(hllKey, logHash);
        if (hllResult === 0) {
            console.log(`Log entry ${logHash} has already been processed`);
        } else {
            console.log(`Processing algolia log entry ${logHash}`);
            redis.lpush(config.ALGOLIA_REDIS_LOGS_KEY, JSON.stringify(log));
        }
    }
};


const dnsPromises = dns.promises;

const downloadMongoLogs = async (mongoUrl, logType, logRedisKey) => {
    const hostLogsUrl = `${config.ATLAS_API_URL}/${mongoUrl}/logs/${logType}.gz`;
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - config.ATLAS_LOGS_INTERVAL;

    const { status, res } = await urllib.request(hostLogsUrl, {
        digestAuth: `${config.ATLAS_PUBLIC_KEY}:${config.ATLAS_PRIVATE_KEY}`,
        streaming: true,
        compressed: true,
        data: {
            'endDate': `${endDate}`,
            'startDate': `${startDate}`,
        }
    });

    if (status !== 200) throw new Error(`Atlas API request failed: ${status}`);

    const logs = readline.createInterface({
        input: res.pipe(zlib.createGunzip({ finishFlush: zlib.constants.Z_SYNC_FLUSH })),
        crlfDelay: Infinity
    });

    for await (const log of logs) {
        const logHash = crypto.createHash('blake2b512').update(log).digest('hex');
        const hllKey = `${logRedisKey}-hll`;

        const hllResult = await redis.pfadd(hllKey, logHash);
        if (hllResult === 0) {
            console.log(`Log ${logType} entry ${logHash} has already been processed`);
        } else {
            console.log(`Processing ${logType} log entry ${logHash}`);
            redis.lpush(logRedisKey, log);
        }
    }
};

const processMongoLogs = async (mongoCluster, logType, logRedisKey) => {
    const mongoRecords = await dnsPromises.resolveSrv(`_mongodb._tcp.${mongoCluster}`);
    const mongoHosts = mongoRecords.map((record) => record.name);
    await Promise.all(mongoHosts.map(host => { downloadMongoLogs(host, logType, logRedisKey) }));
};

async function main() {
    console.log(`Algolia logs retrieval will run every ${config.ALGOLIA_TIMER_INTERVAL}s...`);
    setInterval(
        processAlgoliaLogs,
        1000 * config.ALGOLIA_TIMER_INTERVAL
    );
    console.log(`Atlas mongo logs retrieval will run every ${config.ATLAS_TIMER_INTERVAL}s...`);
    setInterval(
        () => processMongoLogs(config.ATLAS_CLUSTER, 'mongodb', config.ATLAS_MONGOD_REDIS_LOGS_KEY),
        1000 * config.ATLAS_LOGS_INTERVAL
    );
    console.log(`Atlas audit logs retrieval will run every ${config.ATLAS_TIMER_INTERVAL}s...`);
    setInterval(
        () => processMongoLogs(config.ATLAS_CLUSTER, 'mongodb-audit-log', config.ATLAS_AUDIT_REDIS_LOGS_KEY),
        1000 * config.ATLAS_LOGS_INTERVAL
    );
};

process.on('SIGTERM', function onSigterm() {
    process.exit()
});

main();
