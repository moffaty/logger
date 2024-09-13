class ColorFormatter {
    constructor() {
        this.colors = {
            reset: '\x1b[0m',
            red: '\x1b[31m',
            purple: '\x1b[35m',
            cyan: '\x1b[36m',
            gray: '\x1b[90m',
            blue: '\x1b[34m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            white: '\x1b[37m',
            black: '\x1b[30m',
        };

        this.colorsBackground = {
            black: '\x1b[40m',
            red: '\x1b[41m',
            green: '\x1b[42m',
            yellow: '\x1b[43m',
            blue: '\x1b[44m',
            purple: '\x1b[45m',
            cyan: '\x1b[46m',
            white: '\x1b[47m'
        };

        this.reset = this.colors.reset;

        this._time = this.colors.gray;
        this._module = this.colors.blue;
        this._line = this.colors.yellow;
        this._func = this.colors.green;
        this._log = this.colors.white;
        this._error = this.colors.red;

        this._timeBackground = '';
        this._moduleBackground = '';
        this._lineBackground = '';
        this._funcBackground = '';
        this._logBackground = '';
    }

    get time() {
        return this._time;
    }

    set time(value) {
        if (this.colors[value]) {
            this._time = this.colors[value];
        }
    }

    get module() {
        return this._module;
    }

    set module(value) {
        if (this.colors[value]) {
            this._module = this.colors[value];
        }
    }

    get line() {
        return this._line;
    }

    set line(value) {
        if (this.colors[value]) {
            this._line = this.colors[value];
        }
    }

    get func() {
        return this._func;
    }

    set func(value) {
        if (this.colors[value]) {
            this._func = this.colors[value];
        }
    }

    get log() {
        return this._log;
    }

    set log(value) {
        if (this.colors[value]) {
            this._log = this.colors[value];
        } 
    }

    get timeBackground() {
        return this._timeBackground;
    }

    set timeBackground(value) {
        if (this.colorsBackground[value]) {
            this._timeBackground = this.colorsBackground[value];
        }
    }

    get moduleBackground() {
        return this._moduleBackground;
    }

    set moduleBackground(value) {
        if (this.colorsBackground[value]) {
            this._moduleBackground = this.colorsBackground[value];
        }
    }

    get lineBackground() {
        return this._lineBackground;
    }

    set lineBackground(value) {
        if (this.colorsBackground[value]) {
            this._lineBackground = this.colorsBackground[value];
        }
    }

    get funcBackground() {
        return this._funcBackground;
    }

    set funcBackground(value) {
        if (this.colorsBackground[value]) {
            this._funcBackground = this.colorsBackground[value];
        }
    }

    get logBackground() {
        return this._logBackground;
    }

    set logBackground(value) {
        if (this.colorsBackground[value]) {
            this._logBackground = this.colorsBackground[value];
        } 
    }

    colorTime(time) {
        return `${this._timeBackground}${this._time}${time}${this.reset}`;
    }

    colorModule(module) {
        return `${this._moduleBackground}${this._module}${module}${this.reset}`;
    }

    colorLine(line) {
        return `${this._lineBackground}${this._line}${line}${this.reset}`;
    }

    colorFunction(func) {
        return `${this._funcBackground}${this._func}${func}${this.reset}`;
    }

    colorLog(message) {
        return `${this._logBackground}${this._log}${message}${this.reset}`;
    }
}

export { ColorFormatter };
