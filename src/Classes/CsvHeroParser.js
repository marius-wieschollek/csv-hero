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
            isFirstLine     : true,
            fieldStarted    : false,
            isQuotedField   : false,
            waitForDelimiter: false,
            hasQuotesPending: false,
            stash           : '',
            currentRow      : [],
            currentField    : '',
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
            this._config.newLine = '\n';
            let newLine = analyzer.detectLineEnding(data);
            if(newLine === false) {
                this._logError({name: 'DetectionError', message: 'Unable to detect line ending'});
            } else {
                this._config.newLine = newLine;
            }
        }
        if(this._config.delimiter === 'auto') this._config.delimiter = analyzer.detectDelimiter(data);
        if(this._config.quotes === 'auto') this._config.quotes = analyzer.detectQuotes(data);
        if(this._config.escape === 'auto') this._config.escape = this._config.quotes;

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
        if(!error.message || !error.message.length) error.message = error.name;
        if(!error.character) error.character = this._status.currentCharacter - this._status.lineStart - 1;
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

            [result, i] = this._checkComment(data, i, character);
            if(result) continue;
            [result, i] = this._checkEscapedQuotes(data, i);
            if(result) continue;
            [result, i] = this._checkQuotes(data, i);
            if(result) continue;
            [result, i] = this._checkDelimiter(data, i);
            if(result) continue;
            [result, i] = this._checkNewLine(data, i);
            if(result) {
                if(this._config.maxRows !== -1 && this._data.length === this._config.maxRows) return;
                continue;
            }

            if(this._checkSpaces(character)) continue;

            this._handleStash();
            this._status.fieldStarted = true;
            this._status.currentField += character;
        }
        if(this._status.currentField) this._saveField();
        if(this._status.currentRow.length) this._saveRow(this._status.currentCharacter);
    }

    /**
     *
     * @param {string} data
     * @param {number} i
     * @param {string} character
     * @returns {Array}
     * @private
     */
    _checkComment(data, i, character) {
        if(this._config.comment === character && i === this._status.lineStart + 1) {
            let nextIndex = data.indexOf(this._config.newLine, i);
            if(nextIndex !== -1) {
                i += nextIndex - i - 1 + this._config.newLine.length;
            } else {
                i = data.length;
            }
            this._status.currentRow = [];
            this._status.currentField = '';
            this._status.lineStart = i;
            this._status.lineCount++;
            return [true, i];
        }
        return [false, i];
    }

    /**
     *
     * @private
     */
    _handleStash() {
        if(this._status.stash) {
            if(this._status.waitForDelimiter && this._config.strictQuotes) {
                this._logError({name: 'InvalidQuotes', message: 'Invalid trailing quote in quoted field'});
            }
            this._flushStash();
        }
    }

    /**
     *
     * @private
     */
    _flushStash() {
        this._status.currentField += this._status.stash;
        this._status.hasQuotesPending = false;
        this._status.waitForDelimiter = false;
        this._status.stash = '';
    }

    /**
     *
     * @param {string} character
     * @returns {boolean}
     * @private
     */
    _checkSpaces(character) {
        if(!this._config.strictSpaces && this._spaces.indexOf(character) !== -1 && (!this._status.fieldStarted || this._status.waitForDelimiter)) {
            this._status.stash += character;
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
                    this._status.stash += this._config.quotes;
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
                if(this._status.hasQuotesPending) this._flushStash();
                // _flushStash will reset waitForDelimiter
                if(this._status.waitForDelimiter) {
                    this._flushStash();
                } else {
                    this._status.stash += this._config.quotes;
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
        this._status.stash = '';
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

        if(this._config.trimFields) field = field.trim();
        if(this._config.castTypes) return CsvHeroParser._castValue(value);

        return field;
    }

    /**
     *
     * @param value
     * @returns {*}
     * @private
     */
    static _castValue(value) {
        if(value.toLowerCase() === 'true') {
            return true;
        }
        if(value.toLowerCase() === 'false') {
            return false;
        }
        if(!isNaN(value)) {
            return parseFloat(value);
        }
        return value;
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

        if(this._config.skipEmptyRows && (row.length === 0 || row.length === 1 && row[0].length === 0)) return;
        if(this._isEmptyFieldRow(row)) return;
        this._checkRowSize(row);
        if(this._checkFirstLine(row)) return;
        this._data.push(this._mapFields(row));
    }

    /**
     *
     * @param {Array} row
     * @private
     */
    _mapFields(row) {
        if(this._config.mapFields) {
            let mappedRow = {},
                mapping   = this._config.fieldMapping;

            for(let i = 0; i < row.length; i++) {
                if(mapping[i] !== undefined) {
                    mappedRow[mapping[i]] = row[i];
                } else {
                    mappedRow[`field_${i}`] = row[i];
                }
            }
            return mappedRow;
        }
        return row;
    }

    /**
     *
     * @param {Array} row
     * @returns {boolean}
     * @private
     */
    _checkFirstLine(row) {
        if(this._status.isFirstLine && this._config.mapFields && this._config.fieldMapping.length === 0) {
            this._config.fieldMapping = row;
            this._status.isFirstLine = false;
            return true;
        }
        if(this._status.isFirstLine && this._config.skipHeader) {
            this._status.isFirstLine = false;
            return true;
        }
        return false;
    }

    /**
     *
     * @param {Array} row
     * @private
     */
    _checkRowSize(row) {
        if(this._config.rowSize === -1) this._config.rowSize = row.length;
        if(this._config.strictRows) {
            if(this._config.rowSize > row.length) {
                for(let i = row.length; i < this._config.rowSize; i++) {
                    row.push('');
                }
            } else if(this._config.rowSize < row.length) {
                this._logError({name: 'InvalidRow', message: 'Row size does not match the configured size'});
            }
        }
    }

    /**
     *
     * @param {Array} row
     * @returns {boolean}
     * @private
     */
    _isEmptyFieldRow(row) {
        if(this._config.skipEmptyFieldRows) {
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