import express from 'express';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { uploadFileToIpfs, uploadJsonToIpfs } from './ipfs-upload.js';
import { mint } from './nft-minter.js';
import dotenv from 'dotenv';
dotenv.config("./.env");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

app.get('/', (req, res) => {
    res.render("home");
});

app.post('/upload', (req, res) => {
    const title = req.body.title;
    const description = req.body.description;

    const file = req.files.file;
    const fileName = file.name;
    const filePath = "files/" + fileName; 
    
    
    file.mv(filePath, async (err) => {
        if(err) {
            console.log(err);
            res.status(500).send("error occured");
        }

        const fileResult = await uploadFileToIpfs(filePath);
        const fileCid = fileResult.cid.toString();
        const metadata = {
            title: title,
            description: description,
            image: 'http://127.0.0.1:8080/ipfs/' + fileCid
        }

        const metadataResult = await uploadJsonToIpfs(metadata);
        const metadataCid = metadataResult.cid.toString();

        await mint("{user address}", "http://127.0.0.1:8080/ipfs/" + metadataCid);

        res.json(
            {
                message: "file upload successfully",
                metadata: metadata
            }
        )
    });

});

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
});
