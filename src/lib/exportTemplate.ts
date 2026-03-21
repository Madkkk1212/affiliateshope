import * as XLSX from 'xlsx';

export const downloadImportTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      title: 'Contoh Produk Terlaris',
      description: 'Ini adalah deskripsi produk contoh yang bisa Anda edit sesuai kebutuhan.',
      nama_file_foto: 'foto_produk1.jpg',
      price: 'Rp 150.000',
      affiliate_url: 'https://shope.ee/contoh1',
      category: 'Elektronik',
      badge: 'Pilihan Editor',
      hook: 'Pasti Bikin Nyesel Kalau Gak Beli!',
      is_active: 'TRUE'
    },
    {
      title: 'Sepatu Kasual Pria',
      description: 'Sepatu nyaman untuk hangout dan jalan-jalan santai.',
      nama_file_foto: 'sepatu_kasual.png',
      price: 'Rp 250.000',
      affiliate_url: 'https://tokopedia.link/contoh2',
      category: 'Fashion',
      badge: 'Diskon 50%',
      hook: 'Langkah Percaya Diri Setiap Hari',
      is_active: 'TRUE'
    }
  ]);

  // Set column widths for better readability
  const wscols = [
    { wch: 25 }, // title
    { wch: 40 }, // description
    { wch: 20 }, // nama_file_foto
    { wch: 15 }, // price
    { wch: 30 }, // affiliate_url
    { wch: 15 }, // category
    { wch: 15 }, // badge
    { wch: 35 }, // hook
    { wch: 10 }, // is_active
  ];
  ws['!cols'] = wscols;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Import Produk');
  XLSX.writeFile(wb, 'Template_Import_Produk_Lumahive.xlsx');
};
