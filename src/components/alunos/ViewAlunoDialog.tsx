import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Aluno, ArmaçãoTipo, ArmaçãoStatus, Escola, Turma, Municipio } from '@/types';

import { useUpdateAluno, useAluno } from '@/hooks/use-alunos';
import { useHistoricoFases } from '@/hooks/use-historico-fases';
import { useEscolas } from '@/hooks/use-escolas';
import { useTurmas } from '@/hooks/use-turmas';
import { useMunicipios } from '@/hooks/use-municipios';
import { useCurrentArmacaoForAluno, useReleaseCurrentArmacaoForAluno } from '@/hooks/use-armacoes';
import { cn } from '@/lib/utils';
import { StudentPhase } from '@/types';
import { CheckCircle2, Circle, Loader2, User, MapPin, GraduationCap, Calendar, FileText, Shield, Eye } from 'lucide-react';
import { HistoricoMudancasFase } from './HistoricoMudancasFase';
import { SelecionarArmaçãoModal } from '@/components/armacoes/SelecionarArmaçãoModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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

const sexoLabels: Record<string, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  outro: 'Outro',
  nao_informado: 'Não informado',
};

const armacaoTipoLabels: Record<ArmaçãoTipo, string> = {
  masculino: 'Masculino',
  feminino: 'Feminino',
  unissex: 'Unissex',
};

const armacaoStatusLabels: Record<ArmaçãoStatus, string> = {
  disponivel: 'Disponível',
  utilizada: 'Utilizada',
  perdida: 'Perdida',
  danificada: 'Danificada',
};

interface ViewAlunoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aluno: Aluno | null;
  escolas?: Escola[];
  turmas?: Turma[];
  municipios?: Municipio[];
}

