import { useState } from 'react';
import { Calendar, Filter, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  onDateRangeChange?: (startDate: Date, endDate: Date) => void;
  onMunicipioChange?: (municipioId: string | null) => void;
  onEscolaChange?: (escolaId: string | null) => void;
  onExport?: () => void;
  municipios?: { id: string; nome: string }[];
  escolas?: { id: string; nome: string }[];
}

type PeriodPreset = '7d' | '30d' | '90d' | 'thisMonth' | 'lastMonth' | 'custom';

export function DashboardFilters({
  onDateRangeChange,
  onMunicipioChange,
  onEscolaChange,
  onExport,
  municipios = [],
  escolas = []
}: DashboardFiltersProps) {
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('30d');
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedMunicipio, setSelectedMunicipio] = useState<string | null>(null);
  const [selectedEscola, setSelectedEscola] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePeriodChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const now = new Date();
    let start: Date;
    let end: Date = now;

    switch (preset) {
      case '7d':
        start = subDays(now, 7);
        break;
      case '30d':
        start = subDays(now, 30);
        break;
      case '90d':
        start = subDays(now, 90);
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'custom':
        setIsCalendarOpen(true);
        return;
      default:
        start = subDays(now, 30);
    }

    setStartDate(start);
    setEndDate(end);
    onDateRangeChange?.(start, end);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!startDate || date! < startDate) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }

    if (startDate && date) {
      onDateRangeChange?.(startDate, date);
    }
  };

  const handleMunicipioChange = (municipioId: string) => {
    const value = municipioId === 'all' ? null : municipioId;
    setSelectedMunicipio(value);
    setSelectedEscola(null); // Reset school when municipality changes
    onMunicipioChange?.(value);
  };

  const handleEscolaChange = (escolaId: string) => {
    const value = escolaId === 'all' ? null : escolaId;
    setSelectedEscola(value);
    onEscolaChange?.(value);
  };

  const clearFilters = () => {
    setPeriodPreset('30d');
    setStartDate(subDays(new Date(), 30));
    setEndDate(new Date());
    setSelectedMunicipio(null);
    setSelectedEscola(null);
    onDateRangeChange?.(subDays(new Date(), 30), new Date());
    onMunicipioChange?.(null);
    onEscolaChange?.(null);
  };

  const hasActiveFilters = selectedMunicipio || selectedEscola || periodPreset !== '30d';

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Period Filter */}
          <div className="flex-1 w-full lg:w-auto">
            <Label className="text-sm font-medium mb-2 block">Período</Label>
            <div className="flex gap-2">
              <Select value={periodPreset} onValueChange={(value: PeriodPreset) => handlePeriodChange(value)}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                  <SelectItem value="thisMonth">Este mês</SelectItem>
                  <SelectItem value="lastMonth">Mês anterior</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              {periodPreset === 'custom' && (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[180px]">
                      {startDate && endDate
                        ? `${format(startDate, 'dd/MM', { locale: ptBR })} - ${format(endDate, 'dd/MM', { locale: ptBR })}`
                        : 'Selecionar datas'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="range"
                      selected={{ from: startDate, to: endDate }}
                      onSelect={(range) => {
                        if (range?.from) setStartDate(range.from);
                        if (range?.to) setEndDate(range.to);
                        if (range?.from && range?.to) {
                          onDateRangeChange?.(range.from, range.to);
                          setIsCalendarOpen(false);
                        }
                      }}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          {/* Municipio Filter */}
          <div className="flex-1 w-full lg:w-auto">
            <Label className="text-sm font-medium mb-2 block">Município</Label>
            <Select value={selectedMunicipio || 'all'} onValueChange={handleMunicipioChange}>
              <SelectTrigger className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Todos os municípios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os municípios</SelectItem>
                {municipios.map((municipio) => (
                  <SelectItem key={municipio.id} value={municipio.id}>
                    {municipio.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Escola Filter */}
          <div className="flex-1 w-full lg:w-auto">
            <Label className="text-sm font-medium mb-2 block">Escola</Label>
            <Select
              value={selectedEscola || 'all'}
              onValueChange={handleEscolaChange}
              disabled={!selectedMunicipio}
            >
              <SelectTrigger className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={selectedMunicipio ? "Todas as escolas" : "Selecione um município"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as escolas</SelectItem>
                {escolas.map((escola) => (
                  <SelectItem key={escola.id} value={escola.id}>
                    {escola.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full lg:w-auto mt-4 lg:mt-0">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex-1 lg:flex-none"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex-1 lg:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
