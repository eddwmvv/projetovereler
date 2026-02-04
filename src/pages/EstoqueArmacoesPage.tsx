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
import { Plus, Search, X, Upload, ChevronLeft, ChevronRight, LogOut, Loader2, Boxes } from 'lucide-react';
import { useArmacoes, useArmacoesPaginated, useCreateArmação, useTamanhos, useCreateTamanho, useUpdateArmacaoComAuditoria } from '@/hooks/use-armacoes';
import { Armação, ArmaçãoTipo, ArmaçãoStatus, Tamanho } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
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
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 50;
  
  // Carregar todos os dados para o resumo por tamanho (necessário para mostrar todas as categorias)
  const { data: todasArmacoes = [], isLoading } = useArmacoes();
  
  // Carregar dados paginados para a lista (otimização de performance)
  const { data: dadosPaginated } = useArmacoesPaginated(paginaAtual, ITENS_POR_PAGINA);
  const armacoes = dadosPaginated?.data || [];
  const totalArmacoes = dadosPaginated?.total || 0;
  
  const createArmação = useCreateArmação();
  const { data: tamanhos = [] } = useTamanhos();
  const createTamanho = useCreateTamanho();
  const updateArmacao = useUpdateArmacaoComAuditoria();
  const { user } = useAuth();
  const { toast } = useToast();

  const [updatingIds, setUpdatingIds] = useState<Record<string, boolean>>({});

  const setUpdating = (id: string, value: boolean) => {
    setUpdatingIds((prev) => ({ ...prev, [id]: value }));
  };

  const requireUserId = () => {
    if (!user?.id) {
      toast({
        title: 'Sessão inválida',
        description: 'Faça login novamente para realizar alterações no estoque.',
        variant: 'destructive',
      });
      return null;
    }
    return user.id;
  };

  const handleAlterarStatus = async (armacao: Armação, statusNovo: ArmaçãoStatus) => {
    const usuarioId = requireUserId();
    if (!usuarioId) return;

    if (armacao.status === statusNovo) return;

    setUpdating(armacao.id, true);
    try {
      await updateArmacao.mutateAsync({
        armacao,
        usuarioId,
        acao: 'alteracao',
        statusNovo,
      });
    } finally {
      setUpdating(armacao.id, false);
    }
  };

  const handleAlterarTamanho = async (armacao: Armação, tamanhoIdValue: string) => {
    const usuarioId = requireUserId();
    if (!usuarioId) return;

    const tamanhoIdNovo = tamanhoIdValue === 'none' ? null : tamanhoIdValue;
    if ((armacao.tamanhoId ?? null) === tamanhoIdNovo) return;

    const tamanhoNovo = tamanhoIdNovo ? tamanhos.find((t) => t.id === tamanhoIdNovo) : null;

    setUpdating(armacao.id, true);
    try {
      await updateArmacao.mutateAsync({
        armacao,
        usuarioId,
        acao: 'alteracao',
        tamanhoIdNovo,
        tamanhoNovoNome: tamanhoNovo?.nome ?? null,
      });
    } finally {
      setUpdating(armacao.id, false);
    }
  };

  const handleSaida = async (armacao: Armação) => {
    const usuarioId = requireUserId();
    if (!usuarioId) return;

    // Saída = marcar como utilizada (retira do estoque disponível)
    if (armacao.status === 'utilizada') return;

    const ok = confirm(`Confirmar SAÍDA da armação #${armacao.numeracao}?\n\nO status será alterado para "Utilizada".`);
    if (!ok) return;

    setUpdating(armacao.id, true);
    try {
      await updateArmacao.mutateAsync({
        armacao,
        usuarioId,
        acao: 'saida',
        statusNovo: 'utilizada',
      });
    } finally {
      setUpdating(armacao.id, false);
    }
  };

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<ArmaçãoStatus | 'all'>('disponivel');
  const [filtroTipo, setFiltroTipo] = useState<ArmaçãoTipo | 'all'>('all');
  const [filtroTamanho, setFiltroTamanho] = useState<string>('all');

  const aplicarFiltroTamanho = (value: string) => {
    // Se o usuário filtrar por tamanho, faz sentido mostrar também as não disponíveis.
    // Mantemos a escolha do usuário se ele já tiver mudado o filtro de status manualmente.
    if (value !== 'all' && filtroStatus === 'disponivel') {
      setFiltroStatus('all');
    }
    setFiltroTamanho(value);
  };

  // Form state
  const [tipo, setTipo] = useState<ArmaçãoTipo>('unissex');
  const [tamanhoId, setTamanhoId] = useState<string>('none');
  const [novoTamanho, setNovoTamanho] = useState('');
  const [isCriandoTamanho, setIsCriandoTamanho] = useState(false);

  // Resumo por tamanho para visualização rápida do estoque (usa TODOS os dados)
  const resumoPorTamanho = useMemo(() => {
    const mapa = new Map<
      string,
      { total: number; disponiveis: number; utilizadas: number; outros: number }
    >();

    todasArmacoes.forEach((a) => {
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
  }, [todasArmacoes]);

  const armacoesFiltradas = useMemo(() => {
    const filtradas = armacoes.filter((armacao) => {
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

    // Regra: itens não disponíveis devem aparecer por último (mantendo numeração em ordem)
    return filtradas.sort((a, b) => {
      const wa = a.status === 'disponivel' ? 0 : 1;
      const wb = b.status === 'disponivel' ? 0 : 1;
      if (wa !== wb) return wa - wb;
      return a.numeracao.localeCompare(b.numeracao);
    });
  }, [armacoes, busca, filtroStatus, filtroTipo, filtroTamanho]);

  // Paginação
  const totalPaginas = Math.ceil(armacoesFiltradas.length / ITENS_POR_PAGINA);
  const armacoesPaginadas = useMemo(() => {
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    return armacoesFiltradas.slice(inicio, fim);
  }, [armacoesFiltradas, paginaAtual, ITENS_POR_PAGINA]);

  // Reset página ao mudar filtros
  useMemo(() => {
    setPaginaAtual(1);
  }, [busca, filtroStatus, filtroTipo, filtroTamanho]);

  // Form state

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
    setPaginaAtual(1);
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
            {totalArmacoes}
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
            onValueChange={aplicarFiltroTamanho}
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

      {/* Resumo por Tamanho - Scroll Horizontal Infinito Mobile */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Estoque por Tamanho</h2>
          <span className="md:hidden text-xs text-muted-foreground">Arraste →</span>
        </div>
        
        {/* Mobile: Scroll Horizontal */}
        <div className="md:hidden -mx-4">
          <div className="overflow-x-auto px-4 pb-4 scrollbar-hide">
            <div className="flex gap-3 min-w-max">
              {resumoPorTamanho.map(([nome, stats]) => {
                const tamanhoObj = tamanhos.find(t => t.nome === nome);
                const isSelected = tamanhoObj ? filtroTamanho === tamanhoObj.id : filtroTamanho === 'none';
                
                return (
                <button
                  key={nome} 
                  onClick={() => {
                    if (tamanhoObj) {
                      aplicarFiltroTamanho(isSelected ? 'all' : tamanhoObj.id);
                    } else {
                      aplicarFiltroTamanho(isSelected ? 'all' : 'none');
                    }
                  }}
                  className={`w-[160px] flex-shrink-0 rounded-xl border-2 bg-white dark:bg-slate-900 p-4 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200 ${
                    isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                      : 'border-transparent hover:border-blue-300'
                  }`}
                >
                  {/* Tamanho Badge - Retangular */}
                  <div className="flex items-center justify-center mb-3">
                    <div className={`w-full h-[72px] rounded-2xl flex items-center justify-center shadow-md transition-all px-3 ${
                      isSelected 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 scale-105' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      <span className="text-2xl font-black text-white uppercase tracking-tight text-center break-words leading-tight">
                        {nome}
                      </span>
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-center mb-2">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Disponíveis</div>
                  </div>

                  {/* Número grande */}
                  <div className="text-center mb-2">
                    <div className="text-[42px] leading-none font-black bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                      {stats.disponiveis}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-center mb-3">
                    <div className="text-sm text-muted-foreground">
                      de <span className="font-bold text-foreground">{stats.total}</span> total
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full">
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${stats.total > 0 ? (stats.disponiveis / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </button>
                );
              })}
              {resumoPorTamanho.length === 0 && (
                <div className="w-full text-sm text-muted-foreground text-center py-8">
                  Nenhuma armação cadastrada ainda.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {resumoPorTamanho.map(([nome, stats]) => {
            const tamanhoObj = tamanhos.find(t => t.nome === nome);
            const isSelected = tamanhoObj ? filtroTamanho === tamanhoObj.id : filtroTamanho === 'none';
            
            return (
            <button 
              key={nome}
              onClick={() => {
                if (tamanhoObj) {
                  aplicarFiltroTamanho(isSelected ? 'all' : tamanhoObj.id);
                } else {
                  aplicarFiltroTamanho(isSelected ? 'all' : 'none');
                }
              }}
              className={`group rounded-2xl border-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left ${
                isSelected 
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
                  : 'border-transparent hover:border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Tamanho Badge - Retangular */}
                <div className={`min-w-[80px] h-16 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all px-3 ${
                  isSelected 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 scale-105' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  <span className="text-2xl font-black text-white uppercase tracking-tight text-center break-words leading-tight">
                    {nome}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Disponíveis</div>
                  <div className="text-4xl font-black bg-gradient-to-r from-emerald-500 to-green-500 bg-clip-text text-transparent">
                    {stats.disponiveis}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">de</span>
                    <span className="text-sm font-bold text-foreground">{stats.total}</span>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${stats.total > 0 ? (stats.disponiveis / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>{stats.utilizadas} em uso</span>
                  <span>{stats.outros > 0 ? `${stats.outros} outros` : ''}</span>
                </div>
              </div>
            </button>
            );
          })}
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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {armacoesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState
                      icon={Search}
                      title={
                        totalArmacoes === 0
                          ? 'Nenhuma armação cadastrada'
                          : 'Nenhuma armação encontrada'
                      }
                      description={
                        totalArmacoes === 0
                          ? 'Comece adicionando sua primeira armação ao estoque.'
                          : 'Tente ajustar os filtros para encontrar armações.'
                      }
                      action={
                        totalArmacoes === 0
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
                armacoesPaginadas.map((armacao) => {
                  const isUpdating = !!updatingIds[armacao.id];

                  return (
                    <TableRow key={armacao.id}>
                      <TableCell className="font-medium">#{armacao.numeracao}</TableCell>
                      <TableCell>{tipoLabels[armacao.tipo]}</TableCell>
                      <TableCell>
                        <Select
                          value={armacao.tamanhoId ?? 'none'}
                          onValueChange={(v) => handleAlterarTamanho(armacao, v)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue placeholder="Tamanho" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sem tamanho</SelectItem>
                            {tamanhos.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={armacao.status}
                          onValueChange={(v) => handleAlterarStatus(armacao, v as ArmaçãoStatus)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="h-8 w-[160px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleSaida(armacao)}
                            disabled={isUpdating || armacao.status === 'utilizada'}
                            title={armacao.status === 'utilizada' ? 'Armação já está como Utilizada' : 'Registrar saída (status: Utilizada)'}
                          >
                            <LogOut className="h-4 w-4" />
                            Saída
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação Desktop */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-2">
            <div className="text-sm text-muted-foreground">
              Mostrando {(paginaAtual - 1) * ITENS_POR_PAGINA + 1} a{' '}
              {Math.min(paginaAtual * ITENS_POR_PAGINA, armacoesFiltradas.length)} de{' '}
              {armacoesFiltradas.length} armações
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(page => {
                    // Mostrar primeira, última, atual e adjacentes
                    return (
                      page === 1 ||
                      page === totalPaginas ||
                      Math.abs(page - paginaAtual) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    // Adicionar ellipsis se houver gap
                    const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsisBefore && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={paginaAtual === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPaginaAtual(page)}
                          className="w-9"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile: Cards melhorados */}
        <div className="md:hidden space-y-2.5">
          {armacoesFiltradas.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <EmptyState
                icon={Search}
                title={
                  totalArmacoes === 0
                    ? 'Nenhuma armação cadastrada'
                    : 'Nenhuma armação encontrada'
                }
                description={
                  totalArmacoes === 0
                    ? 'Comece adicionando sua primeira armação ao estoque.'
                    : 'Tente ajustar os filtros para encontrar armações.'
                }
                action={
                  totalArmacoes === 0
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
            armacoesPaginadas.map((armacao) => (
              <div 
                key={armacao.id} 
                className="group relative rounded-xl p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200"
              >
                {/* Header com numeração e status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shadow-sm">
                      <span className="text-xs font-black text-white">#</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{armacao.numeracao}</span>
                  </div>
                  <Badge className={`${statusBadgeStyles[armacao.status]} shadow-sm`}>
                    {statusLabels[armacao.status]}
                  </Badge>
                </div>
                
                {/* Detalhes */}
                <div className="flex items-center gap-4">
                  {/* Tipo */}
                  <div className="flex-1 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Tipo</div>
                    <div className="text-sm font-semibold text-foreground">{tipoLabels[armacao.tipo]}</div>
                  </div>
                  
                  {/* Tamanho */}
                  <div className="flex-1 p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">Tamanho</div>
                    <div className="text-sm font-semibold text-foreground">
                      {armacao.tamanho?.nome ? (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold">
                          {armacao.tamanho.nome}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações (mobile) */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Select
                    value={armacao.tamanhoId ?? 'none'}
                    onValueChange={(v) => handleAlterarTamanho(armacao, v)}
                    disabled={!!updatingIds[armacao.id]}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem tamanho</SelectItem>
                      {tamanhos.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={armacao.status}
                    onValueChange={(v) => handleAlterarStatus(armacao, v as ArmaçãoStatus)}
                    disabled={!!updatingIds[armacao.id]}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleSaida(armacao)}
                    disabled={!!updatingIds[armacao.id] || armacao.status === 'utilizada'}
                  >
                    {!!updatingIds[armacao.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Saída (marcar como Utilizada)
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginação Mobile */}
        {totalPaginas > 1 && (
          <div className="flex flex-col gap-3 px-1">
            <div className="text-xs text-center text-muted-foreground">
              {(paginaAtual - 1) * ITENS_POR_PAGINA + 1} - {Math.min(paginaAtual * ITENS_POR_PAGINA, armacoesFiltradas.length)} de {armacoesFiltradas.length}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="flex-1 max-w-[100px]"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold min-w-[60px] text-center">
                  {paginaAtual} / {totalPaginas}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="flex-1 max-w-[100px]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
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
