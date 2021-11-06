// Crea una abstracción de SC para manejar via truffle
var DappToken = artifacts.require("../contracts/DappToken.sol");
var DappTokenSale = artifacts.require("../contracts/DappTokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(DappToken, 1_000_000) // Balance inicial que tendrá la cuenta MADRE del Smart Contract
  .then(() => {

    // https://eth-converter.com/
    var tokenPrice = 1_000_000_000_000_000; // 0.001 ether in wei

    // Al SC de venta se le pasa la dirección del SC de tokens en el constructor
    return deployer.deploy(DappTokenSale, DappToken.address, tokenPrice);
  }); 
};
