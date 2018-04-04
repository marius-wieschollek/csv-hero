import CsvHero from '@js/CsvHero';

(function(root) {
    root.CsvHero = new CsvHero();
})(this || (typeof window !== 'undefined' ? window:global));
