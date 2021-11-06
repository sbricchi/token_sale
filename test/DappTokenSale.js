var DappTokenSale = artifacts.require("../contracts/DappTokenSale.sol");

contract('DappTokenSale', accounts => {
    var tokenSaleInstance;
    /*
    var tokenPrice = web3.toWei(1, 'ether');
    process.stdout.write('\nvalor wei:  ' + tokenPrice);
    */
    
    // https://eth-converter.com/
    var tokenPrice = 1_000_000_000_000_000; // 0.001 ether in wei

    it('inicializar SC con los valores correctos', () => {
        return DappTokenSale.deployed().then(instance => {
            tokenSaleInstance = instance;
            return tokenSaleInstance.address
        }).then(address => {
            assert.notEqual(address, 0x0, 'Tiene la dirección del SC');
            return tokenSaleInstance.tokenContract();
        }).then(address => {
            assert.notEqual(address, 0x0, 'Tiene la dirección del SC de los tokens');
            return tokenSaleInstance.tokenPrice();
        }).then(price => {
            assert.equal(price, tokenPrice, 'El precio del token tiene valor asignado');
        });
    });
});