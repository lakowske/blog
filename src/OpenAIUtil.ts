import {Configuration, OpenAIApi} from "openai";
import {HashmapStore} from "./HashmapStore.js";
import {LocalStorage} from "node-localstorage";

export function openAIAPI() : OpenAIApi {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    return new OpenAIApi(configuration);
}

export class OpenAIContext {
    openai: OpenAIApi;
    hashmapStore: HashmapStore;


    constructor(openai: OpenAIApi, hashmapStore: HashmapStore) {
        this.openai = openai;
        this.hashmapStore = hashmapStore;
    }

    //Get the prompt embedding from OpenAI.  Use the hashmap to store the prompt and its embedding.  If the prompt is already in the hashmap, then return the embedding from the hashmap.
    async getCachedEmbedding(input: string) : Promise<Array<number>> {
        let embeddingReply = await this.hashmapStore.get(input);
        if (embeddingReply == null) {
            let embedding = await this.getEmbedding(input);
            await this.hashmapStore.putEmbedding(input, embedding);
            return embedding;
        } else {
            return embeddingReply.reply;
        }

    }

    //Get the embedding from OpenAI.
    async getEmbedding(input: string) : Promise<Array<number>> {
        const response = await this.openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: input
        });
        if (response.status == 200) {
            return response.data.data[0].embedding;
        } else {
            throw new Error("Error getting embedding");
        }
    }

    // Get prompt reply from OpenAI.  Use the hashmap to cache the prompt replies.  Only call OpenAI if the prompt is not in the hashmap.
    async getReply(prompt: string) : Promise<string> {
        let reply = await this.hashmapStore.getReply(prompt);
        if (reply == null) {
            console.log('Prompt not cached.  Calling OpenAI');
            reply = await this.getOpenAICompletion(prompt);
            await this.hashmapStore.putCompletion(prompt, reply);
        } else {
            console.log('Prompt cached.  Using cached value');
        }
        return reply;
    }

    // Call OpenAI to get a reply to the prompt.
    async getOpenAICompletion(prompt: string) : Promise<string> {
        try {
            const response = await this.openai.createCompletion({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 2048,
                temperature: 0
            });
            if (response.status == 200) {
                return response.data.choices[0].text;
            } else {
                throw new Error("Error getting summary");
            }
        } catch (error) {
            console.log(error);
        }
    }


}