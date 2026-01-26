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
import { useEscola } from '@/hooks/use-escolas';
import { useTurmasByEscola } from '@/hooks/use-turmas';
import { Escola } from '@/types';

interface CreateAlunoFormByEscolaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escolaId: string;
  escola?: Escola | null;
}

export function CreateAlunoFormByEscola({ 
  open, 
  onOpenChange, 
  escolaId,
  escola: escolaProp 
}: CreateAlunoFormByEscolaProps) {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | 'outro' | 'nao_informado'>('nao_informado');
  const [dataNascimento, setDataNascimento] = useState('');
  const [responsavelLegal, setResponsavelLegal] = useState('');
  const [observacao, setObservacao] = useState('');
  
  const createAluno = useCreateAluno();
  const { data: escolaData } = useEscola(escolaId);
  const { data: turmas = [] } = useTurmasByEscola(escolaId);

  // Usar escola da prop ou buscar pelos dados
  const escola = escolaProp || escolaData;

  // Resetar formulário quando fechar
  useEffect(() => {
    if (!open) {
      setNomeCompleto('');
      setTurmaId('');
      setSexo('nao_informado');
      setDataNascimento('');
      setResponsavelLegal('');
      setObservacao('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escolaId || !turmaId || !nomeCompleto || !dataNascimento || !responsavelLegal) {
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
      // Limpar apenas os campos do formulário, mantendo o modal aberto
      setNomeCompleto('');
      setTurmaId('');
      setSexo('nao_informado');
      setDataNascimento('');
      setResponsavelLegal('');
      setObservacao('');
      // Focar no campo de nome para facilitar o próximo cadastro
      setTimeout(() => {
        const nomeInput = document.getElementById('nomeCompleto');
        if (nomeInput) {
          nomeInput.focus();
        }
      }, 100);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  if (!escola && !escolaData) {
    return null;
  }

  const escolaNome = escola?.nome || escolaData?.nome || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Aluno - {escolaNome}</DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno para cadastrá-lo na escola <strong>{escolaNome}</strong>.
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

            {/* Escola (desabilitada, apenas informativa) */}
            <div className="grid gap-2">
              <Label htmlFor="escola">Escola *</Label>
              <Input
                id="escola"
                value={escolaNome}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                A escola está pré-selecionada para este cadastro.
              </p>
            </div>

            {/* Turma */}
            <div className="grid gap-2">
              <Label htmlFor="turma">Turma *</Label>
              <Select 
                value={turmaId} 
                onValueChange={setTurmaId} 
                required
                disabled={turmas.length === 0}
              >
                <SelectTrigger id="turma">
                  <SelectValue 
                    placeholder={
                      turmas.length === 0 
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
              {turmas.length === 0 && (
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
                !turmaId ||
                !dataNascimento ||
                !responsavelLegal ||
                turmas.length === 0
              }
            >
              {createAluno.isPending ? 'Cadastrando...' : 'Cadastrar Aluno'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
