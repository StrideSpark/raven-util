import { fetchCred } from 'credstash-promise';
const Raven = require('raven');

async function fetchSentryUrl(env: string, appName: string) {
    if (env !== 'dev') {
        return fetchCred(`${appName}.sentry.url`);
    }
    return undefined;
}

export interface RavenClient {
    captureExceptionPromise: (err: any) => Promise<string>;
    captureMessagePromise: (msg: string) => Promise<string>;
}

export async function init(env: string, appName: string, extraOptions?: Object): Promise<RavenClient> {
    const sentryUrl = await fetchSentryUrl(env, appName);

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

    Raven.captureExceptionPromise = (err: any) => new Promise<string>((resolve, reject) =>
        Raven.captureException(err, (sendErr: any, eventId: string) => {
            if (sendErr) reject({ sendErr, eventId })
            resolve(eventId)
        }));

    Raven.captureMessagePromise = (msg: string) => new Promise<string>((resolve, reject) =>
        Raven.captureMessage(msg, (sendErr: any, eventId: string) => {
            if (sendErr) reject({ sendErr, eventId })
            resolve(eventId)
        }));
    
    return Raven as RavenClient;
}

