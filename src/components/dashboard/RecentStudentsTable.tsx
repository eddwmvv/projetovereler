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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Alunos Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Fase Atual</TableHead>
              <TableHead className="hidden md:table-cell">Data Cadastro</TableHead>
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
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {student.createdAt.toLocaleDateString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
