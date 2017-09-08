var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {

  var owner = accounts[0];
  
  var donator = accounts[1];
  var beneficiary1 = accounts[2];
  var beneficiary2 = accounts[3];

  var donationGiven = web3.toWei(1, "ether");

  var donatorBalance;
  var beneficiary1Balance;
  var beneficiary2Balance;

  beforeEach(function() {
    return Splitter.new(donator, beneficiary1, beneficiary2, {from: owner})
    .then(function(instance){
      contract = instance;
      return web3.eth.getBalance(donator);
    })
    .then(function(_donatorBalance){
      donatorBalance = _donatorBalance;
      return web3.eth.getBalance(beneficiary1);
    })
    .then(function(_beneficiary1Balance){
      beneficiary1Balance = _beneficiary1Balance;
      return web3.eth.getBalance(beneficiary2);
    })
    .then(function(_beneficiary2Balance){
      beneficiary2Balance = _beneficiary2Balance;
    })
  });

  it("should be owned by owner", function(){
    return contract.owner({from: owner})
    .then(function(_owner){
      assert.strictEqual(_owner, owner, "Contract is not owned by owner");
    });
  });

  it ("should not accept ether not sent by the donator", function(){

    var gasUsed;
    
    return contract.sendTransaction({from: owner, value: donationGiven})
    .then(function(txn){
      gasUsed = txn.receipt.gasUsed;
      return web3.eth.getBalance(donator);
    })
    .then(function(_newDonatorBalance){
      assert.equal(_newDonatorBalance.plus(gasUsed).toString(10), donatorBalance.toString(10));
    });
  })

  it ("should split ether from donator to beneficiaries", function(){

    var gasUsed;
    var donationReceived;

    return contract.sendTransaction({from: donator, value: donationGiven})
    .then(function(txn){
      gasUsed = txn.receipt.gasUsed;
      return web3.eth.getBalance(donator);
    })
    .then(function(_newDonatorBalance){
      var gasPrice = web3.eth.gasPrice;
      var balanceSpentOnGas = gasPrice.times(gasUsed);
      var totalEtherReceived = donatorBalance.minus(_newDonatorBalance.plus(balanceSpentOnGas));
      donationReceived = totalEtherReceived.dividedBy(2);

      return web3.eth.getBalance(beneficiary1);
    })
    .then(function(_newBeneficiary1Balance){
      assert.equal(_newBeneficiary1Balance.toString(10), beneficiary1Balance.plus(donationReceived).toString(10), "Beneficiary1 didn't receive appropriate amount of ether");
      return web3.eth.getBalance(beneficiary2);      
    })
    .then(function(_newBeneficiary2Balance){
      assert.equal(_newBeneficiary2Balance.toString(10), beneficiary2Balance.plus(donationReceived).toString(10), "Beneficiary2 didn't receive appropriate amount of ether");
    })
  })


  
});
