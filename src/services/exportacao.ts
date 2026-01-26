import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlunoRelatorio,
  RelatorioGeral,
  RelatorioEscola,
  RelatorioMunicipio,
  RelatorioEmpresa,
  StudentPhase,
} from '@/types';

// Mapeamento de fases para português
const faseLabels: Record<StudentPhase, string> = {
  triagem: 'Triagem',
  consulta: 'Consulta',
  producao_de_oculos: 'Produção de Óculos',
  entregue: 'Entregue',
};

// Mapeamento de gênero para português
const generoLabels: Record<string, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  outro: 'Outro',
  nao_informado: 'Não Informado',
};

// Funções auxiliares para desenhar gráficos no PDF
function desenharGraficoBarras(
  doc: jsPDF,
  x: number,
  y: number,
  largura: number,
  altura: number,
  dados: { name: string; value: number }[],
  titulo: string,
  corBarras: string = '#0088FE'
): number {
  const maxValue = Math.max(...dados.map((d) => d.value), 1);
  const barWidth = largura / dados.length;
  const barSpacing = barWidth * 0.2;
  const actualBarWidth = barWidth - barSpacing;
  const chartHeight = altura - 30; // Espaço para título e labels

  // Título
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, x + largura / 2, y, { align: 'center' });
  y += 8;

  // Desenhar barras
  dados.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const barX = x + index * barWidth + barSpacing / 2;
    const barY = y + chartHeight - barHeight;

    // Barra - converter cor hex para RGB se necessário
    if (corBarras.startsWith('#')) {
      const r = parseInt(corBarras.substring(1, 3), 16);
      const g = parseInt(corBarras.substring(3, 5), 16);
      const b = parseInt(corBarras.substring(5, 7), 16);
      doc.setFillColor(r, g, b);
    } else {
      doc.setFillColor(corBarras);
    }
    doc.rect(barX, barY, actualBarWidth, barHeight, 'F');

    // Valor no topo da barra
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(item.value.toString(), barX + actualBarWidth / 2, barY - 2, { align: 'center' });

    // Label embaixo
    doc.setFontSize(7);
    doc.text(item.name, barX + actualBarWidth / 2, y + chartHeight + 5, { align: 'center', maxWidth: actualBarWidth });
  });

  return y + altura;
}

function desenharGraficoPizza(
  doc: jsPDF,
  x: number,
  y: number,
  raio: number,
  dados: { name: string; value: number; color?: string }[],
  titulo: string
): number {
  const total = dados.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return y + raio * 2 + 20;

  const cores = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  const centroX = x + raio;
  const centroY = y + raio + 15;

  // Título
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(titulo, centroX, y, { align: 'center' });
  y += 8;

  // Desenhar pizza usando representação visual simplificada
  // Vamos usar barras horizontais coloridas que representam a proporção
  const larguraBarra = raio * 1.5;
  const alturaBarra = 8;
  let barY = centroY - (dados.length * alturaBarra) / 2;

  dados.forEach((item, index) => {
    if (item.value > 0) {
      const porcentagem = item.value / total;
      const larguraPreenchida = larguraBarra * porcentagem;

      // Converter cor hex para RGB
      const cor = item.color || cores[index % cores.length];
      const r = parseInt(cor.substring(1, 3), 16);
      const g = parseInt(cor.substring(3, 5), 16);
      const b = parseInt(cor.substring(5, 7), 16);
      doc.setFillColor(r, g, b);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.1);

      // Desenhar barra completa (fundo cinza claro)
      doc.setFillColor(240, 240, 240);
      doc.rect(centroX - larguraBarra / 2, barY, larguraBarra, alturaBarra, 'F');

      // Desenhar parte preenchida
      doc.setFillColor(r, g, b);
      doc.rect(centroX - larguraBarra / 2, barY, larguraPreenchida, alturaBarra, 'F');

      // Borda
      doc.setDrawColor(0, 0, 0);
      doc.rect(centroX - larguraBarra / 2, barY, larguraBarra, alturaBarra, 'D');

      // Label
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const porcentagemTexto = (porcentagem * 100).toFixed(1);
      doc.text(`${item.name}: ${item.value} (${porcentagemTexto}%)`, centroX + larguraBarra / 2 + 5, barY + alturaBarra / 2 + 2);

      barY += alturaBarra + 2;
    }
  });

  // Legenda com círculos coloridos
  let legendY = barY + 10;
  dados.forEach((item, index) => {
    if (item.value > 0) {
      const cor = item.color || cores[index % cores.length];
      const r = parseInt(cor.substring(1, 3), 16);
      const g = parseInt(cor.substring(3, 5), 16);
      const b = parseInt(cor.substring(5, 7), 16);

      // Círculo colorido
      doc.setFillColor(r, g, b);
      doc.circle(x + 5, legendY, 2, 'F');

      // Texto
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const porcentagem = ((item.value / total) * 100).toFixed(1);
      doc.text(`${item.name}: ${item.value} (${porcentagem}%)`, x + 10, legendY + 1);

      legendY += 6;
    }
  });

  return legendY + 5;
}

