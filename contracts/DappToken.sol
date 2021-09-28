// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

contract DappToken {

    //Estándar ERC20 -> https://github.com/ethereum/EIPs/blob/master/EIPS/eip-20.md

    string public symbol = "DAPP"; // IRC20 STD
    string public name = "DApp Token";
    string public standard = 'DApp Token v1.0';
    uint256 public totalSupply;

    // Segun ERC20
    event Transfer( 
        address indexed _from,
        address indexed _to,
        uint256 _value 
    );

    mapping(address => uint256) public balanceOf; // get only

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
    function transfer(address _to, uint256 _value) public returns (bool success){

        require(balanceOf[msg.sender] >= _value);
        
        // REalización de la transferencia
        // 1. disminuye en el enviador
        balanceOf[msg.sender] -= _value;
        // 2. aumenta en el receptor
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}