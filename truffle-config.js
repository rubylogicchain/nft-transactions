const path = require('path')

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
  contracts_directory: path.join(__dirname, 'contracts'),
  networks: {
    develop: {
      port: 8545,
    },
    development: {
      host: '192.168.0.7',
      port: 7545,
      network_id: '*', // Match any network id
    },
  },
  compilers: {
    solc: {
      version: '0.6.12',
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
}
