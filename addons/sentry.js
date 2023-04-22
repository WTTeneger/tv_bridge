import * as Sentry from "@sentry/node";
Sentry.init({
    dsn: "https://d0a26f95ebc54a4785fc6a2408932fc7@o4504224866500608.ingest.sentry.io/4504224870170627",
    tracesSampleRate: 1.0,
});

// class singleton {
class __sentry{
    static instance;
    constructor() {
        if (!!__sentry.instance) {
            return __sentry.instance;
        }
        Sentry.init({
            dsn: "https://d0a26f95ebc54a4785fc6a2408932fc7@o4504224866500608.ingest.sentry.io/4504224870170627",
            tracesSampleRate: 1.0,
        });
        this.sentry = Sentry;
        // console.log(this.sentry);
        __sentry.instance = this;

        return this;
    }
    async captureException(e) {
        // console.log(this.sentry)
        this.sentry.captureException(e);
    }
    async captureMessage(m) {
        this.sentry.captureMessage(m);
    }
}

const sentry = new __sentry();
export default sentry;

