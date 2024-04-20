import Filehandler from './filehandler';

async function postinstall (): Promise<void> {
    await Filehandler.mkDir('./data');
    await Filehandler.createFile('./data/mnemonics.txt', 'word1 ... word24');
}

await postinstall();