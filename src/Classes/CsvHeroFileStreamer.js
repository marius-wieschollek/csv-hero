export default class CsvHeroFileStreamer {

    /**
     *
     * @param {File} file
     * @param {CsvHeroConfig} config
     */
    constructor(file, config) {
        this._config = config;
        this._file = file;
    }

    readChunk() {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {resolve(reader.result);};
            reader.onerror = reject;
            reader.readAsText(this._file, this._config.encoding);
        });
    }
}