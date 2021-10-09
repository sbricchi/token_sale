// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

contract DappToken {

    //Estándar ERC20 -> https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md

    string public symbol = "DAPP"; // IRC20 STD
    string public name = "DApp Token";
    string public standard = 'DApp Token v1.0';
    uint256 public totalSupply;

    // Nota: The indexed parameters for logged events will allow you to search for these 
    // events using the indexed parameters as filters.
    
    // Segun ERC20
    event Transfer( 
        address indexed _from,
        address indexed _to,
        uint256 _value 
    );

    // Por seguridad en transferencias delegadas
    event Transfer(
        address indexed _spender,
        address indexed _from,
        address indexed _to,
        uint256 _value
    );    

    /*
        Approval
        MUST trigger on any successful call to approve(address _spender, uint256 _value).    
    */
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // 6.3. Four-Args Approval Event
    // Por seguridad en transferencias delegadas
    /*
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _oldValue,
        uint256 _value
    );
    */

    mapping(address => uint256) public balanceOf; // get only

    // Guarda todas las aprobaciones que hace address1 a otras addresses a gastar uint256
    mapping(address => mapping(address => uint256)) public allowance; // get only

    //  
    constructor(uint256 _initialSupply) {
        // El sender será 0 ya que es el ADMIN en la migration
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    /* 
        transfer:
        Transfers _value amount of tokens to address _to, and MUST fire the Transfer event. The function SHOULD throw if the message caller's account balance does not have enough tokens to spend.
        Note Transfers of 0 values MUST be treated as normal transfers and fire the Transfer event.
        function transfer(address _to, uint256 _value) public returns (bool success)
    */
    function transfer(address _to, uint256 _value) public returns (bool success) {

        require(balanceOf[msg.sender] >= _value);
        
        // Realización de la transferencia
        // 1. disminuye en el enviador
        balanceOf[msg.sender] -= _value;
        // 2. aumenta en el receptor
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    /**********************************************************************
        Transferencias delegadas (no es el sender quien la genera)
     **********************************************************************/
    // Transferencia delegada (no es el sender quien la genera)
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {

        // Tiene el saldo suficiente la cuenta de origen?
        require(_value <= balanceOf[_from]);

        // Revisar si alcanza el allowance
        require(_value <= allowance[_from][msg.sender]);

        // Realización de la transferencia
        // 1. Resta balance de la cuenta de origen
        balanceOf[_from] -= _value;
        // 2. Aumenta balance del receptor de la transferencia
        balanceOf[_to] += _value;

        // Actualizar el ALLOWANCE
        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }

    /*
    Allows _spender to withdraw from your account multiple times, up to the _value amount. 
    If this function is called again it overwrites the current allowance with _value.
    NOTE: To prevent attack vectors like the one described here and discussed here, clients SHOULD make sure to create user interfaces in such a way that they set the allowance first to 0 before setting it to another value for the same spender. THOUGH The contract itself shouldn't enforce it, to allow backwards compatibility with contracts deployed before
    */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        
        // Manejar el allowance
        allowance[msg.sender][_spender] = _value;

        // El SENDER aprueba al SPENDER a gastar en su nombre un determinado VALUE
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    // Suggested ERC20 API Changes - para evitar afano 
    // https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit#heading=h.6uz9seehjf3n
    /*
    function approve( address _spender, uint256 _currentValue, uint256 _value) public returns (bool success) {

    }
    */

    // Guarda el monto que se permitió utilizar a mi nombre
    // Returns the amount which _spender is still allowed to withdraw from _owner.
    // Se reemplaza por una mapping mas arriba...
    /*
    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
    }
    */
}