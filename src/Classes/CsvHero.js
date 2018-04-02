import CsvHeroConfig from '@js/CsvHeroConfig';
import CsvHeroParser from '@js/CsvHeroParser';
import CsvHeroFileStreamer from '@js/CsvHeroFileStreamer';
import CsvHeroTextStreamer from '@js/CsvHeroTextStreamer';

export default class CsvHero {

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {File} file
     * @param {Object} userConfig
     * @returns {Promise}
     */
    parse(file, userConfig = {}) {
        return new Promise(async (resolve, reject) => {
            let config = new CsvHeroConfig(userConfig),
                reader = CsvHero._getStreamer(file, config),
                parser = new CsvHeroParser(reader, config);

            await parser.parse();
            CsvHero._createResult(parser, config, resolve, reject);
        });
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



        if(result.hasErrors && !config.ignoreErrors) {
            fail(result);
            return;
        }
        success(result);
    }

    /**
     *
     * @param {File|string} file
     * @param {CsvHeroConfig} config
     * @returns {CsvHeroFileStreamer}
     */
    static _getStreamer(file, config) {
        if(file instanceof File) {
            return new CsvHeroFileStreamer(file, config);
        }
        return new CsvHeroTextStreamer(file, config);
    }
}