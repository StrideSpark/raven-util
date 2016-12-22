import { fetchCred } from 'credstash-promise';
const Raven = require('raven');


async function fetchSentryUrl(env: string, appName: string) {
    if (env !== 'dev') {
        return fetchCred(`${appName}.sentry.url`);
    }
    return undefined;
}

export async function init(env: string, appName: string, extraOptions?: Object) {
    const sentryUrl = await fetchSentryUrl(env, appName);
    if (!sentryUrl) {
        return undefined;
    }

    Raven.config(sentryUrl,
        Object.assign({
            captureUnhandledRejections: true,
            environment: env,
            release: process.env.BUILD_NUM,
            tags: {
                'build_hash': process.env.BUILD_HASH,
                'build_time': process.env.BUILD_TIME,
            }
        }, extraOptions)).install();

    return Raven;
}
