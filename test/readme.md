Iniciar:

Cargar aplicación GANACHE (simulador de blokchain de ethereum)

[wear buyer flee hazard return squirrel blur exhaust puzzle relax rival raisenote: this mnemonic is not secure; don't use it on a public blockchain.
HD PATH
]

Compilar:

truffle compile

Correr tests:

truffle test

Instalar SC desde cero:

truffle migrate --reset 

Consola de truffle:

tuffle console

Dentro de la consola podemos llamar al SC:

El objeto tiene el nombre definido en la migración "DappToken":

DappToken.deployed().then(function(instance) { tokenInstance = instance; })

Nos queda la "tokenInstance" para hacer los llamados (similar a lo hecho en los tests).

Ejemplos:

tokenInstance.name()
tokenInstance.symbol()
tokenInstance.totalSupply().then(function(s) { supply = s;})

=> para ver el valor de la variable:
supply

Para interactuar con la blockchain usamos web3:

Ejemplo:
web3.eth.getAccounts() (Nos muestra las cuentas)
La primera:
web3.eth.getAccounts((error,result) => { if (error) { console.log(error); } else { console.log('SAB -> ' + result[0]); }});

Publicar proyecto en ganache:
- truffle migrate --reset

