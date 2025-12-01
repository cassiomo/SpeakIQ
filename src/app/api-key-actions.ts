'use server';

import * as fs from 'fs/promises';
import * as path from 'path';

export async function getApiKey(): Promise<string | null> {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = await fs.readFile(envPath, 'utf-8');
    const match = envFile.match(/^GEMINI_API_KEY=(.*)$/m);
    return match ? match[1] : null;
  } catch (error) {
    // .env file might not exist
    return null;
  }
}

export async function setApiKey(apiKey: string): Promise<void> {
    const envPath = path.resolve(process.cwd(), '.env');
    let newEnvFileContent = `GEMINI_API_KEY=${apiKey}\n`;
    try {
        const currentEnv = await fs.readFile(envPath, 'utf-8');
        // This will replace the existing key or add it if not present
        if (currentEnv.includes('GEMINI_API_KEY')) {
            newEnvFileContent = currentEnv.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${apiKey}`);
        } else {
            newEnvFileContent = `${currentEnv}\nGEMINI_API_KEY=${apiKey}\n`;
        }
        
    } catch (error) {
        // .env doesn't exist, we will create it
    }
    await fs.writeFile(envPath, newEnvFileContent);
}
