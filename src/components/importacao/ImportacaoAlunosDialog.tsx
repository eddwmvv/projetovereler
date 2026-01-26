import React, { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Edit,
  Save,
  X,
  Trash2,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Escola } from '@/types';
import { useImportarAlunos } from '@/hooks/use-alunos';
import * as XLSX from 'xlsx';

// Tipos para a biblioteca xlsx
declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }

  export interface WorkSheet {
    [cell: string]: any;
    '!cols'?: Array<{ width: number }>;
  }
}

// Tipos para a importação
interface AlunoImport {
  nomeCompleto: string;
  turma: string;
  ano: string;
  sexo: 'masculino' | 'feminino' | 'outro' | 'nao_informado';
  responsavelLegal?: string;
  observacao?: string;
}

interface AlunoValidado extends AlunoImport {
  linha: number;
  erros: string[];
  valido: boolean;
  id?: string; // Para alunos já existentes
}

interface LogImportacao {
  tipo: 'sucesso' | 'erro' | 'aviso';
  mensagem: string;
  linha?: number;
  dados?: any;
}

interface Props {
  escola: Escola;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function ImportacaoAlunosDialog({ escola, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [etapa, setEtapa] = useState<'upload' | 'preview' | 'importando' | 'resultado'>('upload');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [dadosBrutos, setDadosBrutos] = useState<AlunoImport[]>([]);
  const [dadosValidados, setDadosValidados] = useState<AlunoValidado[]>([]);
  const [logs, setLogs] = useState<LogImportacao[]>([]);
  const [progresso, setProgresso] = useState(0);
  const [editandoLinha, setEditandoLinha] = useState<number | null>(null);
  const [linhaEditada, setLinhaEditada] = useState<Partial<AlunoValidado>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importarMutation = useImportarAlunos();

  // Template Excel
  const downloadTemplate = () => {
    // Criar dados de exemplo
    const dados = [
      {
        nome_completo: 'João Silva',
        turma: '1º Ano A',
        ano: 2024,
        sexo: 'masculino',
        responsavel_legal: 'Maria Silva',
        observacao: 'Observação opcional'
      },
      {
        nome_completo: 'Maria Santos',
        turma: '2º Ano B',
        ano: 2024,
        sexo: 'feminino',
        responsavel_legal: 'José Santos',
        observacao: ''
      },
      {
        nome_completo: 'Pedro Oliveira',
        turma: '3º Ano A',
        ano: 2024,
        sexo: 'masculino',
        responsavel_legal: 'Ana Oliveira',
        observacao: ''
      }
    ];

    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dados);

    // Definir larguras das colunas
    ws['!cols'] = [
      { width: 20 }, // nome_completo
      { width: 15 }, // turma
      { width: 8 },  // ano
      { width: 12 }, // sexo
      { width: 20 }, // responsavel_legal
      { width: 25 }  // observacao
    ];

    // Adicionar planilha ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Alunos');

    // Gerar arquivo
    XLSX.writeFile(wb, 'template_importacao_alunos.xlsx');

    toast({
      title: 'Template baixado',
      description: 'O arquivo template Excel foi baixado com sucesso.',
    });
  };

  const parseExcel = (file: File): Promise<AlunoImport[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // Pegar a primeira planilha
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            throw new Error('Arquivo Excel deve conter pelo menos uma planilha');
          }

          const worksheet = workbook.Sheets[sheetName];

          // Converter para JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false
          }) as any[][];

          if (jsonData.length < 2) {
            throw new Error('Planilha deve ter pelo menos cabeçalho e uma linha de dados');
          }

          const headers = jsonData[0].map(h => String(h || '').trim().toLowerCase());
          const expectedHeaders = ['nome_completo', 'turma', 'ano', 'sexo'];

          // Verificar se todos os headers obrigatórios estão presentes
          const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
          if (missingHeaders.length > 0) {
            throw new Error(`Headers obrigatórios faltando: ${missingHeaders.join(', ')}`);
          }

          const alunos: AlunoImport[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length < expectedHeaders.length) continue; // Linha vazia ou incompleta

            alunos.push({
              nomeCompleto: String(row[headers.indexOf('nome_completo')] || '').trim(),
              turma: String(row[headers.indexOf('turma')] || '').trim(),
              ano: String(row[headers.indexOf('ano')] || '').trim(),
              sexo: String(row[headers.indexOf('sexo')] || '').toLowerCase().trim() as AlunoImport['sexo'],
              responsavelLegal: String(row[headers.indexOf('responsavel_legal')] || '').trim() || undefined,
              observacao: String(row[headers.indexOf('observacao')] || '').trim() || undefined,
            });
          }

          resolve(alunos);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const validarDados = (alunos: AlunoImport[]): AlunoValidado[] => {
    const logs: LogImportacao[] = [];

    return alunos.map((aluno, index) => {
      const linha = index + 2; // +2 porque linha 1 é header e index começa em 0
      const erros: string[] = [];

      // Validações
      if (!aluno.nomeCompleto.trim()) {
        erros.push('Nome completo é obrigatório');
      }

      if (!aluno.turma.trim()) {
        erros.push('Turma é obrigatória');
      }

      if (!aluno.ano.trim()) {
        erros.push('Ano é obrigatório');
      } else if (!/^\d{4}$/.test(aluno.ano)) {
        erros.push('Ano deve ter 4 dígitos');
      }

      if (!['masculino', 'feminino', 'outro', 'nao_informado'].includes(aluno.sexo)) {
        erros.push('Sexo deve ser: masculino, feminino, outro ou nao_informado');
      }

      const valido = erros.length === 0;

      if (!valido) {
        logs.push({
          tipo: 'erro',
          mensagem: `Linha ${linha}: ${erros.join(', ')}`,
          linha,
          dados: aluno,
        });
      }

      return {
        ...aluno,
        linha,
        erros,
        valido,
      };
    });
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo do arquivo
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExtensions = ['.xlsx', '.xls'];

    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo Excel válido (.xlsx ou .xls).',
        variant: 'destructive',
      });
      return;
    }

    setArquivo(file);
    setLogs([]);

    try {
      const alunos = await parseExcel(file);
      const validados = validarDados(alunos);

      setDadosBrutos(alunos);
      setDadosValidados(validados);

      // Adicionar logs de validação
      const novosLogs = validados
        .filter(v => !v.valido)
        .map(v => ({
          tipo: 'erro' as const,
          mensagem: `Linha ${v.linha}: ${v.erros.join(', ')}`,
          linha: v.linha,
          dados: v,
        }));

      setLogs(novosLogs);
      setEtapa('preview');

      toast({
        title: 'Arquivo processado',
        description: `${alunos.length} alunos encontrados, ${validados.filter(v => v.valido).length} válidos.`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao processar arquivo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, []);

  const handleImportacao = async () => {
    if (dadosValidados.filter(v => v.valido).length === 0) {
      toast({
        title: 'Nenhum dado válido',
        description: 'Não há dados válidos para importar.',
        variant: 'destructive',
      });
      return;
    }

    setEtapa('importando');
    setProgresso(0);
    const novosLogs: LogImportacao[] = [];

    const alunosValidos = dadosValidados.filter(v => v.valido) as AlunoValidado[];
    const alunosParaImportar = alunosValidos.map(aluno => ({
      nomeCompleto: aluno.nomeCompleto,
      turma: aluno.turma,
      ano: aluno.ano,
      sexo: aluno.sexo,
      responsavelLegal: aluno.responsavelLegal,
      observacao: aluno.observacao,
    }));

    try {
      const resultados = await importarMutation.mutateAsync({
        alunos: alunosParaImportar,
        escolaId: escola.id,
        municipioId: escola.municipioId,
        projetoId: escola.projetosIds[0] || '', // Usar primeiro projeto por padrão
        empresaId: escola.empresaId,
      });

      // Processar resultados para logs
      resultados.forEach(resultado => {
        const log: LogImportacao = {
          tipo: resultado.sucesso ? 'sucesso' : 'erro',
          mensagem: resultado.mensagem,
          dados: resultado.dados,
        };
        novosLogs.push(log);
      });

      setLogs(novosLogs);
      setEtapa('resultado');

      const sucessos = resultados.filter(r => r.sucesso).length;
      const erros = resultados.filter(r => !r.sucesso).length;

      toast({
        title: 'Importação concluída',
        description: `${sucessos} alunos importados com sucesso, ${erros} erros.`,
        variant: erros > 0 ? 'destructive' : 'default',
      });

      if (onSuccess && erros === 0) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Ocorreu um erro durante a importação. Verifique os logs para mais detalhes.',
        variant: 'destructive',
      });

      setLogs([{
        tipo: 'erro',
        mensagem: `Erro geral na importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        dados: {} as any,
      }]);
      setEtapa('resultado');
    }
  };

  const iniciarEdicao = (linha: number) => {
    const aluno = dadosValidados.find(v => v.linha === linha);
    if (aluno) {
      setEditandoLinha(linha);
      setLinhaEditada({ ...aluno });
    }
  };

  const salvarEdicao = () => {
    if (editandoLinha) {
      setDadosValidados(prev =>
        prev.map(v =>
          v.linha === editandoLinha
            ? { ...linhaEditada, linha: editandoLinha, erros: [], valido: true } as AlunoValidado
            : v
        )
      );
      setEditandoLinha(null);
      setLinhaEditada({});
    }
  };

  const cancelarEdicao = () => {
    setEditandoLinha(null);
    setLinhaEditada({});
  };

  const removerLinha = (linha: number) => {
    setDadosValidados(prev => prev.filter(v => v.linha !== linha));
  };

  const resetDialog = () => {
    setEtapa('upload');
    setArquivo(null);
    setDadosBrutos([]);
    setDadosValidados([]);
    setLogs([]);
    setProgresso(0);
    setEditandoLinha(null);
    setLinhaEditada({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Importar Alunos em Massa</h3>
        <p className="text-muted-foreground mb-4">
          Faça upload de um arquivo Excel com os dados dos alunos da escola {escola.nome}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="file-upload" className="text-sm font-medium">
            Arquivo CSV
          </Label>
          <div className="mt-2">
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileUpload}
              className="cursor-pointer"
            />
          </div>
        </div>

        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>O arquivo Excel deve conter as seguintes colunas obrigatórias:</p>
              <ul className="list-disc list-inside text-sm">
                <li><strong>nome_completo</strong> - Nome completo do aluno</li>
                <li><strong>turma</strong> - Nome da turma</li>
                <li><strong>ano</strong> - Ano letivo (ex: 2024)</li>
                <li><strong>sexo</strong> - masculino, feminino, outro ou nao_informado</li>
              </ul>
              <p className="text-sm mt-2">
                Colunas opcionais: responsavel_legal, observacao
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Baixar Template
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    const validos = dadosValidados.filter(v => v.valido);
    const invalidos = dadosValidados.filter(v => !v.valido);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <Eye className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Preview dos Dados</h3>
          <p className="text-muted-foreground">
            Revise os dados antes de importar para a escola {escola.nome}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{validos.length}</div>
            <div className="text-sm text-green-700">Válidos</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{invalidos.length}</div>
            <div className="text-sm text-red-700">Inválidos</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{dadosValidados.length}</div>
            <div className="text-sm text-blue-700">Total</div>
          </div>
        </div>

        {logs.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Erros encontrados:</p>
                <ScrollArea className="max-h-32">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm">
                      {log.mensagem}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-96 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Linha</TableHead>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Sexo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosValidados.map((aluno) => (
                <TableRow key={aluno.linha}>
                  <TableCell>{aluno.linha}</TableCell>
                  <TableCell>
                    {editandoLinha === aluno.linha ? (
                      <Input
                        value={linhaEditada.nomeCompleto || ''}
                        onChange={(e) => setLinhaEditada(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                        className="h-8"
                      />
                    ) : (
                      aluno.nomeCompleto
                    )}
                  </TableCell>
                  <TableCell>
                    {editandoLinha === aluno.linha ? (
                      <Input
                        value={linhaEditada.turma || ''}
                        onChange={(e) => setLinhaEditada(prev => ({ ...prev, turma: e.target.value }))}
                        className="h-8"
                      />
                    ) : (
                      aluno.turma
                    )}
                  </TableCell>
                  <TableCell>
                    {editandoLinha === aluno.linha ? (
                      <Input
                        value={linhaEditada.ano || ''}
                        onChange={(e) => setLinhaEditada(prev => ({ ...prev, ano: e.target.value }))}
                        className="h-8"
                      />
                    ) : (
                      aluno.ano
                    )}
                  </TableCell>
                  <TableCell>
                    {editandoLinha === aluno.linha ? (
                      <select
                        value={linhaEditada.sexo || ''}
                        onChange={(e) => setLinhaEditada(prev => ({ ...prev, sexo: e.target.value as AlunoValidado['sexo'] }))}
                        className="h-8 px-2 border rounded text-sm"
                      >
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                        <option value="outro">Outro</option>
                        <option value="nao_informado">Não informado</option>
                      </select>
                    ) : (
                      <Badge variant={aluno.sexo === 'masculino' ? 'default' : 'secondary'}>
                        {aluno.sexo}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {aluno.valido ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Válido
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inválido
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {editandoLinha === aluno.linha ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={salvarEdicao}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelarEdicao}>
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => iniciarEdicao(aluno.linha)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removerLinha(aluno.linha)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setEtapa('upload')}>
            Voltar
          </Button>
          <Button onClick={handleImportacao} disabled={validos.length === 0}>
            <Users className="w-4 h-4 mr-2" />
            Importar {validos.length} Alunos
          </Button>
        </div>
      </div>
    );
  };

  const renderImportStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="animate-spin mx-auto h-12 w-12 text-primary mb-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Importando Alunos</h3>
        <p className="text-muted-foreground mb-4">
          Aguarde enquanto importamos os alunos para a escola {escola.nome}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progresso</span>
          <span>{Math.round(progresso)}%</span>
        </div>
        <Progress value={progresso} className="h-2" />
      </div>
    </div>
  );

  const renderResultStep = () => {
    const sucessos = logs.filter(l => l.tipo === 'sucesso');
    const erros = logs.filter(l => l.tipo === 'erro');

    return (
      <div className="space-y-6">
        <div className="text-center">
          {erros.length === 0 ? (
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-4" />
          ) : (
            <AlertCircle className="mx-auto h-12 w-12 text-amber-600 mb-4" />
          )}
          <h3 className="text-lg font-semibold mb-2">Importação Concluída</h3>
          <p className="text-muted-foreground">
            {erros.length === 0
              ? 'Todos os alunos foram importados com sucesso!'
              : `${sucessos.length} alunos importados, ${erros.length} erros encontrados`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{sucessos.length}</div>
            <div className="text-sm text-green-700">Sucessos</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{erros.length}</div>
            <div className="text-sm text-red-700">Erros</div>
          </div>
        </div>

        {logs.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Log de Importação</h4>
            <ScrollArea className="h-48 border rounded-lg p-4">
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className={cn(
                    "flex items-start gap-2 text-sm",
                    log.tipo === 'sucesso' && "text-green-700",
                    log.tipo === 'erro' && "text-red-700",
                    log.tipo === 'aviso' && "text-amber-700"
                  )}>
                    {log.tipo === 'sucesso' && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {log.tipo === 'erro' && <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {log.tipo === 'aviso' && <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <span>{log.mensagem}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={resetDialog}>
            Importar Outro Arquivo
          </Button>
          <Button onClick={() => setOpen(false)}>
            Fechar
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar Alunos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Importação em Massa - {escola.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {etapa === 'upload' && renderUploadStep()}
          {etapa === 'preview' && renderPreviewStep()}
          {etapa === 'importando' && renderImportStep()}
          {etapa === 'resultado' && renderResultStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}