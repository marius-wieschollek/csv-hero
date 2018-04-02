let webpack = require('webpack');


module.exports = (env) => {
    console.log('Production: ', false);

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