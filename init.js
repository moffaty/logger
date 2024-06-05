import Logger from './logger.js';

const logger = new Logger({ loginLogFile: 'custom_authlogs.csv' });

logger.addToLog('auth.log', ['user123']);
logger.loginLog('user123', '127.0.0.1');
logger.serverLogs('Server started');
logger.serverLogs('Module initialized');
logger.dbLogs('Database connection established');
logger.listLogs();

function test() {
    logger.serverLogs('123')
}
test();
try {
    throw new Error('Test error');
} catch (error) {
    logger.errorLog(error);
}

// logger.clearLogs();
