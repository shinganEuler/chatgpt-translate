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

export async function translateWithOpenAI(
    OPENAI_API_KEY: string,
    message: string,
    openai_url: string,
    model: string,
    target_langualge: string
): Promise<string> {
    const data = {
        model: model,
        messages: [
            { role: 'system', content: "translate all my input to " + target_langualge },
            { role: 'user', content: message }
        ],
        temperature: 0,
    };

    try {
        const parsedUrl = url.parse(openai_url, true);
        const hostname = parsedUrl.hostname;
        const pathname = (parsedUrl.pathname || "") + (parsedUrl.search || "");

        const options: https.RequestOptions = {
            hostname: hostname,
            path: pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        };

        const response: OpenAIResponse = await new Promise((resolve, reject) => {
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
                        reject(new Error(`Failed to parse openai response: ${error.message}`));
                    }
                });
            });
            req.on('error', (error: any) => {
                reject(new Error(`Request openai failed: ${error.message}`));
            });
            req.write(JSON.stringify(data));
            req.end();
        });

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

export async function translateWithAzureOpenAI(
    AZURE_KEY: string,
    message: string,
    azure_openai_url: string,
    target_langualge: string
): Promise<string> {
    const data = {
        messages: [
            { role: 'system', content: "translate all my input to " + target_langualge },
            { role: 'user', content: message }
        ],
        temperature: 0,
    };

    try {
        const parsedUrl = url.parse(azure_openai_url, true);
        const hostname = parsedUrl.hostname;
        const pathname = (parsedUrl.pathname || "") + (parsedUrl.search || "");

        const options: https.RequestOptions = {
            hostname: hostname,
            path: pathname,
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "api-key": AZURE_KEY,
            }
        };

        const response: OpenAIResponse = await new Promise((resolve, reject) => {
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
                        reject(new Error(`Failed to parse Azure OpenAI response: ${error.message}`));
                    }
                });
            });
            req.on('error', (error: any) => {
                reject(new Error(`Request Azure OpenAI failed: ${error.message}`));
            });
            req.write(JSON.stringify(data));
            req.end();
        });

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

