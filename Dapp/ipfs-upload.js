import { create } from 'kubo-rpc-client';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config("./.env");

// connect to ipfs daemon API server
const ipfs = create(new URL(process.env.IPFS_URL));

export async function uploadFileToIpfs(filePath) {
    try {
        const file = fs.readFileSync(filePath);
        const result = await ipfs.add({ path: filePath, content: file });
        console.log(result);
        return result;
    } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        throw error;
    }
}

export async function uploadJsonToIpfs(json) {
    try {
        const buffer = Buffer.from(JSON.stringify(json));
        const result = await ipfs.add(buffer);
        console.log('IPFS upload result:', result);
        return result;
    } catch (error) {
        console.error('Error uploading JSON to IPFS:', error);
        throw error;
    }
}