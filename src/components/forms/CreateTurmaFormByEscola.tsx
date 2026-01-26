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
import { useCreateTurma } from '@/hooks/use-turmas';
import { useEscola } from '@/hooks/use-escolas';
import { Escola } from '@/types';

interface CreateTurmaFormByEscolaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escolaId: string;
  escola?: Escola | null;
}

export function CreateTurmaFormByEscola({ 
  open, 
  onOpenChange, 
  escolaId,
  escola: escolaProp 
}: CreateTurmaFormByEscolaProps) {
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState<'manha' | 'tarde' | 'integral' | 'noite'>('manha');
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  
  const createTurma = useCreateTurma();
  const { data: escolaData } = useEscola(escolaId);

  // Usar escola da prop ou buscar pelos dados
  const escola = escolaProp || escolaData;

  // Resetar formulário quando fechar
  useEffect(() => {
    if (!open) {
      setNome('');
      setSerie('');
      setTurno('manha');
      setAnoLetivo(new Date().getFullYear().toString());
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escolaId || !nome || !serie || !anoLetivo) {
      return;
    }

    try {
      await createTurma.mutateAsync({
        nome,
        serie,
        turno,
        anoLetivo,
        escolaId,
      });
      // Limpar apenas os campos do formulário, mantendo o modal aberto
      setNome('');
      setSerie('');
      setTurno('manha');
      setAnoLetivo(new Date().getFullYear().toString());
      // Focar no campo de nome para facilitar o próximo cadastro
      setTimeout(() => {
        const nomeInput = document.getElementById('nome');
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Turma - {escolaNome}</DialogTitle>
          <DialogDescription>
            Preencha os dados da turma para cadastrá-la na escola <strong>{escolaNome}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
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

            {/* Nome da Turma */}
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Turma *</Label>
              <Input
                id="nome"
                placeholder="Ex: 1º Ano A"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            {/* Série */}
            <div className="grid gap-2">
              <Label htmlFor="serie">Série *</Label>
              <Input
                id="serie"
                placeholder="Ex: 1º Ano"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                required
              />
            </div>

            {/* Turno */}
            <div className="grid gap-2">
              <Label htmlFor="turno">Turno *</Label>
              <Select 
                value={turno} 
                onValueChange={(value) => setTurno(value as typeof turno)}
                required
              >
                <SelectTrigger id="turno">
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ano Letivo */}
            <div className="grid gap-2">
              <Label htmlFor="anoLetivo">Ano Letivo *</Label>
              <Input
                id="anoLetivo"
                type="text"
                placeholder="2026"
                value={anoLetivo}
                onChange={(e) => setAnoLetivo(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTurma.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                createTurma.isPending ||
                !nome ||
                !serie ||
                !anoLetivo ||
                !escolaId
              }
            >
              {createTurma.isPending ? 'Cadastrando...' : 'Cadastrar Turma'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
