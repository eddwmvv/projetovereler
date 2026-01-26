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
import { useProjetos } from '@/hooks/use-projetos';
import { useEmpresas } from '@/hooks/use-empresas';
import { useMunicipios } from '@/hooks/use-municipios';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Search, 
  ChevronDown, 
  MoreHorizontal,
  FolderKanban,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { CreateProjetoForm } from '@/components/forms/CreateProjetoForm';
import { EditProjetoForm } from '@/components/forms/EditProjetoForm';
import { ViewProjetoDialog } from '@/components/projetos/ViewProjetoDialog';
import { DeleteProjetoDialog } from '@/components/projetos/DeleteProjetoDialog';
import { Projeto } from '@/types';
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

export const ProjetosPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [selectedProjetos, setSelectedProjetos] = useState<Set<string>>(new Set());
  const [searchNome, setSearchNome] = useState('');
  const { data: projetos = [], isLoading: projetosLoading } = useProjetos();
  const { data: empresas = [] } = useEmpresas();
  const { data: municipios = [] } = useMunicipios();

  const projetosFiltrados = useMemo(() => {
    if (!searchNome) return projetos;
    return projetos.filter(projeto => 
      projeto.nome.toLowerCase().includes(searchNome.toLowerCase()) ||
      (projeto.descricao && projeto.descricao.toLowerCase().includes(searchNome.toLowerCase()))
    );
  }, [projetos, searchNome]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjetos(new Set(projetosFiltrados.map(p => p.id)));
    } else {
      setSelectedProjetos(new Set());
    }
  };

  const handleSelectProjeto = (projetoId: string, checked: boolean) => {
    const newSelected = new Set(selectedProjetos);
    if (checked) {
      newSelected.add(projetoId);
    } else {
      newSelected.delete(projetoId);
    }
    setSelectedProjetos(newSelected);
  };

  const allSelected = projetosFiltrados.length > 0 && selectedProjetos.size === projetosFiltrados.length;

  const getEmpresaNome = (empresaId: string) => {
    return empresas.find(e => e.id === empresaId)?.nomeFantasia || '-';
  };

  const getMunicipiosNomes = (municipiosIds: string[]) => {
    if (municipiosIds.length === 0) return 'Nenhum município';
    const nomes = municipiosIds
      .map(id => municipios.find(m => m.id === id)?.nome)
      .filter(Boolean);
    return nomes.length > 0 ? nomes.join(', ') : 'Nenhum município';
  };

  if (projetosLoading) {
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
        <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {projetosFiltrados.length}
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
                Novo Projeto
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
              <TableHead className="hidden md:table-cell">Descrição</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead className="hidden lg:table-cell">Municípios</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projetosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground h-32">
                  {projetos.length === 0 
                    ? 'Nenhum projeto cadastrado'
                    : 'Nenhum projeto encontrado com os filtros selecionados'}
                </TableCell>
              </TableRow>
            ) : (
              projetosFiltrados.map((projeto) => {
                const isSelected = selectedProjetos.has(projeto.id);
                const isAtivo = projeto.status === 'ativo';
                
                return (
                  <TableRow 
                    key={projeto.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedProjeto(projeto);
                      setEditDialogOpen(true);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectProjeto(projeto.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selecionar ${projeto.nome}`}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjeto(projeto);
                        setEditDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("h-10 w-10", getAvatarColor(projeto.nome))}>
                          <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(projeto.nome))}>
                            <FolderKanban className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{projeto.nome}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {projeto.descricao || '-'}
                    </TableCell>
                    <TableCell>{getEmpresaNome(projeto.empresaId)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {projeto.municipiosIds.length > 0 ? `${projeto.municipiosIds.length} município(s)` : 'Nenhum'}
                    </TableCell>
                    <TableCell>{projeto.anoAcao}</TableCell>
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
                            Ativo
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Finalizado
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
                            setSelectedProjeto(projeto);
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
                            setSelectedProjeto(projeto);
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
                                setSelectedProjeto(projeto);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProjeto(projeto);
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
                                setSelectedProjeto(projeto);
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
      <CreateProjetoForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewProjetoDialog 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen}
        projeto={selectedProjeto}
      />
      <EditProjetoForm 
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedProjeto(null);
        }}
        projetoId={selectedProjeto?.id || null}
      />
      <DeleteProjetoDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedProjeto(null);
        }}
        projeto={selectedProjeto}
      />
    </div>
  );
};
