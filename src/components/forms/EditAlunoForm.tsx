import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateAluno, useAluno } from '@/hooks/use-alunos';
import { useEscolas, useEscola, useEscolasByMunicipio } from '@/hooks/use-escolas';
import { useTurmas, useTurma, useTurmasByEscola } from '@/hooks/use-turmas';
import { useMunicipios } from '@/hooks/use-municipios';

import { Aluno, StudentPhase, Municipio, Escola, Turma } from '@/types';
import { SelecionarArmaçãoModal } from '@/components/armacoes/SelecionarArmaçãoModal';
import { armacoesService } from '@/services/armacoes';

interface EditAlunoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId: string | null;
  municipios?: Municipio[];
  allEscolas?: Escola[];
  allTurmas?: Turma[];
}

export function EditAlunoForm({ open, onOpenChange, alunoId, municipios: propMunicipios, allEscolas: propAllEscolas, allTurmas: propAllTurmas }: EditAlunoFormProps) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [municipioId, setMunicipioId] = useState('');
  const [escolaId, setEscolaId] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | 'outro' | 'nao_informado'>('nao_informado');
  const [dataNascimento, setDataNascimento] = useState('');
  const [responsavelLegal, setResponsavelLegal] = useState('');
  const [observacao, setObservacao] = useState('');
  const [faseAtual, setFaseAtual] = useState<'triagem' | 'consulta' | 'producao_de_oculos' | 'entregue'>('triagem');
  const [showArmaçãoModal, setShowArmaçãoModal] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<StudentPhase | null>(null);
  const [isFormReady, setIsFormReady] = useState(false);
  const [forceSelectUpdate, setForceSelectUpdate] = useState(0);

  const updateAluno = useUpdateAluno();
  const { data: aluno, isLoading: isLoadingAluno } = useAluno(alunoId || '');
  const { data: fallbackMunicipios = [] } = useMunicipios();
  const municipios = propMunicipios || fallbackMunicipios;

  // Carregar todas as escolas se não foram fornecidas via props
  const { data: allEscolasFallback = [], isLoading: isLoadingAllEscolas } = useEscolas();

  // Só buscar escolas via hook se não foram fornecidas via props e município estiver definido
  const { data: fallbackEscolas = [], isLoading: isLoadingEscolas } = useEscolasByMunicipio(
    propAllEscolas || allEscolasFallback.length > 0 ? '' : (municipioId || '')
  );

  // Hook adicional para carregar escola específica do aluno se necessário
  const { data: escolaEspecifica } = useEscola(aluno?.escolaId || '');
  const allEscolas = propAllEscolas || allEscolasFallback;
  // Garantir que a escola do aluno esteja na lista sempre (usando dados da API ou da lista completa)
  const escolaDoAluno = (escolaEspecifica && aluno?.escolaId === escolaEspecifica.id) ? escolaEspecifica :
                        (aluno && aluno.escolaId && allEscolas.find(e => e.id === aluno.escolaId));

  const escolasFiltradas = municipioId ? allEscolas.filter(e => e.municipioId === municipioId) : [];
  const escolas = useMemo(() => {
    const baseList = municipioId ? escolasFiltradas : allEscolas;
    if (escolaDoAluno && !baseList.find(e => e.id === escolaDoAluno.id)) {
      return [escolaDoAluno, ...baseList];
    }
    return baseList;
  }, [escolasFiltradas, escolaDoAluno, municipioId, allEscolas]);

  // Carregar todas as turmas se não foram fornecidas via props
  const { data: allTurmasFallback = [], isLoading: isLoadingAllTurmas } = useTurmas();

  // Só buscar turmas via hook se não foram fornecidas via props e escola estiver definida
  const { data: fallbackTurmas = [], isLoading: isLoadingTurmas } = useTurmasByEscola(
    propAllTurmas || allTurmasFallback.length > 0 ? '' : (escolaId || '')
  );

  // Hook adicional para carregar turma específica do aluno se necessário
  const { data: turmaEspecifica } = useTurma(aluno?.turmaId || '');
  const allTurmas = propAllTurmas || allTurmasFallback;
  // Garantir que a turma do aluno esteja na lista sempre (usando dados da API ou da lista completa)
  const turmaDoAluno = (turmaEspecifica && aluno?.turmaId === turmaEspecifica.id) ? turmaEspecifica :
                       (aluno && aluno.turmaId && allTurmas.find(t => t.id === aluno.turmaId));

  const turmasFiltradas = escolaId ? allTurmas.filter(t => t.escolaId === escolaId) : [];
  const turmas = useMemo(() => {
    const baseList = escolaId ? turmasFiltradas : allTurmas;
    if (turmaDoAluno && !baseList.find(t => t.id === turmaDoAluno.id)) {
      return [turmaDoAluno, ...baseList];
    }
    return baseList;
  }, [turmasFiltradas, turmaDoAluno, escolaId, allTurmas]);


  // Preencher formulário sempre que aluno for carregado
  useEffect(() => {
    if (aluno) {
      setNomeCompleto(aluno.nomeCompleto || '');
      setMunicipioId(aluno.municipioId || '');
      setEscolaId(aluno.escolaId || '');
      setTurmaId(aluno.turmaId || '');
      setSexo(aluno.sexo || 'nao_informado');
      setDataNascimento(aluno.dataNascimento ? aluno.dataNascimento.toISOString().split('T')[0] : '');
      setResponsavelLegal(aluno.responsavelLegal || '');
      setObservacao(aluno.observacao || '');
      setFaseAtual(aluno.faseAtual || 'triagem');
      setIsFormReady(true);
      // Forçar atualização dos selects após um pequeno delay para garantir que as listas estejam prontas
      setTimeout(() => setForceSelectUpdate(prev => prev + 1), 100);
    } else {
      setIsFormReady(false);
    }
  }, [aluno]);

  // Resetar estados de edição quando o diálogo fechar
  useEffect(() => {
    if (!open) {
      setShowArmaçãoModal(false);
      setPendingPhase(null);
    }
  }, [open]);

  // Resetar escola e turma quando município mudar (mas não na primeira carga)
  useEffect(() => {
    if (aluno && municipioId && municipioId !== aluno.municipioId) {
      setEscolaId('');
      setTurmaId('');
    }
  }, [municipioId, aluno]);

  // Resetar turma quando escola mudar (mas não na primeira carga)
  useEffect(() => {
    if (aluno && escolaId && escolaId !== aluno.escolaId) {
      setTurmaId('');
    }
  }, [escolaId, aluno]);

  const handleArmaçãoSuccess = async () => {
    if (pendingPhase && alunoId) {
      try {
        await updateAluno.mutateAsync({
          id: alunoId,
          data: {
            nomeCompleto,
            escolaId: escolaId !== aluno.escolaId ? escolaId : undefined,
            turmaId: turmaId !== aluno.turmaId ? turmaId : undefined,
            sexo,
            dataNascimento: new Date(dataNascimento),
            responsavelLegal,
            observacao: observacao.trim() || undefined,
            faseAtual: pendingPhase,
          },
        });
        setPendingPhase(null);
        onOpenChange(false);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoId || !municipioId || !escolaId || !turmaId || !nomeCompleto || !dataNascimento || !responsavelLegal) {
      return;
    }

    // Se está mudando PARA "producao_de_oculos", exibir modal de seleção (sempre obrigatório)
    if (faseAtual === 'producao_de_oculos') {
      setPendingPhase(faseAtual);
      setShowArmaçãoModal(true);
      return;
    }

    // Se está mudando de "producao_de_oculos" para qualquer fase que não seja "entregue", liberar a armação
    // Note: Backend validation also prevents release when aluno is in 'entregue' phase
    if (aluno && aluno.faseAtual === 'producao_de_oculos' && faseAtual !== 'producao_de_oculos' && faseAtual !== 'entregue') {
      await armacoesService.releaseCurrentArmacaoForAluno(alunoId);
    }

    try {
      await updateAluno.mutateAsync({
        id: alunoId,
        data: {
          nomeCompleto,
          escolaId: escolaId !== aluno.escolaId ? escolaId : undefined,
          turmaId: turmaId !== aluno.turmaId ? turmaId : undefined,
          sexo,
          dataNascimento: new Date(dataNascimento),
          responsavelLegal,
          observacao: observacao.trim() || undefined,
          faseAtual,
        },
      });
      onOpenChange(false);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  const isLoadingInitialData = isLoadingAluno ||
    (propAllEscolas ? false : isLoadingAllEscolas) ||
    (propAllTurmas ? false : isLoadingAllTurmas) ||
    (aluno?.escolaId && !escolaEspecifica && !escolaDoAluno ? true : false) ||
    (aluno?.turmaId && !turmaEspecifica && !turmaDoAluno ? true : false);

  if ((isLoadingInitialData && !isFormReady) && alunoId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
            <DialogDescription>
              Carregando dados do aluno...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Carregando...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!aluno && alunoId) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
            <DialogDescription>
              Atualize os dados do aluno no sistema.
            </DialogDescription>
          </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* Nome Completo */}
            <div className="grid gap-2">
              <Label htmlFor="nomeCompleto">Nome Completo *</Label>
              <Input
                id="nomeCompleto"
                placeholder="Digite o nome completo do aluno"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                required
              />
            </div>

            {/* Cidade (Município) */}
            <div className="grid gap-2">
              <Label htmlFor="municipio">Cidade *</Label>
              <Select value={municipioId} onValueChange={setMunicipioId} required>
                <SelectTrigger id="municipio">
                  <SelectValue placeholder="Selecione a cidade" />
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

            {/* Escola */}
            <div className="grid gap-2">
              <Label htmlFor="escola">Escola *</Label>
              <Select
                key={`escola-${forceSelectUpdate}`}
                value={escolaId}
                onValueChange={setEscolaId}
                required
                disabled={!municipioId || (escolas.length === 0 && !isLoadingEscolas)}
              >
                <SelectTrigger id="escola">
                  <SelectValue placeholder={
                    isLoadingInitialData || (aluno?.escolaId && !escolaDoAluno && !escolaEspecifica)
                      ? "Carregando dados..."
                      : isLoadingEscolas && municipioId
                      ? "Carregando escolas..."
                      : !municipioId
                      ? "Selecione primeiro a cidade"
                      : escolas.length === 0
                      ? "Nenhuma escola disponível nesta cidade"
                      : "Selecione a escola"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {municipioId && !isLoadingEscolas && escolas.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Esta cidade não possui escolas cadastradas. Cadastre uma escola primeiro.
                </p>
              )}
            </div>

            {/* Turma */}
            <div className="grid gap-2">
              <Label htmlFor="turma">Turma *</Label>
              <Select
                key={`turma-${forceSelectUpdate}`}
                value={turmaId}
                onValueChange={setTurmaId}
                required
                disabled={!escolaId || (turmas.length === 0 && !isLoadingTurmas)}
              >
                <SelectTrigger id="turma">
                  <SelectValue placeholder={
                    isLoadingInitialData || (aluno?.turmaId && !turmaDoAluno && !turmaEspecifica)
                      ? "Carregando dados..."
                      : isLoadingTurmas && escolaId
                      ? "Carregando turmas..."
                      : !escolaId
                      ? "Selecione primeiro a escola"
                      : turmas.length === 0
                      ? "Nenhuma turma disponível para esta escola"
                      : "Selecione a turma"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.serie} ({turma.turno})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {escolaId && !isLoadingTurmas && turmas.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Esta escola não possui turmas cadastradas. Cadastre uma turma primeiro.
                </p>
              )}
            </div>

            {/* Sexo */}
            <div className="grid gap-2">
              <Label htmlFor="sexo">Sexo *</Label>
              <Select 
                value={sexo} 
                onValueChange={(value) => setSexo(value as typeof sexo)}
                required
              >
                <SelectTrigger id="sexo">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="nao_informado">Não informado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data de Nascimento */}
            <div className="grid gap-2">
              <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Responsável Legal */}
            <div className="grid gap-2">
              <Label htmlFor="responsavelLegal">Responsável Legal *</Label>
              <Input
                id="responsavelLegal"
                placeholder="Digite o nome do responsável legal"
                value={responsavelLegal}
                onChange={(e) => setResponsavelLegal(e.target.value)}
                required
              />
            </div>

            {/* Fase Atual */}
            <div className="grid gap-2">
              <Label htmlFor="faseAtual">Fase Atual *</Label>
              <Select 
                value={faseAtual} 
                onValueChange={(value) => setFaseAtual(value as typeof faseAtual)}
                required
              >
                <SelectTrigger id="faseAtual">
                  <SelectValue placeholder="Selecione a fase atual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="triagem">Triagem</SelectItem>
                  <SelectItem value="consulta">Consulta</SelectItem>
                  <SelectItem value="producao_de_oculos">Produção de Óculos</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Fluxo: Triagem → Consulta → Produção de Óculos → Entregue
              </p>
            </div>

            {/* Observação */}
            <div className="grid gap-2">
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                placeholder="Digite observações sobre o aluno (opcional)"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateAluno.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                updateAluno.isPending ||
                !nomeCompleto ||
                !municipioId ||
                !escolaId ||
                !turmaId ||
                !dataNascimento ||
                !responsavelLegal
              }
            >
              {updateAluno.isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    {aluno && (
      <SelecionarArmaçãoModal
        open={showArmaçãoModal}
        onOpenChange={setShowArmaçãoModal}
        alunos={[aluno]}
        onSuccess={handleArmaçãoSuccess}
      />
    )}
    </>
  );
}
