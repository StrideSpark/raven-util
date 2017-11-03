import { fetchAppCred } from 'credstash-promise';
import * as Raven from 'raven';
import { ConstructorOptions, Client } from 'raven';

async function fetchSentryUrl(env: string, appName: string) {
    if (env !== 'dev') {
        const cred = await fetchAppCred(env, appName, `sentry.url`, '');
        if (cred === '') {
            return undefined;
        }
        return cred;
    }
    return undefined;
}

export interface RavenClient extends Client {
    captureExceptionPromise: (err: any, extra?: any) => Promise<string>;
    captureMessagePromise: (msg: string, extra?: any) => Promise<string>;
}

export async function init(
    env: string,
    appName: string,
    extraOptions?: Partial<ConstructorOptions>
): Promise<RavenClient> {
    const sentryUrl = await fetchSentryUrl(env, appName);

    const client = Raven.config(sentryUrl || false, {
        captureUnhandledRejections: true,
        environment: appName,
        release: process.env.BUILD_NUM,
        tags: {
            env,
            build_hash: process.env.BUILD_HASH || 'unk',
            build_time: process.env.BUILD_TIME || 'unk',
        },

        ...extraOptions,
    });

    client.install();

    (client as any).captureExceptionPromise = (err: any, tags?: any) =>
        new Promise<string>((resolve, reject) =>
            client.captureException(
                err,
                {
                    tags,
                    fingerprint: ['{{ default }}', env, appName],
                },
                (sendErr: any, eventId: string) => {
                    if (sendErr) reject({ sendErr, eventId });
                    resolve(eventId);
                }
            )
        );

    (client as any).captureMessagePromise = (msg: string, tags?: any) =>
        new Promise<string>((resolve, reject) =>
            client.captureMessage(
                msg,
                { tags, fingerprint: ['{{ default }}', env, appName] },
                (sendErr: any, eventId: string) => {
                    if (sendErr) reject({ sendErr, eventId });
                    resolve(eventId);
                }
            )
        );

    return client as RavenClient;
}
