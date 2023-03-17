import * as url from 'url';
import * as https from 'https';

interface AzureOpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        text: string;
        index: number;
        finish_reason: string;
        logprobs: null | any;
    }[];
    usage: {
        completion_tokens: number;
        prompt_tokens: number;
        total_tokens: number;
    };
}

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


async function translateWithOpenAI(
    OPENAI_API_KEY: string,
    message: string,
    openai_url: string,
    model: string,
    target_langualge: string
): Promise<string> {
    const data = {
        model: model,
        messages: [
            { role: 'user', content: "translate all my input to " + target_langualge },
            { role: 'assistant', content: "ok, I will translate all your input to " + target_langualge },
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
            throw new Error('openai No response choices found');
        }

        const content = response.choices[0].message.content;

        if (content.trim() === '') {
            throw new Error('openai Response content is empty');
        }

        return content;
    } catch (error: any) {
        throw new Error(`Failed to get OpenAI response: ${error.message}`);
    }
}

async function translateWithAzureOpenAI(
    AZURE_KEY: string,
    message: string,
    azure_openai_url: string,
    target_langualge: string
): Promise<string> {
    const messages = [
        { role: 'user', content: "translate all my input to " + target_langualge },
        { role: 'assistant', content: "ok, I will translate all your input to " + target_langualge },
        { role: 'user', content: message }
    ];

    let azure_messages = [];

    for (var i = 0; i < messages.length; ++i) {
        let role = messages[i].role;
        let content = messages[i].content;
        azure_messages.push(`<|im_start|>${role}\n${content}\n<|im_end|>`);
    }

    let prompt = azure_messages.join("\n") + "<|im_start|>assistant";

    let data = {
        "prompt": prompt,
        "max_tokens": 2048,
        "temperature": 0,
        "stop": ["<|im_end|>"]
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

        const response: AzureOpenAIResponse = await new Promise((resolve, reject) => {
            const req = https.request(options, (res: any) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk: any) => {
                    body += chunk;
                });
                res.on('end', () => {
                    try {
                        const response = JSON.parse(body) as AzureOpenAIResponse;
                        resolve(response);
                    } catch (error: any) {
                        reject(new Error(`Failed to parse azure openai response: ${error.message}`));
                    }
                });
            });
            req.on('error', (error: any) => {
                reject(new Error(`Request azure openai failed: ${error.message}`));
            });
            req.write(JSON.stringify(data));
            req.end();
        });

        if (response.choices.length === 0) {
            throw new Error('azure openai No response choices found');
        }

        const content = response.choices[0].text;

        if (content.trim() === '') {
            throw new Error('azure openai Response content is empty');
        }

        return content;
    } catch (error: any) {
        throw new Error(`Failed to get Azure OpenAI response: ${error.message}`);
    }
}

module.exports = {
    translateWithOpenAI,
    translateWithAzureOpenAI
};
