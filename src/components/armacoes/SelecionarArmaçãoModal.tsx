import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useArmacoesDisponiveis, useMarcarArmaçãoUtilizada } from '@/hooks/use-armacoes';
import { Aluno } from '@/types';
import { Loader2, Search, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SelecionarArmaçãoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunos: Aluno[];
  onSuccess: () => void;
}

export function SelecionarArmaçãoModal({
  open,
  onOpenChange,
  alunos,
  onSuccess,
}: SelecionarArmaçãoModalProps) {
  const { data: armacoesDisponiveis = [], isLoading } = useArmacoesDisponiveis();
  const marcarUtilizada = useMarcarArmaçãoUtilizada();
  const { toast } = useToast();

  const [numeracoes, setNumeracoes] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!open) {
      setNumeracoes({});
      setBusca('');
    }
  }, [open]);

  const armacoesFiltradas = armacoesDisponiveis.filter(
    (armacao) =>
      armacao.numeracao.toLowerCase().includes(busca.toLowerCase()) ||
      armacao.cor.toLowerCase().includes(busca.toLowerCase()) ||
      armacao.marca.toLowerCase().includes(busca.toLowerCase())
  );

  const validarNumeracao = (numeracao: string): { valida: boolean; armacao?: any } => {
    const numeracaoLimpa = numeracao.trim();
    if (!numeracaoLimpa) {
      return { valida: false };
    }
    const armacao = armacoesDisponiveis.find((a) => a.numeracao === numeracaoLimpa);
    return { valida: !!armacao, armacao };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que todos os alunos têm numeração
    const alunosSemNumeracao = alunos.filter(
      (aluno) => !numeracoes[aluno.id] || numeracoes[aluno.id].trim() === ''
    );

    if (alunosSemNumeracao.length > 0) {
      toast({
        title: 'Erro',
        description: 'Todos os alunos devem ter uma armação selecionada',
        variant: 'destructive',
      });
      return;
    }

    // Validar que as numerações existem e estão disponíveis
    const numeracoesInvalidas: string[] = [];
    for (const [alunoId, numeracao] of Object.entries(numeracoes)) {
      const { valida } = validarNumeracao(numeracao);
      if (!valida) {
        numeracoesInvalidas.push(numeracao);
      }
    }

    if (numeracoesInvalidas.length > 0) {
      toast({
        title: 'Erro',
        description: `As seguintes numerações não foram encontradas ou não estão disponíveis: ${numeracoesInvalidas.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Validar que não há duplicatas
    const numeracoesValores = Object.values(numeracoes).map((n) => n.trim());
    const duplicatas = numeracoesValores.filter(
      (n, i) => numeracoesValores.indexOf(n) !== i
    );

    if (duplicatas.length > 0) {
      toast({
        title: 'Erro',
        description: `Não é possível usar a mesma armação para múltiplos alunos: ${duplicatas.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      // Processar cada aluno
      for (const aluno of alunos) {
        const numeracao = numeracoes[aluno.id].trim();
        const { armacao } = validarNumeracao(numeracao);

        if (armacao) {
          await marcarUtilizada.mutateAsync({
            armacaoId: armacao.id,
            alunoId: aluno.id,
          });
        }
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Selecionar Armação{alunos.length > 1 ? 's' : ''}</DialogTitle>
          <DialogDescription>
            {alunos.length === 1
              ? `Selecione a armação para ${alunos[0].nomeCompleto}`
              : `Selecione uma armação para cada um dos ${alunos.length} alunos selecionados`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Busca de armações */}
          <div className="space-y-2">
            <Label>Buscar Armação</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por numeração, cor ou marca..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Lista de armações disponíveis */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : armacoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground border rounded-md">
              {busca
                ? 'Nenhuma armação encontrada com os filtros aplicados'
                : 'Nenhuma armação disponível no estoque'}
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
              {armacoesFiltradas.map((armacao) => {
                const isSelected = alunos.some(aluno => numeracoes[aluno.id] === armacao.numeracao);
                return (
                  <div
                    key={armacao.id}
                    className={cn("flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer", isSelected ? "bg-green-50 border border-green-200" : "")}
                    onClick={() => {
                      const firstEmpty = alunos.find(a => !numeracoes[a.id]?.trim());
                      if (firstEmpty) {
                        setNumeracoes(prev => ({ ...prev, [firstEmpty.id]: armacao.numeracao }));
                      }
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        #{armacao.numeracao} - {armacao.marca}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {armacao.cor} • {armacao.tipo}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-green-600 ml-2" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Campos de numeração para cada aluno */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">
              Informe a numeração da armação para cada aluno:
            </Label>
            {alunos.map((aluno) => {
              const numeracao = numeracoes[aluno.id] || '';
              const validacao = validarNumeracao(numeracao);

              return (
                <div key={aluno.id} className="space-y-2">
                  <Label htmlFor={`numeracao-${aluno.id}`}>
                    {aluno.nomeCompleto} <span className="text-destructive">*</span>
                  </Label>
                  <div className="space-y-1">
                    <Input
                      id={`numeracao-${aluno.id}`}
                      placeholder="Ex: 0001"
                      value={numeracao}
                      onChange={(e) =>
                        setNumeracoes((prev) => ({
                          ...prev,
                          [aluno.id]: e.target.value,
                        }))
                      }
                      required
                      className={
                        numeracao && !validacao.valida
                          ? 'border-destructive focus-visible:ring-destructive'
                          : ''
                      }
                    />
                    {numeracao && (
                      <div className="flex items-center gap-2 text-xs">
                        {validacao.valida ? (
                          <>
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">
                              Armação disponível: {validacao.armacao?.marca} -{' '}
                              {validacao.armacao?.cor}
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 text-destructive" />
                            <span className="text-destructive">
                              Armação não encontrada ou não disponível
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={marcarUtilizada.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={marcarUtilizada.isPending}>
              {marcarUtilizada.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

