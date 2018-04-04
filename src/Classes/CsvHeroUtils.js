export default class CsvHeroUtils {

    /**
     *
     * @returns {window}
     */
    static getEnv() {
        if (typeof self !== 'undefined') return self;
        if (typeof window !== 'undefined') return window;
        if (typeof global !== 'undefined') return global;

        return {};
    }
}