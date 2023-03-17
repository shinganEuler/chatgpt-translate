export declare function translateWithOpenAI(OPENAI_API_KEY: string, message: string, openai_url: string, model: string, target_langualge: string): Promise<string>;
export declare function translateWithAzureOpenAI(AZURE_KEY: string, message: string, azure_openai_url: string, target_langualge: string): Promise<string>;
