export default class CsvHeroTextStreamer {

    /**
     *
     * @param {string} text
     * @param {CsvHeroConfig} config
     */
    constructor(text, config) {
        this._config = config;
        this._text = text;
    }

    async readChunk() {
        return this._text
    }
}