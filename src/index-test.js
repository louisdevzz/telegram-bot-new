const {Logger} = require('./logger');
const cluster = require('cluster');
const { BotTest } = require('./bot-test');
const {TaskManager} = require('./task-manager');
const config = require('../config.json');
const logger = new Logger(config.app.logs);
const tasks = new TaskManager();

const workers = process.env.WORKERS || 1;

process.on('uncaughtException', (err) => {
    logger.error(`uncaughtException: ${err.message}`);
    logger.error(err.stack.toString());
});

process.on('unhandledRejection', (err) => {
    logger.error(`unhandledRejection: ${err.message}`);
    logger.error(err.stack.toString());
});

const run = async () => {
    logger.log('Worker initializing');

    const bot = new BotTest(logger);


    tasks.subscribe('releases', bot.notifyUsers.bind(bot));

    logger.log('Worker ready');
};
const forkWorker = (cluster) => {
    const worker = cluster.fork().process;

    logger.log(`Worker ${worker.pid} started.`);
    };

    if (cluster.isMaster) {
    logger.log(`Start cluster with ${workers} workers`);

    for (let i = workers; i--;) {
        forkWorker(cluster)
    }

    cluster.on('exit', (worker) => {
        const timeout = config.app.restartRate;

        logger.log(`Worker ${worker.process.pid} died. Restart after ${timeout}s...`);

        setTimeout(() => forkWorker(cluster), timeout);
    });
} else {
    run();
}
