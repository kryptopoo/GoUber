var PrivateKeyProvider = require("truffle-privatekey-provider");
var privateKey = "";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    // development: {
    //   host: "127.0.0.1",
    //   port: 7545,
    //   network_id: "*" // Match any network id
    // },
    test: {
      provider: new PrivateKeyProvider(privateKey, "https://testnet-rpc.gochain.io/"),
      network_id: '31337',
      gas: 4000000,
      gasPrice: 4000000000,
    },
  }
};
