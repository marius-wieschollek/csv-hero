import CsvHeroDataAnalyzer from '@js/CsvHeroDataAnalyzer';

export default class CsvHeroParser {

    get data() {
        return this._data;
    }

    get errors() {
        return this._errors;
    }

    /**
     *
     * @param {CsvHeroFileStreamer} reader
     * @param {CsvHeroConfig} config
     */
    constructor(reader, config) {
        this._spaces = [' ', '\t'];
        this._errors = [];
        this._data = [];
        this._reader = reader;
        this._config = config;
        this._status = {
            fieldStarted    : false,
            isQuotedField   : false,
            waitForDelimiter: false,
            hasQuotesPending: false,
            padding         : '',
            currentRow      : [],
            currentField    : [],
            currentCharacter: 0,
            lineStart       : 0,
            lineCount       : 0
        };
    }

    async parse() {
        let data     = await this.readChunk(),
            analyzer = new CsvHeroDataAnalyzer(this._config);

        if(!data.trim().length) {
            return;
        }

        if(this._config.newLine === 'auto') {
            this._config.newLine = analyzer.detectLineEnding(data);
        }
        if(this._config.delimiter === 'auto') {
            this._config.delimiter = analyzer.detectDelimiter(data);
        }
        if(this._config.quotes === 'auto') {
            this._config.quotes = analyzer.detectQuotes(data);
        }

        this._parseText(data);
    }

    async readChunk() {
        try {
            return await this._reader.readChunk();
        } catch(e) {
            this._logError(e);
        }
        return '';
    }

    /**
     *
     * @param {Error|Object} error
     * @private
     */
    _logError(error) {
        if(error instanceof ProgressEvent) {
            error = error.target.error;
        }
        if(error instanceof Error || error instanceof DOMError) {
            error = {
                name   : error.name,
                message: error.message
            };
        }
        if(!error.name) error.name = 'ParserError';
        if(!error.character) error.character = this._status.currentCharacter - this._status.lineStart;
        error.line = this._status.lineCount;

        this._errors.push(error);
    }

    /**
     *
     * @param {string} data
     * @private
     */
    _parseText(data) {
        this._status.lineCount++;
        for(let i = 0; i < data.length; i++) {
            let character = data[i],
                result    = false;

            this._status.currentCharacter = i;

            [result, i] = this._checkEscapedQuotes(data, i);
            if(result) continue;
            [result, i] = this._checkQuotes(data, i);
            if(result) continue;
            [result, i] = this._checkDelimiter(data, i);
            if(result) continue;
            [result, i] = this._checkNewLine(data, i);
            if(result) continue;

            if(this._checkSpaces(character)) continue;

            this._handlePadding(i);
            this._status.fieldStarted = true;
            this._status.currentField += character;
        }
        this._saveField();
        this._saveRow(this._status.currentCharacter);
    }

    /**
     *
     * @param {number} i
     * @private
     */
    _handlePadding(i) {
        if(this._status.padding) {
            if(this._status.waitForDelimiter) {
                this._status.waitForDelimiter = false;
                this._logError({name: 'InvalidQuotes', message: 'Invalid trailing quotes', character: i - this._config.quotes.length});
            }
            this._status.currentField += this._status.padding;
            this._status.hasQuotesPending = false;
            this._status.padding = '';
        }
    }

    /**
     *
     * @param {string} character
     * @returns {boolean}
     * @private
     */
    _checkSpaces(character) {
        if(!this._config.strictSpaces && this._spaces.indexOf(character) !== -1 && (!this._status.fieldStarted || this._status.waitForDelimiter)) {
            this._status.padding += character;
            return true;
        }
        return false;
    }

    /**
     *
     * @param {string} data
     * @param {number} i
     * @returns {Array}
     * @private
     */
    _checkEscapedQuotes(data, i) {
        if(!this._status.fieldStarted) return [false, i];
        let [isEscaped, offset] = CsvHeroParser._matchesSequence(data, i, this._config.escape + this._config.quotes);
        if(isEscaped) {
            if(this._status.isQuotedField) {
                if(this._config.strictQuotes) {
                    this._status.currentField += this._config.quotes;
                } else {
                    this._status.padding += this._config.quotes;
                    this._status.hasQuotesPending = true;
                    this._status.waitForDelimiter = true;
                }
            } else {
                this._status.currentField += this._config.escape + this._config.quotes;
            }
            this._status.fieldStarted = true;
            i += offset;
            return [true, i];
        }
        return [false, i];
    }

