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
import { useUpdateTurma, useTurma } from '@/hooks/use-turmas';
import { useEscolas } from '@/hooks/use-escolas';

interface EditTurmaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turmaId: string | null;
}

export function EditTurmaForm({ open, onOpenChange, turmaId }: EditTurmaFormProps) {
  const [nome, setNome] = useState('');
  const [serie, setSerie] = useState('');
  const [turno, setTurno] = useState<'manha' | 'tarde' | 'integral' | 'noite'>('manha');
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear().toString());
  const [status, setStatus] = useState<'ativo' | 'inativo' | 'finalizado'>('ativo');
  const [escolaId, setEscolaId] = useState('');
  
  const updateTurma = useUpdateTurma();
  const { data: turma, isLoading: turmaLoading } = useTurma(turmaId || '');
  const { data: escolas = [] } = useEscolas();

  // Preencher formulário quando turma for carregada
  useEffect(() => {
    if (turma) {
      setNome(turma.nome);
      setSerie(turma.serie);
      setTurno(turma.turno);
      setAnoLetivo(turma.anoLetivo);
      setStatus(turma.status);
      setEscolaId(turma.escolaId);
    }
  }, [turma]);

  // Resetar formulário quando dialog fechar
  useEffect(() => {
    if (!open) {
      setNome('');
      setSerie('');
      setTurno('manha');
      setAnoLetivo(new Date().getFullYear().toString());
      setStatus('ativo');
      setEscolaId('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turmaId || !escolaId) return;
    
    try {
      await updateTurma.mutateAsync({
        id: turmaId,
        data: {
          nome,
          serie,
          turno,
          anoLetivo,
          status,
          escolaId,
        },
      });
      onOpenChange(false);
    } catch (error) {
      // Error já é tratado no hook
    }
  };

  if (turmaLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
            <DialogDescription>Carregando dados da turma...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  if (!turma) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Turma</DialogTitle>
            <DialogDescription>
              Atualize os dados da turma.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome da Turma</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ex: 1º Ano A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serie">Série</Label>
              <Input
                id="serie"
                value={serie}
                onChange={(e) => setSerie(e.target.value)}
                required
                placeholder="Ex: 1º Ano"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="turno">Turno</Label>
              <Select value={turno} onValueChange={(value: any) => setTurno(value)} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manha">Manhã</SelectItem>
                  <SelectItem value="tarde">Tarde</SelectItem>
                  <SelectItem value="integral">Integral</SelectItem>
                  <SelectItem value="noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="anoLetivo">Ano Letivo</Label>
              <Input
                id="anoLetivo"
                value={anoLetivo}
                onChange={(e) => setAnoLetivo(e.target.value)}
                required
                placeholder="2026"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativa</SelectItem>
                  <SelectItem value="inativo">Inativa</SelectItem>
                  <SelectItem value="finalizado">Finalizada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="escola">Escola</Label>
              <Select 
                value={escolaId} 
                onValueChange={setEscolaId} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma escola" />
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateTurma.isPending || !escolaId}>
              {updateTurma.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
