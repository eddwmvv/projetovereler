import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Package, Clock, CheckCircle2, School, MapPin, Calendar, User, FileText, History } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

type LoteStatus = 'criado' | 'em_preparo' | 'recebido';

interface Lote {
  id: string;
  nome: string;
  descricao?: string;
  escola_nome: string;
  municipio_nome: string;
  turno: 'manha' | 'tarde' | 'integral' | 'noite';
  status: LoteStatus;
  data_criacao: string;
  data_preparo?: string;
  data_recebimento?: string;
  total_oculos: number;
  total_entregue: number;
  observacoes?: string;
}

interface LoteItem {
  id: string;
  tamanho_id: string | null;
  quantidade: number;
  quantidade_entregue: number;
  observacoes?: string;
  tamanhos?: {
    nome: string;
    descricao?: string;
  } | null;
}

interface HistoricoItem {
  id: string;
  status_anterior?: LoteStatus;
  status_novo: LoteStatus;
  observacoes?: string;
  created_at: string;
  usuario_id?: string;
}

interface ViewLoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lote: Lote;
  onStatusChange: () => void;
}

const statusConfig = {
  criado: { label: 'Criado', icon: Package, color: 'text-blue-600' },
  em_preparo: { label: 'Em Preparo', icon: Clock, color: 'text-amber-600' },
  recebido: { label: 'Recebido', icon: CheckCircle2, color: 'text-green-600' },
};

const turnoLabels = {
  manha: 'Manhã',
  tarde: 'Tarde',
  integral: 'Integral',
  noite: 'Noite',
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Ocorreu um erro inesperado.';
};

export const ViewLoteDialog = ({ open, onOpenChange, lote, onStatusChange }: ViewLoteDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar itens do lote
  const { data: itens, isLoading: itensLoading } = useQuery({
    queryKey: ['lote-itens', lote.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lote_itens')
        .select('*, tamanhos(nome, descricao)')
        .eq('lote_id', lote.id)
        .order('tamanho_id');
      if (error) throw error;
      return data as LoteItem[];
    },
    enabled: open,
  });

  // Buscar histórico do lote
  const { data: historico, isLoading: historicoLoading } = useQuery({
    queryKey: ['lote-historico', lote.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lotes_historico')
        .select('*')
        .eq('lote_id', lote.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as HistoricoItem[];
    },
    enabled: open,
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: LoteStatus) => {
      const { error } = await supabase.rpc('atualizar_status_lote', {
        p_lote_id: lote.id,
        p_novo_status: newStatus,
        p_usuario_id: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Status atualizado!',
        description: 'O status do lote foi atualizado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
      queryClient.invalidateQueries({ queryKey: ['lote-historico', lote.id] });
      onStatusChange();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao atualizar status',
        description: getErrorMessage(error) || 'Ocorreu um erro ao atualizar o status.',
        variant: 'destructive',
      });
    },
  });

  const handleStatusChange = (newStatus: LoteStatus) => {
    updateStatusMutation.mutate(newStatus);
  };

  const statusInfo = statusConfig[lote.status];
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">{lote.nome}</DialogTitle>
              <DialogDescription className="mt-2">
                {lote.descricao || 'Detalhes do lote de óculos'}
              </DialogDescription>
            </div>
            <Badge variant="outline" className={`gap-2 ${statusInfo.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <School className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Escola</p>
                  <p className="font-medium">{lote.escola_nome}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Município</p>
                  <p className="font-medium">{lote.municipio_nome}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Turno</p>
                  <p className="font-medium">{turnoLabels[lote.turno]}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Total de Óculos</p>
                  <p className="font-medium">{lote.total_oculos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens do Lote */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Itens do Lote</CardTitle>
            </CardHeader>
            <CardContent>
              {itensLoading ? (
                <p className="text-center text-gray-500">Carregando itens...</p>
              ) : itens && itens.length > 0 ? (
                <div className="space-y-2">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          Tamanho:{' '}
                          {item.tamanho_id === null
                            ? 'Geral'
                            : item.tamanhos?.nome || 'N/A'}
                          {item.tamanho_id !== null && item.tamanhos?.descricao && ` (${item.tamanhos.descricao})`}
                        </p>
                        {item.observacoes && (
                          <p className="text-sm text-gray-600">{item.observacoes}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{item.quantidade} unidades</p>
                        <p className="text-sm text-gray-600">
                          Entregue: {item.quantidade_entregue}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">Nenhum item encontrado</p>
              )}
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Linha do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-500">Criado em</p>
                  <p className="font-medium">
                    {format(new Date(lote.data_criacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              
              {lote.data_preparo && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-500">Iniciado preparo em</p>
                    <p className="font-medium">
                      {format(new Date(lote.data_preparo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
              
              {lote.data_recebimento && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm text-gray-500">Recebido em</p>
                    <p className="font-medium">
                      {format(new Date(lote.data_recebimento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {lote.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{lote.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Mudanças
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historicoLoading ? (
                <p className="text-center text-gray-500">Carregando histórico...</p>
              ) : historico && historico.length > 0 ? (
                <div className="space-y-3">
                  {historico.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.status_anterior 
                            ? `${statusConfig[item.status_anterior].label} → ${statusConfig[item.status_novo].label}`
                            : `Status: ${statusConfig[item.status_novo].label}`
                          }
                        </p>
                        {item.observacoes && (
                          <p className="text-sm text-gray-600 mt-1">{item.observacoes}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(item.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">Nenhum histórico disponível</p>
              )}
            </CardContent>
          </Card>

          {/* Ações de Status */}
          {lote.status !== 'recebido' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alterar Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {lote.status === 'criado' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Clock className="w-4 h-4" />
                          Marcar como Em Preparo
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar alteração de status</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja marcar este lote como "Em Preparo"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStatusChange('em_preparo')}>
                            Confirmar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {lote.status === 'em_preparo' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Marcar como Recebido
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar recebimento</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja marcar este lote como "Recebido"? Esta ação não poderá ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleStatusChange('recebido')}>
                            Confirmar Recebimento
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
