#!/usr/bin/python3.6

from hash_util import ripemd160,hash160,hash256,dhash256
from base58 import b58encode,b58encode_check,b58decode
import binascii

filepath = 'btc.txt'
with open(filepath) as fp:
   line = fp.readline()
   while line:
       #print(line.strip())
       address = line.strip()
       addressHash = b58decode(address)
       pubkeyHash = addressHash.hex()[2:42]

       data = pubkeyHash
       version='26'
       #version='00'
       data=version+data

       checksum=dhash256(bytes.fromhex(data))
       checksum=checksum.hex()[0:8]
       addressHash=data+checksum

       address=b58encode(bytes.fromhex(addressHash))
       print(line.strip(), address.decode('utf-8'))
       line = fp.readline()
