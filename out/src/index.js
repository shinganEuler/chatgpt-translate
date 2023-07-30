"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateWithAzureOpenAI = exports.translateWithOpenAI = void 0;
const url = require("url");
const https = require("https");
function translateWithOpenAI(OPENAI_API_KEY, message, openai_url, model, target_langualge) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const options = {
                hostname: hostname,
                path: pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                }
            };
            const response = yield new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let body = '';
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(body);
                            resolve(response);
                        }
                        catch (error) {
                            reject(new Error(`Failed to parse openai response: ${error.message}`));
                        }
                    });
                });
                req.on('error', (error) => {
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
        }
        catch (error) {
            throw new Error(`Failed to get OpenAI response: ${error.message}`);
        }
    });
}
exports.translateWithOpenAI = translateWithOpenAI;
function translateWithAzureOpenAI(AZURE_KEY, message, azure_openai_url, target_langualge) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const options = {
                hostname: hostname,
                path: pathname,
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "api-key": AZURE_KEY,
                }
            };
            const response = yield new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let body = '';
                    res.setEncoding('utf8');
                    res.on('data', (chunk) => {
                        body += chunk;
                    });
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(body);
                            resolve(response);
                        }
                        catch (error) {
                            reject(new Error(`Failed to parse Azure OpenAI response: ${error.message}`));
                        }
                    });
                });
                req.on('error', (error) => {
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
        }
        catch (error) {
            throw new Error(`Failed to get Azure OpenAI response: ${error.message}`);
        }
    });
}
exports.translateWithAzureOpenAI = translateWithAzureOpenAI;
//# sourceMappingURL=index.js.map