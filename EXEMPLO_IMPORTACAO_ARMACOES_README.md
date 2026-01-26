# 📋 Arquivo Excel de Exemplo - Importação de Armações

## 📁 Arquivo Criado
- **Nome**: `exemplo_importacao_armacoes.xlsx`
- **Localização**: Raiz do projeto
- **Tamanho**: ~16KB

## 📊 Estrutura das Colunas

| Coluna | Tipo | Obrigatório | Descrição | Valores Permitidos |
|--------|------|-------------|-----------|-------------------|
| **Numeração** | Texto | ✅ | Código único da armação | Ex: 0001, 0002, ABC123<br/>**IMPORTANTE:** Deve ser único no sistema |
| **Tipo** | Texto | ✅ | Tipo da armação | `masculino`, `feminino`, `unissex` |
| **Tamanho** | Texto | ❌ | Tamanho (opcional) | Qualquer texto único, será criado se não existir |
| **Status** | Texto | ✅ | Status inicial | `disponivel`, `utilizada`, `perdida`, `danificada` |

## ⚠️ Regras Importantes

### 🔍 Validações Automáticas
1. **Numeração**: Deve ser única. Linhas com numeração já existente no sistema são **IMPEDIDAS** (não importadas)
2. **Campos obrigatórios**: Numeração, Cor, Tipo, Marca, Status
3. **Tipo**: Apenas `masculino`, `feminino` ou `unissex`
4. **Status**: Apenas `disponivel`, `utilizada`, `perdida` ou `danificada`
5. **Tamanho**: Se não existir, será criado automaticamente

### 🚫 Comportamentos
- **Linhas com erro**: São puladas, mas não interrompem a importação
- **Duplicatas**: Numerações existentes são ignoradas
- **Tamanhos novos**: Criados automaticamente se não existirem

## 📝 Como Usar

1. **Abra** o arquivo `exemplo_importacao_armacoes.xlsx`
2. **Preencha** as colunas com seus dados
3. **Salve** o arquivo
4. **Importe** através do botão "Importar Excel" na página de Estoque

## 🎯 Exemplo de Dados Válidos

```
Numeração | Tipo      | Tamanho | Status
----------|-----------|---------|-----------
0001      | masculino | M       | disponivel
0002      | feminino  | P       | disponivel
0003      | unissex   | G       | utilizada
0004      | masculino | GG      | danificada
0005      | feminino  |         | disponivel
```

## ⚠️ Regras de Unicidade

### 🔒 Campos Únicos
- **Numeração**: Deve ser única em todo o sistema
- **Tamanhos**: Nomes devem ser únicos (não diferencia maiúsculas/minúsculas)
- **Duplicatas**: Serão rejeitadas automaticamente na importação

### 🚫 Comportamentos
- **Numeração duplicada**: Linha **REJEITADA** (não importa, evita duplicatas)
- **Tamanho duplicado**: Linha rejeitada (não cria novo tamanho)
- **Outros campos**: Podem se repetir livremente

### 🔢 Sobre Numeração
- **Importação**: Usa exatamente a numeração do arquivo Excel
- **Criação manual**: Gera numeração automática sequencial
- **Duplicatas**: **NUNCA** são permitidas (rejeitadas automaticamente)

## 📋 Formatos Aceitos
- **Extensões**: `.xlsx`, `.xls`, `.xlsm`
- **Tamanho máximo**: 10MB
- **Linhas**: Até milhares de registros
- **Codificação**: UTF-8 recomendada

## 🔄 Processo de Importação
1. **Upload** → Validação do arquivo
2. **Preview** → Visualização dos dados
3. **Processamento** → Validação linha por linha
4. **Resultado** → Relatório detalhado

## ✨ Recursos Automáticos
- ✅ **Criação de tamanhos** inexistentes
- ✅ **Validação de unicidade** de numeração
- ✅ **Feedback visual** de progresso
- ✅ **Relatório completo** de resultados