
//A hashmap class that hashes prompt strings, stores the hash key in a map, and stores the prompt and reply as the json value.
// The hashmap is stored in a file, and the file is read into memory when the hashmap is instantiated.

import * as fs from "fs";
import * as util from "util";
import * as crypto from "crypto";
import * as path from "path";
import {LocalStorage} from "node-localstorage";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);

export class HashmapStore {
    private _localStorage : LocalStorage;
    private _hashmapFile : string;

    constructor(hashmapFile : string) {
        //get the parent directory of the hashmap file
        this._localStorage = new LocalStorage(hashmapFile);
        this._hashmapFile = hashmapFile;
    }

    public async putEmbedding(prompt : string, embedding : Array<number>) : Promise<void> {
        let hash = crypto.createHash('sha256').update(prompt).digest('hex');
        let obj = {prompt: prompt, reply: embedding, type:'embedding'};
        this._localStorage.setItem(hash, JSON.stringify(obj));
    }

    //Hashes the prompt string and stores the prompt and reply in the hashmap.
    public async putCompletion(prompt : string, reply : string) : Promise<void> {
        let hash = crypto.createHash('sha256').update(prompt).digest('hex');
        let obj = {prompt: prompt, reply: reply, type:'completion'};
        this._localStorage.setItem(hash, JSON.stringify(obj));
    }

    //Hashes the prompt string and returns the object if it exists in the hashmap.
    public async get(prompt : string) : Promise<any> {
        let hash = crypto.createHash('sha256').update(prompt).digest('hex');
        let obj = JSON.parse(this._localStorage.getItem(hash));
        return obj;
    }

    //Hashes the prompt string and returns the reply if it exists in the hashmap.
    public async getReply(prompt : string) : Promise<string> {
        let hash = crypto.createHash('sha256').update(prompt).digest('hex');
        let obj = JSON.parse(this._localStorage.getItem(hash));
        if (obj) {
            return obj['reply'];
        } else {
            return null;
        }
    }

    //Hashes the prompt string and deletes the prompt and reply from the hashmap.
    public async delete(prompt : string) : Promise<void> {
        let hash = crypto.createHash('sha256').update(prompt).digest('hex');
        this._localStorage.removeItem(hash);
    }

    //Returns the number of entries in the hashmap.
    public async size() : Promise<number> {
        return this._localStorage.length;
    }

}