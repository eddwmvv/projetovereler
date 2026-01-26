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
  MapPin
} from 'lucide-react';
import { CreateMunicipioForm } from '@/components/forms/CreateMunicipioForm';
import { EditMunicipioForm } from '@/components/forms/EditMunicipioForm';
import { ViewMunicipioDialog } from '@/components/municipios/ViewMunicipioDialog';
import { DeleteMunicipioDialog } from '@/components/municipios/DeleteMunicipioDialog';
import { Municipio } from '@/types';
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

export const MunicipiosPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMunicipio, setSelectedMunicipio] = useState<Municipio | null>(null);
  const [selectedMunicipios, setSelectedMunicipios] = useState<Set<string>>(new Set());
  const [searchNome, setSearchNome] = useState('');
  const { data: municipios = [], isLoading: municipiosLoading } = useMunicipios();

  const municipiosFiltrados = useMemo(() => {
    if (!searchNome) return municipios;
    return municipios.filter(municipio => 
      municipio.nome.toLowerCase().includes(searchNome.toLowerCase()) ||
      municipio.estado.toLowerCase().includes(searchNome.toLowerCase())
    );
  }, [municipios, searchNome]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMunicipios(new Set(municipiosFiltrados.map(m => m.id)));
    } else {
      setSelectedMunicipios(new Set());
    }
  };

  const handleSelectMunicipio = (municipioId: string, checked: boolean) => {
    const newSelected = new Set(selectedMunicipios);
    if (checked) {
      newSelected.add(municipioId);
    } else {
      newSelected.delete(municipioId);
    }
    setSelectedMunicipios(newSelected);
  };

  const allSelected = municipiosFiltrados.length > 0 && selectedMunicipios.size === municipiosFiltrados.length;

  if (municipiosLoading) {
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
        <h1 className="text-3xl font-bold tracking-tight">Municípios</h1>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {municipiosFiltrados.length}
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
                Novo Município
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
              <TableHead>Estado</TableHead>
              <TableHead>Projetos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {municipiosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-32">
                  {municipios.length === 0 
                    ? 'Nenhum município cadastrado'
                    : 'Nenhum município encontrado com os filtros selecionados'}
                </TableCell>
              </TableRow>
            ) : (
              municipiosFiltrados.map((municipio) => {
                const isSelected = selectedMunicipios.has(municipio.id);
                
                return (
                  <TableRow 
                    key={municipio.id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-muted/50"
                    )}
                    onClick={() => {
                      setSelectedMunicipio(municipio);
                      setEditDialogOpen(true);
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectMunicipio(municipio.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Selecionar ${municipio.nome}`}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMunicipio(municipio);
                        setEditDialogOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className={cn("h-10 w-10", getAvatarColor(municipio.nome))}>
                          <AvatarFallback className={cn("text-white font-semibold", getAvatarColor(municipio.nome))}>
                            <MapPin className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{municipio.nome}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{municipio.estado}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {municipio.projetosIds.length} projeto(s)
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
                            setSelectedMunicipio(municipio);
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
                            setSelectedMunicipio(municipio);
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
                                setSelectedMunicipio(municipio);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMunicipio(municipio);
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
                                setSelectedMunicipio(municipio);
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
      <CreateMunicipioForm open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <ViewMunicipioDialog 
        open={viewDialogOpen} 
        onOpenChange={setViewDialogOpen}
        municipio={selectedMunicipio}
      />
      <EditMunicipioForm 
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedMunicipio(null);
        }}
        municipioId={selectedMunicipio?.id || null}
      />
      <DeleteMunicipioDialog 
        open={deleteDialogOpen} 
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setSelectedMunicipio(null);
        }}
        municipio={selectedMunicipio}
      />
    </div>
  );
};
