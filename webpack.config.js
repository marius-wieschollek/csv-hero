let webpack = require('webpack');

module.exports = (env) => {
    let target = env.target ? env.target:'web',
        type = target === 'web' ? 'var':'commonjs2';

    return {
        entry  : {
            'csv-hero': `${__dirname}/src/${target}.js`
        },
        output : {
            path    : `${__dirname}/`,
            filename: `dist/[name].${target}.js`,
            libraryTarget: type
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