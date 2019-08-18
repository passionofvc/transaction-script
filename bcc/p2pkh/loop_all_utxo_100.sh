COUNTER=0
while [ $COUNTER -lt 100 ]; do
    node spend_bcc_p2pkh.js
    sleep 1
    let COUNTER=COUNTER+1
done;

