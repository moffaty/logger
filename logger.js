import { readFileSync, mkdirSync, existsSync, appendFile, rm, readdir } from 'fs';
import { join, basename } from 'path';
import { ColorFormatter } from './color.js';

class Logger {
    constructor(config = {}) {
        this._configFile = config.config || 'logger.json.config';
        if (existsSync(this._configFile)) {
            this._config = JSON.parse(readFileSync(this._configFile));
        }
        this._logDir = config.logDir || this._config.logDir || 'logs';
        this._loginLogFile = config.loginLogFile || this._config.loginLogFile || 'authlogs.csv';
        this._database = config.database || this._config.database || 'DTB';
        this._application = config.application || this._config.application || 'APP';
        this._colorFormatter = new ColorFormatter();
        this.changeColor(this._config.color);
        this.changeBackground(this._config.background);
        this._initialize();
    }

    /**
     * 
     * @param {*} colors 
     */
    changeColor(color = {}) {
        this._colorFormatter.time = color.time;
        this._colorFormatter.module = color.module;
        this._colorFormatter.line = color.line;
        this._colorFormatter.func = color.func;
        this._colorFormatter.log = color.log;
    }

        /**
     * 
     * @param {*} colors 
     */
    changeBackground(color = {}) {
        this._colorFormatter.timeBackground = color.time;
        this._colorFormatter.moduleBackground = color.module;
        this._colorFormatter.lineBackground = color.line;
        this._colorFormatter.funcBackground = color.func;
        this._colorFormatter.logBackground = color.log;
    }

    async _initialize() {
        this.createLogDir();
    }

    get logDir() {
        return this._logDir;
    }

    set logDir(value) {
        this._logDir = value;
    }

    get loginLogFile() {
        return this._loginLogFile;
    }

    set loginLogFile(value) {
        this._loginLogFile = value;
    }

    get database() {
        return this._database;
    }

    set database(value) {
        this._database = value;
    }

    get application() {
        return this._application;
    }

    set application(value) {
        this._application = value;
    }

    async createLogDir() {
        const contDate = this._getFormattedDate();
        const path = join(this._logDir, contDate);
        const logPath = join(path, this._loginLogFile);
        mkdirSync(path, { recursive: true }, (err) => {
            if (!err || err.code === 'EEXIST') {
                if (!existsSync(logPath)) {
                    appendFile(logPath, "NAME,DATE,TIME,IP\n", (err) => {});
                }
            }
        });
    }

    _getFormattedDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = String(today.getFullYear()).slice(-2);
        return month + day + year;
    }

    _getFormattedTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;
        return timeString;
    }

    addToLog(filename, data, output = true) {
        const file = (this._getFile(4));
        const func = (this._getFunction(4));
        const timeString = this._getFormattedTime();
        const contDate = this._getFormattedDate();
        const log = `${timeString}, ${data.join(',')} \n`;
        appendFile(join(this._logDir, contDate, filename), log, (err) => {
            if (output) {
                if (err) {
                    return this._logLogs(file, func, `Error writing to file - ${err}`);
                }
                this._logLogs(file, func, 'Data was successfully wrote in file');
            }
        });
    }

    loginLog(username, ip) {
        const file = (this._getFile(4));
        const func = (this._getFunction(4));
        const timeString = this._getFormattedTime();
        const contDate = this._getFormattedDate();
        const log = `${username}, ${contDate}, ${timeString}, ${ip} \n`;
        appendFile(join(this._logDir, contDate, this._loginLogFile), log, (err) => {
            if (err) {
                return this._logLogs(file, func, `Error writing to file - ${err}`);
            }
            this._logLogs(file, func, 'data of auth logged');
        });
    }

    _output(log) {
        const cF = this._colorFormatter;
        const colorfulLog = `${cF.colorTime(`[${log.time.toLocaleDateString()}T${log.time.toLocaleTimeString()}]`)} ${cF.colorModule(log.where)} ${cF.colorLine(log.line)}${cF.colorFunction(log.function)}: ${cF.colorLog(log.message)}`;
        console.log(colorfulLog);
    }

    _log(where, message, customFile = '', customFunc = '') {
        const func = customFunc || this._getFunction();
        const line = customFile || this._getFile();
        const time = new Date();
        const log = { time, where, function: func.trim() === 'at' ? '' : ` function:${func.trim()}`, line: line, message };
        this._output(log);
    }

    _getTrace(traceStr = 5) {
        const trace = new Error().stack.split('\n')[traceStr];
        return trace;
    }

    _getFile(traceStr = 5) {
        const trace = this._getTrace(traceStr);
        const line = basename(trace.substring(trace.indexOf('(')).replace(')', ''));
        return line;
    }

    _getFunction(traceStr = 5) {
        const trace = this._getTrace(traceStr);
        const func = trace.substring(trace.indexOf('at') + 2, trace.indexOf('('));
        return func;
    }

    serverLogs(...message) {
        this.addToLog('server.csv', message, false);
        this._log('APP', message.join(' '));
    }

    dbLogs(...message) {
        this.addToLog('database.csv', message, false);
        this._log('DTB', message.join(' '));
    }

    _logLogs(file, func, ...message) {
        this._log('LOG', message.join(' '), file, func);
    }

    clearLogs() {
        const file = (this._getFile(4));
        const func = (this._getFunction(4));
        rm(this._logDir, { recursive: true }, (err) => {
            if (err) {
                return this._logLogs(file, func, `Error clearing to file - ${err}`);
            }
            this._logLogs(file, func, 'Logs are cleared!');
        });
    }

    listLogs(date = this._getFormattedDate()) {
        const file = (this._getFile(4));
        const func = (this._getFunction(4));
        const pathToContDir = join(this._logDir, date);
        readdir(pathToContDir, (err, files) => {
            if (err) {
                return this._logLogs(file, func,`Error reading file - ${err}`);
            }
            this._logLogs(file, func, `Logs ${date}: ${files.join(', ')}`);
        });
    }

    listLog(date = this._getFormattedDate(), file) {
        const fileLogger = (this._getFile(4));
        const func = (this._getFunction(4));
        const pathToContDir = join(this._logDir, date);
        readdir(pathToContDir, (err, files) => {
            if (err) {
                return this._logLogs(fileLogger, func,`Error reading file - ${err}`);
            }
            this._logLogs(fileLogger, func,`Logs ${date}: ${files.join(', ')}`);
        });
    }

    errorLog(error) {
        const file = (this._getFile(4));
        const func = (this._getFunction(4));
        const timeString = this._getFormattedTime();
        const contDate = this._getFormattedDate();
        const log = `ERROR, ${timeString}, ${error.message}, ${error.stack} \n`;
        appendFile(join(this._logDir, contDate, 'error.csv'), log, (err) => {
            if (err) {
                return this._logLogs(file, func, `Error writing to file - ${err}`);
            }
            this._logLogs(file, func, 'Error was written in file');
        });
    }
}

export default Logger;