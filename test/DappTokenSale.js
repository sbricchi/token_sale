var DappToken = artifacts.require("../contracts/DappToken.sol");
var DappTokenSale = artifacts.require("../contracts/DappTokenSale.sol");

contract('DappTokenSale', function(accounts) {
    var tokenInstance;
    var tokenSaleInstance;
    
    // Primera cuenta de la blockchain de ganache dueña del SC de tokens. 
    // Cuando se inicializó la prueba se le asignadron 1M de tokens a la cuenta 0 de la chain de ganache.
    // La idea es que le pase una parte de esos tokens al SC de ventas.
    // Dado que un SC también es publicado a la Blockchain y tiene su propio address se puede hacer.
    var admin = accounts[0]; 
    var tokensAvailable = 750_000; // Le pasaremos el 75% de los tokens en existencia

    var buyer = accounts[9];
    var numberOfTokens; 
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

    it('compra de tokens', function() {
        /*******************
            Inicialización
        *********************/
        return DappToken.deployed().then(function(instance) {
            // Obtener primero el SC de tokens
            tokenInstance = instance;
            //process.stdout.write('\nDireccion tokenInstance: ' + tokenInstance.address);

            return DappTokenSale.deployed();
        }).then(function(instance) {
            // ahora obtenemos el SC del tokenSale
            tokenSaleInstance = instance;
            //process.stdout.write('\nDireccion tokenSaleInstance: ' + tokenSaleInstance.address);

            // Provisionar algunos tokens al SC de ventas para que venda de forma independiente
            // Otorgar el 75% de los tokens al SC de ventas:
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
        }).then(receipt => {
            // Estamos en incialización con un SC ya testeado en pasos anteriores 
            // así que no verifico el receipt...
            
            /*
            //Control
            process.stdout.write('\nTransferencia de saldo inicial:');
            process.stdout.write('\nreceipt.logs.length ' + receipt.logs.length);
            process.stdout.write('\nreceipt.logs[0].event ' + receipt.logs[0].event);
            process.stdout.write('\nreceipt.logs[0].args._from ' + receipt.logs[0].args._from);
            process.stdout.write('\nreceipt.logs[0].args._to ' + receipt.logs[0].args._to);
            process.stdout.write('\nreceipt.logs[0].args._value ' + receipt.logs[0].args._value);
            */

            numberOfTokens = 10; 
            
            /*******************
             Arrancan las pruebas
            *********************/
            
            // Agrega metadata que es soportada y recibida por las operaciones de un SMART CONTRACT
            // ejemplo el "from".
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice }); //value = in wei
        }).then(function(receipt) {

            /*
            process.stdout.write('\nCompra de Tokens:');
            process.stdout.write('\nreceipt.logs.length ' + receipt.logs.length);
            process.stdout.write('\nreceipt.logs[0].event ' + receipt.logs[0].event);
            process.stdout.write('\nreceipt.logs[0].args._buyer ' + receipt.logs[0].args._buyer);
            process.stdout.write('\nreceipt.logs[0].args._amount ' + receipt.logs[0].args._amount);
            */

            assert.equal(receipt.logs.length, 1, 'lanzó un único evento');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'log de la cuenta que compró los tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'log de la cantidad de tokens comprados');

            return tokenSaleInstance.tokensSold();
        }).then(function(amount) {
            //process.stdout.write('\nCantidad tokens Vendidos ' + amount.toNumber());
            assert.equal(amount.toNumber(), numberOfTokens, 'Se incrementa el monto de tokens vendidos');

            // Balance del comprador
            return tokenInstance.balanceOf(buyer);
        }).then(function(buyerBalance) {
            //process.stdout.write('\nBalance del comprador ' + buyerBalance.toNumber());
            assert.equal(buyerBalance.toNumber(), numberOfTokens, 'Se actualizó el saldo de la cuenta del comprador');
            
            // Chequear balance del SC de ventas
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(tokenSalesBalance) {
            //process.stdout.write('\nBalance del vendedor ' + tokenSalesBalance.toNumber());
            assert.equal(tokenSalesBalance.toNumber(), tokensAvailable - numberOfTokens, 'Disminuyó el saldo de la cuenta del SC de ventas');

            // Itenta comprar tokens a valor demasiado pequeño
            // Try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
        }).then(assert.fail).catch(function(error) {
            // ATENCION!!! Cuando no está completa la funcionalidad no devuelve un ERROR valido y no es posible utilizqar 
            // el indexOf() ya que no es STRING el resultado de error.message...
            //process.stdout.write('\nError con VALUE = 1:  ' + error.message);
            assert(error.message.indexOf('revert') >= 0, 'msg.value debe igualar la cantidad de tokens en wei');

            /* DEBUG FINAL*/
            //printSalesBalanceAsync(tokenInstance, tokenSaleInstance);
            //printBalanceAsync(9, accounts, tokenInstance);
            // No es posible ejecutar esto en el último paso...Desconozco el motivo!!!

            // Require that are enough tokens in the tokenSale SC 
            return tokenSaleInstance.buyTokens(800_000, { from: buyer, value: numberOfTokens * tokenPrice });
        }).then(assert.fail).catch(function(error) {
            //process.stdout.write('\nError falta de tokens:  ' + error.message);
            assert(error.message.indexOf('revert') >= 0, 'No hay suficientes tokens en el SC de ventas');
        });
    });

    it('Finaliza la venta de tokens', () => {
        return DappToken.deployed().then(instance => {
            // Obtener primero el SC de tokens
            tokenInstance = instance;
            //process.stdout.write('\nDireccion tokenInstance: ' + tokenInstance.address);

            return DappTokenSale.deployed();
        }).then(instance => {
            // ahora obtenemos el SC del tokenSale
            tokenSaleInstance = instance;

            // intentar finalizar la venta con alguien que no sea el admin
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch(error => {
            //process.stdout.write('\nError no es el admin:  ' + error.message);
            assert(error.message.indexOf('revert' >= 0, 'Sólo puede finalizar la venta el admin'));

            // Finalizar la venta como Admin
            return tokenSaleInstance.endSale({ from : admin });
        }).then(receipt => {

            // Verificar
            return tokenInstance.balanceOf(admin);
        }).then(balance => {
            // tokens iniciales otorgados a este SC menos los 10 vendidos
            assert.equal(balance.toNumber(), 999_990, 'tokens no vendidos devueltos al admin');

            // Verificar la desrucción del SC de ventas viendo que alguna de sus 
            // propiedades están en cero luego de la destrucción
            return tokenSaleInstance.tokenPrice();
            //return tokenSaleInstance.tokensSold();
        //}).then(valor => {
        }).then(assert.fail).catch(error => {
            //process.stdout.write('\nError el SC se suicidó!: ' + error.message);
            //assert.equal(valor.toNumber(), 0, 'El precio de los tokens debe ser reseteado...');
            //assert.equal(1, 1, 'Algo...');
            assert(error.message.indexOf('Returned values aren\'t valid' >= 0, 'El SC de venta ya no es accesible'));
        });
    });

    //region Privadas

    async function printSalesBalanceAsync(tokenSmartContractInstance, tokenSalesSmartContractInstance) {
        try {
            let balance = await tokenSmartContractInstance.balanceOf(tokenSalesSmartContractInstance.address); // Devuelve una promesa...
            process.stdout.write('\nBalance cuenta ventas => ' + balance);
        }
        catch (error) {
            process.stdout.write('\nError printSalesBalanceAsync !! ' + error);
        }
    }

    async function printBalanceAsync(accountIndex, accounts, smartContractInstance) {
        try {
            let balance = await smartContractInstance.balanceOf(accounts[accountIndex]); // Devuelve una promesa...
            process.stdout.write('\nBalance cuenta #' + accountIndex + ' => ' + balance);
        }
        catch (error) {
            process.stdout.write('\nError printBalanceAsync!! ' + error);
        }
    }

    //endregion

});