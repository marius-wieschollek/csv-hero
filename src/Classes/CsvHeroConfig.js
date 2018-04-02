export default class CsvHeroConfig {

    get config() {
        return this._config;
    }

    /**
     *
     * @returns {string}
     */
    get delimiter() {
        return this._config.delimiter;
    }

    /**
     *
     * @param {string} delimiter
     */
    set delimiter(delimiter) {
        this._config.delimiter = delimiter;
    }

    /**
     *
     * @returns {string}
     */
    get newLine() {
        return this._config.newLine;
    }

    /**
     *
     * @param {string} newLine
     */
    set newLine(newLine) {
        this._config.newLine = newLine;
    }

    /**
     *
     * @returns {string}
     */
    get quotes() {
        return this._config.quotes;
    }

    /**
     *
     * @param {string} quotes
     */
    set quotes(quotes) {
        this._config.quotes = quotes;
    }

    /**
     *
     * @returns {string}
     */
    get escape() {
        return this._config.escape;
    }

    /**
     *
     * @returns {string}
     */
    get encoding() {
        return this._config.encoding;
    }

    /**
     *
     * @returns {bool}
     */
    get strictSpaces() {
        return this._config.strictSpaces;
    }

    /**
     *
     * @returns {bool}
     */
    get strictQuotes() {
        return this._config.strictQuotes;
    }

    /**
     *
     * @returns {bool}
     */
    get skipEmptyRows() {
        return this._config.skipEmptyRows;
    }

    /**
     *
     * @returns {bool}
     */
    get skipRowsOfEmptyFields() {
        return this._config.skipRowsOfEmptyFields;
    }

    /**
     *
     * @returns {bool}
     */
    get trimFields() {
        return this._config.trimFields;
    }

    /**
     *
     * @returns {bool}
     */
    get ignoreErrors() {
        return this._config.ignoreErrors;
    }

    /**
     *
     * @param {Object} userConfig
     */
    constructor(userConfig) {
        this._config = {
            delimiter            : 'auto',
            newLine              : 'auto',
            quotes               : '"',
            escape               : '"',
            encoding             : 'UTF-8',
            strictSpaces         : true,
            strictQuotes         : true,
            skipEmptyRows        : true,
            skipRowsOfEmptyFields: false,
            trimFields                 : false,
            ignoreErrors         : false
        };
        this.parseConfig(userConfig);
    }

    /**
     *
     * @param {Object} config
     */
    parseConfig(config) {
        for(let key in config) {
            if(!config.hasOwnProperty(key) || !this._config.hasOwnProperty(key)) continue;

            this._config[key] = config[key];
        }
    }
}