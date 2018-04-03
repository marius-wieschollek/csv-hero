import CsvHero from '@js/CsvHero';

(function() {
    if(typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], CsvHero);
    }
    else if(typeof module === 'object' && typeof exports !== 'undefined') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = new CsvHero();
    }
    else if(self) {
        // Browser globals
        self.CsvHero = new CsvHero();
    }
}());