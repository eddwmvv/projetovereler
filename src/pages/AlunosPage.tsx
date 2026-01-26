import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAlunos, useUpdateAlunosBatch } from '@/hooks/use-alunos';
import { useEscolas } from '@/hooks/use-escolas';
import { useEscolasByMunicipio } from '@/hooks/use-escolas';
import { useTurmas } from '@/hooks/use-turmas';
import { useTurmasByEscola } from '@/hooks/use-turmas';
import { useProjetos } from '@/hooks/use-projetos';
import { useMunicipios } from '@/hooks/use-municipios';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Eye,
  Plus,
  Trash2,
  X,
  Search,
  ChevronDown,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  UserCheck,
  FileCheck,
  Table2,
  LayoutGrid,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap
} from 'lucide-react';
import { StudentPhase, Aluno, AlunoRelatorio } from '@/types';
import { cn } from '@/lib/utils';
import { CreateAlunoForm } from '@/components/forms/CreateAlunoForm';
import { EditAlunoForm } from '@/components/forms/EditAlunoForm';
import { ViewAlunoDialog } from '@/components/alunos/ViewAlunoDialog';
import { DesligarAlunoDialog } from '@/components/alunos/DesligarAlunoDialog';
import { SelecionarArmaçãoModal } from '@/components/armacoes/SelecionarArmaçãoModal';
import { SelecionarArmacaoLoteModal } from '@/components/armacoes/SelecionarArmacaoLoteModal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlunosCardView } from '@/components/alunos/AlunosCardView';
import { exportacaoService } from '@/services/exportacao';
import { useToast } from '@/hooks/use-toast';
import { differenceInDays } from 'date-fns';
import { useAlunosInativos, useReativarAluno } from '@/hooks/use-alunos-inativos';
import { UserX, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const phaseLabels: Record<StudentPhase, string> = {
  triagem: 'Triagem',
  consulta: 'Consulta',
  producao_de_oculos: 'Produção de Óculos',
  entregue: 'Entregue',
};

const phaseBadgeStyles: Record<StudentPhase, string> = {
  triagem: 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
  consulta: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  producao_de_oculos: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  entregue: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const phaseIcons: Record<StudentPhase, typeof Clock> = {
  triagem: Clock,
  consulta: UserCheck,
  producao_de_oculos: FileCheck,
  entregue: CheckCircle2,
};

// Função para gerar iniciais do nome
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Função para gerar cor do avatar baseada no nome
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-orange-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

type ViewMode = 'table' | 'cards';
type SortColumn = 'nome' | 'idade' | 'turma' | 'escola' | 'fase' | 'createdAt';
type SortDirection = 'asc' | 'desc' | null;

export const AlunosPage = () => {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [selectedAlunos, setSelectedAlunos] = useState<Set<string>>(new Set());
  const [showArmaçãoModal, setShowArmaçãoModal] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<StudentPhase | null>(null);
  const [showInativosModal, setShowInativosModal] = useState(false);
  
  // Visualização e paginação
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Filtros
  const [searchNome, setSearchNome] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [filtroEscola, setFiltroEscola] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  
  const { data: alunos = [], isLoading: alunosLoading } = useAlunos();
  const { data: projetos = [] } = useProjetos();
  const { data: municipios = [] } = useMunicipios();
  const { data: escolas = [] } = useEscolas();
  const { data: escolasFiltradas = [] } = useEscolasByMunicipio(filtroCidade);
  const { data: turmas = [] } = useTurmas();
  const { data: turmasFiltradas = [] } = useTurmasByEscola(filtroEscola);
  const updateAlunosBatch = useUpdateAlunosBatch();

  // Dados para alunos inativos
  const { data: alunosInativos = [] } = useAlunosInativos();
  const reativarMutation = useReativarAluno();

  const getEscolaNome = (escolaId: string) => {
    return escolas.find(e => e.id === escolaId)?.nome || '-';
  };

  const getTurmaNome = (turmaId: string) => {
    return turmas.find(t => t.id === turmaId)?.nome || '-';
  };

  const getProjetoNome = (projetoId: string) => {
    return projetos.find(p => p.id === projetoId)?.nome || '-';
  };

  const getMunicipioNome = (municipioId: string) => {
    return municipios.find(m => m.id === municipioId)?.nome || '-';
  };

  // Função auxiliar para calcular idade
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Resetar filtros dependentes
  const handleCidadeChange = (cidadeId: string) => {
    setFiltroCidade(cidadeId);
    setFiltroEscola('');
    setFiltroTurma('');
  };

  const handleEscolaChange = (escolaId: string) => {
    setFiltroEscola(escolaId);
    setFiltroTurma('');
  };

  // Filtrar e ordenar alunos
  const alunosFiltrados = useMemo(() => {
    let filtrados = alunos.filter((aluno) => {
      // Filtro por nome
      if (searchNome && !aluno.nomeCompleto.toLowerCase().includes(searchNome.toLowerCase())) {
        return false;
      }

      // Filtro por projeto
      if (filtroProjeto && aluno.projetoId !== filtroProjeto) {
        return false;
      }

      // Filtro por cidade
      if (filtroCidade && aluno.municipioId !== filtroCidade) {
        return false;
      }

      // Filtro por escola
      if (filtroEscola && aluno.escolaId !== filtroEscola) {
        return false;
      }

      // Filtro por turma
      if (filtroTurma && aluno.turmaId !== filtroTurma) {
        return false;
      }

      return true;
    });

    // Ordenação
    if (sortColumn && sortDirection) {
      filtrados = [...filtrados].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortColumn) {
          case 'nome':
            aValue = a.nomeCompleto.toLowerCase();
            bValue = b.nomeCompleto.toLowerCase();
            break;
          case 'idade':
            aValue = calculateAge(a.dataNascimento);
            bValue = calculateAge(b.dataNascimento);
            break;
          case 'turma':
            aValue = getTurmaNome(a.turmaId);
            bValue = getTurmaNome(b.turmaId);
            break;
          case 'escola':
            aValue = getEscolaNome(a.escolaId);
            bValue = getEscolaNome(b.escolaId);
            break;
          case 'fase':
            aValue = a.faseAtual;
            bValue = b.faseAtual;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtrados;
  }, [alunos, searchNome, filtroProjeto, filtroCidade, filtroEscola, filtroTurma, sortColumn, sortDirection]);

  // Paginação
  const alunosPaginados = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return alunosFiltrados.slice(start, end);
  }, [alunosFiltrados, page, pageSize]);

  const totalPages = Math.ceil(alunosFiltrados.length / pageSize);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column || !sortDirection) {
      return null;
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Converter alunos para formato de exportação
  const alunosParaExportacao = useMemo((): AlunoRelatorio[] => {
    const alunosParaExportar = selectedAlunos.size > 0
      ? alunosFiltrados.filter(a => selectedAlunos.has(a.id))
      : alunosFiltrados;

    return alunosParaExportar.map((aluno) => {
      const idade = calculateAge(aluno.dataNascimento);
      return {
        ...aluno,
        idade,
        escolaNome: getEscolaNome(aluno.escolaId),
        turmaNome: getTurmaNome(aluno.turmaId),
        municipioNome: getMunicipioNome(aluno.municipioId),
        empresaNome: getProjetoNome(aluno.projetoId), // Simplificado
        diasNaFase: differenceInDays(new Date(), new Date(aluno.createdAt)),
      };
    });
  }, [alunosFiltrados, selectedAlunos, getEscolaNome, getTurmaNome, getMunicipioNome, getProjetoNome, calculateAge]);

  const handleExportarCSV = () => {
    try {
      exportacaoService.exportarAlunosCSV(
        alunosParaExportacao,
        selectedAlunos.size > 0 ? 'alunos_selecionados' : 'alunos_filtrados'
      );
      toast({
        title: 'Sucesso',
        description: 'Dados exportados para CSV com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar dados',
        variant: 'destructive',
      });
    }
  };

  const handleExportarExcel = () => {
    try {
      exportacaoService.exportarAlunosExcel(
        alunosParaExportacao,
        selectedAlunos.size > 0 ? 'alunos_selecionados' : 'alunos_filtrados'
      );
      toast({
        title: 'Sucesso',
        description: 'Dados exportados para Excel com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar dados',
        variant: 'destructive',
      });
    }
  };

  const handleExportarPDF = () => {
    try {
      exportacaoService.exportarAlunosPDF(
        alunosParaExportacao,
        selectedAlunos.size > 0 ? 'RELATÓRIO DE ALUNOS SELECIONADOS' : 'RELATÓRIO DE ALUNOS FILTRADOS'
      );
      toast({
        title: 'Sucesso',
        description: 'Dados exportados para PDF com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao exportar dados',
        variant: 'destructive',
      });
    }
  };

  const hasActiveFilters = searchNome || filtroProjeto || filtroCidade || filtroEscola || filtroTurma;

  const clearFilters = () => {
    setSearchNome('');
    setFiltroProjeto('');
    setFiltroCidade('');
    setFiltroEscola('');
    setFiltroTurma('');
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlunos(new Set(alunosFiltrados.map(a => a.id)));
    } else {
      setSelectedAlunos(new Set());
    }
  };

  const handleSelectAluno = (alunoId: string, checked: boolean) => {
    const newSelected = new Set(selectedAlunos);
    if (checked) {
      newSelected.add(alunoId);
    } else {
      newSelected.delete(alunoId);
    }
    setSelectedAlunos(newSelected);
  };

  const allSelected = alunosFiltrados.length > 0 && selectedAlunos.size === alunosFiltrados.length;
  const someSelected = selectedAlunos.size > 0 && selectedAlunos.size < alunosFiltrados.length;
  const hasMultipleSelected = selectedAlunos.size > 1;

  const handleBatchUpdatePhase = async (fase: StudentPhase) => {
    if (selectedAlunos.size === 0) return;

    // Se está mudando para "producao_de_oculos", sempre exibir modal de seleção de armação
    if (fase === 'producao_de_oculos') {
      setPendingPhase(fase);
      setShowArmaçãoModal(true);
      return;
    }

    // Para outras mudanças de fase, atualizar diretamente
    try {
      await updateAlunosBatch.mutateAsync({
        ids: Array.from(selectedAlunos),
        faseAtual: fase,
      });
      setSelectedAlunos(new Set());
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleArmaçãoSuccess = async () => {
    if (pendingPhase && selectedAlunos.size > 0) {
      try {
        await updateAlunosBatch.mutateAsync({
          ids: Array.from(selectedAlunos),
          faseAtual: pendingPhase,
        });
        setSelectedAlunos(new Set());
        setPendingPhase(null);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  const alunosSelecionadosParaArmação = alunos.filter((a) => selectedAlunos.has(a.id) && a.faseAtual === 'consulta');

  if (alunosLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
        </div>
        <LoadingState variant="table" rows={10} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com título e badge */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {alunosFiltrados.length}
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          {/* Botão Add com dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Aluno
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Botão Alunos Inativos */}
          <Button
            variant="outline"
            onClick={() => setShowInativosModal(true)}
            className="gap-2"
          >
            <UserX className="h-4 w-4" />
            Alunos Inativos
            {alunosInativos.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {alunosInativos.length}
              </Badge>
            )}
          </Button>

          {/* Campo de busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchNome}
              onChange={(e) => setSearchNome(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Controles de visualização e exportação */}
        <div className="flex items-center gap-2">
          {/* Toggle de visualização */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-r-none"
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Exportação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportarCSV} disabled={alunosParaExportacao.length === 0}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar CSV ({alunosParaExportacao.length} alunos)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportarExcel} disabled={alunosParaExportacao.length === 0}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel ({alunosParaExportacao.length} alunos)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportarPDF} disabled={alunosParaExportacao.length === 0}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar PDF ({alunosParaExportacao.length} alunos)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filtros rápidos ou Ações em massa */}
        {hasMultipleSelected ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">
              {selectedAlunos.size} selecionado(s)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchUpdatePhase('triagem')}
              disabled={updateAlunosBatch.isPending}
              className="gap-2"
            >
              <Clock className="h-4 w-4" />
              Triagem
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchUpdatePhase('consulta')}
              disabled={updateAlunosBatch.isPending}
              className="gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Consulta
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchUpdatePhase('producao_de_oculos')}
              disabled={updateAlunosBatch.isPending}
              className="gap-2"
            >
              <FileCheck className="h-4 w-4" />
              Produção de Óculos
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchUpdatePhase('entregue')}
              disabled={updateAlunosBatch.isPending}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Entregue
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedAlunos(new Set())}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Select 
              value={filtroProjeto || "all"} 
              onValueChange={(value) => setFiltroProjeto(value === "all" ? '' : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {projetos.map((projeto) => (
                  <SelectItem key={projeto.id} value={projeto.id}>
                    {projeto.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filtroCidade || "all"} 
              onValueChange={(value) => handleCidadeChange(value === "all" ? '' : value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {municipios.map((municipio) => (
                  <SelectItem key={municipio.id} value={municipio.id}>
                    {municipio.nome} - {municipio.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filtroEscola || "all"} 
              onValueChange={(value) => handleEscolaChange(value === "all" ? '' : value)}
              disabled={!filtroCidade}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue 
                  placeholder={filtroCidade ? "Escola" : "Selecione a cidade primeiro"} 
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as escolas</SelectItem>
                {(filtroCidade ? escolasFiltradas : escolas).map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
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
        )}
      </div>

      {/* Tabela ou Cards */}
      {viewMode === 'table' ? (
        <div className="space-y-4">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('nome')}
                  >
                    <div className="flex items-center gap-1">
                      Nome
                      {getSortIcon('nome') && <span className="text-xs">{getSortIcon('nome')}</span>}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="hidden md:table-cell cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('idade')}
                  >
                    <div className="flex items-center gap-1">
                      Idade
                      {getSortIcon('idade') && <span className="text-xs">{getSortIcon('idade')}</span>}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="hidden lg:table-cell cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('turma')}
                  >
                    <div className="flex items-center gap-1">
                      Turma
                      {getSortIcon('turma') && <span className="text-xs">{getSortIcon('turma')}</span>}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="hidden xl:table-cell cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('escola')}
                  >
                    <div className="flex items-center gap-1">
                      Escola
                      {getSortIcon('escola') && <span className="text-xs">{getSortIcon('escola')}</span>}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('fase')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {getSortIcon('fase') && <span className="text-xs">{getSortIcon('fase')}</span>}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                      {alunosPaginados.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="p-0">
                            <EmptyState
                              icon={hasActiveFilters ? Search : GraduationCap}
                              title={
                                alunos.length === 0
                                  ? 'Nenhum aluno cadastrado'
                                  : hasActiveFilters
                                  ? 'Nenhum aluno encontrado'
                                  : 'Nenhum aluno cadastrado'
                              }
                              description={
                                alunos.length === 0
                                  ? 'Comece adicionando seu primeiro aluno ao sistema.'
                                  : hasActiveFilters
                                  ? 'Tente ajustar os filtros para encontrar alunos.'
                                  : 'Comece adicionando seu primeiro aluno ao sistema.'
                              }
                              action={
                                alunos.length === 0
                                  ? {
                                      label: 'Adicionar Aluno',
                                      onClick: () => setCreateDialogOpen(true),
                                    }
                                  : hasActiveFilters
                                  ? {
                                      label: 'Limpar Filtros',
                                      onClick: clearFilters,
                                    }
                                  : {
                                      label: 'Adicionar Aluno',
                                      onClick: () => setCreateDialogOpen(true),
                                    }
                              }
                              className="border-0 shadow-none"
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                  alunosPaginados.map((aluno) => {
                const PhaseIcon = phaseIcons[aluno.faseAtual];
                const isSelected = selectedAlunos.has(aluno.id);
                
                return (
                  <TableRow
                    key={aluno.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedAluno(aluno);
                      setViewDialogOpen(true);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectAluno(aluno.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selecionar ${aluno.nomeCompleto}`}
                      />
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAluno(aluno);
                        setViewDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("h-10 w-10", getAvatarColor(aluno.nomeCompleto))}>
                          <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(aluno.nomeCompleto))}>
                            {getInitials(aluno.nomeCompleto)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{aluno.nomeCompleto}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {aluno.responsavelLegal || '-'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {calculateAge(aluno.dataNascimento)} anos
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {getTurmaNome(aluno.turmaId)}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {getEscolaNome(aluno.escolaId)}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('font-medium gap-1.5', phaseBadgeStyles[aluno.faseAtual])}>
                        <PhaseIcon className="h-3 w-3" />
                        {phaseLabels[aluno.faseAtual]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAluno(aluno);
                            setViewDialogOpen(true);
                          }}
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAluno(aluno);
                            setEditDialogOpen(true);
                          }}
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAluno(aluno);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAluno(aluno);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAluno(aluno);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, alunosFiltrados.length)} de {alunosFiltrados.length} alunos
                </p>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">por página</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground px-2">
                  de {totalPages}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <AlunosCardView
            alunos={alunosPaginados}
            onView={(aluno) => {
              setSelectedAluno(aluno);
              setViewDialogOpen(true);
            }}
            onEdit={(aluno) => {
              setSelectedAluno(aluno);
              setEditDialogOpen(true);
            }}
            onDelete={(aluno) => {
              setSelectedAluno(aluno);
              setDeleteDialogOpen(true);
            }}
            getEscolaNome={getEscolaNome}
            getTurmaNome={getTurmaNome}
            calculateAge={calculateAge}
          />

          {/* Paginação para cards */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, alunosFiltrados.length)} de {alunosFiltrados.length} alunos
                </p>
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12</SelectItem>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="48">48</SelectItem>
                    <SelectItem value="96">96</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">por página</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground px-2">
                  de {totalPages}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Modal Alunos Inativos */}
      <Dialog open={showInativosModal} onOpenChange={setShowInativosModal}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5" />
              Alunos Inativos
              <Badge variant="destructive" className="ml-2">
                {alunosInativos.length}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Alunos que foram marcados como inativos no sistema. Todos os dados são preservados.
            </DialogDescription>
          </DialogHeader>

          {alunosInativos.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum aluno inativo encontrado.</p>
            </div>
          ) : (
            <>
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Estes alunos foram marcados como inativos. Clique em "Reativar" para retorná-los ao sistema (voltam para a fase de triagem).
                </AlertDescription>
              </Alert>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {alunosInativos.map((aluno) => (
                  <div key={aluno.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {aluno.nomeCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{aluno.nomeCompleto}</div>
                          <div className="text-sm text-muted-foreground">
                            {getEscolaNome(aluno.escolaId)} • {getTurmaNome(aluno.turmaId)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Desligado por {aluno.usuario_desligamento_nome} em {new Date(aluno.data_desligamento).toLocaleDateString('pt-BR')}
                          </div>
                          {aluno.motivo_desligamento && (
                            <div className="text-xs text-muted-foreground mt-1 italic">
                              Motivo: {aluno.motivo_desligamento}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => reativarMutation.mutate(aluno.id)}
                      disabled={reativarMutation.isPending}
                      className="gap-2 ml-4"
                    >
                      <RefreshCw className={`w-4 h-4 ${reativarMutation.isPending ? 'animate-spin' : ''}`} />
                      Reativar
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreateAlunoForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewAlunoDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        aluno={selectedAluno}
        escolas={escolas}
        turmas={turmas}
        municipios={municipios}
      />
      <EditAlunoForm
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedAluno(null);
        }}
        alunoId={selectedAluno?.id || null}
        municipios={municipios}
        allEscolas={escolas}
        allTurmas={turmas}
      />
      <DesligarAlunoDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedAluno(null);
        }}
        aluno={selectedAluno}
      />
      {alunosSelecionadosParaArmação.length > 0 && (
        alunosSelecionadosParaArmação.length === 1 ? (
          <SelecionarArmaçãoModal
            open={showArmaçãoModal}
            onOpenChange={setShowArmaçãoModal}
            alunos={alunosSelecionadosParaArmação}
            onSuccess={handleArmaçãoSuccess}
          />
        ) : (
          <SelecionarArmacaoLoteModal
            open={showArmaçãoModal}
            onOpenChange={setShowArmaçãoModal}
            alunos={alunosSelecionadosParaArmação}
            onSuccess={handleArmaçãoSuccess}
          />
        )
      )}
    </div>
  );
};
