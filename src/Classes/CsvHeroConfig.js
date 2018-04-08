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
     * @param {string} escape
     */
    set escape(escape) {
        this._config.escape = escape;
    }

    /**
     *
     * @returns {string}
     */
    get comment() {
        return this._config.comment;
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
     * @returns {boolean}
     */
    get strictSpaces() {
        return this._config.strictSpaces;
    }

    /**
     *
     * @returns {boolean}
     */
    get strictQuotes() {
        return this._config.strictQuotes;
    }

    /**
     *
     * @returns {boolean}
     */
    get strictEndingQuotes() {
        return this._config.strictEndingQuotes;
    }

    /**
     *
     * @returns {boolean}
     */
    get strictRows() {
        return this._config.strictRows;
    }

    /**
     *
     * @returns {number}
     */
    get rowSize() {
        return this._config.rowSize;
    }

    /**
     *
     * @param {number} rowSize
     */
    set rowSize(rowSize) {
        this._config.rowSize = rowSize;
    }

    /**
     *
     * @returns {boolean}
     */
    get skipEmptyRows() {
        return this._config.skipEmptyRows;
    }

    /**
     *
     * @returns {boolean}
     */
    get skipEmptyFieldRows() {
        return this._config.skipEmptyFieldRows;
    }

    /**
     *
     * @returns {boolean}
     */
    get trimFields() {
        return this._config.trimFields;
    }

    /**
     *
     * @returns {boolean}
     */
    get castTypes() {
        return this._config.castTypes;
    }

    /**
     *
     * @returns {boolean}
     */
    get mapFields() {
        return this._config.mapFields;
    }

    /**
     *
     * @returns {Array}
     */
    get fieldMapping() {
        return this._config.fieldMapping;
    }

    /**
     *
     * @param {Array} fieldMapping
     */
    set fieldMapping(fieldMapping) {
        this._config.fieldMapping = fieldMapping;
    }

    /**
     *
     * @returns {boolean}
     */
    get skipHeader() {
        return this._config.skipHeader;
    }

    /**
     *
     * @returns {number}
     */
    get maxRows() {
        return this._config.maxRows;
    }

    /**
     *
     * @returns {boolean}
     */
    get worker() {
        return this._config.worker;
    }

    /**
     *
     * @returns {string|null}
     */
    get workerUrl() {
        return this._config.workerUrl;
    }

    /**
     *
     * @returns {boolean}
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
            delimiter         : 'auto',
            newLine           : 'auto',
            quotes            : 'auto',
            escape            : 'auto',
            comment           : '',
            encoding          : 'UTF-8',
            strictSpaces      : true,
            strictQuotes      : true,
            strictEndingQuotes: false,
            strictRows        : false,
            trimFields        : false,
            castTypes         : false,
            mapFields         : false,
            fieldMapping      : [],
            rowSize           : -1,
            maxRows           : -1,
            skipHeader        : false,
            skipEmptyRows     : true,
            skipEmptyFieldRows: false,
            worker            : false,
            workerUrl         : null,
            ignoreErrors      : false
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