export function ViewAlunoDialog({ open, onOpenChange, aluno, escolas: propEscolas, turmas: propTurmas, municipios: propMunicipios }: ViewAlunoDialogProps) {
  const [isEditingPhase, setIsEditingPhase] = useState(false);
  const [showArmaçãoModal, setShowArmaçãoModal] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<StudentPhase | null>(null);
  const { data: fallbackEscolas = [], isLoading: isLoadingEscolas } = useEscolas();
  const { data: fallbackTurmas = [], isLoading: isLoadingTurmas } = useTurmas();
  const { data: fallbackMunicipios = [], isLoading: isLoadingMunicipios } = useMunicipios();

  const escolas = propEscolas || fallbackEscolas;
  const turmas = propTurmas || fallbackTurmas;
  const municipios = propMunicipios || fallbackMunicipios;
  const updateAluno = useUpdateAluno();
  const { data: alunoAtualizado, isLoading: isLoadingAluno } = useAluno(aluno?.id || '');
  const { data: historico = [] } = useHistoricoFases(aluno?.id || '');
  const releaseCurrentArmacao = useReleaseCurrentArmacaoForAluno();

  // Usar aluno atualizado se disponível, senão usar o aluno passado como prop
  const alunoExibido = alunoAtualizado || aluno;

  // Hook para buscar armação só quando temos um ID válido
  const { data: armacao } = useCurrentArmacaoForAluno(alunoExibido?.id || '');

  const isLoading = isLoadingAluno;

  // Resetar estado de edição quando o diálogo fechar
  useEffect(() => {
    if (!open) {
      setIsEditingPhase(false);
      setShowArmaçãoModal(false);
      setPendingPhase(null);
    }
  }, [open]);

  if (!alunoExibido) return null;

  const escola = escolas.find(e => e.id === alunoExibido.escolaId);
  const turma = turmas.find(t => t.id === alunoExibido.turmaId);
  const municipio = municipios.find(m => m.id === alunoExibido.municipioId);

  const handlePhaseChange = async (newPhase: StudentPhase) => {
    if (!alunoExibido.id || newPhase === alunoExibido.faseAtual) {
      setIsEditingPhase(false);
      return;
    }

    // Se está mudando de "producao_de_oculos" para qualquer fase que não seja "entregue" ou "producao_de_oculos", liberar a armação
    // Note: Backend validation also prevents release when aluno is in 'entregue' phase
    if (alunoExibido.faseAtual === 'producao_de_oculos' && newPhase !== 'producao_de_oculos' && newPhase !== 'entregue') {
      try {
        await releaseCurrentArmacao.mutateAsync(alunoExibido.id);
      } catch (error) {
        // Error handled by hook
        return;
      }
    }

    // Se está mudando PARA "producao_de_oculos", exibir modal de seleção (sempre obrigatório)
    if (newPhase === 'producao_de_oculos') {
      setPendingPhase(newPhase);
      setShowArmaçãoModal(true);
      setIsEditingPhase(false);
      return;
    }

    // Para outras mudanças de fase, atualizar diretamente
    try {
      await updateAluno.mutateAsync({
        id: alunoExibido.id,
        data: { faseAtual: newPhase },
      });
      setIsEditingPhase(false);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const handleArmaçãoSuccess = async () => {
    if (pendingPhase && alunoExibido.id) {
      try {
        await updateAluno.mutateAsync({
          id: alunoExibido.id,
          data: { faseAtual: pendingPhase },
        });
        setPendingPhase(null);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Aluno</DialogTitle>
            <DialogDescription>
              Informações completas do aluno cadastrado.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 mt-4">
                {/* Nome */}
                <div>
                  <h3 className="text-lg font-semibold">{alunoExibido.nomeCompleto}</h3>
                  <p className="text-sm text-muted-foreground">
                    {calculateAge(alunoExibido.dataNascimento)} anos
                  </p>
                </div>

                {/* Fase Atual - Destaque */}
                <div className="space-y-3 p-4 bg-transparent rounded-lg">
                  <h4 className="font-medium text-sm text-muted-foreground uppercase">Fase Atual do Aluno</h4>
                  <div className="flex items-center gap-2">
                    {isEditingPhase ? (
                      <Select
                        value={alunoExibido.faseAtual}
                        onValueChange={(value) => {
                          handlePhaseChange(value as StudentPhase);
                          setIsEditingPhase(false);
                        }}
                        onOpenChange={(open) => {
                          if (!open) setIsEditingPhase(false);
                        }}
                        defaultOpen={true}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="triagem">Triagem</SelectItem>
                          <SelectItem value="consulta">Consulta</SelectItem>
                          <SelectItem value="producao_de_oculos">Produção de Óculos</SelectItem>
                          <SelectItem value="entregue">Entregue</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        className={cn(
                          'font-medium text-base px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity',
                          phaseBadgeStyles[alunoExibido.faseAtual]
                        )}
                        onClick={() => setIsEditingPhase(true)}
                        title="Clique para alterar a fase"
                      >
                        {phaseLabels[alunoExibido.faseAtual]}
                      </Badge>
                    )}
                  </div>
                  {/* Fluxo Visual - Design Inspirado na Referência */}
                  <div className="flex items-center mt-6 pt-4 border-t">
                    {/* Triagem */}
                    <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => handlePhaseChange('triagem')}>
                      <div className="relative flex items-center justify-center mb-2">
                        {/* Círculo */}
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-white",
                          alunoExibido.faseAtual === 'triagem'
                            ? "border-green-500"
                            : ['consulta', 'producao_de_oculos', 'entregue'].includes(alunoExibido.faseAtual)
                            ? "border-green-500"
                            : "border-gray-300"
                        )}>
                          {alunoExibido.faseAtual === 'triagem' || ['consulta', 'producao_de_oculos', 'entregue'].includes(alunoExibido.faseAtual) ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium transition-colors whitespace-nowrap",
                        alunoExibido.faseAtual === 'triagem'
                          ? "text-gray-900 dark:text-gray-100"
                          : ['consulta', 'producao_de_oculos', 'entregue'].includes(alunoExibido.faseAtual)
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-600"
                      )}>Triagem</span>
                    </div>

                    {/* Linha de conexão 1 */}
                    <div className={cn(
                      "h-0.5 flex-1 mx-2 transition-all",
                      ['consulta', 'producao_de_oculos', 'entregue'].includes(alunoExibido.faseAtual)
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    )} />

                    {/* Consulta */}
                    <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => handlePhaseChange('consulta')}>
                      <div className="relative flex items-center justify-center mb-2">
                        {/* Círculo */}
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-white",
                          alunoExibido.faseAtual === 'consulta'
                            ? "border-green-500"
                            : ['producao_de_oculos', 'entregue'].includes(alunoExibido.faseAtual)
                            ? "border-green-500"
                            : alunoExibido.faseAtual === 'triagem'
                            ? "border-green-500"
                            : "border-gray-300"
                        )}>
                          {alunoExibido.faseAtual === 'consulta' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500" />
                          ) : ['producao_de_oculos', 'entregue'].includes(alunoExibido.faseAtual) ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500" />
                          ) : alunoExibido.faseAtual === 'triagem' ? (
                            <Circle className="w-5 h-5 text-green-500" strokeWidth={2} />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium transition-colors whitespace-nowrap",
                        alunoExibido.faseAtual === 'consulta'
                          ? "text-gray-900 dark:text-gray-100"
                          : ['producao_de_oculos', 'entregue'].includes(alunoExibido.faseAtual)
                          ? "text-gray-900 dark:text-gray-100"
                          : alunoExibido.faseAtual === 'triagem'
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-600"
                      )}>Consulta</span>
                    </div>

                    {/* Linha de conexão 2 */}
                    <div className={cn(
                      "h-0.5 flex-1 mx-2 transition-all",
                      ['producao_de_oculos', 'entregue'].includes(alunoExibido.faseAtual)
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : alunoExibido.faseAtual === 'consulta'
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    )} />

                    {/* Produção de Óculos */}
                    <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => handlePhaseChange('producao_de_oculos')}>
                      <div className="relative flex items-center justify-center mb-2">
                        {/* Círculo */}
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-white",
                          alunoExibido.faseAtual === 'producao_de_oculos'
                            ? "border-green-500"
                            : alunoExibido.faseAtual === 'entregue'
                            ? "border-green-500"
                            : ['triagem', 'consulta'].includes(alunoExibido.faseAtual)
                            ? "border-green-500"
                            : "border-gray-300"
                        )}>
                          {alunoExibido.faseAtual === 'producao_de_oculos' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500" />
                          ) : alunoExibido.faseAtual === 'entregue' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500" />
                          ) : ['triagem', 'consulta'].includes(alunoExibido.faseAtual) ? (
                            <Circle className="w-5 h-5 text-green-500" strokeWidth={2} />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium transition-colors text-center whitespace-nowrap",
                        alunoExibido.faseAtual === 'producao_de_oculos'
                          ? "text-gray-900 dark:text-gray-100"
                          : alunoExibido.faseAtual === 'entregue'
                          ? "text-gray-900 dark:text-gray-100"
                          : ['triagem', 'consulta'].includes(alunoExibido.faseAtual)
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-600"
                      )}>Produção de Óculos</span>
                    </div>

                    {/* Linha de conexão 3 */}
                    <div className={cn(
                      "h-0.5 flex-1 mx-2 transition-all",
                      alunoExibido.faseAtual === 'entregue'
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : alunoExibido.faseAtual === 'producao_de_oculos'
                        ? "bg-gradient-to-r from-green-400 to-green-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    )} />

                    {/* Entregue */}
                    <div className="flex flex-col items-center flex-1 cursor-pointer group" onClick={() => handlePhaseChange('entregue')}>
                      <div className="relative flex items-center justify-center mb-2">
                        {/* Círculo */}
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-white",
                          alunoExibido.faseAtual === 'entregue'
                            ? "border-green-500"
                            : ['triagem', 'consulta', 'producao_de_oculos'].includes(alunoExibido.faseAtual)
                            ? "border-green-500"
                            : "border-gray-300"
                        )}>
                          {alunoExibido.faseAtual === 'entregue' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500" />
                          ) : ['triagem', 'consulta', 'producao_de_oculos'].includes(alunoExibido.faseAtual) ? (
                            <Circle className="w-5 h-5 text-green-500" strokeWidth={2} />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium transition-colors whitespace-nowrap",
                        alunoExibido.faseAtual === 'entregue'
                          ? "text-gray-900 dark:text-gray-100"
                          : ['triagem', 'consulta', 'producao_de_oculos'].includes(alunoExibido.faseAtual)
                          ? "text-gray-900 dark:text-gray-100"
                          : "text-gray-400 dark:text-gray-600"
                      )}>Entregue</span>
                    </div>
                  </div>
                </div>

              <div className="space-y-6 py-4">
                {/* Informações Pessoais */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Data de Nascimento</p>
                          <p className="text-sm font-medium">{formatDate(alunoExibido.dataNascimento)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Sexo</p>
                          <p className="text-sm font-medium">{sexoLabels[alunoExibido.sexo] || alunoExibido.sexo}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Responsável Legal</p>
                        <p className="text-sm font-medium">{alunoExibido.responsavelLegal}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Localização */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Localização
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Cidade</p>
                          <p className="text-sm font-medium">{municipio ? `${municipio.nome} - ${municipio.estado}` : '-'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                        <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground font-medium">Escola</p>
                          <p className="text-sm font-medium">{escola?.nome || '-'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-border">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Turma</p>
                        <p className="text-sm font-medium">{turma ? `${turma.nome} - ${turma.serie} (${turma.turno})` : '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Armação Selecionada */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" />
                      Armação Selecionada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {armacao ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Numeração</p>
                            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">{armacao.numeracao}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full shrink-0"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Cor</p>
                            <p className="text-sm font-semibold">{armacao.cor}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full shrink-0"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Tipo</p>
                            <p className="text-sm font-semibold">{armacaoTipoLabels[armacao.tipo]}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full shrink-0"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Marca</p>
                            <p className="text-sm font-semibold">{armacao.marca}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg md:col-span-2 lg:col-span-1">
                          <div className="w-2 h-2 bg-muted-foreground/50 rounded-full shrink-0"></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Status</p>
                            <Badge
                              variant={armacao.status === 'utilizada' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {armacaoStatusLabels[armacao.status]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-center">
                        <div className="space-y-2">
                          <Eye className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
                          <p className="text-sm text-muted-foreground">Nenhuma armação selecionada</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Observação */}
                {alunoExibido.observacao && (
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Observação
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap text-amber-800 dark:text-amber-200">{alunoExibido.observacao}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Data de Cadastro */}
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-full">
                    <Calendar className="h-3 w-3" />
                    Cadastrado em {formatDate(alunoExibido.createdAt)}
                  </div>
                </div>
              </div>

              {/* Histórico de Mudanças de Fase */}
              <div className="pt-4 border-t">
                <HistoricoMudancasFase historico={historico} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {alunoExibido && (
        <SelecionarArmaçãoModal
          open={showArmaçãoModal}
          onOpenChange={setShowArmaçãoModal}
          alunos={[alunoExibido]}
          onSuccess={handleArmaçãoSuccess}
        />
      )}
    </>
  );
}
