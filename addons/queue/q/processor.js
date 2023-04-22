export default function (job) {
    // Do some heavy work
    job.progress(42);

    console.log(job);
    console.log('job', job.data.message);

    // sleep 5 seconds
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(result);
        }, 40000);
    });


    // return Promise.resolve(result);
}