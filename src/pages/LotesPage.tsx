import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Package, Clock, CheckCircle2, Eye, Loader2, X, ArrowRightLeft } from 'lucide-react';
import { CreateLoteDialog } from '@/components/lotes/CreateLoteDialog';
import { ViewLoteDialog } from '@/components/lotes/ViewLoteDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';

type LoteStatus = 'criado' | 'em_preparo' | 'recebido';

interface Lote {
  id: string;
  nome: string;
  descricao?: string;
  escola_nome: string;
  municipio_nome: string;
  turno: 'manha' | 'tarde' | 'integral' | 'noite';
  status: LoteStatus;
  data_criacao: string;
  data_preparo?: string;
  data_recebimento?: string;
  total_oculos: number;
  total_entregue: number;
  observacoes?: string;
}

const statusConfig = {
  criado: {
    label: 'Criado',
    icon: Package,
    color: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    textMain: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  em_preparo: {
    label: 'Em Preparo',
    icon: Clock,
    color: 'from-amber-500 to-orange-500',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    textMain: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
  },
  recebido: {
    label: 'Recebido',
    icon: CheckCircle2,
    color: 'from-emerald-500 to-green-500',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    textMain: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
};

const turnoLabels = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
  noite: 'Noite',
};

const turnoColors = {
  manha: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  tarde: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  integral: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  noite: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export const LotesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | LoteStatus>('all');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar lotes
  const { data: lotes = [], isLoading } = useQuery({
    queryKey: ['lotes'],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('buscar_lotes_com_detalhes');
      if (error) throw error;
      return data as Lote[];
    },
  });

  // Filtrar lotes
  const filteredLotes = useMemo(() => {
    return lotes.filter((lote) => {
      const matchesSearch =
        lote.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lote.escola_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lote.municipio_nome.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lote.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [lotes, searchTerm, statusFilter]);

  // Paginação
  const totalPaginas = Math.ceil(filteredLotes.length / itensPorPagina);
  const lotesPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    return filteredLotes.slice(inicio, fim);
  }, [filteredLotes, paginaAtual, itensPorPagina]);

  // Reset página ao mudar filtros
  useMemo(() => {
    setPaginaAtual(1);
  }, [searchTerm, statusFilter]);

  // Estatísticas por status
  const statsPorStatus = useMemo(() => {
    const stats: Record<string, { total: number; oculos: number }> = {
      criado: { total: 0, oculos: 0 },
      em_preparo: { total: 0, oculos: 0 },
      recebido: { total: 0, oculos: 0 },
    };

    lotes.forEach((lote) => {
      stats[lote.status].total += 1;
      stats[lote.status].oculos += lote.total_oculos;
    });

    return stats;
  }, [lotes]);

  // Total geral
  const statsGerais = useMemo(() => ({
    total: lotes.length,
    oculos: lotes.reduce((acc, l) => acc + l.total_oculos, 0),
    entregues: lotes.reduce((acc, l) => acc + l.total_entregue, 0),
  }), [lotes]);

  const handleViewLote = (lote: Lote) => {
    setSelectedLote(lote);
    setViewDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaginaAtual(1);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all';

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lotes</h1>
        </div>
        <LoadingState variant="table" rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lotes</h1>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {filteredLotes.length}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm"
            onClick={() => setCreateDialogOpen(true)}
            className="flex-1 md:flex-none"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Novo Lote</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Cards de Resumo por Status */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Lotes por Status</h2>
        
        {/* Mobile: Scroll Horizontal */}
        <div className="md:hidden -mx-4">
          <div className="overflow-x-auto px-4 pb-4 scrollbar-hide">
            <div className="flex gap-3 min-w-max">
              {/* Card Geral */}
              <button
                onClick={() => setStatusFilter('all')}
                className={`w-[160px] flex-shrink-0 rounded-xl border-2 bg-white dark:bg-slate-900 p-4 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200 ${
                  statusFilter === 'all'
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-full h-[60px] rounded-2xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-md">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-center mb-2">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Total</div>
                </div>
                <div className="text-center mb-2">
                  <div className="text-[36px] leading-none font-black bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
                    {statsGerais.total}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">
                    {statsGerais.oculos} óculos
                  </div>
                </div>
              </button>

              {/* Cards por Status */}
              {(Object.keys(statusConfig) as LoteStatus[]).map((status) => {
                const config = statusConfig[status];
                const stats = statsPorStatus[status];
                const isSelected = statusFilter === status;

                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(isSelected ? 'all' : status)}
                    className={`w-[160px] flex-shrink-0 rounded-xl border-2 bg-white dark:bg-slate-900 p-4 shadow-md hover:shadow-lg active:scale-[0.97] transition-all duration-200 ${
                      isSelected
                        ? `border-transparent ring-2 ring-${config.color.split('-')[1]}-500`
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-3">
                      <div className={`w-full h-[60px] rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md`}>
                        <config.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center mb-2">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{config.label}</div>
                    </div>
                    <div className="text-center mb-2">
                      <div className={`text-[36px] leading-none font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                        {stats.total}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">
                        {stats.oculos} óculos
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid gap-4 grid-cols-2 lg:grid-cols-4">
          {/* Card Geral */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`group rounded-2xl border-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left ${
              statusFilter === 'all'
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="min-w-[60px] h-14 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total</div>
                <div className="text-4xl font-black text-slate-700 dark:text-slate-300">
                  {statsGerais.total}
                </div>
                <div className="text-xs text-muted-foreground">
                  {statsGerais.oculos} óculos
                </div>
              </div>
            </div>
          </button>

          {/* Cards por Status */}
          {(Object.keys(statusConfig) as LoteStatus[]).map((status) => {
            const config = statusConfig[status];
            const stats = statsPorStatus[status];
            const isSelected = statusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(isSelected ? 'all' : status)}
                className={`group rounded-2xl border-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-left ${
                  isSelected
                    ? `border-transparent ring-2 ring-${config.color.split('-')[1]}-500`
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`min-w-[60px] h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-all`}>
                    <config.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{config.label}</div>
                    <div className={`text-4xl font-black bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                      {stats.total}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stats.oculos} óculos
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, escola ou município..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as LoteStatus | 'all')}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {(Object.keys(statusConfig) as LoteStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {statusConfig[status].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote</TableHead>
              <TableHead>Escola</TableHead>
              <TableHead>Município</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Óculos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotesPaginados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <EmptyState
                    icon={Package}
                    title={lotes.length === 0 ? 'Nenhum lote cadastrado' : 'Nenhum lote encontrado'}
                    description={
                      lotes.length === 0
                        ? 'Comece criando seu primeiro lote de óculos.'
                        : 'Tente ajustar os filtros para encontrar lotes.'
                    }
                    action={
                      lotes.length === 0
                        ? {
                            label: 'Criar Lote',
                            onClick: () => setCreateDialogOpen(true),
                          }
                        : undefined
                    }
                    className="border-0 shadow-none"
                  />
                </TableCell>
              </TableRow>
            ) : (
              lotesPaginados.map((lote) => {
                const statusInfo = statusConfig[lote.status];
                const StatusIcon = statusInfo.icon;
                const isEmPreparo = lote.status === 'em_preparo';

                return (
                  <TableRow key={lote.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${statusInfo.color} flex items-center justify-center shadow-sm`}>
                          <StatusIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{lote.nome}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(lote.data_criacao), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lote.escola_nome}</TableCell>
                    <TableCell>{lote.municipio_nome}</TableCell>
                    <TableCell>
                      <Badge className={turnoColors[lote.turno]}>
                        {turnoLabels[lote.turno]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusInfo.bgLight} ${statusInfo.textMain} ${statusInfo.border}`}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold">{lote.total_oculos}</span>
                        {lote.total_entregue > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {lote.total_entregue} entregues
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLote(lote)}
                        className="gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Paginação Desktop */}
        {totalPaginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/50">
            <div className="text-sm text-muted-foreground">
              Mostrando {(paginaAtual - 1) * itensPorPagina + 1} a{' '}
              {Math.min(paginaAtual * itensPorPagina, filteredLotes.length)} de{' '}
              {filteredLotes.length} lotes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
              >
                Anterior
              </Button>
              <span className="text-sm font-medium">
                {paginaAtual} / {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {lotesPaginados.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <EmptyState
                icon={Package}
                title={lotes.length === 0 ? 'Nenhum lote cadastrado' : 'Nenhum lote encontrado'}
                description={
                  lotes.length === 0
                    ? 'Comece criando seu primeiro lote de óculos.'
                    : 'Tente ajustar os filtros para encontrar lotes.'
                }
                action={
                  lotes.length === 0
                    ? {
                        label: 'Criar Lote',
                        onClick: () => setCreateDialogOpen(true),
                      }
                    : undefined
                }
              />
            </CardContent>
          </Card>
        ) : (
          lotesPaginados.map((lote) => {
            const statusInfo = statusConfig[lote.status];
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={lote.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${statusInfo.color} flex items-center justify-center shadow-md`}>
                        <StatusIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{lote.nome}</CardTitle>
                        <CardDescription>
                          {format(new Date(lote.data_criacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${statusInfo.bgLight} ${statusInfo.textMain} ${statusInfo.border}`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">Escola</div>
                      <div className="font-medium text-sm">{lote.escola_nome}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">Município</div>
                      <div className="font-medium text-sm">{lote.municipio_nome}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">Turno</div>
                      <Badge className={turnoColors[lote.turno]}>{turnoLabels[lote.turno]}</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">Óculos</div>
                      <div className="font-bold text-lg">{lote.total_oculos}</div>
                    </div>
                  </div>

                  {/* Progresso de entregas */}
                  {lote.total_entregue > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Entregues</span>
                        <span className="font-medium">{lote.total_entregue} de {lote.total_oculos}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
                          style={{ width: `${(lote.total_entregue / lote.total_oculos) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewLote(lote)}
                    className="w-full gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}

        {/* Paginação Mobile */}
        {totalPaginas > 1 && (
          <div className="flex flex-col gap-3 px-1">
            <div className="text-xs text-center text-muted-foreground">
              {(paginaAtual - 1) * itensPorPagina + 1} - {Math.min(paginaAtual * itensPorPagina, filteredLotes.length)} de {filteredLotes.length}
            </div>
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                disabled={paginaAtual === 1}
                className="flex-1 max-w-[100px]"
              >
                Anterior
              </Button>
              <span className="text-sm font-semibold min-w-[60px] text-center">
                {paginaAtual} / {totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                disabled={paginaAtual === totalPaginas}
                className="flex-1 max-w-[100px]"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Diálogos */}
      <CreateLoteDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['lotes'] });
          setCreateDialogOpen(false);
        }}
      />
      
      {selectedLote && (
        <ViewLoteDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          lote={selectedLote}
          onStatusChange={() => {
            queryClient.invalidateQueries({ queryKey: ['lotes'] });
          }}
        />
      )}
    </div>
  );
};
