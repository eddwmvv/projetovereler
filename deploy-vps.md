# Guia de Deploy no VPS

## 📦 Pré-requisitos

- Acesso SSH ao VPS
- Git instalado no VPS
- Node.js e npm/yarn instalados
- PM2 ou outro gerenciador de processos (recomendado)

## 🚀 Passo a Passo para Deploy

### 1. Conectar ao VPS via SSH

```bash
ssh usuario@seu-vps.com
# ou
ssh usuario@IP_DO_VPS
```

### 2. Navegar até o diretório do projeto

```bash
cd /caminho/do/projeto
# Exemplo: cd /var/www/vereler
```

### 3. Fazer backup (recomendado)

```bash
# Criar backup da versão atual
cp -r . ../vereler-backup-$(date +%Y%m%d-%H%M%S)
```

### 4. Baixar as novas alterações do Git

```bash
# Verificar branch atual
git branch

# Baixar alterações
git pull origin main

# Se houver conflitos, resolva-os antes de continuar
```

### 5. Instalar/Atualizar dependências

```bash
# Instalar novas dependências (se houver)
npm install
# ou
yarn install
```

### 6. Build do projeto

```bash
# Gerar build de produção
npm run build
# ou
yarn build
```

### 7. Reiniciar o serviço

#### Se estiver usando PM2:
```bash
# Reiniciar aplicação
pm2 restart vereler

# Verificar status
pm2 status

# Ver logs
pm2 logs vereler
```

#### Se estiver usando systemd:
```bash
# Reiniciar serviço
sudo systemctl restart vereler

# Verificar status
sudo systemctl status vereler

# Ver logs
sudo journalctl -u vereler -f
```

#### Se estiver usando Docker:
```bash
# Rebuild e restart
docker-compose down
docker-compose up -d --build

# Ver logs
docker-compose logs -f
```

### 8. Verificar se está funcionando

```bash
# Testar se o serviço está respondendo
curl http://localhost:PORTA

# Verificar processos
ps aux | grep node
```

## 🔧 Script Automatizado

Crie um arquivo `deploy.sh` no servidor:

```bash
#!/bin/bash

echo "🚀 Iniciando deploy..."

# Ir para o diretório do projeto
cd /var/www/vereler

# Fazer backup
echo "📦 Criando backup..."
cp -r . ../vereler-backup-$(date +%Y%m%d-%H%M%S)

# Baixar alterações
echo "⬇️ Baixando alterações do Git..."
git pull origin main

# Instalar dependências
echo "📚 Instalando dependências..."
npm install

# Build
echo "🔨 Gerando build..."
npm run build

# Reiniciar PM2
echo "🔄 Reiniciando aplicação..."
pm2 restart vereler

# Verificar status
echo "✅ Verificando status..."
pm2 status

echo "🎉 Deploy concluído!"
```

Tornar o script executável:
```bash
chmod +x deploy.sh
```

Executar:
```bash
./deploy.sh
```

## 🐛 Troubleshooting

### Problema: Erro de permissões
```bash
# Ajustar permissões
sudo chown -R $USER:$USER /var/www/vereler
```

### Problema: Porta já em uso
```bash
# Verificar processos na porta
sudo lsof -i :PORTA

# Matar processo se necessário
sudo kill -9 PID
```

### Problema: Build falhou
```bash
# Limpar cache e node_modules
rm -rf node_modules
rm -rf .next  # Se for Next.js
rm -rf dist   # Se for Vite

# Reinstalar
npm install
npm run build
```

### Problema: Git pull falhou
```bash
# Descartar alterações locais (CUIDADO!)
git reset --hard origin/main

# Ou fazer stash
git stash
git pull origin main
git stash pop
```

## 📝 Checklist Pós-Deploy

- [ ] Aplicação está rodando
- [ ] Não há erros nos logs
- [ ] Frontend carrega corretamente
- [ ] API responde corretamente
- [ ] Bottom navigation aparece em mobile
- [ ] Página de estoque funciona
- [ ] Navegação entre páginas funciona
- [ ] Sidebar aparece apenas em desktop

## 🔍 Comandos Úteis

```bash
# Ver logs em tempo real (PM2)
pm2 logs vereler --lines 100

# Monitorar recursos
pm2 monit

# Listar processos
pm2 list

# Informações detalhadas
pm2 info vereler

# Reiniciar com zero-downtime
pm2 reload vereler

# Verificar build
ls -la dist/  # ou build/
```

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs da aplicação
2. Verificar logs do servidor (nginx/apache)
3. Verificar se todas as dependências foram instaladas
4. Verificar se o build foi gerado corretamente
5. Verificar se as variáveis de ambiente estão corretas

## 🎯 Melhorias Implementadas

Esta atualização inclui:
- ✅ Bottom Navigation estilo Binance
- ✅ Página de estoque responsiva
- ✅ Cards mobile para tabelas
- ✅ Sidebar oculta em mobile
- ✅ Filtros otimizados
- ✅ Safe area support

Teste em diferentes dispositivos após o deploy!
