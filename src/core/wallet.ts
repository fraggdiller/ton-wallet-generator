import Crypto from './crypto';
import { PBKDF_ITERATIONS } from '../other/constants';
import nacl from 'tweetnacl';
import { WalletContractV4 } from 'ton';
import { TonWallet } from '../other/types';


export default class Wallet extends Crypto {

    public static async generateWallet (count: number): Promise<TonWallet[]> {
        const wallets: TonWallet[] = [];

        for (let i: number = 0; i < count; i++) {
            const mnemonic: string = this.generateMnemonic();

            const generatedWallet: TonWallet = await this.processWallet(mnemonic);

            wallets.push(generatedWallet);
        }

        return wallets;
    };

    public static async getWalletFromMnemonic (mnemonics: string[]): Promise<TonWallet[]> {
        const wallets: TonWallet[] = [];

        for (let i: number = 0; i < mnemonics.length; i++) {
            const mnemonic: string = mnemonics[i];
            const generatedWallet: TonWallet = await this.processWallet(mnemonic);

            wallets.push(generatedWallet);
        }

        return wallets;
    };

    private static async processWallet (mnemonic: string): Promise<TonWallet> {
        const mnemonicArray: string[] = mnemonic.split(' ');

        const entropy: ArrayBuffer = await this.mnemonicToEntropy(mnemonicArray);

        let seed: Uint8Array = await this.pbkdf2Sha512(entropy, 'TON default seed', PBKDF_ITERATIONS);

        seed = seed.slice(0, 32);

        const keypair: nacl.SignKeyPair = nacl.sign.keyPair.fromSeed(seed);

        const wallet: WalletContractV4 = WalletContractV4.create({ publicKey: Buffer.from(keypair.publicKey), workchain: 0 });

        const address: string = wallet.address.toString({ bounceable: true });
        const addressUnBouncable: string = wallet.address.toString({ bounceable: false });
        const addressRaw: string = wallet.address.toRawString();

        return {
            mnemonic: mnemonic,
            addressBouncable: address,
            addressUnBouncable: addressUnBouncable,
            addressRaw: addressRaw
        };
    }
}