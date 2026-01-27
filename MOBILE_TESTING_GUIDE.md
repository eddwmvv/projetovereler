# Guia de Testes - Versão Mobile

## 🧪 Checklist de Testes

### 1. Bottom Navigation

#### ✅ Funcionalidade Básica
- [ ] Menu aparece apenas em telas < 1024px
- [ ] Menu desaparece em telas ≥ 1024px
- [ ] 4 itens visíveis: Início, Alunos, Estoque, Relatórios
- [ ] Ícones corretos para cada item
- [ ] Labels legíveis abaixo dos ícones

#### ✅ Navegação
- [ ] Clicar em "Início" navega para /
- [ ] Clicar em "Alunos" navega para /alunos
- [ ] Clicar em "Estoque" navega para /estoque-armacoes
- [ ] Clicar em "Relatórios" navega para /relatorios

#### ✅ Estado Ativo
- [ ] Item ativo fica azul (blue-600)
- [ ] Item ativo tem ícone maior (scale-110)
- [ ] Item ativo tem label em negrito
- [ ] Apenas um item ativo por vez

#### ✅ Interação
- [ ] Feedback visual ao tocar (active:bg-gray-100)
- [ ] Transições suaves entre estados
- [ ] Touch target ≥ 64px de altura

#### ✅ Safe Area
- [ ] Respeita safe-area-inset-bottom em iPhone X+
- [ ] Menu não fica escondido pelo home indicator
- [ ] Funciona corretamente em Android com gestos

### 2. Página de Estoque

#### ✅ Header Responsivo
- [ ] Título "Estoque" (não "Estoque de Armações") em mobile
- [ ] Título text-2xl em mobile
- [ ] Título text-3xl em desktop
- [ ] Badge com contador funciona
- [ ] Botões em flex column em mobile
- [ ] Botões "Import" e "Novo" em mobile
- [ ] Botões "Importar Excel" e "Nova Armação" em desktop

#### ✅ Filtros
##### Mobile
- [ ] Campo de busca ocupa linha inteira
- [ ] Filtros em grid 2x2
- [ ] Labels simplificadas ("Todos" ao invés de "Todos os status")
- [ ] Botão "Limpar" integrado ao grid quando há filtros ativos
- [ ] Todos os selects funcionam corretamente

##### Desktop
- [ ] Filtros em linha horizontal
- [ ] Grid 4 colunas responsivo
- [ ] Botão "Limpar" ao lado dos filtros

#### ✅ Cards de Resumo por Tamanho
##### Layout
- [ ] 1 coluna em mobile (< 640px)
- [ ] 2 colunas em tablet (640px - 768px)
- [ ] 3 colunas em desktop pequeno (768px - 1024px)
- [ ] 4 colunas em desktop (≥ 1024px)

##### Visual
- [ ] Ícone do tamanho em caixa azul à esquerda
- [ ] Número de disponíveis em verde grande
- [ ] Total de armações exibido
- [ ] Hover effect com sombra
- [ ] Cards com arredondamento adequado

##### Dados
- [ ] Números corretos para cada tamanho
- [ ] Atualiza ao aplicar filtros
- [ ] Mostra "Nenhuma armação" quando vazio

#### ✅ Lista de Armações
##### Desktop (≥ 768px)
- [ ] Exibe tabela tradicional
- [ ] 4 colunas: Numeração, Tipo, Tamanho, Status
- [ ] Scroll vertical funciona
- [ ] Sem overflow horizontal
- [ ] Badges coloridos corretos

