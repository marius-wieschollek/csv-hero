export default class CsvHeroDataAnalyzer {

    /**
     *
     * @param {CsvHeroConfig} config
     */
    constructor(config) {
        this._delimiters = [',', ';', '|', '\t', ' '];
        this._newLines = ['\r\n', '\n', '\r'];
        this._quotes = ['"', '\''];
        this._config = config;
    }

    /**
     *
     * @param {string} data
     * @returns {string}
     */
    detectLineEnding(data) {
        let match   = '',
            minimum = 0;

        for(let i = 0; i < this._newLines.length; i++) {
            let regexp      = new RegExp(this._newLines[i], 'gm'),
                occurrences = (data.match(regexp) || []).length;
            if(minimum < occurrences) {
                minimum = occurrences;
                match = this._newLines[i];
            }
        }

        return match === '' ? false:match;
    }

    /**
     *
     * @param {string} data
     * @returns {string}
     */
    detectDelimiter(data) {
        let lineStart = data.indexOf(this._config.newLine) + this._config.newLine.length,
            sample = data.substr(0, data.indexOf(this._config.newLine, lineStart));

        return this._findBestPattern(sample, this._delimiters, 'delimiter', ',');
    }

    /**
     *
     * @param {string} data
     * @returns {string}
     */
    detectQuotes(data) {
        let lineStart = data.indexOf(this._config.newLine) + this._config.newLine.length,
            sample = data.substr(0, data.indexOf(this._config.newLine, lineStart));

        return this._findBestPattern(sample, this._quotes, 'quotes', '"');
    }

    /**
     *
     * @param text
     * @param patterns
     * @param type
     * @param fallback
     * @returns {string}
     * @private
     */
    _findBestPattern(text, patterns, type, fallback) {
        let search = CsvHeroDataAnalyzer._processPatterns(patterns);
        this._gatherPatternStatistics(text, search);
        return CsvHeroDataAnalyzer._determineBestMatch(search, type, fallback);
    }

    /**
     *
     * @param {Array} patterns
     * @private
     */
    static _processPatterns(patterns) {
        let search = [];
        for(let i = 0; i < patterns.length; i++) {
            search.push(
                {
                    value : patterns[i],
                    regexp: new RegExp(patterns[i].replace('|', '\\|'), 'g'),
                    min   : -1,
                    max   : -1,
                    sum   : 0
                }
            );
        }
        return search;
    }

    /**
     *
     * @param {string} input
     * @param {Array} search
     * @private
     */
    _gatherPatternStatistics(input, search) {
        let text = input.split(this._config.newLine),
            max = text.length < 100 ? text.length:100;
        for(let i = 0; i < max; i++) {
            for(let j = 0; j < search.length; j++) {
                let occurrences = (text[i].match(search[j].regexp) || []).length;

                if(search[j].min > occurrences || search[j].min === -1) {
                    search[j].min = occurrences;
                }
                if(search[j].max < occurrences || search[j].max === -1) {
                    search[j].max = occurrences;
                }
                search[j].sum += occurrences;
            }
        }
    }

    /**
     *
     * @param {Array} search
     * @param type
     * @param fallback
     * @returns {string}
     * @private
     */
    static _determineBestMatch(search, type, fallback) {
        let choice = '', span = -1, minZero = true;
        for(let i = 0; i < search.length; i++) {
            let currentSpan = search[i].max - search[i].min,
            spanAccepted = span > currentSpan || span === -1;

            if(search[i].max !== 0 &&
               (minZero && search[i].min !== 0 || (search[i].min !== 0 && spanAccepted) || (minZero && spanAccepted))
            ) {
                choice = search[i].value;
                span = currentSpan;
                minZero = search[i].min === 0;
            }
        }

        if(span !== -1) return choice;

        console.warn(`Could not determine ${type} automatically. Using ${fallback}`);

        return fallback;
    }
}