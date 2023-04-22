import Bull from 'bull';
import Arena from 'bull-arena';
const arena = Arena({
    Bull,
    queues: [
        {
            // Required for each queue definition.
            name: 'my_queue',

            // User-readable display name for the host. Required.
            hostId: ' My Queues Server',
            // hostId: 'Queue Server 1',

            // Queue type (Bull or Bee - default Bull).
            type: 'bull',

            // Queue key prefix. Defaults to "bq" for Bee and "bull" for Bull.
            prefix: 'bull',

            redis: {
                host: 'localhost', // Redis host
                port: 6379, // Redis port
                password: 'ITAB_willberiesdb_PASS_rs', // Redis auth password
            },
        }
    ],
}, {
    basePath: "/",
    disableListen: false,
});