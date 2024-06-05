import { readFileSync, mkdirSync, existsSync, appendFile, rm, readdir, readFile, writeFile, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { ColorFormatter } from './color.js';
import { exec } from 'child_process';
import readline from 'readline';

class Logger {
    constructor(config = {}) {
        this._configFile = config.config || 'logger.json.config';
        if (existsSync(this._configFile)) {
            this._config = JSON.parse(readFileSync(this._configFile));
        }
        this._logDir = config.logDir || this._config.logDir || 'logs';
        this._loginLogFile = 'auth.csv';
        this._database = config.database || this._config.database || 'DTB';
        this._application = config.application || this._config.application || 'APP';
        this._logger = config.logger || this._config.logger || 'LOG';
        this._colorFormatter = new ColorFormatter();
        this.changeColor(this._config.color);
        this.changeBackground(this._config.background);
        this._currentTimeFile = '.time';
        this._update = config.update || this._config.update || true;
        this._updateTime = config.updateTime || this._config.updateTime || 120000;
        this._intervalId = null;
        this.update = this._update; // to trigger setter
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
        this._createTimeFile();
        this._createLogDir();
    }

    get update() {
        return this._update;
    }

    set update(value) {
        this._update = value;

        if (this._update) {
            if (!this._intervalId) {
                this._intervalId = setInterval(() => this._updateTimeFile(), this._updateTime);
            }
        } 
        else {
            if (this._intervalId) {
                clearInterval(this._intervalId);
                this._intervalId = null;
            }
        }
    }

    get updateTime() {
        return this._updateTime;
    }

    set updateTime(value) {
        this._updateTime = value;
        if (this._update) {
            if (this._intervalId) {
                clearInterval(this._intervalId);
                this._intervalId = setInterval(() => this._updateTimeFile(), this._updateTime);
            }
        }
    }

    get logDir() {
        return this._logDir;
    }

    set logDir(value) {
        this._logDir = value;
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

    get logger() {
        return this._logger;
    }

    set logger(value) {
        this._logger = value;
    }

    async _createLogDir() {
        const contDate = this._getFormattedDate();
        const path = join(this._logDir, contDate);
        mkdirSync(path, { recursive: true }, (err) => {
            console.error(err);
        });
    }

    async _createTimeFile() {
        appendFile(join(this._logDir, this._currentTimeFile), this._getFormattedTime() + '\n', (err) => {})
    }

    async _updateTimeFile() {
        const path = join(this._logDir, this._currentTimeFile);
        const timeFile = readFileSync(path, (err) => {}).toString();
        const lastTime = timeFile.split('\n').pop();
        const time = this._getFormattedTime();
        if (time > lastTime) {
            await appendFile(path, this._getFormattedTime() + '\n', (err) => {});
        }
        else {
            await this._createLogDir();
            await writeFile(path, '', (err) => {});
            await this._createTimeFile();
        }
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

    login(username, userData = { ip: '127.0.0.1' }) {
        const file = (this._getFile(4));
        const func = (this._getFunction(4));
        const concatenatedData = Object.values(userData).join(', ');
        const timeString = this._getFormattedTime();
        const contDate = this._getFormattedDate();
        const log = `${username}, ${timeString}, ${concatenatedData} \n`;
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

    server(...message) {
        this.addToLog('server.csv', message, false);
        this._log(this._application, message.join(' '));
    }

    database(...message) {
        this.addToLog('database.csv', message, false);
        this._log(this._database, message.join(' '));
    }

    _logLogs(file, func, ...message) {
        this._log(this._logger, message.join(' '), file, func);
    }

    async clear(date = this._getFormattedDate()) {
        const file = this._getFile(4);
        const func = this._getFunction(4);
        const pathToContDir = join(this._logDir, date);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`Are you sure you want to clear logs in ${pathToContDir}? (yes/no): `, async (answer) => {
            if (answer.toLowerCase() === 'yes') {
                try {
                    await rm(pathToContDir, { recursive: true }, (err) => err ? this.error(err) : '');
                    this._logLogs(file, func, 'Logs are cleared!');
                } catch (err) {
                    this._logLogs(file, func, `Error clearing logs - ${err}`);
                }
            } else {
                this._logLogs(file, func, 'Operation aborted.');
            }
            rl.close();
        });
    }

    listLogs(date = this._getFormattedDate()) {
        return new Promise((resolve, reject) => {
            const file = (this._getFile(6));
            const func = (this._getFunction(6));
            const pathToContDir = join(this._logDir, date);
            readdir(pathToContDir, (err, files) => {
                if (err) {
                    this._logLogs(file, func,`Error reading file - ${err}`);
                    reject(err);
                }
                this._logLogs(file, func, `Logs/${date}: ${files.join(', ')}`);
                resolve(files);
            });
        })
    }

    tailLog(logFile, countLines = 10, date = this._getFormattedDate()) {
        this._outputLog('tail -n ' + countLines, logFile, date);
    }

    headLog(logFile, countLines = 10, date = this._getFormattedDate()) {
        this._outputLog('head -n ' + countLines, logFile, date);
    }

    outputLog(logFile, date = this._getFormattedDate()) {
        this._outputLog('cat', logFile, date);
    }

    _outputLog(command, logFile, date = this._getFormattedDate()) {
        const fileLogger = (this._getFile(5));
        const func = (this._getFunction(5));
        const pathToContDir = join(this._logDir, date);
        exec(`${command} ${join(pathToContDir, logFile)}`,  (err, stdout, stderr) => {
            if (err) {
                return this._logLogs(fileLogger, func,`Error reading file - ${err}`);
            }
            this._logLogs(fileLogger, func,`Logs/${date}:\n${stdout}`);
        })
    }

    error(error) {
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