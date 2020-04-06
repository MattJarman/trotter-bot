const path = require('path');
const dev = require('./env/development');
// prod

const defaults = {
    root: path.join(__dirname, '..'),
    prefix: '!',
    groovyPrefix: '-',
    timeout: 10000, // 10 seconds
    insults: [
        'dumbass',
        'jive turkey',
        'garage à bites',
        'tortchenfriedhof',
        'skitstovel',
        'pendejo',
        'trou du cul',
        'ass clown',
        'shitblimp'
    ],
    bulkDelete: {
        max: 100,
        min: 1
    }
};

module.exports = {
    dev: Object.assign({}, dev, defaults)
}[process.env.NODE_ENV || 'dev'];