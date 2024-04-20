import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export default class Crypto {
    protected static stringToIntArray (str: string, size: number = 1): Uint8Array {
        let buffer: ArrayBuffer;
        let bufferView: Uint8Array | Uint16Array | Uint32Array;

        switch (size) {
            case 1:
                buffer = new ArrayBuffer(str.length);
                bufferView = new Uint8Array(buffer);
                break;
            case 2:
                buffer = new ArrayBuffer(str.length * 2);
                bufferView = new Uint16Array(buffer);
                break;
            case 4:
                buffer = new ArrayBuffer(str.length * 4);
                bufferView = new Uint32Array(buffer);
                break;
            default:
                throw new Error(`Incorrect size specified: ${size}`);
        }

        for (let i: number = 0, strLen: number = str.length; i < strLen; i++) {
            bufferView[i] = str.charCodeAt(i);
        }

        return new Uint8Array(bufferView.buffer);
    };

    protected static async hmacSha512 (phrase: string, password: string): Promise<ArrayBuffer> {
        const phraseBuffer: ArrayBufferLike = this.stringToIntArray(phrase).buffer;
        const passwordBuffer: ArrayBufferLike = password.length ? this.stringToIntArray(password).buffer : new ArrayBuffer(0);
        const hmacAlgo: {name: string, hash: string } = { name: 'HMAC', hash: 'SHA-512' };
        const hmacKey: CryptoKey = await crypto.subtle.importKey(
            'raw',
            phraseBuffer,
            hmacAlgo,
            false,
            ['sign']
        );
        return await crypto.subtle.sign(hmacAlgo, hmacKey, passwordBuffer);
    };

    protected static async mnemonicToEntropy (mnemonicArray: string[], password: string = ''): Promise<ArrayBuffer> {
        const mnemonicPhrase: string = mnemonicArray.join(' ');
        return await this.hmacSha512(mnemonicPhrase, password);
    };

    protected static async pbkdf2Sha512 (key: ArrayBuffer, salt: string, iterations: number): Promise<Uint8Array> {
        const saltBuffer: ArrayBufferLike = this.stringToIntArray(salt).buffer;
        const pbkdf2_key: CryptoKey = await crypto.subtle.importKey(
            'raw',
            key,
            { name: 'PBKDF2' },
            false,
            ['deriveBits']
        );
        const derivedBits: ArrayBuffer = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-512', salt: saltBuffer, iterations: iterations },
            pbkdf2_key,
            512
        );
        return new Uint8Array(derivedBits);
    };

    protected static generateMnemonic (): string {
        return bip39.generateMnemonic(wordlist, 256);
    };
}