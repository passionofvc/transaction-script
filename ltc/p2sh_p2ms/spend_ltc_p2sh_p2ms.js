//litecoin
//https://chain.so/tx/LTCTEST/4471f7398a0e73f0f38af9c90cc3b9dda769100f3cf94ae20c6922b7c1d8838c
//sepnt p2 multisig 2 of 2
//2N7dpMLbrSfDh1atGEpAjfZoxzm7c1nUipw legacy
//QazaUMU6TmGn9meJrvCkkGFQ99ZRwFdHDk  segwit


const explorers = require('litecore-explorers')
const bitcoin = require('bitcoinjs-lib')
//var bitcore = require('bitcore-lib');
//const coinSelect = require('coinselect')
const util = require('util')
const FEE = 100000

async function sweep(from, key, to){
    let litecore = explorers.litecore
    //let insight = new explorers.Insight('https://testnet.litecore.io', 'testnet')
    //let insight = new explorers.Insight('https://testnet.litecore.io/')
    let insight = new explorers.Insight('https://testnet.litecore.io', litecore.Networks.testnet)
    //let network = bitcoin.networks.litecoinTestnet
    //litecore.Networks.defaultNetwork = litecore.Networks.testnet
    //console.log(litecore.Networks)

    //network_litecoin_testnet
    const　ltc_testnet　=　{
　　　　messagePrefix:　'\x19Litecoin　Signed　Message:\n',
　　　　bip32:　{　//　tpub,　tprv
　　　　　　public:　0x043587cf,
　　　　　　private: 0x04358394
　　　　},
　　　　pubKeyHash:　0x6f,
　　　　scriptHash:　0xc4,　//2 start address
　　　　wif:　0xef
    }

    //let fromAddress =  litecore.Address.fromString(from, ltc_testnet).toString()
    let buffer = bitcoin.address.fromBase58Check(from)
    //var sliceString = buffer.hash.toString('hex');
    let fromAddress = new litecore.Address(buffer.hash, 'testnet', 'scripthash').toString()
    let destAddress = to

    // Validate the wallets.
    if (!litecore.Address.isValid(fromAddress)) {
        return({success: false, error: `Invalid wallet (from): ${fromAddress}`})
    }
    //if (!litecore.Address.isValid(destAddress)) {
    //    return({success: false, error: `Invalid wallet (to): ${destAddress}`})
    //}

    // Get unspent transactions
    const getUtxos = util.promisify(insight.getUtxos).bind(insight)

    let jsonUtxos = []
     await getUtxos(fromAddress).then(utxos => {
          utxos.forEach(utxo => {
              let jsonUtxo = utxo.toJSON()
              jsonUtxo.value = utxo.satoshis
              jsonUtxos.push(jsonUtxo)
          })
    });
    //console.log(jsonUtxos)

    let txb = new bitcoin.TransactionBuilder(ltc_testnet)
    let inputsValue = 0
    //inputs
    jsonUtxos.forEach( input => {
        console.log(input)
        inputsValue += input.value
        txb.addInput(input.txid, input.vout)
    })
    console.log(jsonUtxos)
    for(let k=0; k<jsonUtxos.length; k++) {
        console.log(jsonUtxos[k].value)
    }
    //let keyPair = bitcoin.ECPair.fromWIF(key, network)
    //let p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network })
    //let p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network })
    //let amountInSatoshis = litecore.Unit.fromBTC(amount).toSatoshis()

    //outputs
    let transferAmount = inputsValue - FEE
    if (transferAmount <= 0) {
        return;
    }
    console.log(inputsValue,  transferAmount, FEE )
    let outputs = [
       { address: destAddress, value: transferAmount}
    ]
    outputs.forEach( target => {
        txb.addOutput(target.address, target.value)
    })

    //spent 2 of 2 multisig p2sh-p2ms
    const keyPairs = [
        bitcoin.ECPair.fromWIF(keys[0], ltc_testnet),
        bitcoin.ECPair.fromWIF(keys[1], ltc_testnet)
    ]
    const pubkeys = keyPairs.map(x => x.publicKey)
    const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys: pubkeys, network: ltc_testnet })
    const p2sh = bitcoin.payments.p2sh({ redeem: p2ms, network: ltc_testnet })

    //sign all inputs
    for(let j= 0; j < jsonUtxos.length; j++) {
        //一個のINPUTに対して、２回署名実施
        txb.sign({
            prevOutScriptType: 'p2sh-p2ms',
            vin: j,
            keyPair: keyPairs[0],
            redeemScript: p2sh.redeem.output,
        });

        txb.sign({
            prevOutScriptType: 'p2sh-p2ms',
            vin: j,
            keyPair: keyPairs[1],
            redeemScript: p2sh.redeem.output,
        });
    }

    const tx = txb.build()
    console.log( tx.toHex() )
    //return;

    insight.broadcast(tx.toHex(), function(error, returnedTxId) {
        if (error) {
            console.log(error)
        } else {
            console.log(returnedTxId);
        }
    });

}

//from='2N7dpMLbrSfDh1atGEpAjfZoxzm7c1nUipw'
from='QazaUMU6TmGn9meJrvCkkGFQ99ZRwFdHDk'
keys=[
'cU39grwS4qnPy3aucTSqq3bdduJacNf5bfCo9ThsWgFToVuk54vJ',
'cPFij267aAFsv1VaPtDEBUBBpeFf81GVaaW9ZG7nqpodNKpf4JqQ'
]
to='mjo8pQ4yYqP6NGvjLgZ3hD3Xv5n7TdWGGh'
let result = sweep(from, keys, to)
console.log(result)

