const env = require('dotenv').config({ path: process.env.BUILD_ENV === 'test' ? '.env.test' : '.env.production' })
console.log(process.env.BUILD_ENV)
module.exports = {
  files: 'dist/**',
  from: [/REPLACE_FACTORY_ADDRESS/g, /REPLACE_INIT_CODE_HASH/g],
  to: [env.parsed.FACTORY_ADDRESS, env.parsed.INIT_CODE_HASH]
}
