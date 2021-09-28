var DappToken = artifacts.require("../contracts/DappToken.sol");

module.exports = function (deployer) {
  deployer.deploy(DappToken, 1_000_000);
};
