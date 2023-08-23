import * as url from 'url';
import * as https from 'https';

interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: OpenAIResponseChoice[];
    usage: OpenAIResponseUsage;
}

interface OpenAIResponseChoice {
    index: number;
    finish_reason: string;
    message: OpenAIResponseMessage;
}

interface OpenAIResponseMessage {
    role: string;
    content: string;
}

interface OpenAIResponseUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

async function requestAPI(apiUrl: string, data: any, headers: Record<string, string>): Promise<OpenAIResponse> {
    const parsedUrl = url.parse(apiUrl, true);
    const hostname = parsedUrl.hostname;
    const pathname = (parsedUrl.pathname || "") + (parsedUrl.search || "");

    const options: https.RequestOptions = {
        hostname: hostname,
        path: pathname,
        method: 'POST',
        headers: headers
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res: any) => {
            let body = '';
            res.setEncoding('utf8');
            res.on('data', (chunk: any) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(body) as OpenAIResponse;
                    resolve(response);
                } catch (error: any) {
                    reject(new Error(`Failed to parse API response: ${error.message}`));
                }
            });
        });

        req.on('error', (error: any) => {
            reject(new Error(`Request to API failed: ${error.message}`));
        });

        req.write(JSON.stringify(data));
        req.end();
    });
}

function constructData(message: string, targetLanguage: string, model?: string): any {
    return {
        model: model,
        messages: [
            { role: 'system', content: `Please provide a straightforward translation of the following contents into ${targetLanguage}. Do not add any extra information or context.` },
            { role: 'user', content: message }
        ],
        temperature: 0,
    };
}

export async function translateWithOpenAI(OPENAI_API_KEY: string, message: string, openai_url: string, model: string, targetLanguage: string): Promise<string> {
    try {
        const data = constructData(message, targetLanguage, model);
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        };

        const response = await requestAPI(openai_url, data, headers);

        if (response.choices.length === 0) {
            throw new Error('Openai no response choices found');
        }

        const content = response.choices[0].message.content;

        if (content.trim() === '') {
            throw new Error('Openai response content is empty');
        }

        return content;
    } catch (error: any) {
        throw new Error(`Failed to get OpenAI response: ${error.message}`);
    }
}

export async function translateWithAzureOpenAI(AZURE_KEY: string, message: string, azure_openai_url: string, targetLanguage: string): Promise<string> {
    try {
        const data = constructData(message, targetLanguage);
        const headers = {
            'Content-Type': 'application/json',
            'api-key': AZURE_KEY,
        };

        const response = await requestAPI(azure_openai_url, data, headers);

        if (response.choices.length === 0) {
            throw new Error('Azure OpenAI no response choices found');
        }

        const content = response.choices[0].message.content;

        if (content.trim() === '') {
            throw new Error('Azure OpenAI response content is empty');
        }

        return content;
    } catch (error: any) {
        throw new Error(`Failed to get Azure OpenAI response: ${error.message}`);
    }
}
