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

    it('aproves tokens for delegated transfer', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100); // Sin crear transaction...
        }).then(function(success) {
            assert.equal(success, true, 'appoved returns TRUE');
            // Aprueba a cuenta 1 a transferir 100 en nombre de la cuenta 0
            return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
        }).then(function(appoval) {
            assert.equal(appoval.logs.length, 1, 'triggers one event');
            assert.equal(appoval.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(appoval.logs[0].args._owner, accounts[0], 'logs the account la cual autoriza al SENDER a realizar la transacción en su nombre');
            assert.equal(appoval.logs[0].args._spender, accounts[1], 'logs the account que es autorizada por el OWNER a realizar el gasto a su nombre');
            assert.equal(appoval.logs[0].args._value, 100, 'logs the approved amount');
            // Por que monto cuenta 0 aprobó cuenta 1 a transferir en su nombre?
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            // Por que monto cuenta 0 aprobó cuenta 1 a transferir en su nombre?
            assert.equal(allowance.toNumber(), 100, 'saldo permitido');
        });
    }); //it

    it('handles delegated transfers', function() {
        return DappToken.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2]; // OWNER
            toAccount = accounts[3]; // RECEPTOR de la Trx
            spendingAccount = accounts[4]; // SENDER
            // Ponemos algo de saldo en al cuenta from para empezar las pruebas
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] }); // Sabemos que la 0 tiene guita de los tests anteriores
        }).then(function(receipt) {
            /* Chequeo por Consola */
            //for (i = 0; i <= 4; i++) { printBalance(i, accounts, tokenInstance); }
            // Aprobar que spendingAccount gaste 10 tokens desde fromAccount
            // Para el approve el SENDER es el OWNER de los TOKENS...
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(function(receipt) {
            // Tratar de mandar algo superior al balance del FROM/OWNER
            // El llamador aca es el SPENDER en nombre del OWNER
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount }); // Mas de 100
        }).then(assert.fail).catch(function(error) {
            //process.stdout.write('\nError ' + error.message);
            // Mensaje completo desde el blockchain: "Returned error: VM Exception while processing transaction: revert"
            assert(error.message.indexOf('revert') >= 0, 'No tiene suficiente saldo');
            // Itenta transferir algo superioir a lo aprobado
            return tokenInstance.transferFrom(fromAccount, toAccount, 11, { from: spendingAccount }); 
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'No se aprobó la transferencia de ese monto');
            // Se verifica que "transferFrom" devuelva "true"
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 1, { from: spendingAccount });
        }).then(function(returnValue) {
            assert.equal(returnValue, true, '"transferFrom" debe devolver "true"');
            // Prueba del retorno de una tranferencia delegada válida
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account origen de los fondos');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account destino de los fondos');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the monto transferido');
            // Actualización del balance de la cuenta de origen
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, 'disminuyó el saldo de la cuenta de origen');
            // Actualización del balance de la cuenta de destino
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, 'aumentó el saldo de la cuenta de destino');
            // Balance del saldo permitido
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 0, 'deduce el monto del aprobado');
        });
    }); //it

    
    
    
    //region Privadas
    function printBalance(accountIndex, accounts, smartContractInstance) {
        _ = smartContractInstance.balanceOf(accounts[accountIndex])
            .then(function(balance) {
                //process.stdout.write('\nvalor ' + balance);
                process.stdout.write('\nBalance cuenta ' + accountIndex + ' => ' + balance);
        })
    }
    //endregion
});