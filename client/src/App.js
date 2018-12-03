// App = {
//   web3Provider: null,
//   contracts: {},
//   myAccount: {},
//   goUberInstance: {},

//   init: async function() {   
//     return await App.initWeb3();
//   },

//   initWeb3: async function() {
//     // Modern dapp browsers...
//     if (window.ethereum) {
//       App.web3Provider = window.ethereum;
//       try {
//         // Request account access
//         await window.ethereum.enable();
//       } catch (error) {
//         // User denied account access...
//         console.error("User denied account access")
//       }
//     }
//     // Legacy dapp browsers...
//     else if (window.web3) {
//       App.web3Provider = window.web3.currentProvider;
//     }
//     // If no injected web3 instance is detected, fall back to Ganache
//     else {
//       App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
//     }
//     web3 = new Web3(App.web3Provider);

//     return App.initContract();
//   },

//   initContract: function() {
//     $.getJSON('GoUber.json', function(data) {
//       console.log(data);
//       // Get the necessary contract artifact file and instantiate it with truffle-contract
//       var GoUberArtifact = data;
//       App.contracts.GoUber = TruffleContract(GoUberArtifact);
    
//       // Set the provider for our contract
//       App.contracts.GoUber.setProvider(App.web3Provider);
    
//       //App.getContractInstance();
//     });

    

//     App.getMyAccount();
//   },

//   getMyAccount: function(){
//     web3.eth.getAccounts(function(error, accounts) {
//       if (error) {
//         console.log(error);
//       }
    
//       App.myAccount = accounts[0];
//     });
//   },

// };

// $(function() {
//   $(window).load(function() {
//     App.init();
//   });
// });
