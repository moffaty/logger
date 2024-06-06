import { readFileSync, readFile, mkdirSync, existsSync, appendFile, rm, readdir, writeFile } from 'fs';
import { join, basename } from 'path';
import { ColorFormatter } from './color.js';
import { exec } from 'child_process';

class Logger {
    #logger = '';
    #lastTime;
    #colorFormatter;
    #logDir;
    #database;
    #application;
    #loginLogFile;
    #update;
    #updateTime;
    #intervalId;
    #config;
    #configFile;
    #date;
    constructor(config = {}) {
        this.#configFile = config.config || 'logger.json.config';
        if (existsSync(this.#configFile)) {
            this.#config = JSON.parse(readFileSync(this.#configFile));
        }
        else {
            this.#config = {};
        }
        this.#logDir = config.logDir || this.#config.logDir || 'logs';
        this.#loginLogFile = 'auth.csv';
        this.#database = config.database || this.#config.database || 'DTB';
        this.#application = config.application || this.#config.application || 'APP';
        this.#logger = config.logger || this.#config.logger || 'LOG';
        this.#colorFormatter = new ColorFormatter();
        this.changeColor(this.#config.color);
        this.changeBackground(this.#config.background);
        this.#update = config.update || this.#config.update || true;
        this.#updateTime = config.updateTime || this.#config.updateTime || 120000;
        this.#intervalId = null;
        this.update = this.#update; // to trigger setter
        this.#initialize();
    }

    /**
     * 
     * @param {*} colors 
     */
    changeColor(color = {}) {
        this.#colorFormatter.time = color.time;
        this.#colorFormatter.module = color.module;
        this.#colorFormatter.line = color.line;
        this.#colorFormatter.func = color.func;
        this.#colorFormatter.log = color.log;
    }

        /**
     * 
     * @param {*} colors 
     */
    changeBackground(color = {}) {
        this.#colorFormatter.timeBackground = color.time;
        this.#colorFormatter.moduleBackground = color.module;
        this.#colorFormatter.lineBackground = color.line;
        this.#colorFormatter.funcBackground = color.func;
        this.#colorFormatter.logBackground = color.log;
    }

    async #initialize() {
        this.#createLogDir();
    }

    get update() {
        return this.#update;
    }

    set update(value) {
        this.#update = value;

        if (this.#update) {
            if (!this.#intervalId) {
                this.#intervalId = setInterval(() => this.#updateTimeFile(), this.#updateTime);
            }
        } 
        else {
            if (this.#intervalId) {
                clearInterval(this.#intervalId);
                this.#intervalId = null;
            }
        }
    }

    get updateTime() {
        return this.#updateTime;
    }

    set updateTime(value) {
        this.#updateTime = value;
        if (this.#update) {
            if (this.#intervalId) {
                clearInterval(this.#intervalId);
                this.#intervalId = setInterval(() => this.#updateTimeFile(), this.#updateTime);
            }
        }
    }

    get logDir() {
        return this.#logDir;
    }

    set logDir(value) {
        this.#logDir = value;
    }

    get database() {
        return this.#database;
    }

    set database(value) {
        this.#database = value;
    }

    get application() {
        return this.#application;
    }

    set application(value) {
        this.#application = value;
    }

    get logger() {
        return this.#logger;
    }

    set logger(value) {
        this.#logger = value;
    }
    
    get date() {
        return this.#date;
    }

    set date(value) {
        this.#date = value;
    }

    get textColor() {
        return this.#colorFormatter.log;
    }

    set textColor(value) {
        this.#colorFormatter.log = value;
    }

    get funcColor() {
        return this.#colorFormatter.func;
    }

    set funcColor(value) {
        this.#colorFormatter.func = value;
    }

    get lineColor() {
        return this.#colorFormatter.line;
    }

    set lineColor(value) {
        this.#colorFormatter.line = value;
    }

    get timeColor() {
        return this.#colorFormatter.time;
    }

    set timeColor(value) {
        this.#colorFormatter.time = value;
    }

    get moduleColor() {
        return this.#colorFormatter.module;
    }

    set moduleColor(value) {
        this.#colorFormatter.module = value;
    }

    async #createLogDir() {
        const contDate = this.#getFormattedDate();
        const path = join(this.#logDir, contDate);
        mkdirSync(path, { recursive: true }, (err) => {
            console.error(err);
        });
    }

    async #updateTimeFile() {
        const time = this.#getFormattedTime();
        if (time > this.#lastTime) {
            time = this.#lastTime;
        }
        else {
            await this.#createLogDir();
        }
    }

    #getFormattedDate() {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = String(today.getFullYear()).slice(-2);
        this.#date = month + day + year;
        return this.#date;
    }

    #getFormattedTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;
        return timeString;
    }

    addToLog(filename, data, output = true) {
        const file = (this.#getFile(4));
        const func = (this.#getFunction(4));
        const timeString = this.#getFormattedTime();
        const contDate = this.#getFormattedDate();
        const log = `${timeString}, ${data.join(',')} \n`;
        appendFile(join(this.#logDir, contDate, filename), log, (err) => {
            if (output) {
                if (err) {
                    return this.#logLogs(file, func, `Error writing to file - ${err}`);
                }
                this.#logLogs(file, func, 'Data was successfully wrote in file');
            }
        });
    }

    login(username, userData = { ip: '127.0.0.1' }) {
        const file = (this.#getFile(4));
        const func = (this.#getFunction(4));
        const concatenatedData = Object.values(userData).join(', ');
        const timeString = this.#getFormattedTime();
        const contDate = this.#getFormattedDate();
        const log = `${username}, ${timeString}, ${concatenatedData} \n`;
        appendFile(join(this.#logDir, contDate, this.#loginLogFile), log, (err) => {
            if (err) {
                return this.#logLogs(file, func, `Error writing to file - ${err}`);
            }
            this.#logLogs(file, func, 'data of auth logged');
        });
    }

    #output(log) {
        const cF = this.#colorFormatter;
        const colorfulLog = `${cF.colorTime(`[${log.time.toLocaleDateString()}T${log.time.toLocaleTimeString()}]`)} ${cF.colorModule(log.where)} ${cF.colorLine(log.line)}${cF.colorFunction(log.function)}: ${cF.colorLog(log.message)}`;
        console.log(colorfulLog);
    }

    #log(where, message, customFile = '', customFunc = '') {
        const func = customFunc || this.#getFunction();
        const line = customFile || this.#getFile();
        const time = new Date();
        const log = { time, where, function: func.trim() === 'at' ? '' : ` function:${func.trim()}`, line: line, message };
        this.#output(log);
    }

    #getTrace(traceStr = 5) {
        const trace = new Error().stack.split('\n')[traceStr];
        return trace;
    }

    #getFile(traceStr = 5) {
        const trace = this.#getTrace(traceStr);
        const line = basename(trace.substring(trace.indexOf('(')).replace(')', ''));
        return line;
    }

    #getFunction(traceStr = 5) {
        const trace = this.#getTrace(traceStr);
        const func = trace.substring(trace.indexOf('at') + 2, trace.indexOf('('));
        return func;
    }

