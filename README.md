# openai-translate

Translate use chatgpt api.

## Usage

### for openai api

```
export async function translateWithOpenAI(
    OPENAI_API_KEY: string,         // your openai api key, get from https://platform.openai.com/account/api-keys
    message: string,                // message to translate
    openai_url: string,             // openai api url, like https://api.openai.com/v1/chat/completions
    model: string,                  // model to use, like "gpt-3.5-turbo"
    target_langualge: string        // target language, like "zh-cn", get from https://cloud.google.com/translate/docs/languages
): Promise<string>
```

### for azure openai api

```
async function translateWithAzureOpenAI(
    AZURE_KEY: string,              // your azure openai key
    message: string,
    azure_openai_url: string,       // your custom azure openai url, like "https://YOUR_ENDPOINT_NAME.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT_NAME/chat/completions?api-version=2023-05-15"
    target_langualge: string
): Promise<string>
```
