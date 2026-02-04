import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MunicipioData {
  id: string;
  nome: string;
  alunos: number;
  escolas: number;
  coordenadas?: { lat: number; lng: number };
}

interface MapaMunicipiosProps {
  municipios: MunicipioData[];
  title?: string;
  onMunicipioClick?: (municipioId: string) => void;
}

export function MapaMunicipios({
  municipios,
  title = "Municípios Atendidos",
  onMunicipioClick
}: MapaMunicipiosProps) {
  const totalAlunos = municipios.reduce((sum, m) => sum + m.alunos, 0);
  const totalEscolas = municipios.reduce((sum, m) => sum + m.escolas, 0);

  // Sort by number of students
  const sortedMunicipios = [...municipios].sort((a, b) => b.alunos - a.alunos);

  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 dark:text-blue-300">Total de Alunos</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {totalAlunos.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700 dark:text-emerald-300">Total de Escolas</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {totalEscolas.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Municipio List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Municípios por número de alunos
          </h4>
          {sortedMunicipios.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum município encontrado</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {sortedMunicipios.map((municipio, index) => {
                const percentage = totalAlunos > 0 ? (municipio.alunos / totalAlunos) * 100 : 0;
                return (
                  <div
                    key={municipio.id}
                    onClick={() => onMunicipioClick?.(municipio.id)}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200",
                      "hover:shadow-md cursor-pointer",
                      "bg-white dark:bg-slate-800",
                      "border-slate-200 dark:border-slate-700",
                      "hover:border-blue-300 dark:hover:border-blue-700"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                          index < 3 ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                        )}>
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {municipio.nome}
                        </span>
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {municipio.alunos.toLocaleString('pt-BR')} alunos
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>{municipio.escolas} escola{municipio.escolas !== 1 ? 's' : ''}</span>
                      <span>{percentage.toFixed(1)}% do total</span>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
