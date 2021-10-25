web3.eth.getAccounts((error,result) => { if (error) { console.log(error); } else { admin = result[0]; }});

// Seteo cuentas inciales (0 y 1 de la blockchain)
web3.eth.getAccounts((error,result) => admin = result[0]);
web3.eth.getAccounts((error,result) => receiver = result[1]);

// Transferencia normal
tokenInstance.transfer(receiver, 100, { from: admin })

// Chequear balances de 0 y 1
tokenInstance.balanceOf(admin)
tokenInstance.balanceOf(receiver)


// Transferencias delegadas:
// Seteo de cuentas
web3.eth.getAccounts((error,result) => fromAccount = result[2]);web3.eth.getAccounts((error,result) => toAccount = result[3]);web3.eth.getAccounts((error,result) => spendingAccount = result[4]);

// Fondear cuenta fromAccount para la prueba
tokenInstance.transfer(fromAccount, 100, { from: admin })

// Chequear balance fromAccount
tokenInstance.balanceOf(fromAccount)

// Aprobación: fromAccount autoriza a spendingAccount a gastar / transferir hasta 10 en su nombre.
tokenInstance.approve(spendingAccount, 10, { from: fromAccount })

// Chequear allowance creada
tokenInstance.allowance(fromAccount, spendingAccount)

// Realizar Trransferencia delegada
tokenInstance.transferFrom(fromAccount, toAccount, 1, { from: spendingAccount })

// Chequear balance fromAccount y toAccount 
tokenInstance.balanceOf(fromAccount)
tokenInstance.balanceOf(toAccount)



// Probar web3 nuevo:
import web3 from 'web3';
const ethProvider = new web3(web3.givenProvider).eth;
const accounts = await ethProvider.requestAccounts();
const ethBalance = web3.utils.fromWei(await ethProvider.getBalance(accounts[0]), 'ether');
console.log(ethBalance);
