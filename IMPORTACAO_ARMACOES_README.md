# Importação em Massa de Armações

## Funcionalidades Implementadas

✅ **Leitura de arquivos Excel** (.xlsx, .xls, .xlsm)
✅ **Validação de numeração** (linhas com numeração duplicada são ignoradas)
✅ **Validação de dados** (tipo, status, campos obrigatórios)
✅ **Criação automática de tamanhos** (se não existir, é criado)
✅ **Preview dos dados** antes da importação
✅ **Relatório detalhado** dos resultados
✅ **Interface intuitiva** com upload via drag & drop

## Como Usar

### 1. Preparar o arquivo Excel

O arquivo deve conter as seguintes colunas obrigatórias:
- **Numeração** (única, será validada)
- **Cor**
- **Tipo** (masculino, feminino ou unissex)
- **Marca**
- **Status** (disponivel, utilizada, perdida ou danificada)

Coluna opcional:
- **Tamanho** (será criado automaticamente se não existir)

## ⚠️ Regras Críticas

### 🔒 Validação de Unicidade
- **Numeração**: Deve ser única no sistema
- **Tamanhos**: Nomes devem ser únicos (não diferencia maiúsculas/minúsculas)

### 🔒 Validação de Unicidade de Numeração
- **Numeração deve ser única no sistema**
- **Importação**: Usa exatamente a numeração especificada no arquivo Excel
- **Criação manual**: Gera numeração automática sequencial (ex: 0001, 0002...)
- **Duplicatas**: **REJEITADAS** - linha não é importada
- **Processamento contínuo**: Outras linhas válidas continuam sendo processadas

### 🔒 Validação de Tamanhos
- **Tamanhos são criados automaticamente** se não existirem
- **Nomes duplicados são rejeitados** (não cria novo tamanho)
- **Busca por nome existente** antes de criar
- **Mensagem clara** em caso de duplicata

### 2. Formato do Arquivo

```csv
Numeração,Tipo,Tamanho,Status
0001,masculino,M,disponivel
0002,feminino,P,disponivel
0003,unissex,G,utilizada
0004,masculino,,danificada
```

### 3. Processo de Importação

1. Na página **Estoque de Armações**, clique em **"Importar Excel"**
2. Selecione o arquivo Excel (máx. 10MB)
3. **Preview**: Verifique os dados na tabela
4. **Importar**: Clique para processar
5. **Resultado**: Veja o relatório com sucessos, duplicatas e erros

### 4. Validações Realizadas

- ✅ **Numeração**: Verificada unicidade (REJEITADA se já existir - usa numeração do arquivo)
- ✅ **Tipo**: Deve ser "masculino", "feminino" ou "unissex"
- ✅ **Status**: Deve ser "disponivel", "utilizada", "perdida" ou "danificada"
- ✅ **Campos obrigatórios**: Numeração, Cor, Tipo, Status
- ✅ **Tamanho**: Criado automaticamente se não existir (nomes únicos)
- ✅ **Arquivo**: Apenas Excel, máximo 10MB

### 5. Resultados

Cada linha terá um dos seguintes status:
- 🟢 **Sucesso**: Armação criada com sucesso
- 🟠 **Duplicada**: Numeração já existe (IMPEDIDA - linha não importada)
- 🔴 **Erro**: Problema de validação ou processamento

## Arquivos Modificados

- `src/services/armacoes.ts` - Funções de importação e validação
- `src/hooks/use-armacoes.ts` - Hook para importação
- `src/components/armacoes/ImportArmacoesModal.tsx` - Modal de importação
- `src/pages/EstoqueArmacoesPage.tsx` - Botão e integração

## Dependências Adicionadas

- `xlsx` - Para leitura de arquivos Excel
- `@types/node` - Tipos TypeScript

## Exemplo de Uso no Código

```typescript
import { parseExcelFile, processarImportacaoArmacoes } from '@/services/armacoes';

// Ler arquivo
const dados = await parseExcelFile(file);

// Processar importação
const resultados = await processarImportacaoArmacoes(dados);
```

## Considerações Técnicas

- **Processamento sequencial** para evitar conflitos de numeração
- **Transações atômicas** por linha
- **Feedback visual** durante processamento
- **Limpeza automática** ao fechar modal
- **Validação robusta** de tipos e formatos