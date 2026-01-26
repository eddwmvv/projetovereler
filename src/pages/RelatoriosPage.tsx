import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  Users,
  Building2,
  MapPin,
  School,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';
import { useRelatorioGeral, useAlunosParaExportacao } from '@/hooks/use-relatorios';
import { RelatorioFiltros } from '@/types';
import { exportacaoService } from '@/services/exportacao';
import { GraficoPizza } from '@/components/relatorios/GraficoPizza';
import { GraficoBarras } from '@/components/relatorios/GraficoBarras';
import { FiltrosRelatorio } from '@/components/relatorios/FiltrosRelatorio';
import { useToast } from '@/hooks/use-toast';

export const RelatoriosPage = () => {
  const { toast: showToast } = useToast();
  const [filtros, setFiltros] = useState<RelatorioFiltros>({});
  const [abaAtiva, setAbaAtiva] = useState('geral');

  const { data: relatorioGeral, isLoading: carregandoGeral } = useRelatorioGeral(filtros);
  const { data: alunosExportacao, isLoading: carregandoAlunos } = useAlunosParaExportacao(filtros);

  const limparFiltros = () => {
    setFiltros({});
  };

  const handleExportarCSV = () => {
    try {
      if (!alunosExportacao || alunosExportacao.length === 0) {
        showToast({
          title: 'Erro',
          description: 'Não há dados para exportar',
          variant: 'destructive',
        });
        return;
      }
      exportacaoService.exportarCSV(alunosExportacao, 'relatorio_alunos');
      showToast({
        title: 'Sucesso',
        description: 'Arquivo CSV exportado com sucesso!',
      });
    } catch (error) {
      showToast({
        title: 'Erro',
        description: 'Erro ao exportar CSV',
        variant: 'destructive',
      });
    }
  };

  const handleExportarExcel = () => {
    try {
      if (!alunosExportacao || alunosExportacao.length === 0) {
        showToast({
          title: 'Erro',
          description: 'Não há dados para exportar',
          variant: 'destructive',
        });
        return;
      }
      exportacaoService.exportarExcel(alunosExportacao, 'relatorio_alunos');
      showToast({
        title: 'Sucesso',
        description: 'Arquivo Excel exportado com sucesso!',
      });
    } catch (error) {
      showToast({
        title: 'Erro',
        description: 'Erro ao exportar Excel',
        variant: 'destructive',
      });
    }
  };

  const handleExportarPDF = () => {
    try {
      if (!relatorioGeral || !alunosExportacao) {
        showToast({
          title: 'Erro',
          description: 'Carregue os dados do relatório primeiro',
          variant: 'destructive',
        });
        return;
      }
      exportacaoService.exportarRelatorioGeralPDF(relatorioGeral, alunosExportacao);
      showToast({
        title: 'Sucesso',
        description: 'Arquivo PDF exportado com sucesso!',
      });
    } catch (error) {
      showToast({
        title: 'Erro',
        description: 'Erro ao exportar PDF',
        variant: 'destructive',
      });
    }
  };

  // Preparar dados para gráficos
  const dadosFasePizza =
    relatorioGeral?.alunosPorFase
      ? [
          { name: 'Triagem', value: relatorioGeral.alunosPorFase.triagem, color: '#0088FE' },
          { name: 'Consulta', value: relatorioGeral.alunosPorFase.consulta, color: '#FFBB28' },
          { name: 'Produção', value: relatorioGeral.alunosPorFase.producao_de_oculos, color: '#00C49F' },
          { name: 'Entregue', value: relatorioGeral.alunosPorFase.entregue, color: '#8884d8' },
        ].filter((item) => item.value > 0)
      : [];

  const dadosFaseBarras =
    relatorioGeral?.alunosPorFase
      ? [
          { name: 'Triagem', value: relatorioGeral.alunosPorFase.triagem },
          { name: 'Consulta', value: relatorioGeral.alunosPorFase.consulta },
          { name: 'Produção', value: relatorioGeral.alunosPorFase.producao_de_oculos },
          { name: 'Entregue', value: relatorioGeral.alunosPorFase.entregue },
        ]
      : [];

  const dadosEtaria =
    relatorioGeral?.distribuicaoEtaria.map((item) => ({
      name: item.faixa,
      value: item.quantidade,
    })) || [];

  const dadosGenero =
    relatorioGeral?.distribuicaoGenero.map((item) => ({
      name:
        item.genero === 'masculino'
          ? 'Masculino'
          : item.genero === 'feminino'
            ? 'Feminino'
            : item.genero === 'outro'
              ? 'Outro'
              : 'Não Informado',
      value: item.quantidade,
      color: item.genero === 'masculino' ? '#0088FE' : item.genero === 'feminino' ? '#FF69B4' : '#8884d8',
    })) || [];

  return (
    <div className="space-y-6">
      {/* Cabeçalho com Exportação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Relatórios e Exportação
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportarCSV} disabled={carregandoAlunos}>
                <FileText className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportarExcel} disabled={carregandoAlunos}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportarPDF} disabled={carregandoGeral}>
                <FileDown className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gere relatórios detalhados e exporte os dados em diferentes formatos. Use os filtros abaixo para personalizar
            seus relatórios.
          </p>
        </CardContent>
      </Card>

      {/* Filtros */}
      <FiltrosRelatorio filtros={filtros} onFiltrosChange={setFiltros} onLimparFiltros={limparFiltros} />

      {/* Tabs de Relatórios */}
      <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="fases">Por Fase</TabsTrigger>
          <TabsTrigger value="demografico">Demográfico</TabsTrigger>
          <TabsTrigger value="dados">Dados Completos</TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="geral" className="space-y-4">
          {carregandoGeral ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">Carregando dados...</div>
              </CardContent>
            </Card>
          ) : relatorioGeral ? (
            <>
              {/* Cards de Métricas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total de Alunos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relatorioGeral.totalAlunos}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relatorioGeral.taxaConclusao.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Idade Média</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relatorioGeral.idadeMedia.toFixed(1)} anos</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Alunos Entregues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{relatorioGeral.alunosPorFase.entregue}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico de Fases */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Fase</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dadosFasePizza.length > 0 ? (
                      <GraficoPizza data={dadosFasePizza} />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Nenhum dado disponível
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição por Fase (Barras)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dadosFaseBarras.length > 0 ? (
                      <GraficoBarras data={dadosFaseBarras} />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        Nenhum dado disponível
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">Nenhum dado encontrado</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Por Fase */}
        <TabsContent value="fases" className="space-y-4">
          {carregandoGeral ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">Carregando dados...</div>
              </CardContent>
            </Card>
          ) : relatorioGeral ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Triagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{relatorioGeral.alunosPorFase.triagem}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {relatorioGeral.totalAlunos > 0
                      ? ((relatorioGeral.alunosPorFase.triagem / relatorioGeral.totalAlunos) * 100).toFixed(1)
                      : 0}
                    % do total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Consulta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{relatorioGeral.alunosPorFase.consulta}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {relatorioGeral.totalAlunos > 0
                      ? ((relatorioGeral.alunosPorFase.consulta / relatorioGeral.totalAlunos) * 100).toFixed(1)
                      : 0}
                    % do total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Produção de Óculos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{relatorioGeral.alunosPorFase.producao_de_oculos}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {relatorioGeral.totalAlunos > 0
                      ? ((relatorioGeral.alunosPorFase.producao_de_oculos / relatorioGeral.totalAlunos) * 100).toFixed(1)
                      : 0}
                    % do total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Entregue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{relatorioGeral.alunosPorFase.entregue}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {relatorioGeral.totalAlunos > 0
                      ? ((relatorioGeral.alunosPorFase.entregue / relatorioGeral.totalAlunos) * 100).toFixed(1)
                      : 0}
                    % do total
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">Nenhum dado encontrado</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Demográfico */}
        <TabsContent value="demografico" className="space-y-4">
          {carregandoGeral ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">Carregando dados...</div>
              </CardContent>
            </Card>
          ) : relatorioGeral ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição Etária</CardTitle>
                </CardHeader>
                <CardContent>
                  {dadosEtaria.length > 0 ? (
                    <GraficoBarras data={dadosEtaria} xLabel="Faixa Etária" yLabel="Quantidade" />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Gênero</CardTitle>
                </CardHeader>
                <CardContent>
                  {dadosGenero.length > 0 ? (
                    <GraficoPizza data={dadosGenero} />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">Nenhum dado encontrado</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Aba Dados Completos */}
        <TabsContent value="dados" className="space-y-4">
          {carregandoAlunos ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">Carregando dados...</div>
              </CardContent>
            </Card>
          ) : alunosExportacao && alunosExportacao.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Lista de Alunos ({alunosExportacao.length} registros)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-semibold">Nome</th>
                        <th className="text-left p-2 font-semibold">Idade</th>
                        <th className="text-left p-2 font-semibold">Fase</th>
                        <th className="text-left p-2 font-semibold">Escola</th>
                        <th className="text-left p-2 font-semibold">Turma</th>
                        <th className="text-left p-2 font-semibold">Município</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunosExportacao.slice(0, 100).map((aluno) => (
                        <tr key={aluno.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{aluno.nomeCompleto}</td>
                          <td className="p-2">{aluno.idade}</td>
                          <td className="p-2">
                            {aluno.faseAtual === 'triagem'
                              ? 'Triagem'
                              : aluno.faseAtual === 'consulta'
                                ? 'Consulta'
                                : aluno.faseAtual === 'producao_de_oculos'
                                  ? 'Produção'
                                  : 'Entregue'}
                          </td>
                          <td className="p-2">{aluno.escolaNome}</td>
                          <td className="p-2">{aluno.turmaNome}</td>
                          <td className="p-2">{aluno.municipioNome}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {alunosExportacao.length > 100 && (
                    <div className="mt-4 text-sm text-muted-foreground text-center">
                      Mostrando 100 de {alunosExportacao.length} registros. Exporte para ver todos os dados.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">Nenhum dado encontrado</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
