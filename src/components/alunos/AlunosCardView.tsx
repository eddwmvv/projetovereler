import { Aluno } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { Eye, Edit, MoreHorizontal, Trash2, GraduationCap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StudentPhase } from '@/types';
import { cn } from '@/lib/utils';

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

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) return '??';
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

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

interface AlunosCardViewProps {
  alunos: Aluno[];
  onView?: (aluno: Aluno) => void;
  onEdit?: (aluno: Aluno) => void;
  onDelete?: (aluno: Aluno) => void;
  getEscolaNome?: (escolaId: string) => string;
  getTurmaNome?: (turmaId: string) => string;
  calculateAge?: (birthDate: Date) => number;
}

export function AlunosCardView({
  alunos,
  onView,
  onEdit,
  onDelete,
  getEscolaNome,
  getTurmaNome,
  calculateAge,
}: AlunosCardViewProps) {
  if (alunos.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title="Nenhum aluno encontrado"
        description="Não há alunos para exibir no momento."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {alunos.map((aluno) => (
        <Card
          key={aluno.id}
          className={cn(
            "cursor-pointer hover:bg-muted/50 transition-colors",
            onView && "hover:shadow-lg"
          )}
          onClick={() => onView?.(aluno)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className={cn('h-12 w-12 flex-shrink-0', getAvatarColor(aluno.nomeCompleto))}>
                  <AvatarFallback className={cn('text-white font-semibold', getAvatarColor(aluno.nomeCompleto))}>
                    {getInitials(aluno.nomeCompleto)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{aluno.nomeCompleto}</h3>
                  {calculateAge && (
                    <p className="text-sm text-muted-foreground">
                      {calculateAge(aluno.dataNascimento)} anos
                    </p>
                  )}
                </div>
              </div>
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
                  {onView && (
                    <DropdownMenuItem onClick={() => onView(aluno)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(aluno)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(aluno)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Badge className={cn('font-medium', phaseBadgeStyles[aluno.faseAtual])}>
                {phaseLabels[aluno.faseAtual]}
              </Badge>

              <div className="space-y-1 text-sm">
                {getTurmaNome && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Turma:</span>
                    <span className="font-medium">{getTurmaNome(aluno.turmaId)}</span>
                  </div>
                )}
                {getEscolaNome && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Escola:</span>
                    <span className="font-medium truncate ml-2">{getEscolaNome(aluno.escolaId)}</span>
                  </div>
                )}
                {aluno.responsavelLegal && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground truncate">
                      Responsável: {aluno.responsavelLegal}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
