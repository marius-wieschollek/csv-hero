let webpack = require('webpack');

module.exports = () => {
    return {
        entry  : {
            'csv-hero': `${__dirname}/src/csv-hero.js`
        },
        output : {
            path    : `${__dirname}/`,
            filename: 'dist/[name].js'
        },
        resolve: {
            modules   : ['node_modules', 'src'],
            extensions: ['.js'],
            alias     : {
                '@js': `${__dirname}/src/Classes`
            }
        }
    };
};