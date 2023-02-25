import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import {Content, LoadContext} from "./Content.js";

const readDir = util.promisify(fs.readdir);
const stat = util.promisify(fs.stat);

//Given a directory, return a list of all the files in the directory with absolute paths
export async function getListOfFiles(dir : string) : Promise<string[]> {
    let files = await readDir(dir);
    let fileList = [];
    for (let file of files) {
        let fullPath = path.join(dir, file);
        let statInfo = await stat(fullPath);
        if (statInfo.isDirectory()) {
            let subFiles = await getListOfFiles(fullPath);
            fileList = fileList.concat(subFiles);
        } else {
            fileList.push(fullPath);
        }
    }

    return fileList;

}

export async function indexFiles(dir : string) : Promise<Map<string, Content>> {
    const contents = await getListOfContent(dir);
    let index = new Map<string, Content>();

    for (let content of contents) {
        index.set(content.relativePath, content);
    }

    return index;
}

export async function getListOfContent(dir : string) : Promise<Content[]> {
    const files = await getListOfFiles(dir);

    let contents = [];
    for (let file of files) {
        //get the relative path of the file
        let relativePath = path.relative(dir, file);

        let content = new Content(file, relativePath, false);
        contents.push(content);
    }

    return contents;
}


export async function cacheIndex(index : Map<string, Content>, loadContext : LoadContext) : Promise<Map<string, Content>> {
    let entries = index.entries()

    for (let entry of entries) {
        let content = entry[1];
        await content.load();
    }

    return index;
}


export function getHtmlLinks(index : Map<string, Content>) {
    let entries = index.entries();
    let links = [];
    for (let entry of entries) {
        let content = entry[1];
        if (content.getMimeType() == 'text/html') {
            links.push(content.getLink());
        }
    }

    return links;
}


function getHtmlTitles(index : Map<string, Content>) {
    let entries = index.entries();
    let titles = [];
    for (let entry of entries) {
        let content = entry[1];
        let title = content.contentAttributes.get('title');
        if (title != null) {
            titles.push(title);
        }
    }

    return titles;
}

function addRelated(index : Map<string, Content>, links : string[]) {
    let entries = index.entries();
    for (let entry of entries) {
        let content = entry[1];
        if (content.getMimeType() == 'text/html') {
            content.addRelated(links);
        }
    }

    return index;
}

export async function prepareContent(loadContext: LoadContext) {
    let index = await indexFiles(loadContext.contentDir);
    index = await cacheIndex(index, loadContext);
    let links = getHtmlLinks(index);
    index = addRelated(index, links);
    return index;
}


export function indexMemorySize(index : Map<string, Content>) {
    let entries = index.entries();
    let size = 0;
    for (let entry of entries) {
        let content = entry[1];
        size += content.size;
    }

    return size;
}

export async function storeIndex(index : Map<string, Content>, dir : string) {
    let entries = index.entries();
    for (let entry of entries) {
        let content = entry[1];
        await content.cache(dir);
    }
}

// Load the index from the cache. If the cache is not available, then return null
export async function loadIndexFromCache(contentDir : string, cacheDir : string) {
    let index = new Map<string, Content>();
    let contents = await getListOfContent(contentDir);
    for (let content of contents) {
        //If isCached is true, then load the content from the cache
        if (await content.isCached(cacheDir)) {
            index.set(content.relativePath, content);
        } else {
            await content.load();
        }
        index.set(content.relativePath, content);
    }

    return index;
}