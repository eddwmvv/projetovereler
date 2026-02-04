import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { exportacaoService } from '@/services/exportacao';

const TAMANHO_GERAL = 'GERAL' as const;

type Escola = {
  id: string;
  nome: string;
  municipios?: { nome: string } | null;
};

type Tamanho = {
  id: string;
  nome: string;
  descricao?: string | null;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Ocorreu um erro inesperado.';
};

const formSchema = z.object({
  descricao: z.string().optional(),
  escola_id: z.string().min(1, 'Escola é obrigatória'),
  turno: z.enum(['manha', 'tarde', 'integral', 'noite'], {
    required_error: 'Turno é obrigatório',
  }),
  observacoes: z.string().optional(),
  itens: z
    .array(
      z.object({
        // Aceita UUID de tamanho OU a opção especial "GERAL" (sem tamanho)
        tamanho_id: z
          .string()
          .min(1, 'Tamanho é obrigatório')
          .refine(
            (v) => v === TAMANHO_GERAL || z.string().uuid().safeParse(v).success,
            'Tamanho inválido'
          ),
        quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
        observacoes: z.string().optional(),
      })
    )
    .min(1, 'Adicione pelo menos um item ao lote'),
});

type FormData = z.infer<typeof formSchema>;

interface CreateLoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateLoteDialog = ({ open, onOpenChange, onSuccess }: CreateLoteDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const turnoLabels: Record<FormData['turno'], string> = {
    manha: 'Manhã',
    tarde: 'Tarde',
    integral: 'Integral',
    noite: 'Noite',
  };
  const [currentItem, setCurrentItem] = useState<{ tamanho_id: string; quantidade: number; observacoes: string }>({
    tamanho_id: '',
    quantidade: 0,
    observacoes: '',
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: '',
      escola_id: '',
      turno: undefined,
      observacoes: '',
      itens: [],
    },
  });

  // Buscar escolas
  const { data: escolas, isLoading: escolasLoading } = useQuery<Escola[]>({
    queryKey: ['escolas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escolas')
        .select('id, nome, municipios(nome)')
        .order('nome');
      if (error) throw error;
      return (data ?? []) as Escola[];
    },
  });

  // Buscar tamanhos
  const { data: tamanhos, isLoading: tamanhosLoading } = useQuery<Tamanho[]>({
    queryKey: ['tamanhos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tamanhos')
        .select('id, nome, descricao')
        .order('nome');
      if (error) throw error;
      return (data ?? []) as Tamanho[];
    },
  });

  // Mutation para criar lote
  const createLoteMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Gerar próximo número de lote
      const { data: nomeData, error: nomeError } = await supabase
        .rpc('gerar_proximo_numero_lote');
      
      if (nomeError) throw nomeError;
      const nome = nomeData as string;

      // Criar o lote
      const { data: lote, error: loteError } = await supabase
        .from('lotes')
        .insert({
          nome: nome,
          descricao: data.descricao,
          escola_id: data.escola_id,
          turno: data.turno,
          observacoes: data.observacoes,
          criado_por: user?.id,
        })
        .select()
        .single();

      if (loteError) throw loteError;

      // Criar os itens do lote
      const itensToInsert = data.itens.map((item) => ({
        lote_id: lote.id,
        // "GERAL" = sem tamanho (NULL no banco)
        tamanho_id: item.tamanho_id === TAMANHO_GERAL ? null : item.tamanho_id,
        quantidade: item.quantidade,
        observacoes: item.observacoes,
      }));

      const { error: itensError } = await supabase
        .from('lote_itens')
        .insert(itensToInsert);

      if (itensError) throw itensError;

      // Registrar no histórico
      await supabase.from('lotes_historico').insert({
        lote_id: lote.id,
        status_anterior: null,
        status_novo: 'criado',
        observacoes: 'Lote criado',
        usuario_id: user?.id,
      });

      return lote;
    },
    onSuccess: async (lote, variables) => {
      // Gerar PDF automaticamente após criação do lote
      try {
        const escola = escolas?.find((e) => e.id === variables.escola_id);
        const turnoLabel = turnoLabels[variables.turno] ?? variables.turno;

        const itensPdf = variables.itens.map((item) => {
          const isGeral = item.tamanho_id === TAMANHO_GERAL;
          const tamanho = isGeral ? undefined : tamanhos?.find((t) => t.id === item.tamanho_id);
          return {
            tamanho: isGeral ? 'Geral' : tamanho?.nome || 'N/A',
            quantidade: item.quantidade,
            observacoes: item.observacoes || '',
          };
        });

        const totalOculos = itensPdf.reduce((acc, i) => acc + i.quantidade, 0);

        await exportacaoService.exportarLotePDF({
          numeroLote: lote.nome,
          escola: escola?.nome || 'Escola não encontrada',
          municipio: escola?.municipios?.nome || undefined,
          turno: turnoLabel,
          descricao: variables.descricao || '',
          observacoes: variables.observacoes || '',
          itens: itensPdf,
          totalOculos,
          geradoEm: new Date(),
        });
      } catch (error) {
        toast({
          title: 'Lote criado, mas falhou ao gerar PDF',
          description: getErrorMessage(error),
          variant: 'destructive',
        });
      }

      toast({
        title: 'Lote criado com sucesso!',
        description: 'O lote foi criado e está pronto para ser processado.',
      });
      form.reset();
      onSuccess();
    },
    onError: (error: unknown) => {
      toast({
        title: 'Erro ao criar lote',
        description: getErrorMessage(error) || 'Ocorreu um erro ao criar o lote.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createLoteMutation.mutate(data);
  };

  const adicionarItem = () => {
    if (!currentItem.tamanho_id || currentItem.quantidade <= 0) {
      toast({
        title: 'Erro',
        description: 'Preencha o tamanho (ou selecione "Geral") e a quantidade para adicionar o item.',
        variant: 'destructive',
      });
      return;
    }

    const itens = form.getValues('itens');
    const hasGeral = itens.some((i) => i.tamanho_id === TAMANHO_GERAL);

    // Regra: não permitir misturar "Geral" com tamanhos específicos
    if (currentItem.tamanho_id === TAMANHO_GERAL && itens.length > 0) {
      toast({
        title: 'Não permitido',
        description: 'Para usar "Geral", remova os itens por tamanho (não é possível misturar).',
        variant: 'destructive',
      });
      return;
    }

    if (currentItem.tamanho_id !== TAMANHO_GERAL && hasGeral) {
      toast({
        title: 'Não permitido',
        description: 'Você já adicionou "Geral". Remova-o para adicionar itens por tamanho.',
        variant: 'destructive',
      });
      return;
    }

    form.setValue('itens', [...itens, currentItem]);
    setCurrentItem({ tamanho_id: '', quantidade: 0, observacoes: '' });
  };

  const removerItem = (index: number) => {
    const itens = form.getValues('itens');
    form.setValue('itens', itens.filter((_, i) => i !== index));
  };

  const itens = form.watch('itens');
  const totalOculos = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Lote</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo lote de óculos
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ O nome do lote será gerado automaticamente</strong> (ex: LT01, LT02, LT03...)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="escola_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escola*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {escolasLoading ? (
                          <div className="p-2 text-center">Carregando...</div>
                        ) : (
                          escolas?.map((escola) => (
                            <SelectItem key={escola.id} value={escola.id}>
                              {escola.nome} - {escola.municipios?.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="turno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manha">Manhã</SelectItem>
                      <SelectItem value="tarde">Tarde</SelectItem>
                      <SelectItem value="integral">Integral</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição opcional do lote"
                      {...field}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Itens do Lote */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Itens do Lote</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione os óculos por tamanho ou adicione "Geral" para quantidade total
                </p>
              </div>

              {/* Formulário para adicionar item */}
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Tamanho*</label>
                      <Select
                        value={currentItem.tamanho_id}
                        onValueChange={(value) => setCurrentItem({ ...currentItem, tamanho_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TAMANHO_GERAL}>Geral (quantidade total)</SelectItem>
                        {tamanhosLoading ? (
                          <div className="p-2 text-center text-sm">Carregando...</div>
                        ) : tamanhos && tamanhos.length > 0 ? (
                          tamanhos.map((tamanho) => (
                            <SelectItem key={tamanho.id} value={tamanho.id}>
                              {tamanho.nome}{tamanho.descricao ? ` - ${tamanho.descricao}` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-sm">Nenhum tamanho disponível</div>
                        )}
                      </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Quantidade*</label>
                      <Input
                        type="number"
                        min="1"
                        value={currentItem.quantidade || ''}
                        onChange={(e) => setCurrentItem({ ...currentItem, quantidade: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={adicionarItem}
                        className="w-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de itens adicionados */}
              {itens.length > 0 && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">Itens Adicionados</h4>
                        <p className="text-sm text-gray-600">
                          Total: <span className="font-bold">{totalOculos}</span> óculos
                        </p>
                      </div>
                      {itens.map((item, index) => {
                        const isGeral = item.tamanho_id === TAMANHO_GERAL;
                        const tamanho = isGeral ? undefined : tamanhos?.find((t) => t.id === item.tamanho_id);

                        return (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium">
                                Tamanho: {isGeral ? 'Geral' : tamanho?.nome || 'N/A'} - Quantidade: {item.quantidade}
                              </p>
                              {item.observacoes && (
                                <p className="text-sm text-gray-600">{item.observacoes}</p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerItem(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações gerais sobre o lote"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createLoteMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createLoteMutation.isPending}>
                {createLoteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Criar Lote
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
