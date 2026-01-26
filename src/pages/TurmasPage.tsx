import { useState, useMemo } from 'react';
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
import { useTurmas } from '@/hooks/use-turmas';
import { useEscolas } from '@/hooks/use-escolas';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Search, 
  ChevronDown, 
  MoreHorizontal,
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Shift, Turma } from '@/types';
import { CreateTurmaForm } from '@/components/forms/CreateTurmaForm';
import { EditTurmaForm } from '@/components/forms/EditTurmaForm';
import { ViewTurmaDialog } from '@/components/turmas/ViewTurmaDialog';
import { DeleteTurmaDialog } from '@/components/turmas/DeleteTurmaDialog';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getAvatarColor } from '@/lib/page-utils';

const turnoLabels: Record<Shift, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
  noite: 'Noite',
};

export const TurmasPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [selectedTurmas, setSelectedTurmas] = useState<Set<string>>(new Set());
  const [searchNome, setSearchNome] = useState('');
  const { data: turmas = [], isLoading: turmasLoading } = useTurmas();
  const { data: escolas = [] } = useEscolas();

  const turmasFiltradas = useMemo(() => {
    if (!searchNome) return turmas;
    return turmas.filter(turma => 
      turma.nome.toLowerCase().includes(searchNome.toLowerCase()) ||
      getEscolaNome(turma.escolaId).toLowerCase().includes(searchNome.toLowerCase())
    );
  }, [turmas, searchNome]);

  const getEscolaNome = (escolaId: string) => {
    return escolas.find(e => e.id === escolaId)?.nome || '-';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTurmas(new Set(turmasFiltradas.map(t => t.id)));
    } else {
      setSelectedTurmas(new Set());
    }
  };

  const handleSelectTurma = (turmaId: string, checked: boolean) => {
    const newSelected = new Set(selectedTurmas);
    if (checked) {
      newSelected.add(turmaId);
    } else {
      newSelected.delete(turmaId);
    }
    setSelectedTurmas(newSelected);
  };

  const allSelected = turmasFiltradas.length > 0 && selectedTurmas.size === turmasFiltradas.length;

  if (turmasLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com título e badge */}
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {turmasFiltradas.length}
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
                Nova Turma
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
      </div>

      {/* Tabela */}
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
              <TableHead>Nome</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Turno</TableHead>
              <TableHead className="hidden md:table-cell">Escola</TableHead>
              <TableHead>Ano Letivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turmasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground h-32">
                  {turmas.length === 0 
                    ? 'Nenhuma turma cadastrada'
                    : 'Nenhuma turma encontrada com os filtros selecionados'}
                </TableCell>
              </TableRow>
            ) : (
              turmasFiltradas.map((turma) => {
                const isSelected = selectedTurmas.has(turma.id);
                const isAtivo = turma.status === 'ativo';
                
                return (
                  <TableRow 
                    key={turma.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedTurma(turma);
                      setEditDialogOpen(true);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectTurma(turma.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selecionar ${turma.nome}`}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTurma(turma);
                        setEditDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("h-10 w-10", getAvatarColor(turma.nome))}>
                          <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(turma.nome))}>
                            <Users className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{turma.nome}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{turma.serie}</TableCell>
                    <TableCell>{turnoLabels[turma.turno]}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getEscolaNome(turma.escolaId)}
                    </TableCell>
                    <TableCell>{turma.anoLetivo}</TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          "font-medium gap-1.5",
                          isAtivo 
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
                        )}
                      >
                        {isAtivo ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Ativa
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inativa
                          </>
                        )}
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
                            setSelectedTurma(turma);
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
                            setSelectedTurma(turma);
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
                                setSelectedTurma(turma);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTurma(turma);
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
                                setSelectedTurma(turma);
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
      <CreateTurmaForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewTurmaDialog 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen}
        turma={selectedTurma}
      />
      <EditTurmaForm 
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedTurma(null);
        }}
        turmaId={selectedTurma?.id || null}
      />
      <DeleteTurmaDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedTurma(null);
        }}
        turma={selectedTurma}
      />
    </div>
  );
};
