import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Column } from './DataTable';

interface MobileTableProps<T> {
  data: T[];
  columns: Column<T>[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  className?: string;
  renderCardActions?: (row: T) => ReactNode;
}

export function MobileTable<T extends { id: string }>({
  data,
  columns,
  page = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  emptyMessage = 'Nenhum item encontrado',
  className,
  renderCardActions,
}: MobileTableProps<T>) {
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : Math.ceil(data.length / pageSize);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems || data.length);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Cards */}
      {data.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 px-4">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((row) => (
            <div
              key={row.id}
              className="bg-card border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow"
            >
              {columns.map((column) => {
                // Pular a coluna de ações se existir renderCardActions
                if (column.id === 'actions' && renderCardActions) {
                  return null;
                }
                
                const content = column.accessor(row);
                
                // Não renderizar se o conteúdo estiver vazio
                if (!content) return null;

                return (
                  <div key={column.id} className="flex flex-col space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase">
                      {column.header}
                    </span>
                    <div className="text-sm font-medium text-foreground">
                      {content}
                    </div>
                  </div>
                );
              })}
              
              {/* Ações personalizadas */}
              {renderCardActions && (
                <div className="pt-2 border-t flex gap-2 flex-wrap">
                  {renderCardActions(row)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginação Mobile */}
      {(onPageChange || onPageSizeChange) && data.length > 0 && (
        <div className="space-y-3 pt-2">
          {/* Informações e itens por página */}
          <div className="flex flex-col gap-3 text-sm">
            <p className="text-muted-foreground text-center">
              Mostrando {startItem} a {endItem} de {totalItems || data.length}
            </p>
            {onPageSizeChange && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-muted-foreground">Por página:</span>
                <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Botões de navegação */}
          {onPageChange && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="flex-1 max-w-[120px]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1 px-3 py-1 bg-muted rounded-md">
                <span className="text-sm font-medium">{page}</span>
                <span className="text-xs text-muted-foreground">de</span>
                <span className="text-sm font-medium">{totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="flex-1 max-w-[120px]"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
