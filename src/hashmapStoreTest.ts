// @ts-ignore
import test from 'node:test';
import {HashmapStore} from "./HashmapStore.js";
import {LocalStorage} from "node-localstorage";
import {openAIAPI, OpenAIContext} from "./OpenAIUtil.js";
import * as assert from "assert";

test('test storing and loading replies', async (t) => {
    const promptHashFile = '../cache/promptHash.json';
    const localStorage = new LocalStorage('../cache/localstorage.db');
    const hashmapStore = new HashmapStore(promptHashFile);

    const prompt = 'This is a test prompt';
    const reply = 'This is a test reply';
    localStorage.setItem(prompt,reply);
    await hashmapStore.putCompletion(prompt, reply);
    const result = await hashmapStore.getReply(prompt);
    //assert that the reply is the same as the one we stored
    assert.strictEqual(result, reply, "should be the same");
    const localResult = localStorage.getItem(prompt);
    //assert that the reply is the same as the one we stored
    assert.strictEqual(localResult, reply, "should be the same");

});

test('test openai hashmap', async (t) => {
    let openaiAPI = openAIAPI();
    let openaiContext = new OpenAIContext(openaiAPI, new HashmapStore('../cache/promptHash.json'));
    const prompt = 'Say a little about yourself';
    const reply = await openaiContext.getReply(prompt);
    console.log(reply);

});

test('test embedding with hashmap', async (t) => {
    let openaiAPI = openAIAPI();
    let openaiContext = new OpenAIContext(openaiAPI, new HashmapStore('../cache/promptHash.json'));
    const prompt = 'Say a little about yourself';
    const reply = await openaiContext.getReply(prompt);
    console.log(reply);
});