const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_LOGS_TYPE = process.env.ALGOLIA_LOGS_TYPE || 'all';
const ALGOLIA_LOGS_COUNT = process.env.ALGOLIA_LOGS_COUNT || '100';
const ALGOLIA_API_URL = `https://${ALGOLIA_APP_ID}.algolia.net/1/logs?type=${ALGOLIA_LOGS_TYPE}&lenght=${ALGOLIA_LOGS_COUNT}`;

const ATLAS_CLUSTER_ID = process.env.ATLAS_CLUSTER_ID;
const ATLAS_API_URL = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${ATLAS_CLUSTER_ID}/clusters`;


module.exports = {
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_DB: process.env.REDIS_DB || '0',

    SENTINELS: process.env.SENTINELS,
    SENTINEL_REDIS_PRIMARY: process.env.SENTINEL_REDIS_PRIMARY,

    ALGOLIA_APP_ID,
    ALGOLIA_LOGS_TYPE,
    ALGOLIA_LOGS_COUNT,
    ALGOLIA_API_URL,
    ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
    ALGOLIA_TIMER_INTERVAL: process.env.ALGOLIA_TIMER_INTERVAL || 60,
    ALGOLIA_REDIS_LOGS_KEY: process.env.ALGOLIA_REDIS_LOGS_KEY || 'algolia-logs',

    ATLAS_API_URL,
    ATLAS_PUBLIC_KEY: process.env.ATLAS_PUBLIC_KEY,
    ATLAS_PRIVATE_KEY: process.env.ATLAS_PRIVATE_KEY,
    ATLAS_CLUSTER: process.env.ATLAS_CLUSTER,
    ATLAS_LOGS_INTERVAL: process.env.ATLAS_LOGS_INTERVAL || 300,
    ATLAS_TIMER_INTERVAL: process.env.ATLAS_TIMER_INTERVAL || 300,
    ATLAS_MONGOD_REDIS_LOGS_KEY: process.env.ATLAS_MONGOD_REDIS_LOGS_KEY || 'atlas-mongo-logs',
    ATLAS_AUDIT_REDIS_LOGS_KEY: process.env.ATLAS_AUDIT_REDIS_LOGS_KEY || 'atlas-audit-logs',
};
