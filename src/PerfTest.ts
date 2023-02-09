import * as assert from "assert";
// @ts-ignore
import test from 'node:test';

async function makeRequest() {
  //Request the root of the server
  let response = await fetch('http://localhost:8099');
  //Read the response as text
  let text = await response.text();
  //Print the response
  //console.log(text);
  if(text == 'We re back!') {}
  else throw new Error("Unexpected response");
}

async function storeContent() {

}

//Measure the time it takes to make the request 1000 times
console.time('10000 requests');
for (let i = 0; i < 10000; i++) {
    makeRequest();

}
console.timeLog('10000 requests');
