import Excel from 'exceljs';
import { TonWallet } from '../other/types';

export async function createExcelFile (data: TonWallet[]): Promise<void> {
    const workbook: Excel.Workbook = new Excel.Workbook();
    const worksheet: Excel.Worksheet = workbook.addWorksheet('Data');

    worksheet.columns = [
        { header: 'Mnemonic', key: 'mnemonic', width: 32 },
        { header: 'Address Bouncable', key: 'addressBouncable', width: 32 },
        { header: 'Address UnBouncable', key: 'addressUnBouncable', width: 32 },
        { header: 'Address Raw', key: 'addressRaw', width: 32 }
    ];

    data.forEach((item: TonWallet): void => {
        worksheet.addRow(item);
    });

    await workbook.xlsx.writeFile('./data/ton-wallets.xlsx');
}
