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
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Alunos Recentes</h3>
          <p className="text-sm text-gray-500 mt-1">Últimos cadastros do sistema</p>
        </div>

        {/* Desktop: Tabela */}
        <div className="hidden md:block">
          <div className="space-y-1 divide-y divide-gray-100">
            {students.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                Nenhum aluno cadastrado recentemente
              </div>
            ) : (
              students.map((student) => (
                <div 
                  key={student.id}
                  className="py-4 px-2 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{student.nomeCompleto}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {student.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className={cn('font-medium text-xs ml-4 shrink-0', phaseBadgeStyles[student.faseAtual])}>
                    {phaseLabels[student.faseAtual]}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-2">
          {students.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              Nenhum aluno cadastrado recentemente
            </div>
          ) : (
            students.map((student) => (
              <div 
                key={student.id} 
                className="p-4 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{student.nomeCompleto}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {student.createdAt.toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge className={cn('font-medium text-xs shrink-0', phaseBadgeStyles[student.faseAtual])}>
                    {phaseLabels[student.faseAtual]}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
