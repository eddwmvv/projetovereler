import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, User } from 'lucide-react';
import { HistoricoFase, StudentPhase } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HistoricoMudancasFaseProps {
  historico: HistoricoFase[];
}

const faseLabels: Record<StudentPhase, string> = {
  triagem: 'Triagem',
  consulta: 'Consulta',
  producao_de_oculos: 'Produção de Óculos',
  entregue: 'Entregue',
};

const faseColors: Record<StudentPhase, string> = {
  triagem: 'bg-blue-100 text-blue-800 border-blue-300',
  consulta: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  producao_de_oculos: 'bg-green-100 text-green-800 border-green-300',
  entregue: 'bg-gray-100 text-gray-800 border-gray-300',
};

export function HistoricoMudancasFase({ historico }: HistoricoMudancasFaseProps) {
  if (historico.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Histórico de Mudanças de Fase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma mudança de fase registrada ainda.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Histórico de Mudanças de Fase ({historico.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {historico.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Indicador de fase */}
              <div className="flex-shrink-0">
                <Badge className={faseColors[item.fase]}>
                  {faseLabels[item.fase]}
                </Badge>
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                {/* Observações (contém informação sobre a mudança) */}
                {item.observacoes && (
                  <p className="text-sm text-foreground mb-2">{item.observacoes}</p>
                )}

                {/* Data e usuário */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(item.data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  {item.userName && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {item.userName}
                      {item.userEmail && (
                        <span className="text-muted-foreground/70">
                          ({item.userEmail})
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
