import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Loader2, Download } from 'lucide-react';
import { useImportArmacoesEmMassa } from '@/hooks/use-armacoes';
import { parseExcelFile, ArmacaoImportRow, ArmacaoImportResult } from '@/services/armacoes';
import { useToast } from '@/hooks/use-toast';

interface ImportArmacoesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportArmacoesModal({ open, onOpenChange }: ImportArmacoesModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ArmacaoImportRow[]>([]);
  const [results, setResults] = useState<ArmacaoImportResult[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'results'>('upload');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useImportArmacoesEmMassa();
  const { toast } = useToast();

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Validar tipo do arquivo
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: 'Tipo de arquivo inválido',
        description: 'Por favor, selecione um arquivo Excel (.xlsx, .xls, .xlsm)',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 10MB',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setIsProcessingFile(true);

    try {
      const data = await parseExcelFile(selectedFile);
      setParsedData(data);
      setStep('preview');
    } catch (error) {
      toast({
        title: 'Erro ao processar arquivo',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setStep('results');

    try {
      const importResults = await importMutation.mutateAsync(parsedData);
      setResults(importResults);
    } catch (error) {
      console.error('Erro na importação:', error);
    }
  };

  const resetModal = () => {
    setFile(null);
    setParsedData([]);
    setResults([]);
    setStep('upload');
    setIsProcessingFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };

  const getStatusIcon = (result: ArmacaoImportResult) => {
    if (result.success) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (result.isDuplicate) return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (result: ArmacaoImportResult) => {
    if (result.success) return <Badge className="bg-green-100 text-green-700">Sucesso</Badge>;
    if (result.isDuplicate) return <Badge className="bg-orange-100 text-orange-700">Duplicada</Badge>;
    return <Badge className="bg-red-100 text-red-700">Erro</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Importação em Massa de Armações</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo Excel com as colunas: Numeração, Tipo, Tamanho (opcional), Status<br />
            <strong>Importante:</strong> A numeração deve ser única. Linhas com numeração já existente serão <strong>impedidas</strong> de serem importadas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Upload Step */}
          {step === 'upload' && (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione um arquivo Excel</h3>
              <p className="text-sm text-gray-500 mb-4 text-center">
                Arquivo deve conter as colunas: Numeração, Tipo, Tamanho, Status<br />
                Máximo: 10MB • <strong>Numerações duplicadas serão impedidas</strong>
              </p>

              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="text-sm text-amber-800 mb-2">
                  <strong>⚠️ Regras Críticas:</strong>
                </div>
                <div className="text-xs text-amber-700 space-y-1">
                  <div>• <strong>Numerações:</strong> Já existentes serão <strong>REJEITADAS</strong> (linha não importada)</div>
                  <div>• <strong>Tamanhos:</strong> Nomes duplicados serão rejeitados (não cria novo tamanho)</div>
                  <div className="mt-2 italic">
                    Exemplo: Se tentar importar numeração "0001" que já existe, a linha será rejeitada para evitar duplicatas.
                  </div>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-blue-700">
                    <strong>Precisa de ajuda?</strong> Baixe o arquivo de exemplo com as colunas corretas.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/exemplo_importacao_armacoes.xlsx';
                      link.download = 'exemplo_importacao_armacoes.xlsx';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Exemplo
                  </Button>
                </div>
              </div>

              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.xlsm"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="flex items-center gap-2"
              >
                {isProcessingFile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Escolher Arquivo
                  </>
                )}
              </Button>

              {file && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Arquivo selecionado:</strong> {file.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Tamanho: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Prévia dos Dados</h3>
                  <p className="text-sm text-gray-500">
                    {parsedData.length} linha(s) encontrada(s). Verifique os dados antes de importar.<br />
                    <strong>Importante:</strong> Numerações duplicadas serão <strong>rejeitadas</strong> (linhas não importadas).
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('upload')}>
                    Voltar
                  </Button>
                  <Button onClick={handleImport} disabled={importMutation.isPending}>
                    {importMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Importando...
                      </>
                    ) : (
                      'Importar'
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numeração</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 50).map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{row.numeracao}</TableCell>
                        <TableCell>{row.tipo}</TableCell>
                        <TableCell>{row.tamanho || '-'}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </TableRow>
                    ))}
                    {parsedData.length > 50 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                          ... e mais {parsedData.length - 50} linha(s)
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Results Step */}
          {step === 'results' && (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Resultado da Importação</h3>
                  <p className="text-sm text-gray-500">
                    {results.filter(r => r.success).length} sucesso(s),{' '}
                    {results.filter(r => r.isDuplicate).length} duplicada(s),{' '}
                    {results.filter(r => !r.success && !r.isDuplicate).length} erro(s)
                  </p>
                </div>
                <Button onClick={handleClose}>
                  Fechar
                </Button>
              </div>

              <div className="flex-1 overflow-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Numeração</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mensagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result)}
                            {getStatusBadge(result)}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{result.row.numeracao}</TableCell>
                        <TableCell>{result.row.tipo}</TableCell>
                        <TableCell>{result.row.tamanho || '-'}</TableCell>
                        <TableCell>{result.row.status}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {result.error || 'OK'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}