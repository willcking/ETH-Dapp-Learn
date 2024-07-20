import { ethers, JsonRpcProvider } from "ethers";
import fs from 'fs';
import dotenv from 'dotenv';
import { hash } from "crypto";
dotenv.config("./.env");


//const provider = new JsonRpcProvider(process.env.TEST_RPC); 
const provider = new JsonRpcProvider(process.env.ALCHEMy_ETH_SEPOLIA + process.env.API_KEY);


const signer = await provider.getSigner();
const contractAddress = process.env.CNFT_ADDRESS;
const abi = JSON.parse(fs.readFileSync("./abis/cnft.json"));
const contract = new ethers.Contract(contractAddress, abi, signer);

export async function mint(to, uri) {
    const result = await contract.safeMint(to, uri);
    console.log(result.hash);
};