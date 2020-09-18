export async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Promise.resolve().then([wait, fn]).then([wait, fn]).then ...
export async function execute_with_delay(fn, delay, seq) {
    return seq.reduce((promise, item) => {
      return promise.then(() => {
        return Promise.all([wait(delay), fn(item)])
      })
    }, Promise.resolve())
}