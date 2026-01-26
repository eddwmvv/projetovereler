import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useEscolas } from '@/hooks/use-escolas';
import { useMunicipios } from '@/hooks/use-municipios';
import { useEmpresas } from '@/hooks/use-empresas';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  Plus,
  Eye,
  Search,
  ChevronDown,
  MoreHorizontal,
  School,
  GraduationCap,
  Users,
  Upload
} from 'lucide-react';
import { CreateEscolaForm } from '@/components/forms/CreateEscolaForm';
import { EditEscolaForm } from '@/components/forms/EditEscolaForm';
import { ViewEscolaDialog } from '@/components/escolas/ViewEscolaDialog';
import { DeleteEscolaDialog } from '@/components/escolas/DeleteEscolaDialog';
import { CreateAlunoFormByEscola } from '@/components/forms/CreateAlunoFormByEscola';
import { CreateTurmaFormByEscola } from '@/components/forms/CreateTurmaFormByEscola';
import { ImportacaoAlunosDialog } from '@/components/importacao/ImportacaoAlunosDialog';
import { Escola } from '@/types';
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

export const EscolasPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createAlunoDialogOpen, setCreateAlunoDialogOpen] = useState(false);
  const [createTurmaDialogOpen, setCreateTurmaDialogOpen] = useState(false);
  const [selectedEscola, setSelectedEscola] = useState<Escola | null>(null);
  const [selectedEscolas, setSelectedEscolas] = useState<Set<string>>(new Set());
  const [searchNome, setSearchNome] = useState('');
  const { data: escolas = [], isLoading: escolasLoading } = useEscolas();
  const { data: municipios = [] } = useMunicipios();
  const { data: empresas = [] } = useEmpresas();

  const escolasFiltradas = useMemo(() => {
    if (!searchNome) return escolas;
    return escolas.filter(escola => 
      escola.nome.toLowerCase().includes(searchNome.toLowerCase()) ||
      getMunicipioNome(escola.municipioId).toLowerCase().includes(searchNome.toLowerCase())
    );
  }, [escolas, searchNome]);

  const getMunicipioNome = (municipioId: string) => {
    return municipios.find(m => m.id === municipioId)?.nome || '-';
  };

  const getEmpresaNome = (empresaId: string) => {
    return empresas.find(e => e.id === empresaId)?.nomeFantasia || '-';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEscolas(new Set(escolasFiltradas.map(e => e.id)));
    } else {
      setSelectedEscolas(new Set());
    }
  };

  const handleSelectEscola = (escolaId: string, checked: boolean) => {
    const newSelected = new Set(selectedEscolas);
    if (checked) {
      newSelected.add(escolaId);
    } else {
      newSelected.delete(escolaId);
    }
    setSelectedEscolas(newSelected);
  };

  const allSelected = escolasFiltradas.length > 0 && selectedEscolas.size === escolasFiltradas.length;

  if (escolasLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com título e badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-heading-md">Escolas</h1>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {escolasFiltradas.length}
          </div>
        </div>
        <div className="text-body-sm text-muted-foreground">
          Gerencie instituições de ensino e importe alunos em massa
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
                Nova Escola
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
              <TableHead>Município</TableHead>
              <TableHead className="hidden md:table-cell">Empresa</TableHead>
              <TableHead>Projetos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escolasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                  {escolas.length === 0 
                    ? 'Nenhuma escola cadastrada'
                    : 'Nenhuma escola encontrada com os filtros selecionados'}
                </TableCell>
              </TableRow>
            ) : (
              escolasFiltradas.map((escola) => {
                const isSelected = selectedEscolas.has(escola.id);
                
                return (
                  <TableRow 
                    key={escola.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedEscola(escola);
                      setEditDialogOpen(true);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectEscola(escola.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selecionar ${escola.nome}`}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEscola(escola);
                        setEditDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("h-10 w-10", getAvatarColor(escola.nome))}>
                          <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(escola.nome))}>
                            <School className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{escola.nome}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getMunicipioNome(escola.municipioId)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getEmpresaNome(escola.empresaId)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {escola.projetosIds.length} projeto(s)
                      </span>
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEscola(escola);
                            setCreateTurmaDialogOpen(true);
                          }}
                          title="Cadastrar Turma"
                        >
                          <Users className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEscola(escola);
                            setCreateAlunoDialogOpen(true);
                          }}
                          title="Cadastrar Aluno"
                        >
                          <GraduationCap className="w-4 h-4" />
                        </Button>
                        <ImportacaoAlunosDialog
                          escola={escola}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                              title="Importar Alunos em Massa"
                            >
                              <Upload className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEscola(escola);
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
                            setSelectedEscola(escola);
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
                                setSelectedEscola(escola);
                                setCreateTurmaDialogOpen(true);
                              }}
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Cadastrar Turma
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEscola(escola);
                                setCreateAlunoDialogOpen(true);
                              }}
                            >
                              <GraduationCap className="mr-2 h-4 w-4" />
                              Cadastrar Aluno
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEscola(escola);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEscola(escola);
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
                                setSelectedEscola(escola);
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
      <CreateEscolaForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewEscolaDialog 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen}
        escola={selectedEscola}
      />
      <EditEscolaForm 
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedEscola(null);
        }}
        escolaId={selectedEscola?.id || null}
      />
      <DeleteEscolaDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedEscola(null);
        }}
        escola={selectedEscola}
      />
      {selectedEscola && (
        <>
          <CreateTurmaFormByEscola
            open={createTurmaDialogOpen}
            onOpenChange={(open) => {
              setCreateTurmaDialogOpen(open);
              if (!open) {
                // Não limpar selectedEscola aqui, pois pode ser usado por outros modais
              }
            }}
            escolaId={selectedEscola.id}
            escola={selectedEscola}
          />
          <CreateAlunoFormByEscola
            open={createAlunoDialogOpen}
            onOpenChange={(open) => {
              setCreateAlunoDialogOpen(open);
              if (!open) {
                // Não limpar selectedEscola aqui, pois pode ser usado por outros modais
              }
            }}
            escolaId={selectedEscola.id}
            escola={selectedEscola}
          />
        </>
      )}
    </div>
  );
};
