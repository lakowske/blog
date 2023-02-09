// @ts-ignore
import test from 'node:test'
import {
    indexMemorySize,
    loadIndexFromCache,
    prepareContent,
    storeIndex
} from "./ContentUtils.js";

test('test caching', async (t) => {
    const cacheDir = '../cache';
    const contentDir = '../public';
    let index = await prepareContent(contentDir, null);
    let contentSize = indexMemorySize(index);
    let kb = contentSize / 1024;
    let mb = kb / 1024;
    //round mb to 2 decimal places
    mb = Math.round(mb * 100) / 100;
    console.log(mb + 'MB of content indexed');

    await storeIndex(index, cacheDir);
    await loadIndexFromCache(contentDir, cacheDir);


})

test('envVariable', () => {
    // Check if PORT is set
    if (process.env.PORT == null) {
        console.log('Port is not set');
    } else {
        console.log('Port is set');
        console.log(process.env.PORT);
    }
});