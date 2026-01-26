import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { RelatorioFiltros, StudentPhase, Gender } from '@/types';
import { useEscolas } from '@/hooks/use-escolas';
import { useMunicipios } from '@/hooks/use-municipios';
import { useEmpresas } from '@/hooks/use-empresas';

interface FiltrosRelatorioProps {
  filtros: RelatorioFiltros;
  onFiltrosChange: (filtros: RelatorioFiltros) => void;
  onLimparFiltros: () => void;
}

export function FiltrosRelatorio({ filtros, onFiltrosChange, onLimparFiltros }: FiltrosRelatorioProps) {
  const { data: escolas = [] } = useEscolas();
  const { data: municipios = [] } = useMunicipios();
  const { data: empresas = [] } = useEmpresas();

  const [fasesSelecionadas, setFasesSelecionadas] = useState<StudentPhase[]>(filtros.fase || []);

  const toggleFase = (fase: StudentPhase) => {
    const novasFases = fasesSelecionadas.includes(fase)
      ? fasesSelecionadas.filter((f) => f !== fase)
      : [...fasesSelecionadas, fase];
    setFasesSelecionadas(novasFases);
    onFiltrosChange({ ...filtros, fase: novasFases.length > 0 ? novasFases : undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros do Relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Período Início */}
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !filtros.periodoInicio && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filtros.periodoInicio ? format(filtros.periodoInicio, 'dd/MM/yyyy') : 'Selecione'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filtros.periodoInicio}
                  onSelect={(date) => onFiltrosChange({ ...filtros, periodoInicio: date || undefined })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Período Fim */}
          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('w-full justify-start text-left font-normal', !filtros.periodoFim && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filtros.periodoFim ? format(filtros.periodoFim, 'dd/MM/yyyy') : 'Selecione'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filtros.periodoFim}
                  onSelect={(date) => onFiltrosChange({ ...filtros, periodoFim: date || undefined })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Escola */}
          <div className="space-y-2">
            <Label>Escola</Label>
            <Select
              value={filtros.escolaId}
              onValueChange={(value) => onFiltrosChange({ ...filtros, escolaId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as escolas" />
              </SelectTrigger>
              <SelectContent>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Município */}
          <div className="space-y-2">
            <Label>Município</Label>
            <Select
              value={filtros.municipioId}
              onValueChange={(value) => onFiltrosChange({ ...filtros, municipioId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os municípios" />
              </SelectTrigger>
              <SelectContent>
                {municipios.map((municipio) => (
                  <SelectItem key={municipio.id} value={municipio.id}>
                    {municipio.nome} - {municipio.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <Label>Empresa</Label>
            <Select
              value={filtros.empresaId}
              onValueChange={(value) => onFiltrosChange({ ...filtros, empresaId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as empresas" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nomeFantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gênero */}
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select
              value={filtros.genero}
              onValueChange={(value) => onFiltrosChange({ ...filtros, genero: value as Gender })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os gêneros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
                <SelectItem value="nao_informado">Não Informado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fases */}
        <div className="space-y-2">
          <Label>Fases</Label>
          <div className="flex flex-wrap gap-4">
            {(['triagem', 'consulta', 'producao_de_oculos', 'entregue'] as StudentPhase[]).map((fase) => {
              const faseLabels: Record<StudentPhase, string> = {
                triagem: 'Triagem',
                consulta: 'Consulta',
                producao_de_oculos: 'Produção de Óculos',
                entregue: 'Entregue',
              };
              return (
                <div key={fase} className="flex items-center space-x-2">
                  <Checkbox
                    id={fase}
                    checked={fasesSelecionadas.includes(fase)}
                    onCheckedChange={() => toggleFase(fase)}
                  />
                  <label htmlFor={fase} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {faseLabels[fase]}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botão Limpar */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onLimparFiltros}>
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
