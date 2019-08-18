tx_hex="$@"

#curl -X POST -d "tx_hex=${tx_hex}" https://chain.so/api/v2/send_tx/BTCTEST
#echo

raw_hex="${tx_hex}"
curl -X GET  https://blockstream.info/testnet/api/broadcast?tx=${raw_hex}
echo ''





