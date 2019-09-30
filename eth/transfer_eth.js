var Web3 = require("web3")
var web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/9c2bb44c20034062b5ad65b8752e7e15"));
var EthTx = require("ethereumjs-tx")
const ethjsUtil = require('ethereumjs-util')


let priv_key = process.argv[2]
let dest_address= process.argv[3]
let gas_price   = 20*1000000000
let gas_limit   = 22000

let address = ethjsUtil.privateToAddress(Buffer.from(priv_key,'hex'))
const from_address  = ethjsUtil.toChecksumAddress( address.toString('hex') )

function processSignTx(balance, nonce) {
    //var gas_price=10000000000;
    //var gas_limit = 21000;
    var transfer_amount = balance - (gas_price*gas_limit);
    console.log('transfer balance=', balance, 'fee=', gas_price*gas_limit, 'transferAmount=', transfer_amount, 'from=', address.toString('hex'), 'to=', dest_address )
    if (transfer_amount <= 0 ) {
        console.log('not enough balance to transfer,balance=', balance, 'fee=', gas_price*gas_limit, 'transferAmount=', transfer_amount)
        process.exit(0);
    }
    var rawTx = {
        from : from_address,
        nonce: web3.utils.toHex(nonce),
        //nonce: '0x01',
        to: dest_address,
        gasPrice: web3.utils.toHex(gas_price),
        gasLimit: web3.utils.toHex(gas_limit),
        //value: web3.toHex(web3.toWei(1, 'ether')),
        value: web3.utils.toHex(transfer_amount),
        data: '0x00',
        chainId :'0x03'
    }
    //Create buffer
    var pKey1x = Buffer.from(priv_key, 'hex')
    //New transaction instance
    var tx = new EthTx(rawTx)
    //Sign transaction
    tx.sign(pKey1x)
    //Make Serialized
    var serializedTx = `0x${tx.serialize().toString('hex')}`
    //Send Transaction which returns hash of transaction on main network
    web3.eth.sendSignedTransaction(serializedTx, (error, data) => {
      if(!error) { console.log(data) } else {console.log(error) }
    })
    console.log('rawTx:', serializedTx)
    //web3.eth.sendSignedTransaction(serializedTx).on('receipt', console.log);
}

function getBalance(error, result){
    if (!error) {
        console.log('Ether:', web3.utils.fromWei(result,'ether'));
        return result;
    }else {
        console.log('[getBalance] we have a problem: ', error);
        return 0;
    }

}

function getTransactionCount(error, result) {
    if (!error) {
        console.log('Nonce:', result);
        return result;
    } else {
        console.log('[getTransactionCount] we have a problem: ', error);
        return 0;
    }
}


// Use Web3 to get the balance of the address, convert it and then show it in the console.
web3.eth.getBalance(from_address, function (error, result) {
    var balance = getBalance(error, result);

    // Use Web3 to get the nonce of the address
    web3.eth.getTransactionCount(from_address, function (error2, result2) {
        var nonce = getTransactionCount(error2, result2);
        processSignTx(balance, nonce)
    });
});
