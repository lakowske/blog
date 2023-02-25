/*
A Content object stores the contents of the file in a string if it's an html file, css file, or js file.
If it's a binary file, it stores the contents in a buffer. It also stores the file's last modified date, and the file's size in bytes.
 */
import * as fs from "fs";
import * as util from "util";
import mime from "mime";
import JSDOM from "jsdom";
import * as path from "path";
import {OpenAIApi} from "openai";
import {OpenAIContext} from "./OpenAIUtil.js";

const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

export class LoadContext {
    public openai : OpenAIApi;
    public cacheDir : string;
    public contentDir: string;
    public openaiContext: OpenAIContext;

    constructor(contentDir : string, cacheDir : string, openaiContext : OpenAIContext) {
        this.contentDir = contentDir;
        this.cacheDir = cacheDir;
        this.openaiContext = openaiContext;
    }

    public async getTitleEmbedding(content : Content) : Promise<Array<number>> {
        return this.openaiContext.getCachedEmbedding(content.contentAttributes.get('title'));
    }

    public async getSummary(content : Content) : Promise<string> {
        if (content.type === 'html') {
            const prompt = "Summarize the html document:\n\n" + await content.get();
            return await this.openaiContext.getReply(prompt);
        } else {
            return '';
        }
    }
}

export class Content {

    public contents : any;

    public file : string;

    public relativePath : string;

    public type : string;

    public lastModified : Date;

    public size : number;

    public contentAttributes : Map<string, string>;

    public embeddings : Map<string, Array<number>>;

    public jsdom : JSDOM.JSDOM;

    public useCache : boolean;

    constructor(file : string, relativePath : string, useCache : boolean) {
        this.file = file;
        this.relativePath = relativePath;
        this.type = file.split('.').pop();
        this.contentAttributes = new Map<string, string>();
        this.embeddings = new Map<string, Array<number>>();
        this.useCache = useCache;
    }

    public async get() : Promise<any> {
        if (this.contents == null) {
            this.contents = '';
        } else if (this.useCache == false) {
            return await this.load();
        } else if (this.jsdom != null) {
                return this.jsdom.serialize();
        }

        return this.contents;
    }

    public async load() : Promise<any> {
        const statInfo = await stat(this.file);
        this.lastModified = statInfo.mtime;
        this.size = statInfo.size;
        let content : any;
        if (this.type == 'html') {
            content = await readFile(this.file, 'utf8');
            this.jsdom = new JSDOM.JSDOM(content);
            const document = this.jsdom.window.document;
            const title = document.getElementsByTagName('title');
            if (title.length > 0) {
                this.contentAttributes.set('title', title[0].textContent);
            }
        } else if (this.type == 'css' || this.type == 'js') {
            content = await readFile(this.file, 'utf8');
        } else {
            content = await readFile(this.file)
        }
        this.contents = content;
        return content;
    }

    public getMimeType() : string {
        return mime.getType(this.type);
    }

    public getMetadataPath(dir : string) : string {
        return dir + '/' + this.relativePath + '.json';
    }

    public getCachedPath(dir : string) : string {
        return dir + '/' + this.relativePath;
    }

    public getLink() : string {
        if (this.type == 'html') {
            return `<a class="articleLink" href="/${this.relativePath}">${this.contentAttributes.get('title')}</a>`;
        } else {
            return `<a href="/${this.relativePath}">${this.relativePath}</a>`;
        }
    }

    public addRelated(links : string[]) {
        let document = this.jsdom.window.document;
        let relatedTable = document.getElementById('related');
        if (relatedTable != null) {
            //Add a table of links to related element
            let tbody = document.createElement('tbody');
            relatedTable.appendChild(tbody);


            for (let link of links) {
                let tr = document.createElement('tr');
                let td = document.createElement('td');
                td.innerHTML = link;
                tr.appendChild(td);
                tbody.appendChild(tr);
            }

        }
    }

    //Store the contents and save the metadata to files
    public async cache(dir : string) : Promise<any> {
        //Only store the contents if it's a html file, otherwise we use the original file
        if (this.type != 'html') {
            return;
        }

        this.contents = this.jsdom.serialize();
        const contentPath = this.getCachedPath(dir);
        //create the parent directories if they don't exist
        const parentDir = path.dirname(contentPath);
        await mkdir(parentDir, {recursive: true});
        await writeFile(contentPath, this.contents);


        let metadata = {
            lastModified: this.lastModified,
            size: this.size,
            contentAttributes: this.contentAttributes,
            embeddings: this.embeddings,
            file: this.file
        }

        //write the metadata to a file
        const metadataPath = this.getMetadataPath(dir);
        writeFile(metadataPath, JSON.stringify(metadata));
    }

    //Load cached contents and metadata from files
    public async loadFromCache(dir : string) : Promise<any> {
        const metadataPath = this.getMetadataPath(dir);
        const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
        this.lastModified = new Date(metadata.lastModified);
        this.size = metadata.size;
        this.contentAttributes = metadata.contentAttributes;
        this.embeddings = metadata.embeddings;
        this.file = metadata.file;
        if (this.type == 'html') {
            this.contents = await readFile(this.getCachedPath(dir), 'utf8');
            this.jsdom = new JSDOM.JSDOM(this.contents);
        } else {
            await this.load();
        }

    }

    //Check if the cached file exists and is up to date
    public async isCached(dir : string) : Promise<boolean> {
        const metadataPath = this.getMetadataPath(dir);

        //check if the metadata file exists
        let metadataExists = true;
        try {
            let metadataStat = await stat(metadataPath);
        } catch (e) {
            return false;
        }

        await this.loadFromCache(dir);

        const statInfo = await stat(this.file);
        if (statInfo.mtime.getTime() > this.lastModified.getTime()) {
            return false;
        }

        return true;
    }
}