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
import { Aluno, StudentPhase } from '@/types';
import { cn } from '@/lib/utils';

interface RecentStudentsTableProps {
  students: Aluno[];
}

const phaseLabels: Record<StudentPhase, string> = {
  triagem: 'Triagem',
  consulta: 'Consulta',
  producao_de_oculos: 'Produção de Óculos',
  entregue: 'Entregue',
};

const phaseBadgeStyles: Record<StudentPhase, string> = {
  triagem: 'bg-primary/10 text-primary hover:bg-primary/20',
  consulta: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  producao_de_oculos: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
  entregue: 'bg-muted text-muted-foreground hover:bg-muted',
};

export const RecentStudentsTable = ({ students }: RecentStudentsTableProps) => {
  return (
    <Card>
      <CardHeader className="pb-2 md:pb-3">
        <CardTitle className="text-base md:text-lg font-semibold">Alunos Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
        {/* Desktop: Tabela */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Fase Atual</TableHead>
                <TableHead>Data Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{student.nomeCompleto}</TableCell>
                  <TableCell>
                    <Badge className={cn('font-medium', phaseBadgeStyles[student.faseAtual])}>
                      {phaseLabels[student.faseAtual]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.createdAt.toLocaleDateString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-2">
          {students.map((student) => (
            <div 
              key={student.id} 
              className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{student.nomeCompleto}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {student.createdAt.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Badge className={cn('font-medium text-xs shrink-0', phaseBadgeStyles[student.faseAtual])}>
                  {phaseLabels[student.faseAtual]}
                </Badge>
              </div>
            </div>
          ))}
          {students.length === 0 && (
            <div className="text-center py-6 text-sm text-muted-foreground">
              Nenhum aluno cadastrado recentemente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
