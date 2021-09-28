var DappToken = artifacts.require("../contracts/DappToken.sol");

contract('DappToken', function(accounts) { // Ganache nos envía las cuentas
  
    var tokenInstance;

    // Utilizando "karma-jasmine" para testing. Viene con el TRUFFLE

    it('allocates the contract with the correct values', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name) {
            assert.equal(name, 'DApp Token', 'correct name'); 
            return tokenInstance.symbol();
        }).then(function(symbol) {
            assert.equal(symbol, 'DAPP', 'correct Symbol'); 
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'DApp Token v1.0', 'correct STD'); 
        });
    });

    it('allocates the initial supply upon deployment', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply) {
            assert.equal(totalSupply.toNumber(), 1_000_000, 'sets the total supply to 1M'); 
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(adminBalance) {
            assert.equal(adminBalance.toNumber(), 1_000_000, 'it allocates the initial amount to the admin account');
        });
    });

    it('transfers token ownership', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            // algo mayor que el saldo del tipo (de cuenta 0)
            return tokenInstance.transfer.call(accounts[1], 9999999999999);
            // Cuando usamos el CALL no se crea una transacción realmente
        }).then(assert.fail).catch(function(error) {
            // *************************************
            // Ejemplo de impresión de MENSAJE!!! 
            // *************************************
            //process.stdout.write('Error ' + error.message);
            assert(error.message.indexOf('revert') >= 0, 'El mensaje de error debería contener "revert"');
            return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
        }).then(function(success) {
            assert(success, true, 'Devuelve booleano TRUE');
            // Transferencia REAL sin CALL
            return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'Agregó el monto a la cuenta receptora');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, 'Restó el monto desde la cuenta de origen');
        });
    });

});