// @ts-ignore
import test from 'node:test';
import * as fs from "fs";
import * as util from "util";



test('watch public directory', async (t) => {

    const watcher = fs.watch('../public', (eventType, filename) => {
        console.log(`event type is: ${eventType}`);
        if (filename) {
            console.log(`filename provided: ${filename}`);
        } else {
            console.log('filename not provided');
        }
    });
});