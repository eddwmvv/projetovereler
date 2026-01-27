import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, X, Upload } from 'lucide-react';
import { useArmacoes, useCreateArmação, useTamanhos, useCreateTamanho, useTamanhoByNome } from '@/hooks/use-armacoes';
import { ArmaçãoTipo, ArmaçãoStatus, Tamanho } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Loader2 } from 'lucide-react';
import { ImportArmacoesModal } from '@/components/armacoes/ImportArmacoesModal';

const tipoLabels: Record<ArmaçãoTipo, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  unissex: 'Unissex',
};

const statusLabels: Record<ArmaçãoStatus, string> = {
  disponivel: 'Disponível',
  utilizada: 'Utilizada',
  perdida: 'Perdida',
  danificada: 'Danificada',
};

const statusBadgeStyles: Record<ArmaçãoStatus, string> = {
  disponivel: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  utilizada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  perdida: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  danificada: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

export function EstoqueArmacoesPage() {
  const { data: armacoes = [], isLoading } = useArmacoes();
  const createArmação = useCreateArmação();
  const { data: tamanhos = [] } = useTamanhos();
  const createTamanho = useCreateTamanho();
  const { toast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<ArmaçãoStatus | 'all'>('all');
  const [filtroTipo, setFiltroTipo] = useState<ArmaçãoTipo | 'all'>('all');
  const [filtroTamanho, setFiltroTamanho] = useState<string>('all');

  // Form state
  const [tipo, setTipo] = useState<ArmaçãoTipo>('unissex');
  const [tamanhoId, setTamanhoId] = useState<string>('none');
  const [novoTamanho, setNovoTamanho] = useState('');
  const [isCriandoTamanho, setIsCriandoTamanho] = useState(false);

  // Resumo por tamanho para visualização rápida do estoque
  const resumoPorTamanho = useMemo(() => {
    const mapa = new Map<
      string,
      { total: number; disponiveis: number; utilizadas: number; outros: number }
    >();

    armacoes.forEach((a) => {
      const chave = a.tamanho?.nome || 'Sem tamanho';
      if (!mapa.has(chave)) {
        mapa.set(chave, { total: 0, disponiveis: 0, utilizadas: 0, outros: 0 });
      }
      const item = mapa.get(chave)!;
      item.total += 1;
      if (a.status === 'disponivel') item.disponiveis += 1;
      else if (a.status === 'utilizada') item.utilizadas += 1;
      else item.outros += 1;
    });

    return Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [armacoes]);

  const armacoesFiltradas = useMemo(() => {
    return armacoes.filter((armacao) => {
      if (
        busca &&
        !armacao.numeracao.toLowerCase().includes(busca.toLowerCase()) &&
        !(armacao.tamanho && armacao.tamanho.nome.toLowerCase().includes(busca.toLowerCase()))
      ) {
        return false;
      }
      if (filtroStatus !== 'all' && armacao.status !== filtroStatus) {
        return false;
      }
      if (filtroTipo !== 'all' && armacao.tipo !== filtroTipo) {
        return false;
      }
      if (filtroTamanho !== 'all') {
        if (filtroTamanho === 'none') {
          // Filtrar armações sem tamanho
          if (armacao.tamanhoId) {
            return false;
          }
        } else {
          // Filtrar por tamanho específico
          if (armacao.tamanhoId !== filtroTamanho) {
            return false;
          }
        }
      }
      return true;
    });
  }, [armacoes, busca, filtroStatus, filtroTipo, filtroTamanho]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Nenhum campo obrigatório além do tipo (que tem valor padrão)

    try {
      let tamanhoIdFinal = tamanhoId === 'none' ? undefined : tamanhoId;

      // Se está criando um novo tamanho, valide se já existe primeiro
      if (isCriandoTamanho && novoTamanho.trim()) {
        // Verificar se tamanho já existe (usando o hook diretamente)
        const tamanhoExistente = tamanhos.find(t => t.nome.toLowerCase() === novoTamanho.trim().toLowerCase());
        if (tamanhoExistente) {
          toast({
            title: 'Erro',
            description: `Tamanho "${novoTamanho.trim()}" já existe no sistema. Selecione-o da lista ou escolha outro nome.`,
            variant: 'destructive',
          });
          return;
        }

        const tamanhoCriado = await createTamanho.mutateAsync({
          nome: novoTamanho.trim(),
        });
        tamanhoIdFinal = tamanhoCriado.id;
      }

      await createArmação.mutateAsync({
        tipo,
        tamanhoId: tamanhoIdFinal,
      });

      setCreateDialogOpen(false);
      setTipo('unissex');
      setTamanhoId('none');
      setNovoTamanho('');
      setIsCriandoTamanho(false);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const hasActiveFilters = busca || filtroStatus !== 'all' || filtroTipo !== 'all' || filtroTamanho !== 'all';

  const clearFilters = () => {
    setBusca('');
    setFiltroStatus('all');
    setFiltroTipo('all');
    setFiltroTamanho('all');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Estoque de Armações</h1>
        </div>
        <LoadingState variant="table" rows={10} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Estoque</h1>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {armacoesFiltradas.length}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setImportDialogOpen(true)}
            className="flex-1 md:flex-none"
          >
            <Upload className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Importar</span>
            <span className="sm:hidden">Import</span>
          </Button>
          <Button 
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="flex-1 md:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nova</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Filtros - Layout Responsivo */}
      <div className="space-y-3">
        {/* Busca - sempre em destaque */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por numeração..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Filtros em grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Select
            value={filtroStatus}
            onValueChange={(v) => setFiltroStatus(v as ArmaçãoStatus | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filtroTipo}
            onValueChange={(v) => setFiltroTipo(v as ArmaçãoTipo | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(tipoLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={filtroTamanho}
            onValueChange={setFiltroTamanho}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tamanho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="none">Sem tamanho</SelectItem>
              {tamanhos.map((tamanho) => (
                <SelectItem key={tamanho.id} value={tamanho.id}>
                  {tamanho.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Resumo por Tamanho - Cards Responsivos */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Estoque por Tamanho</h2>
        
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {resumoPorTamanho.map(([nome, stats]) => (
            <div key={nome} className="border rounded-lg p-3 md:p-4 bg-card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                {/* Tamanho */}
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <span className="text-2xl md:text-3xl font-extrabold text-blue-600 dark:text-blue-400 uppercase">
                    {nome}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Disponíveis</div>
                  <div className="text-3xl md:text-4xl font-extrabold text-green-600 dark:text-green-400">
                    {stats.disponiveis}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    de {stats.total} total
                  </div>
                </div>
              </div>
            </div>
          ))}
          {resumoPorTamanho.length === 0 && (
            <div className="border rounded-lg p-6 text-sm text-muted-foreground text-center col-span-full">
              Nenhuma armação cadastrada ainda.
            </div>
          )}
        </div>
      </div>

      {/* Lista de Armações */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Todas as Armações</h2>
        
        {/* Desktop: Tabela */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
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
              {armacoesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-0">
                    <EmptyState
                      icon={Search}
                      title={
                        armacoes.length === 0
                          ? 'Nenhuma armação cadastrada'
                          : 'Nenhuma armação encontrada'
                      }
                      description={
                        armacoes.length === 0
                          ? 'Comece adicionando sua primeira armação ao estoque.'
                          : 'Tente ajustar os filtros para encontrar armações.'
                      }
                      action={
                        armacoes.length === 0
                          ? {
                              label: 'Adicionar Armação',
                              onClick: () => setCreateDialogOpen(true),
                            }
                          : undefined
                      }
                      className="border-0 shadow-none"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                armacoesFiltradas.map((armacao) => (
                  <TableRow key={armacao.id}>
                    <TableCell className="font-medium">#{armacao.numeracao}</TableCell>
                    <TableCell>{tipoLabels[armacao.tipo]}</TableCell>
                    <TableCell>{armacao.tamanho?.nome || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusBadgeStyles[armacao.status]}>
                        {statusLabels[armacao.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-2">
          {armacoesFiltradas.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <EmptyState
                icon={Search}
                title={
                  armacoes.length === 0
                    ? 'Nenhuma armação cadastrada'
                    : 'Nenhuma armação encontrada'
                }
                description={
                  armacoes.length === 0
                    ? 'Comece adicionando sua primeira armação ao estoque.'
                    : 'Tente ajustar os filtros para encontrar armações.'
                }
                action={
                  armacoes.length === 0
                    ? {
                        label: 'Adicionar Armação',
                        onClick: () => setCreateDialogOpen(true),
                      }
                    : undefined
                }
                className="border-0 shadow-none"
              />
            </div>
          ) : (
            armacoesFiltradas.map((armacao) => (
              <div key={armacao.id} className="border rounded-lg p-3 bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">#{armacao.numeracao}</span>
                  <Badge className={statusBadgeStyles[armacao.status]}>
                    {statusLabels[armacao.status]}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <div className="font-medium">{tipoLabels[armacao.tipo]}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tamanho:</span>
                    <div className="font-medium">{armacao.tamanho?.nome || '-'}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialog de criação */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Armação</DialogTitle>
            <DialogDescription>
              A numeração será gerada automaticamente pelo sistema.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as ArmaçãoTipo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="unissex">Unissex</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tamanho">
                Tamanho
              </Label>
              {isCriandoTamanho ? (
                <div className="space-y-2">
                  <Input
                    id="novoTamanho"
                    value={novoTamanho}
                    onChange={(e) => setNovoTamanho(e.target.value)}
                    placeholder="Digite o nome do novo tamanho..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsCriandoTamanho(false);
                      setNovoTamanho('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Select
                  value={tamanhoId}
                  onValueChange={(value) => {
                    if (value === 'novo') {
                      setIsCriandoTamanho(true);
                      setTamanhoId('');
                    } else {
                      setTamanhoId(value);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tamanho (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {tamanhos.map((tamanho) => (
                      <SelectItem key={tamanho.id} value={tamanho.id}>
                        {tamanho.nome}
                      </SelectItem>
                    ))}
                    <SelectItem value="novo">➕ Criar novo tamanho</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createArmação.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createArmação.isPending}>
                {createArmação.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Importação */}
      <ImportArmacoesModal
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}
