const XLSX = require('xlsx');

// Criar dados de exemplo (apenas cabeçalhos)
const headers = [
  ['Numeração', 'Cor', 'Tipo', 'Marca', 'Tamanho', 'Status']
];

// Criar workbook
const wb = XLSX.utils.book_new();

// Criar worksheet
const ws = XLSX.utils.aoa_to_sheet(headers);

// Definir largura das colunas
ws['!cols'] = [
  { wch: 12 }, // Numeração
  { wch: 15 }, // Cor
  { wch: 12 }, // Tipo
  { wch: 15 }, // Marca
  { wch: 12 }, // Tamanho
  { wch: 12 }, // Status
];

// Adicionar worksheet ao workbook
XLSX.utils.book_append_sheet(wb, ws, 'Armações');

// Salvar arquivo
XLSX.writeFile(wb, 'exemplo_importacao_armacoes.xlsx');

console.log('Arquivo exemplo_importacao_armacoes.xlsx criado com sucesso!');
console.log('Colunas: Numeração, Cor, Tipo, Marca, Tamanho, Status');