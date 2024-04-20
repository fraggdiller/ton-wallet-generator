import fs from 'node:fs/promises';
import path from 'node:path';


export default class Filehandler {

    public static async readFile (filePath: string): Promise<string> {
        try {
            await fs.access(filePath);
        } catch {
            throw Error(`File doesn't exist: ${filePath}`);
        }
        return fs.readFile(filePath, 'utf-8');
    };

    public static async loadFile (filePath: string): Promise<string[]> {
        filePath = path.join(process.cwd(), filePath);

        const data: string = await this.readFile(filePath);
        return data.split('\n')
            .map((line: string): string => line.replace(/\r/g, '').trim())
            .filter((line: string): boolean => line !== '');
    };

    public static async writeFile (filePath: string, new_data: string, rewrite?: boolean): Promise<void> {
        try {
            if (rewrite) {
                await fs.writeFile(filePath, new_data);
            } else {
                let existingData: string = '';
                try {
                    existingData = await this.readFile(filePath);
                } catch {
                    /* do nothing */
                }

                const updatedData: string = existingData + '\n' + new_data;

                await fs.writeFile(filePath, updatedData);
            }
        } catch (e) {
            throw Error(`Произошла ошибка при записи в файл ${filePath}: ${e}`);
        }
    };

    public static async createFile (filePath: string, data: string): Promise<void> {
        try {
            const file: fs.FileHandle = await fs.open(filePath, 'wx');
            await file.writeFile(data);
            await file.close();
        } catch (e) {
            if (e.code === 'EEXIST') {
                return;
            } else {
                throw Error(`Произошла ошибка при создании файла ${filePath}: ${e}`);
            }
        }
    };

    public static async mkDir (dirPath: string): Promise<void> {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath);
        }
    };

    public static async rename (path: string, newPath: string): Promise<void> {
        try {
            await fs.access(path);
            await fs.rename(path, newPath);
        } catch {
            /* do nothing */
        }
    };
}