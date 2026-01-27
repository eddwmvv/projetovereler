# Melhorias de Responsividade Mobile

## Resumo
Este documento descreve as melhorias implementadas para tornar o sistema Ver e Ler totalmente responsivo e otimizado para dispositivos móveis.

## Funcionalidades Implementadas

### 1. Sidebar Mobile com Overlay
- **Arquivo**: `src/components/layout/Sidebar.tsx`
- **Funcionalidades**:
  - Sidebar que desliza da esquerda em dispositivos móveis
  - Overlay escuro com transparência quando o menu está aberto
  - Botão de fechar (X) no topo do sidebar
  - Animações suaves de entrada e saída
  - Fecha automaticamente ao clicar em um item do menu
  - Fecha ao clicar no overlay
  - Mantém funcionalidade de colapsar/expandir no desktop

### 2. Header Mobile com Botão Hamburguer
- **Arquivo**: `src/components/layout/DashboardLayout.tsx`
- **Funcionalidades**:
  - Header fixo visível apenas em dispositivos móveis (< 1024px)
  - Botão hamburguer para abrir o sidebar
  - Logo/título do sistema exibido no header

### 3. Hook de Controle do Sidebar Mobile
- **Arquivo**: `src/hooks/use-mobile-sidebar.tsx`
- **Funcionalidades**:
  - Context API para gerenciar estado global do sidebar
  - Detecção automática de tamanho de tela
  - Métodos para abrir, fechar e alternar o sidebar
  - Fecha automaticamente ao redimensionar para desktop

### 4. Visualização de Tabelas em Cards
- **Arquivo**: `src/components/shared/MobileTable.tsx`
- **Funcionalidades**:
  - Cards responsivos para cada linha da tabela
  - Layout vertical com labels claras
  - Área dedicada para ações (botões)
  - Paginação otimizada para mobile
  - Design limpo e legível

### 5. DataTable Responsivo
- **Arquivo**: `src/components/shared/DataTable.tsx`
- **Funcionalidades**:
  - Detecção automática do tamanho da tela
  - Alterna entre tabela (desktop) e cards (mobile) automaticamente
  - Breakpoint em 768px (tablets e menores usam cards)
  - Paginação responsiva com botões compactos em mobile
  - Controles de "itens por página" adaptados para telas pequenas
  - Scroll horizontal para tabelas em tablets

### 6. Utilitários CSS Responsivos
- **Arquivo**: `src/index.css`
- **Classes adicionadas**:
  - `.mobile-container` - Padding otimizado para mobile
  - `.desktop-container` - Padding para desktop
  - `.responsive-text-lg` até `.responsive-text-3xl` - Tamanhos de texto adaptativos
  - `.responsive-grid` - Grid de 1, 2 ou 3 colunas responsivo
  - `.responsive-grid-2` - Grid de 1 ou 2 colunas
  - `.responsive-grid-4` - Grid de 1, 2 ou 4 colunas

## Breakpoints Utilizados

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 768px (md)
- **Desktop pequeno**: 768px - 1024px (lg)
- **Desktop**: ≥ 1024px (lg+)

## Como Usar

### Sidebar Mobile
O sidebar mobile é controlado automaticamente. Em dispositivos com largura < 1024px:
- O botão hamburguer aparece no header
- O sidebar fica oculto por padrão
- Clique no hamburguer para abrir
- Clique no overlay ou em um item do menu para fechar

### Tabelas Responsivas
O componente `DataTable` detecta automaticamente o tamanho da tela:

```tsx
<DataTable
  data={items}
  columns={columns}
  page={page}
  pageSize={pageSize}
  onPageChange={setPage}
  // Em mobile, automaticamente mostra cards
  // Opcionalmente, forneça ações customizadas para os cards:
  renderMobileCard={(row) => (
    <>
      <Button size="sm" onClick={() => handleEdit(row)}>Editar</Button>
      <Button size="sm" variant="destructive" onClick={() => handleDelete(row)}>Excluir</Button>
    </>
  )}
/>
```

### Classes CSS Responsivas
Use as classes utilitárias para garantir responsividade:

```tsx
<div className="responsive-grid">
  {/* Automaticamente: 1 coluna (mobile), 2 (tablet), 3 (desktop) */}
</div>

<h1 className="responsive-text-3xl">
  {/* Automaticamente: text-2xl (mobile), text-3xl (desktop) */}
</h1>
```

## Testes Recomendados

1. **Testar em diferentes tamanhos de tela**:
   - Mobile: iPhone, Android (375px - 428px)
   - Tablet: iPad (768px - 1024px)
   - Desktop: 1920px+

2. **Testar funcionalidades**:
   - Abrir/fechar sidebar em mobile
   - Navegação entre páginas
   - Visualização de tabelas em cards
   - Paginação em diferentes tamanhos
   - Redimensionamento da janela

3. **Testar performance**:
   - Animações devem ser suaves
   - Não deve haver layout shift
   - Scroll deve funcionar corretamente

## Compatibilidade

- **Navegadores**: Chrome, Firefox, Safari, Edge (versões modernas)
- **Dispositivos**: iOS 12+, Android 8+
- **Acessibilidade**: Mantém suporte a leitores de tela

## Próximos Passos Sugeridos

1. Testar em dispositivos físicos reais
2. Otimizar imagens para mobile (se aplicável)
3. Adicionar gestos de swipe para fechar sidebar (opcional)
4. Implementar PWA para instalação em dispositivos móveis
5. Adicionar modo landscape otimizado para tablets
