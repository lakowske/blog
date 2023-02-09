
/*
A Content object stores the contents of the file in a string if it's an html file, css file, or js file.
If it's a binary file, it stores the contents in a buffer. It also stores the file's last modified date, and the file's size in bytes.
 */
import * as fs from "fs";
import * as util from "util";
import mime from "mime";
import JSDOM from "jsdom";
import * as path from "path";

const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);


export class Content {

    public contents : any;

    public file : string;

    public relativePath : string;

    public type : string;

    public lastModified : Date;

    public size : number;

    public htmlAttributes : Map<string, string>;

    public jsdom : JSDOM.JSDOM;

    constructor(file : string, relativePath : string) {
        this.file = file;
        this.relativePath = relativePath;
        this.type = file.split('.').pop();
        this.htmlAttributes = new Map<string, string>();
    }

    public get() : Promise<any> {
        if (this.contents == null) {
            this.contents = '';
        } if (this.jsdom != null) {
            return this.jsdom.serialize();
        }

        return this.contents;
    }

    public async load(openai) : Promise<any> {
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
                this.htmlAttributes.set('title', title[0].textContent);
            }
            if (openai != null) {
                let response = await this.getEmbedding(openai);
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
            return `<a href="/${this.relativePath}">${this.htmlAttributes.get('title')}</a>`;
        } else {
            return `<a href="/${this.relativePath}">${this.relativePath}</a>`;
        }
    }

    public async getEmbedding(openai) : Promise<any> {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: this.htmlAttributes.get('title')
        });
        return response;
    }

    public addRelated(links : string[]) {
        let document = this.jsdom.window.document;
        let related = document.getElementById('related');
        if (related != null) {
            for (let link of links) {
                related.innerHTML += '<tr><td>' + link + '</td></tr>';
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
            htmlAttributes: this.htmlAttributes,
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
        this.htmlAttributes = metadata.htmlAttributes;
        this.file = metadata.file;
        if (this.type == 'html') {
            this.contents = await readFile(this.getCachedPath(dir), 'utf8');
            this.jsdom = new JSDOM.JSDOM(this.contents);
        } else {
            await this.load(null);
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