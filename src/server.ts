import {createServer} from 'http';
import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import {Content} from "./Content.js";
import {indexMemorySize, prepareContent} from "./ContentUtils.js";

dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function runServer(index : Map<string, Content>) {
    //If PORT env is set, then use that port, otherwise use 8090
    let portString = process.env.PORT;
    let port = 8090;
    if (portString != null) {
        port = parseInt(portString);
    }

    createServer(function (req, res) {
        let content = parseRequest(req, index);
        if (content == null) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 Not Found');
        } else {
            const mimeType = content.getMimeType();
            res.writeHead(200, {'Content-Type': mimeType});
            let data = content.get();
            res.end(data);
        }
    }).listen(port);
}

//Check the request url and route it to the appropriate handler function
function parseRequest(req, index : Map<string, Content>) {
    let url = req.url;
    console.log(url);
    //get the relative path from the url
    let relativePath = url.substring(1);
    //if the url is a slash, then relativePath is /about/index.html
    if (relativePath == '') {
        relativePath = 'about/index.html';
    }

    //Check if the url end with a slash
    if (relativePath.endsWith('/')) {
        //If it does, then add index.html to the end
        relativePath += 'index.html';
    }


    let content = index.get(relativePath);
    if (content == null) {
        return null;
    }

    return content;
}


async function main() {
    //return prepareContent('../public', openai);
    return prepareContent('../public', null);
}

main().then(function (index) {
    console.log(indexMemorySize(index));
    runServer(index);
});