export const exportacaoService = {
  // Exportar para CSV
  exportarCSV(alunos: AlunoRelatorio[], nomeArquivo: string = 'relatorio_alunos'): void {
    const headers = [
      'Nome Completo',
      'Idade',
      'Gênero',
      'Data de Nascimento',
      'Fase Atual',
      'Escola',
      'Turma',
      'Município',
      'Empresa',
      'Responsável Legal',
      'Dias na Fase',
      'Data de Cadastro',
    ];

    const rows = alunos.map((aluno) => [
      aluno.nomeCompleto,
      aluno.idade.toString(),
      generoLabels[aluno.sexo] || aluno.sexo,
      format(aluno.dataNascimento, 'dd/MM/yyyy', { locale: ptBR }),
      faseLabels[aluno.faseAtual],
      aluno.escolaNome,
      aluno.turmaNome,
      aluno.municipioNome,
      aluno.empresaNome,
      aluno.responsavelLegal,
      aluno.diasNaFase.toString(),
      format(aluno.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Exportar para Excel
  exportarExcel(alunos: AlunoRelatorio[], nomeArquivo: string = 'relatorio_alunos'): void {
    const dados = alunos.map((aluno) => ({
      'Nome Completo': aluno.nomeCompleto,
      Idade: aluno.idade,
      Gênero: generoLabels[aluno.sexo] || aluno.sexo,
      'Data de Nascimento': format(aluno.dataNascimento, 'dd/MM/yyyy', { locale: ptBR }),
      'Fase Atual': faseLabels[aluno.faseAtual],
      Escola: aluno.escolaNome,
      Turma: aluno.turmaNome,
      Município: aluno.municipioNome,
      Empresa: aluno.empresaNome,
      'Responsável Legal': aluno.responsavelLegal,
      'Dias na Fase': aluno.diasNaFase,
      'Data de Cadastro': format(aluno.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
      Observação: aluno.observacao || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Nome Completo
      { wch: 8 }, // Idade
      { wch: 12 }, // Gênero
      { wch: 18 }, // Data de Nascimento
      { wch: 20 }, // Fase Atual
      { wch: 25 }, // Escola
      { wch: 20 }, // Turma
      { wch: 20 }, // Município
      { wch: 25 }, // Empresa
      { wch: 25 }, // Responsável Legal
      { wch: 12 }, // Dias na Fase
      { wch: 18 }, // Data de Cadastro
      { wch: 40 }, // Observação
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  },

  // Exportar Relatório Geral para PDF
  exportarRelatorioGeralPDF(relatorio: RelatorioGeral, alunos: AlunoRelatorio[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO GERAL - SISTEMA VER E LER', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Período (só mostrar se for uma data válida)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataInicioValida = relatorio.periodo.inicio && relatorio.periodo.inicio.getTime() > 0;
    const dataFimValida = relatorio.periodo.fim && relatorio.periodo.fim.getTime() > 0;
    
    if (dataInicioValida && dataFimValida) {
      doc.text(
        `Período: ${format(relatorio.periodo.inicio, 'dd/MM/yyyy', { locale: ptBR })} a ${format(relatorio.periodo.fim, 'dd/MM/yyyy', { locale: ptBR })}`,
        pageWidth / 2,
        yPos,
        { align: 'center' }
      );
      yPos += 15;
    } else {
      doc.text(
        `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
        pageWidth / 2,
        yPos,
        { align: 'center' }
      );
      yPos += 15;
    }

    // Estatísticas Gerais
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTATÍSTICAS GERAIS', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Alunos: ${relatorio.totalAlunos}`, 14, yPos);
    yPos += 6;
    doc.text(`Taxa de Conclusão: ${relatorio.taxaConclusao.toFixed(2)}%`, 14, yPos);
    yPos += 6;
    doc.text(`Idade Média: ${relatorio.idadeMedia.toFixed(1)} anos`, 14, yPos);
    yPos += 15;

    // Preparar dados para gráficos
    const dadosFase = [
      { name: 'Triagem', value: relatorio.alunosPorFase.triagem },
      { name: 'Consulta', value: relatorio.alunosPorFase.consulta },
      { name: 'Produção', value: relatorio.alunosPorFase.producao_de_oculos },
      { name: 'Entregue', value: relatorio.alunosPorFase.entregue },
    ].filter((d) => d.value > 0);

    const dadosFasePizza = [
      { name: 'Triagem', value: relatorio.alunosPorFase.triagem, color: '#0088FE' },
      { name: 'Consulta', value: relatorio.alunosPorFase.consulta, color: '#FFBB28' },
      { name: 'Produção', value: relatorio.alunosPorFase.producao_de_oculos, color: '#00C49F' },
      { name: 'Entregue', value: relatorio.alunosPorFase.entregue, color: '#8884d8' },
    ].filter((d) => d.value > 0);

    // Gráfico de Barras - Distribuição por Fase
    if (dadosFase.length > 0) {
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }
      yPos = desenharGraficoBarras(doc, 14, yPos, pageWidth - 28, 80, dadosFase, 'Distribuição por Fase', '#0088FE');
      yPos += 10;
    }

    // Gráfico de Pizza - Distribuição por Fase
    if (dadosFasePizza.length > 0) {
      if (yPos > pageHeight - 120) {
        doc.addPage();
        yPos = 20;
      }
      yPos = desenharGraficoPizza(doc, pageWidth / 2 - 40, yPos, 35, dadosFasePizza, 'Distribuição por Fase');
      yPos += 10;
    }

    // Tabela de Distribuição por Fase
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DISTRIBUIÇÃO POR FASE - DETALHES', 14, yPos);
    yPos += 8;

    const faseData = [
      ['Fase', 'Quantidade', 'Percentual'],
      [
        'Triagem',
        relatorio.alunosPorFase.triagem.toString(),
        relatorio.totalAlunos > 0
          ? ((relatorio.alunosPorFase.triagem / relatorio.totalAlunos) * 100).toFixed(2) + '%'
          : '0%',
      ],
      [
        'Consulta',
        relatorio.alunosPorFase.consulta.toString(),
        relatorio.totalAlunos > 0
          ? ((relatorio.alunosPorFase.consulta / relatorio.totalAlunos) * 100).toFixed(2) + '%'
          : '0%',
      ],
      [
        'Produção de Óculos',
        relatorio.alunosPorFase.producao_de_oculos.toString(),
        relatorio.totalAlunos > 0
          ? ((relatorio.alunosPorFase.producao_de_oculos / relatorio.totalAlunos) * 100).toFixed(2) + '%'
          : '0%',
      ],
      [
        'Entregue',
        relatorio.alunosPorFase.entregue.toString(),
        relatorio.totalAlunos > 0
          ? ((relatorio.alunosPorFase.entregue / relatorio.totalAlunos) * 100).toFixed(2) + '%'
          : '0%',
      ],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [faseData[0]],
      body: faseData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [200, 98, 39] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Verificar se precisa de nova página
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    // Gráfico de Barras - Distribuição Etária
    if (relatorio.distribuicaoEtaria.length > 0) {
      if (yPos > pageHeight - 100) {
        doc.addPage();
        yPos = 20;
      }
      const dadosEtaria = relatorio.distribuicaoEtaria.map((d) => ({
        name: d.faixa,
        value: d.quantidade,
      }));
      yPos = desenharGraficoBarras(doc, 14, yPos, pageWidth - 28, 80, dadosEtaria, 'Distribuição Etária', '#00C49F');
      yPos += 10;
    }

    // Tabela de Distribuição Etária
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DISTRIBUIÇÃO ETÁRIA - DETALHES', 14, yPos);
    yPos += 8;

    const etariaData = [['Faixa Etária', 'Quantidade'], ...relatorio.distribuicaoEtaria.map((d) => [d.faixa, d.quantidade.toString()])];

    autoTable(doc, {
      startY: yPos,
      head: [etariaData[0]],
      body: etariaData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [200, 98, 39] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    // Gráfico de Pizza - Distribuição por Gênero
    if (relatorio.distribuicaoGenero.length > 0) {
      if (yPos > pageHeight - 120) {
        doc.addPage();
        yPos = 20;
      }
      const dadosGenero = relatorio.distribuicaoGenero.map((d, index) => ({
        name: generoLabels[d.genero] || d.genero,
        value: d.quantidade,
        color: ['#0088FE', '#FF69B4', '#8884d8', '#82ca9d'][index % 4],
      }));
      yPos = desenharGraficoPizza(doc, pageWidth / 2 - 40, yPos, 35, dadosGenero, 'Distribuição por Gênero');
      yPos += 10;
    }

    // Tabela de Distribuição por Gênero
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DISTRIBUIÇÃO POR GÊNERO - DETALHES', 14, yPos);
    yPos += 8;

    const generoData = [
      ['Gênero', 'Quantidade'],
      ...relatorio.distribuicaoGenero.map((d) => [generoLabels[d.genero] || d.genero, d.quantidade.toString()]),
    ];

    autoTable(doc, {
      startY: yPos,
      head: [generoData[0]],
      body: generoData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [200, 98, 39] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Lista de Alunos (primeira página)
    if (alunos.length > 0) {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('LISTA DE ALUNOS', 14, yPos);
      yPos += 8;

      const alunosData = alunos.slice(0, 50).map((aluno) => [
        aluno.nomeCompleto,
        aluno.idade.toString(),
        faseLabels[aluno.faseAtual],
        aluno.escolaNome,
        format(aluno.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Nome', 'Idade', 'Fase', 'Escola', 'Data Cadastro']],
        body: alunosData,
        theme: 'striped',
        headStyles: { fillColor: [200, 98, 39] },
        pageBreak: 'auto',
      });
    }

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`relatorio_geral_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  // Exportar Relatório por Escola para PDF
  exportarRelatorioEscolaPDF(relatorio: RelatorioEscola, alunos: AlunoRelatorio[]): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO POR ESCOLA', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Dados da Escola
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Escola: ${relatorio.escola.nome}`, 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Alunos: ${relatorio.totalAlunos}`, 14, yPos);
    yPos += 6;
    doc.text(`Taxa de Conclusão: ${relatorio.taxaConclusao.toFixed(2)}%`, 14, yPos);
    yPos += 6;
    doc.text(`Idade Média: ${relatorio.idadeMedia.toFixed(1)} anos`, 14, yPos);
    yPos += 10;

    // Distribuição por Fase
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DISTRIBUIÇÃO POR FASE', 14, yPos);
    yPos += 8;

    const faseData = [
      ['Fase', 'Quantidade'],
      ['Triagem', relatorio.alunosPorFase.triagem.toString()],
      ['Consulta', relatorio.alunosPorFase.consulta.toString()],
      ['Produção de Óculos', relatorio.alunosPorFase.producao_de_oculos.toString()],
      ['Entregue', relatorio.alunosPorFase.entregue.toString()],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [faseData[0]],
      body: faseData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [200, 98, 39] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    // Distribuição Etária
    if (relatorio.distribuicaoEtaria.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DISTRIBUIÇÃO ETÁRIA', 14, yPos);
      yPos += 8;

      const etariaData = [['Faixa Etária', 'Quantidade'], ...relatorio.distribuicaoEtaria.map((d) => [d.faixa, d.quantidade.toString()])];

      autoTable(doc, {
        startY: yPos,
        head: [etariaData[0]],
        body: etariaData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [200, 98, 39] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    // Lista de Alunos
    if (alunos.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('LISTA DE ALUNOS', 14, yPos);
      yPos += 8;

      const alunosData = alunos.map((aluno) => [
        aluno.nomeCompleto,
        aluno.idade.toString(),
        faseLabels[aluno.faseAtual],
        aluno.turmaNome,
        format(aluno.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Nome', 'Idade', 'Fase', 'Turma', 'Data Cadastro']],
        body: alunosData,
        theme: 'striped',
        headStyles: { fillColor: [200, 98, 39] },
        pageBreak: 'auto',
      });
    }

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const nomeEscolaSanitizado = relatorio.escola.nome.replace(/[^a-z0-9]/gi, '_').substring(0, 30);
    doc.save(`relatorio_escola_${nomeEscolaSanitizado}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  // Exportar lista simples de alunos para PDF
  exportarAlunosPDF(alunos: AlunoRelatorio[], titulo: string = 'RELATÓRIO DE ALUNOS'): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, pageWidth / 2, 20, { align: 'center' });

    // Tabela de alunos
    const alunosData = alunos.map((aluno) => [
      aluno.nomeCompleto,
      aluno.idade.toString(),
      generoLabels[aluno.sexo] || aluno.sexo,
      faseLabels[aluno.faseAtual],
      aluno.escolaNome,
      aluno.turmaNome,
      format(aluno.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Nome', 'Idade', 'Gênero', 'Fase', 'Escola', 'Turma', 'Data Cadastro']],
      body: alunosData,
      theme: 'striped',
      headStyles: { fillColor: [200, 98, 39] },
      pageBreak: 'auto',
    });

    // Rodapé
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} - Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    doc.save(`relatorio_alunos_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  },

  // Exportar alunos filtrados/selecionados para CSV
  exportarAlunosCSV(alunos: AlunoRelatorio[], nomeArquivo: string = 'alunos'): void {
    const headers = [
      'Nome Completo',
      'Idade',
      'Gênero',
      'Data de Nascimento',
      'Fase Atual',
      'Escola',
      'Turma',
      'Município',
      'Empresa',
      'Responsável Legal',
      'Data de Cadastro',
    ];

    const rows = alunos.map((aluno) => [
      aluno.nomeCompleto,
      aluno.idade.toString(),
      generoLabels[aluno.sexo] || aluno.sexo,
      format(aluno.dataNascimento, 'dd/MM/yyyy', { locale: ptBR }),
      faseLabels[aluno.faseAtual],
      aluno.escolaNome,
      aluno.turmaNome,
      aluno.municipioNome,
      aluno.empresaNome,
      aluno.responsavelLegal,
      format(aluno.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Exportar alunos filtrados/selecionados para Excel
  exportarAlunosExcel(alunos: AlunoRelatorio[], nomeArquivo: string = 'alunos'): void {
    const dados = alunos.map((aluno) => ({
      'Nome Completo': aluno.nomeCompleto,
      Idade: aluno.idade,
      Gênero: generoLabels[aluno.sexo] || aluno.sexo,
      'Data de Nascimento': format(aluno.dataNascimento, 'dd/MM/yyyy', { locale: ptBR }),
      'Fase Atual': faseLabels[aluno.faseAtual],
      Escola: aluno.escolaNome,
      Turma: aluno.turmaNome,
      Município: aluno.municipioNome,
      Empresa: aluno.empresaNome,
      'Responsável Legal': aluno.responsavelLegal,
      'Data de Cadastro': format(aluno.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
      Observação: aluno.observacao || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');

    const colWidths = [
      { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 18 }, { wch: 20 },
      { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 25 },
      { wch: 18 }, { wch: 40 },
    ];
    worksheet['!cols'] = colWidths;

    XLSX.writeFile(workbook, `${nomeArquivo}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  },
};
