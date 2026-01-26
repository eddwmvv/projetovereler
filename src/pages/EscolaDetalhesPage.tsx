import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useEscola } from '@/hooks/use-escolas';
import { useTurmasByEscola } from '@/hooks/use-turmas';
import { CreateTurmaForm } from '@/components/forms/CreateTurmaForm';
import { Shift } from '@/types';

const turnoLabels: Record<Shift, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
  noite: 'Noite',
};

interface EscolaDetalhesPageProps {
  escolaId: string;
  onBack: () => void;
}

export const EscolaDetalhesPage = ({ escolaId, onBack }: EscolaDetalhesPageProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: escola, isLoading: escolaLoading } = useEscola(escolaId);
  const { data: turmas = [], isLoading: turmasLoading } = useTurmasByEscola(escolaId);

  if (escolaLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!escola) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Escola não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{escola.nome}</h1>
          <p className="text-muted-foreground">Turmas da escola</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Turmas</CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Turma
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {turmasLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Carregando turmas...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Série</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Ano Letivo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhuma turma cadastrada nesta escola
                    </TableCell>
                  </TableRow>
                ) : (
                  turmas.map((turma) => (
                    <TableRow key={turma.id}>
                      <TableCell className="font-medium">{turma.nome}</TableCell>
                      <TableCell>{turma.serie}</TableCell>
                      <TableCell>{turnoLabels[turma.turno]}</TableCell>
                      <TableCell>{turma.anoLetivo}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={turma.status === 'ativo' ? 'default' : 'secondary'}
                        >
                          {turma.status === 'ativo' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateTurmaForm 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        escolaId={escolaId}
      />
    </div>
  );
};
