import { useState, useEffect } from 'react';
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
import { useCreateAluno } from '@/hooks/use-alunos';
import { useEscolasByMunicipio } from '@/hooks/use-escolas';
import { useTurmasByEscola } from '@/hooks/use-turmas';
import { useMunicipios } from '@/hooks/use-municipios';

interface CreateAlunoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAlunoForm({ open, onOpenChange }: CreateAlunoFormProps) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [municipioId, setMunicipioId] = useState('');
  const [escolaId, setEscolaId] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | 'outro' | 'nao_informado'>('nao_informado');
  const [dataNascimento, setDataNascimento] = useState('');
  const [responsavelLegal, setResponsavelLegal] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const createAluno = useCreateAluno();
  const { data: municipios = [] } = useMunicipios();
  const { data: escolas = [] } = useEscolasByMunicipio(municipioId);
  const { data: turmas = [] } = useTurmasByEscola(escolaId);

  // Resetar escola e turma quando município mudar
  useEffect(() => {
    setEscolaId('');
    setTurmaId('');
  }, [municipioId]);

  // Resetar turma quando escola mudar
  useEffect(() => {
    setTurmaId('');
  }, [escolaId]);

  // Resetar formulário quando fechar
  useEffect(() => {
    if (!open) {
      setNomeCompleto('');
      setMunicipioId('');
      setEscolaId('');
      setTurmaId('');
      setSexo('nao_informado');
      setDataNascimento('');
      setResponsavelLegal('');
      setObservacao('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!municipioId || !escolaId || !turmaId || !nomeCompleto || !dataNascimento || !responsavelLegal) {
      return;
    }

    try {
      await createAluno.mutateAsync({
        nomeCompleto,
        escolaId,
        turmaId,
        sexo,
        dataNascimento: new Date(dataNascimento),
        responsavelLegal,
        observacao: observacao.trim() || undefined,
      });
      onOpenChange(false);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Aluno</DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno para cadastrá-lo no sistema.
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
                value={escolaId} 
                onValueChange={setEscolaId} 
                required
                disabled={!municipioId || escolas.length === 0}
              >
                <SelectTrigger id="escola">
                  <SelectValue 
                    placeholder={
                      !municipioId 
                        ? "Selecione primeiro a cidade" 
                        : escolas.length === 0 
                        ? "Nenhuma escola disponível nesta cidade"
                        : "Selecione a escola"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {escolas.map((escola) => (
                    <SelectItem key={escola.id} value={escola.id}>
                      {escola.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {municipioId && escolas.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Esta cidade não possui escolas cadastradas. Cadastre uma escola primeiro.
                </p>
              )}
            </div>

            {/* Turma */}
            <div className="grid gap-2">
              <Label htmlFor="turma">Turma *</Label>
              <Select 
                value={turmaId} 
                onValueChange={setTurmaId} 
                required
                disabled={!escolaId || turmas.length === 0}
              >
                <SelectTrigger id="turma">
                  <SelectValue 
                    placeholder={
                      !escolaId 
                        ? "Selecione primeiro a escola" 
                        : turmas.length === 0 
                        ? "Nenhuma turma disponível para esta escola"
                        : "Selecione a turma"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.serie} ({turma.turno})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {escolaId && turmas.length === 0 && (
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
              disabled={createAluno.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                createAluno.isPending ||
                !nomeCompleto ||
                !municipioId ||
                !escolaId ||
                !turmaId ||
                !dataNascimento ||
                !responsavelLegal
              }
            >
              {createAluno.isPending ? 'Criando...' : 'Criar Aluno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