##### Mobile (< 768px)
- [ ] Exibe cards ao invés de tabela
- [ ] Cada card mostra:
  - [ ] Numeração em destaque (#001)
  - [ ] Badge de status colorido
  - [ ] Tipo da armação
  - [ ] Tamanho da armação
- [ ] Hover effect suave
- [ ] Touch targets adequados
- [ ] Espaçamento correto entre cards

##### Estados Vazios
- [ ] Mostra EmptyState quando sem armações
- [ ] Mensagem diferente para "sem armações" vs "sem resultados"
- [ ] Botão "Adicionar Armação" quando vazio
- [ ] Sem botão quando apenas filtrado

#### ✅ Dialog de Criação
- [ ] Abre ao clicar em "Nova" / "Nova Armação"
- [ ] Formulário responsivo
- [ ] Campos funcionam corretamente
- [ ] Botões de ação visíveis
- [ ] Fecha após criar com sucesso

#### ✅ Modal de Importação
- [ ] Abre ao clicar em "Import" / "Importar Excel"
- [ ] Layout responsivo
- [ ] Upload funciona
- [ ] Feedback adequado

### 3. Layout Geral

#### ✅ Sidebar
- [ ] Visível apenas em desktop (≥ 1024px)
- [ ] Oculta em mobile (< 1024px)
- [ ] Colapsar/expandir funciona em desktop

#### ✅ Espaçamento
- [ ] Content tem pb-20 em mobile (espaço para bottom nav)
- [ ] Content tem pb-6 em desktop
- [ ] Sem sobreposição de elementos

#### ✅ Scroll
- [ ] Scroll vertical funciona normalmente
- [ ] Bottom nav fica fixo ao scrollar
- [ ] Sem scroll horizontal em nenhuma tela

### 4. Responsividade

#### ✅ Breakpoints
##### Mobile (< 640px)
- [ ] Bottom nav visível
- [ ] Sidebar oculta
- [ ] Cards em 1 coluna
- [ ] Filtros em 2x2
- [ ] Botões full width

##### Tablet (640px - 768px)
- [ ] Bottom nav visível
- [ ] Sidebar oculta
- [ ] Cards em 2 colunas
- [ ] Filtros em 2x2

##### Desktop pequeno (768px - 1024px)
- [ ] Bottom nav visível
- [ ] Sidebar oculta
- [ ] Tabela visível
- [ ] Cards de resumo em 3 colunas

##### Desktop (≥ 1024px)
- [ ] Bottom nav oculto
- [ ] Sidebar visível
- [ ] Tabela visível
- [ ] Cards de resumo em 4 colunas

#### ✅ Rotação de Tela
- [ ] Portrait → Landscape funciona
- [ ] Landscape → Portrait funciona
- [ ] Layout se adapta corretamente
- [ ] Sem elementos cortados

### 5. Performance

#### ✅ Renderização
- [ ] Primeira renderização < 1s
- [ ] Transições suaves (60fps)
- [ ] Sem jank ao scrollar
- [ ] Imagens carregam progressivamente

#### ✅ Interação
- [ ] Cliques respondem imediatamente
- [ ] Sem delay perceptível
- [ ] Animações fluidas

### 6. Acessibilidade

#### ✅ Contraste
- [ ] Textos legíveis em todos os backgrounds
- [ ] Ícones visíveis
- [ ] Badges com contraste adequado

#### ✅ Touch Targets
- [ ] Todos os botões ≥ 44px
- [ ] Bottom nav items ≥ 64px
- [ ] Cards com padding adequado
- [ ] Espaçamento entre elementos clicáveis

#### ✅ Texto
- [ ] Tamanho mínimo 14px
- [ ] Números de destaque grandes
- [ ] Hierarquia clara

### 7. Casos Especiais

#### ✅ Dispositivos com Notch
- [ ] iPhone X, 11, 12, 13, 14, 15
- [ ] Bottom nav respeita safe area
- [ ] Sem elementos cortados pelo notch
- [ ] Home indicator não sobrepõe conteúdo

#### ✅ Dispositivos Antigos
- [ ] iOS 12+ funciona
- [ ] Android 8+ funciona
- [ ] Fallbacks para navegadores antigos

#### ✅ Orientação Paisagem
- [ ] Layout se adapta
- [ ] Bottom nav continua acessível
- [ ] Conteúdo não fica cortado

### 8. Integração

#### ✅ Navegação entre Páginas
- [ ] / → /alunos funciona
- [ ] /alunos → /estoque-armacoes funciona
- [ ] /estoque-armacoes → /relatorios funciona
- [ ] /relatorios → / funciona
- [ ] Estado do menu atualiza corretamente

#### ✅ Estado Persistente
- [ ] Filtros mantém estado ao navegar e voltar
- [ ] Scroll position restaurada (se aplicável)

## 🔬 Testes por Dispositivo

### iPhone
- [ ] iPhone SE (375px)
- [ ] iPhone 12/13/14 (390px)
- [ ] iPhone 14/15 Pro Max (430px)

### Android
- [ ] Samsung Galaxy S21 (360px)
- [ ] Pixel 5 (393px)
- [ ] Samsung Galaxy S21+ (412px)

### Tablet
- [ ] iPad (768px)
- [ ] iPad Pro 11" (834px)
- [ ] iPad Pro 12.9" (1024px)

### Desktop
- [ ] 1366x768 (laptop comum)
- [ ] 1920x1080 (Full HD)
- [ ] 2560x1440 (2K)

## 🐛 Bugs Conhecidos e Soluções

### Problema: Bottom nav sobrepõe conteúdo
**Solução**: Verificar se `pb-20 lg:pb-6` está aplicado no main

### Problema: Sidebar aparece em mobile
**Solução**: Verificar condição `!isMobile` no DashboardLayout

### Problema: Cards muito pequenos
**Solução**: Verificar padding e min-height dos cards

### Problema: Filtros cortados
**Solução**: Usar grid 2x2 em mobile

## ✅ Critérios de Aceitação

Para considerar os testes bem-sucedidos, todos os itens devem estar ✅:

1. **Funcionalidade**: 100% dos recursos funcionam
2. **Responsividade**: Funciona em todos os breakpoints
3. **Performance**: Sem lag ou jank
4. **Acessibilidade**: Touch targets e contraste adequados
5. **Visual**: Seguindo design proposto
6. **Compatibilidade**: Funciona em iOS 12+ e Android 8+

## 📝 Relatório de Teste

```
Data: __/__/____
Testador: ________________
Dispositivo: ________________
Navegador: ________________

Resultados:
- Funcionalidade: [ ] Passou [ ] Falhou
- Responsividade: [ ] Passou [ ] Falhou
- Performance: [ ] Passou [ ] Falhou
- Acessibilidade: [ ] Passou [ ] Falhou
- Visual: [ ] Passou [ ] Falhou

Bugs encontrados:
1. _________________________________
2. _________________________________
3. _________________________________

Notas:
_____________________________________
_____________________________________
```
