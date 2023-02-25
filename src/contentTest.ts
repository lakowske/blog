// @ts-ignore
import test from 'node:test'
import {
    getListOfContent,
    indexMemorySize,
    loadIndexFromCache,
    prepareContent,
    storeIndex
} from "./ContentUtils.js";
import {LoadContext} from "./Content.js";
import {Configuration, OpenAIApi} from "openai";
import {OpenAIContext, openAIAPI} from "./OpenAIUtil.js";
import {HashmapStore} from "./HashmapStore.js";
/*
test('test caching', async (t) => {
    const cacheDir = '../cache';
    const contentDir = '../public';
    const loadContext = new LoadContext(contentDir, cacheDir, null);
    let index = await prepareContent(loadContext);
    let contentSize = indexMemorySize(index);
    let kb = contentSize / 1024;
    let mb = kb / 1024;
    //round mb to 2 decimal places
    mb = Math.round(mb * 100) / 100;
    console.log(mb + 'MB of content indexed');

    await storeIndex(index, cacheDir);
    await loadIndexFromCache(contentDir, cacheDir);


})
*/

test('envVariable', () => {
    // Check if PORT is set
    if (process.env.PORT == null) {
        console.log('Port is not set');
    } else {
        console.log('Port is set');
        console.log(process.env.PORT);
    }
    // Check if OPENAI_API_KEY is set
    if (process.env.OPENAI_API_KEY == null) {
        console.log('OpenAI API Key is not set');
    } else {
        console.log('OpenAI API Key is set');
        console.log(process.env.OPENAI_API_KEY);
    }
});

test('test embeddings', async (t) => {

    const cacheDir = '../cache';
    const contentDir = '../public';
    let openaiAPI = openAIAPI();
    let openaiContext = new OpenAIContext(openaiAPI, new HashmapStore('../cache/promptHash.json'));

    const loadContext = new LoadContext(contentDir, cacheDir, openaiContext);
    //let index = await prepareContent(loadContext);
    const contents = await getListOfContent(contentDir);
    for (let i = 0; i < contents.length; i++) {
        const content = contents[i];
        await content.load();
        const summary = await loadContext.getSummary(content);
        console.log(content.contentAttributes);
        console.log(content.embeddings);
    }




    //const embedding = await loadContext.getTitleEmbedding(content);


});

