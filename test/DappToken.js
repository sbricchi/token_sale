var DappToken = artifacts.require("../contracts/DappToken.sol");

contract('DappToken', function(account) {
  
    it('sets the total supply upon deployment', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1M'); 
        });
    });
})

/*
module.exports = function (deployer) {
  deployer.deploy(DappToken);
};
*/
