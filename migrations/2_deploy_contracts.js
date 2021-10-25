var DappToken = artifacts.require("../contracts/DappToken.sol");

module.exports = function (deployer) {
  deployer.deploy(DappToken, 1_000_000); // Valor inicial que tendra la cuneta MADRE del Smart Contract
};
