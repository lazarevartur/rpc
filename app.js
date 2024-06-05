import express from 'express';
import { ethers } from 'ethers';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8545;
const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;

const app = express();
app.use(bodyParser.json());

const allowedAddresses = ['0xF3Bc8C5F2A857d68D5809f02352C9d73656d74D4'].map(
    (item) => item.toLowerCase()
);

function isAddressAllowed(address) {
  return allowedAddresses.includes(address.toLowerCase());
}

app.get('/', async (req, res) => {
    res.json({message: 'Hello World!'});
})

app.post('/', async (req, res) => {
  const { method, params, id } = req.body;
  console.log('REQ =>', { method, params, id });

  try {
      if (method === 'eth_sendRawTransaction') {
          const rawTx = ethers.utils.parseTransaction(params[0]);
          if (!isAddressAllowed(rawTx.from)) {
              console.error('Address not allowed')
              throw new Error('Address not allowed');
          }
      }

      if (method === 'eth_sendTransaction') {
          if (!isAddressAllowed(params[0].from)) {
              console.error('Address not allowed')
              throw new Error('Address not allowed');
          }
      }

    const { data } = await axios.post(sepoliaRpcUrl, req.body);
    console.log('RESP =>', data);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      error: { code: -1, message: error.message },
      id: id
    });
  }
});

app.listen(port, () => {
  console.log(`Custom Ethereum RPC server listening at http://localhost:${port}`);
});