    /**
     *
     * @param {string} data
     * @param {number} i
     * @returns {Array}
     * @private
     */
    _checkQuotes(data, i) {
        let [isQuote, offset] = CsvHeroParser._matchesSequence(data, i, this._config.quotes);
        if(isQuote) {
            if(this._status.fieldStarted && !this._status.isQuotedField) {
                this._status.currentField += this._config.quotes;
            } else if(this._status.fieldStarted) {
                if(this._status.hasQuotesPending) {
                    this._status.currentField += this._config.quotes;
                    this._status.hasQuotesPending = false;
                    this._status.waitForDelimiter = false;
                }
                if(this._status.waitForDelimiter) {
                    this._status.currentField += this._status.padding;
                    this._status.waitForDelimiter = false;
                    this._status.padding = '';
                } else {
                    this._status.padding += this._config.quotes;
                    this._status.waitForDelimiter = true;
                }
            } else {
                this._status.fieldStarted = true;
                this._status.isQuotedField = true;
            }
            i += offset;
            return [true, i];
        }
        return [false, i];
    }

    /**
     *
     * @param {string} data
     * @param {number} i
     * @returns {Array}
     * @private
     */
    _checkDelimiter(data, i) {
        let [isDelimiter, offset] = CsvHeroParser._matchesSequence(data, i, this._config.delimiter);
        if(isDelimiter && (!this._status.isQuotedField || this._status.waitForDelimiter)) {
            this._saveField();
            i += offset;
            return [true, i];
        }
        return [false, i];
    }

    /**
     *
     * @param {string} data
     * @param {number} i
     * @returns {Array}
     * @private
     */
    _checkNewLine(data, i) {
        let [isNewLine, offset] = CsvHeroParser._matchesSequence(data, i, this._config.newLine);
        if(isNewLine && (!this._status.isQuotedField || this._status.waitForDelimiter)) {
            this._saveField();
            this._saveRow(i);
            i += offset;
            return [true, i];
        }
        return [false, i];
    }

    /**
     *
     * @private
     */
    _saveField() {
        this._status.currentRow.push(this._processFieldValue());
        this._status.currentField = '';
        this._status.padding = '';
        this._status.fieldStarted = false;
        this._status.isQuotedField = false;
        this._status.hasQuotesPending = false;
        this._status.waitForDelimiter = false;
    }

    /**
     *
     * @param value
     * @private
     */
    _processFieldValue(value) {
        let field = this._status.currentField;
        if(this._status.hasQuotesPending) field += this._config.quotes;

        if(this._config.trimFields) {
            field = field.trim();
        }

        return field;
    }

    /**
     *
     * @param {number} pointer
     * @private
     */
    _saveRow(pointer) {
        let row = this._status.currentRow;
        this._status.currentRow = [];
        this._status.lineStart = pointer;
        this._status.lineCount++;

        if(this._config.skipEmptyRows && (row.length === 0 || row.length === 1 && row[0].length === 0)) {
            return;
        }

        if(this._isEmptyFieldRow(row)) return;
        this._data.push(row);
    }

    /**
     *
     * @param {Array} row
     * @returns {boolean}
     * @private
     */
    _isEmptyFieldRow(row) {
        if(this._config.skipRowsOfEmptyFields) {
            let isEmpty = true;
            for(let i = 0; i < row.length; i++) {
                if(row[i].length !== 0) {
                    isEmpty = false;
                    break;
                }
            }
            return isEmpty;
        }
        return false;
    }

    /**
     *
     * @param {string} data
     * @param {number} pointer
     * @param {string} sequence
     * @returns {Array}
     * @private
     */
    static _matchesSequence(data, pointer, sequence) {
        let length = sequence.length;

        return [data.substr(pointer, length) === sequence, length - 1];
    }
}