    server(...message) {
        this.addToLog('server.csv', message, false);
        this.#log(this.#application, message.join(' '));
    }

    database(...message) {
        this.addToLog('database.csv', message, false);
        this.#log(this.#database, message.join(' '));
    }

    #logLogs(file, func, ...message) {
        this.#log(this.#logger, message.join(' '), file, func);
    }

    async clear(date = this.#getFormattedDate(), log = '') {
        return new Promise(async (resolve, reject) => {
            const file = this.#getFile(4);
            const func = this.#getFunction(4);
            const pathToContDir = join(this.#logDir, date);
    
            try {
                if (log) {
                    await rm(join(pathToContDir, log), (err) => err ? this.error(err) : '');
                    this.#logLogs(file, func, `${log} is cleared!`);
                }
                else {
                    await rm(pathToContDir, { recursive: true }, (err) => err ? this.error(err) : '');
                    this.#logLogs(file, func, 'Logs are cleared!');
                }
                resolve (true);
            } catch (err) {
                this.#logLogs(file, func, `Error clearing logs - ${err}`);
                reject(false);
            }
        })
    }

    listLogs(date = this.#getFormattedDate()) {
        return new Promise((resolve, reject) => {
            const file = (this.#getFile(6));
            const func = (this.#getFunction(6));
            const pathToContDir = join(this.#logDir, date);
            readdir(pathToContDir, (err, files) => {
                if (err) {
                    this.#logLogs(file, func,`Error reading file - ${err}`);
                    reject(err);
                }
                this.#logLogs(file, func, `Logs/${date}: ${files.join(', ')}`);
                resolve(files);
            });
        })
    }

    tailLog(logFile, countLines = 10, date = this.#getFormattedDate()) {
        this.#outputLog('tail -n ' + countLines, logFile, date);
    }

    headLog(logFile, countLines = 10, date = this.#getFormattedDate()) {
        this.#outputLog('head -n ' + countLines, logFile, date);
    }

    outputLog(logFile, date = this.#getFormattedDate()) {
        this.#outputLog('cat', logFile, date);
    }

    #outputLog(command, logFile, date = this.#getFormattedDate()) {
        const fileLogger = (this.#getFile(5));
        const func = (this.#getFunction(5));
        const pathToContDir = join(this.#logDir, date);
        exec(`${command} ${join(pathToContDir, logFile)}`,  (err, stdout, stderr) => {
            if (err) {
                return this.#logLogs(fileLogger, func,`Error reading file - ${err}`);
            }
            this.#logLogs(fileLogger, func,`Logs/${date}:\n${stdout}`);
        })
    }

    error(error) {
        const file = (this.#getFile(4));
        const func = (this.#getFunction(4));
        const timeString = this.#getFormattedTime();
        const contDate = this.#getFormattedDate();
        const log = `ERROR, ${timeString}, ${error.message}, ${error.stack} \n`;
        appendFile(join(this.#logDir, contDate, 'error.csv'), log, (err) => {
            if (err) {
                return this.#logLogs(file, func, `Error writing to file - ${err}`);
            }
            this.#logLogs(file, func, 'Error was written in file');
        });
    }
}

export default Logger;