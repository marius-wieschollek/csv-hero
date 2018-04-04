import CsvHeroUtils from '@js/CsvHeroUtils';
import CsvHeroConfig from '@js/CsvHeroConfig';
import CsvHeroParser from '@js/CsvHeroParser';
import CsvHeroFileStreamer from '@js/CsvHeroFileStreamer';
import CsvHeroTextStreamer from '@js/CsvHeroTextStreamer';

export default class CsvHero {

    constructor() {
        this._isWorker = typeof WorkerGlobalScope !== 'undefined';
        this._isBrowser = typeof document !== 'undefined';
        if (!this._isWorker && this._isBrowser) {
            this._workerUrl = document.currentScript.src;
        } else if(this._isWorker) {
            self.onmessage = (event) => {
                let config = new CsvHeroConfig(event.data.config);
                CsvHero._runLocal(event.data.file, config, self.postMessage, self.postMessage);
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {File|string} file
     * @param {Object} userConfig
     * @returns {Promise}
     */
    parse(file, userConfig = {}) {
        return new Promise(async (resolve, reject) => {
            let config = new CsvHeroConfig(userConfig);

            if (config.worker && !this._isWorker && this._isBrowser) {
                this._runWorker(file, config, resolve, reject);
            } else {
                CsvHero._runLocal(file, config, resolve, reject)
                    .catch(reject);
            }
        });
    }


    /**
     *
     * @param {File|string} file
     * @param {CsvHeroConfig} config
     * @param {function} success
     * @param {function} fail
     * @private
     */
    _runWorker(file, config, success, fail) {
        let workerUrl = config.workerUrl !== null ? config.workerUrl:this._workerUrl;
        if(!workerUrl) throw new Error('Worker URL missing');

        let worker = new Worker(workerUrl);
        worker.onmessage = (event) => {
            let result = event.data;
            result.hasErrors && !result.config.ignoreErrors ? fail(result):success(result);
        };
        worker.postMessage({file, config: config.config});
    }

    /**
     *
     * @param {File|string} file
     * @param {CsvHeroConfig} config
     * @param {function} success
     * @param {function} fail
     * @private
     */
    static async _runLocal(file, config, success, fail) {
        let reader = CsvHero._getStreamer(file, config),
            parser = new CsvHeroParser(reader, config);

        await parser.parse();
        CsvHero._createResult(parser, config, success, fail);
    }

    /**
     *
     * @param {CsvHeroParser} parser
     * @param {CsvHeroConfig} config
     * @param {function} success function
     * @param {function} fail    function
     */
    static _createResult(parser, config, success, fail) {
        let result = {
            config   : config.config,
            data     : parser.data,
            errors   : parser.errors,
            hasData  : parser.data.length !== 0,
            hasErrors: parser.errors.length !== 0
        };

        result.hasErrors && !result.config.ignoreErrors ? fail(result):success(result);
    }

    /**
     *
     * @param {File|string} file
     * @param {CsvHeroConfig} config
     * @returns {CsvHeroFileStreamer}
     */
    static _getStreamer(file, config) {
        if (CsvHeroUtils.getEnv().File && file instanceof File) {
            return new CsvHeroFileStreamer(file, config);
        }
        return new CsvHeroTextStreamer(file, config);
    }
}