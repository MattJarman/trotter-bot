const path = require('path')
const commands = require('./commands')
const dev = require('./env/development')

const defaults = {
  root: path.join(__dirname, '..'),
  prefix: '!',
  groovyPrefix: '-',
  timeout: 10000,
  colour: '#1DB954',
  bulkDelete: {
    max: 100,
    min: 1
  },
  music: {
    fortunateSon: {
      link: 'https://www.youtube.com/watch?v=ZWijx_AgPiA',
      length: 76000
    }
  }
}

module.exports = {
  dev: Object.assign({}, dev, defaults, commands)
}[process.env.NODE_ENV || 'dev']
