import {createServer} from 'http';
import * as fs from 'fs';
import * as path from 'path';
import {config} from 'dotenv';
import {Content, LoadContext} from "./Content.js";
import {indexMemorySize, prepareContent} from "./ContentUtils.js";

/**
 * A simple http server that serves blog content.  The blog content
 * is indexed and cached in memory.  The server routes requests to the
 * appropriate content object in memory.  Content has some related links
 * that are dynamically added to the html content objects.
 */


/**
 * A function that runs a Content server
 * @param {Map<String, Content>} index - a map of content objects
 * @returns {void}
 */
function runServer(index : Map<string, Content>) {
    //If PORT env is set, then use that port, otherwise use 8090
    let portString = process.env.PORT;
    let port = 8090;
    if (portString != null) {
        port = parseInt(portString);
    }

    createServer(async function (req, res) {
        let content = parseRequest(req, index);
        if (content == null) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
            res.end('404 Not Found');
        } else {
            const mimeType = content.getMimeType();
            res.writeHead(200, {'Content-Type': mimeType});
            let data = await content.get();
            res.end(data);
        }
    }).listen(port);
}

/**
 * Check the request url and route it to the appropriate handler function
 * @param {Request} req - a request object
 * @param index - a map of content objects
 * @returns {Promise<null|Content>} - a promise that resolves to a content object or null
 */
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

/**
 * Preprocess the content
 * @returns {Promise<Map<string, Content>>} - a promise that resolves to a map of content objects
 */
async function preprocessContent() {
    //return prepareContent('../public', openai);
    const loadContext = new LoadContext('../public', '../cache');
    return prepareContent(loadContext);
}

/**
 * Dump the content to a directory so that it can be served by a static file server.
 * @param {Map<string, Content>} index - a map of content objects
 * @param {string} dir - the directory to dump the content to
 * @returns {Promise<void>} - a promise that resolves to void
 */
async function dumpContent(index : Map<string, Content>, dir : string) {
    let entries = index.entries();
    for (let entry of entries) {
        let content = entry[1];
        let filePath = path.join(dir, content.relativePath);
        let data = await content.get();
        fs.mkdirSync(path.dirname(filePath), {recursive: true});
        fs.writeFileSync(filePath, data);
    }
}

// Load the environment variables
config();

// Parse the command line arguments to determine the action to take
const args = process.argv.slice(2);
if (args.length == 0) {
    console.log('Usage: node src/server.js [dump|serve]');
    process.exit(1);
}

// Prepare the content then take action on the content
preprocessContent().then(function (index) {
    console.log(indexMemorySize(index));
    const action = args[0];
    if (action == 'dump') {
        dumpContent(index, '../dump').then(function () {
            console.log('Content dumped to ../dump');
        });
    } else if (action == 'serve') {
        runServer(index);
    }
});