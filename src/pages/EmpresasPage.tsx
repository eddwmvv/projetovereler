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
  Building2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { CreateEmpresaForm } from '@/components/forms/CreateEmpresaForm';
import { EditEmpresaForm } from '@/components/forms/EditEmpresaForm';
import { ViewEmpresaDialog } from '@/components/empresas/ViewEmpresaDialog';
import { DeleteEmpresaDialog } from '@/components/empresas/DeleteEmpresaDialog';
import { Empresa } from '@/types';
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

export const EmpresasPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [selectedEmpresas, setSelectedEmpresas] = useState<Set<string>>(new Set());
  const [searchNome, setSearchNome] = useState('');
  const { data: empresas = [], isLoading } = useEmpresas();

  const empresasFiltradas = useMemo(() => {
    if (!searchNome) return empresas;
    return empresas.filter(empresa => 
      empresa.nomeFantasia.toLowerCase().includes(searchNome.toLowerCase()) ||
      empresa.razaoSocial.toLowerCase().includes(searchNome.toLowerCase())
    );
  }, [empresas, searchNome]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmpresas(new Set(empresasFiltradas.map(e => e.id)));
    } else {
      setSelectedEmpresas(new Set());
    }
  };

  const handleSelectEmpresa = (empresaId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmpresas);
    if (checked) {
      newSelected.add(empresaId);
    } else {
      newSelected.delete(empresaId);
    }
    setSelectedEmpresas(newSelected);
  };

  const allSelected = empresasFiltradas.length > 0 && selectedEmpresas.size === empresasFiltradas.length;

  if (isLoading) {
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
        <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {empresasFiltradas.length}
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
                Nova Empresa
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
              <TableHead className="hidden md:table-cell">Razão Social</TableHead>
              <TableHead className="hidden lg:table-cell">CNPJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-32">
                  {empresas.length === 0 
                    ? 'Nenhuma empresa cadastrada'
                    : 'Nenhuma empresa encontrada com os filtros selecionados'}
                </TableCell>
              </TableRow>
            ) : (
              empresasFiltradas.map((empresa) => {
                const isSelected = selectedEmpresas.has(empresa.id);
                const isAtivo = empresa.status === 'ativo';
                
                return (
                  <TableRow 
                    key={empresa.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedEmpresa(empresa);
                      setEditDialogOpen(true);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectEmpresa(empresa.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selecionar ${empresa.nomeFantasia}`}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmpresa(empresa);
                        setEditDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("h-10 w-10", getAvatarColor(empresa.nomeFantasia))}>
                          <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(empresa.nomeFantasia))}>
                            <Building2 className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{empresa.nomeFantasia}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {empresa.razaoSocial}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {empresa.cnpj}
                    </TableCell>
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
                            setSelectedEmpresa(empresa);
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
                            setSelectedEmpresa(empresa);
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
                                setSelectedEmpresa(empresa);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEmpresa(empresa);
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
                                setSelectedEmpresa(empresa);
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
      <CreateEmpresaForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewEmpresaDialog 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen}
        empresa={selectedEmpresa}
      />
      <EditEmpresaForm 
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedEmpresa(null);
        }}
        empresaId={selectedEmpresa?.id || null}
      />
      <DeleteEmpresaDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedEmpresa(null);
        }}
        empresa={selectedEmpresa}
      />
    </div>
  );
};
