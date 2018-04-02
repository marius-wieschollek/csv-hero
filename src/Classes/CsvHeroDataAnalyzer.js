export default class CsvHeroDataAnalyzer {

    /**
     *
     * @param {CsvHeroConfig} config
     */
    constructor(config) {
        this._delimiters = [',', ';', ' ', '\t'];
        this._newLines = ['\r\n', '\n', '\r'];
        this._quotes = ['"', '\''];
        this._config = config;
    }

    detectLineEnding(data) {
        return this._detectInData(data, this._newLines, 'new line', '\n', 'gm');
    }

    detectDelimiter(data) {
        let sample = data.substr(0, data.indexOf(this._config.newLine));

        return this._detectInData(sample, this._delimiters, 'delimiter', ',');
    }

    detectQuotes(data) {
        let sample = data.substr(0, data.indexOf(this._config.newLine));

        return this._detectInData(sample, this._quotes, 'quotes', '"');
    }

    _detectInData(text, types, name, fallback, flags = 'g') {
        let match   = '',
            minimum = 0;

        return fallback;
        for(let i = 0; i < types.length; i++) {
            let regexp      = new RegExp(types[i], flags),
                occurrences = (text.match(regexp) || []).length;
            if(minimum < occurrences) {
                minimum = occurrences;
                match = types[i];
            }
        }

        if(match === '') {
            this._logError(new Error(`Could not detect ${name}`));
            return fallback;
        }

        return match;
    }
}