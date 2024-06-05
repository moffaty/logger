# LOGGER
Simple crossplatform logger with output in file system to node.js projects
- Output in console with color message
- Simplify config


# EXAMPLES
### CONFIG
Logs in console differ in types: database, application, logs.
To change name for each use next syntax:
```javascript
import Logger from './logger.js';
const logger = new Logger({ application: 'SERVER' }); // you can change this from define
logger.database = 'database'; // or from property of entity
```
You can also use config file like this:
```javascript
const logger = new Logger();
```
```json
// logger.json.config
{
    "application": "SERVER",
    "database": "DATABASE",
    "logger": "LOGGER",
}
```
To change default config file (file need to be in json format):
```javascript
const logger = new Logger({ config: 'your_config_file' });
```
### FILES
In default logger output in files in 'logs' directory in root directory of project. To change this option:
```javascript
const logger = new Logger({ logDir: 'loggerDEF' });
logger.logDir = 'loggerSTR'
``` 
```JSON
{
    "logDir": "loggerJSON"
}
```
After create entity of logger logDir will create automatically. 
Logger write in every day in format DD-MM-YY.
How to log:
- For log from your application-server use `server(...message)`
- For log from your database-wrapper use `database(...message)`
- For log from your auth-service use `login(username, userData = { ip: '127.0.0.1'})`
This methods create separated files with TIME, MESSAGE format
- database create and using `database.csv`
- server create and using `server.csv`
- login create and using `auth.csv`
```javascript
// example
logger.serverLogs('Server started');
logger.databaseLogs('Database connection established');
logger.login('user123', { ip: '127.0.0.1', role: 'user' }); // for example u can add personal field in log
logger.login('user123', { password: '123' }); // why u doing this?
```

### UPDATE
By default config logger create dir everyday and logger can do it without rebooting system:
- Logger check system time for installed interval
- Logger if system time is less than set time interval ago (it means tomorrow has come) create new directory and start working on it

Logger by default have interval for this action - 2 minutes. 
It can be changed:
```javascript
// firstly need to set for need update
// warning 1: this means that application will be infinity interval loop
// warning 2: without set update 
// first way:
// setter of 'update' supports dynamic attribute change, this allows you to turn the interval on and off at any time
logger.update = true;
// second way:
new Logger({ update: true });
// third way:
{
    "update": true
}
// after that you can change interval time (in ms)
// it is not recommended to use a small amount of time, it can cause a lot of stress of PC
// first way:
new Logger({ updateTime: 120000 });
// second way:
{
    "updateTime": 123456789
}
// third way (unrecommended for development): 
// that canceling current interval and start new
logger.updateTime = 22222;
```

### WATCHING LOGS
For get all files in last
```javascript
const files = await logger.listLogs(); // output array of files from THIS day
const files = await logger.listLogs('060524'); // output array of files from 0605024 
/*
example output in console: Logs/060524: auth.log, authlogs.csv, custom_authlogs.csv, database.csv, error.csv, server.csv
files = 
[
  'auth.log',
  'authlogs.csv',
  'custom_authlogs.csv',
  'database.csv',
  'error.csv',
  'server.csv'
]
*/
``` 
Also logger have method to read logs it's implemented from async methods using `head -n` and `tail -n` with `exec` for files
```javascript
logger.headLog('auth.log'); // output 10 from top of file
logger.tailLog('auth.log'); // output 10 from end of file 
logger.outputLog('auth.log'); // output all file
// output from given date
logger.headLog('auth.log', '060524');
logger.tailLog('auth.log', '060524');
logger.outputLog('auth.log', '060524');
```