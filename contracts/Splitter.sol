pragma solidity ^0.4.4;

import "./SafeMath.sol";

contract Splitter is Owned {

    struct BeneficiaryPolicy {
        address beneficiary1;
        address beneficiary2;
    }
    mapping (address => BeneficiaryPolicy) beneficiaryPolicies;
    mapping (address => uint) owedBalances;
    
    event Split(address _benefactor, address _beneficiary1, address _beneficiary2, uint _amountSent);
    event Withdrawal(address _withdrawer, uint _amountWithdrawn);

    function Splitter() public {}

    function declareBeneficiaries(address _beneficiary1, address _beneficiary2) public returns(bool) {
        // Require distinct entities for simplicity
        require(msg.sender != _beneficiary1);
        require(msg.sender != _beneficiary2);
        require(_beneficiary1 != _beneficiary2);

        beneficiaryPolicies[msg.sender] = BeneficiaryPolicy(_beneficiary1, _beneficiary2);

        return true;
    }

    function () payable public {    
        address benefactor = msg.sender;
        address beneficiary1 = beneficiaryPolicies[msg.sender].beneficiary1;
        address beneficiary2 = beneficiaryPolicies[msg.sender].beneficiary2;

        // Validate that this benefactor has set up a beneficiary policy
        require(beneficiary1 != address(0));
        require(beneficiary2 != address(0));

        uint remainder = msg.value % 2;
        owedBalances[benefactor] = SafeMath.add(owedBalances[benefactor], remainder);
        
        uint toPayout = SafeMath.div(SafeMath.sub(msg.value, remainder), 2);
        owedBalances[beneficiary1] = SafeMath.add(owedBalances[beneficiary1], toPayout);
        owedBalances[beneficiary2] = SafeMath.add(owedBalances[beneficiary2], toPayout);

        Split(benefactor, beneficiary1, beneficiary2, msg.value);
    }

    function withdraw() public returns(bool) {
        address recipient = msg.sender; 
        uint tmpBalance = owedBalances[recipient];
        assert(tmpBalance != 0);

        owedBalances[recipient] = 0;
        if (!recipient.send(tmpBalance)) {
            revert();
        }
        Withdrawal(recipient, tmpBalance);
        return true;
    }

    function getBalance(address recipient) public returns(uint) {
        return owedBalances[recipient];
    }

}
