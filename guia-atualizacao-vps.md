# Guia de Atualização do Projeto no VPS via SSH

## Pré-requisitos
- Cliente SSH instalado (PuTTY no Windows ou terminal nativo)
- Credenciais de acesso ao VPS (IP, usuário e senha/chave SSH)
- Projeto já deve estar inicialmente deployado no VPS

## Passo 1: Conectar ao VPS via SSH

### No Windows (PowerShell ou CMD):
```bash
ssh usuario@SEU_IP_VPS
```

### Usando PuTTY (interface gráfica):
1. Abra o PuTTY
2. Em "Host Name": digite o IP do seu VPS
3. Em "Port": 22 (padrão SSH)
4. Clique em "Open"
5. Digite usuário e senha quando solicitado

## Passo 2: Navegar até o Diretório do Projeto

```bash
cd /caminho/para/seu/projeto
# Exemplo: cd /var/www/projetovereler
```

## Passo 3: Verificar Status Atual

```bash
# Ver branch atual e status
git status

# Ver última versão deployada
git log -1 --oneline
```

## Passo 4: Atualizar o Código do GitHub

```bash
# Buscar últimas alterações
git fetch origin

# Atualizar branch main
git pull origin main
```

**Se houver conflitos:**
```bash
# Ver arquivos em conflito
git status

# Resolver conflitos manualmente ou
# Descartar alterações locais e usar versão do GitHub
git reset --hard origin/main
```

## Passo 5: Instalar Novas Dependências (se houver)

### Backend (Node.js):
```bash
# Se houver package.json atualizado
npm install
```

### Frontend (React/Vite):
```bash
# Navegar até pasta do frontend se separada
cd frontend
npm install
cd ..
```

## Passo 6: Rebuild do Frontend

```bash
# Build de produção
npm run build

# Ou se frontend está em pasta separada
cd frontend
npm run build
cd ..
```

## Passo 7: Reiniciar Serviços

### Opção 1 - Usando PM2 (recomendado):
```bash
# Reiniciar aplicação
pm2 restart all

# Ou reiniciar app específico
pm2 restart app-name

# Ver status
pm2 status

# Ver logs
pm2 logs
```

### Opção 2 - Usando systemd:
```bash
# Reiniciar serviço
sudo systemctl restart nome-do-servico

# Ver status
sudo systemctl status nome-do-servico
```

### Opção 3 - Nginx (se necessário):
```bash
# Testar configuração
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx
```

## Passo 8: Verificar se a Atualização Funcionou

```bash
# Ver logs em tempo real (PM2)
pm2 logs --lines 50

# Verificar se o processo está rodando
pm2 status

# Testar endpoint da API
curl http://localhost:PORTA/api/health
```

## Passo 9: Testar no Navegador

1. Acesse: `http://SEU_IP_VPS` ou `https://seudominio.com`
2. Verifique se as novas funcionalidades estão presentes
3. Teste as principais funcionalidades do sistema
4. Verifique o console do navegador (F12) para erros

## Script Automatizado de Atualização

Você pode criar um script para automatizar o processo:

```bash
# Criar arquivo de script
nano ~/atualizar-projeto.sh
```

**Conteúdo do script:**
```bash
#!/bin/bash

echo "🚀 Iniciando atualização do projeto..."

# Navegar até o diretório
cd /var/www/projetovereler || exit

# Fazer backup antes de atualizar
echo "📦 Criando backup..."
git stash

# Atualizar código
echo "⬇️  Baixando atualizações..."
git pull origin main

# Instalar dependências
echo "📚 Instalando dependências..."
npm install

# Build do frontend
echo "🏗️  Compilando frontend..."
npm run build

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart all

# Verificar status
echo "✅ Verificando status..."
pm2 status

echo "✨ Atualização concluída!"
```

**Dar permissão de execução:**
```bash
chmod +x ~/atualizar-projeto.sh
```

**Executar o script:**
```bash
~/atualizar-projeto.sh
```

## Comandos Úteis para Diagnóstico

```bash
# Ver logs do sistema
sudo journalctl -xe

# Ver uso de memória e CPU
htop
# ou
top

# Ver espaço em disco
df -h

# Ver processos Node.js rodando
ps aux | grep node

# Ver portas em uso
sudo netstat -tulpn | grep LISTEN
```

## Troubleshooting Comum

### Erro: "Permission denied"
```bash
# Verificar permissões
ls -la /var/www/projetovereler

# Corrigir permissões se necessário
sudo chown -R $USER:$USER /var/www/projetovereler
```

### Erro: "Port already in use"
```bash
# Encontrar processo na porta
sudo lsof -i :3000

# Matar processo
kill -9 PID_DO_PROCESSO
```

### Erro: Build falhou - falta memória
```bash
# Aumentar swap ou
# Build localmente e subir apenas a pasta dist
```

### Site não carrega após atualização
```bash
# Limpar cache do navegador (Ctrl+Shift+R)
# Verificar logs do nginx
sudo tail -f /var/log/nginx/error.log

# Verificar logs da aplicação
pm2 logs
```

## Boas Práticas

1. **Sempre faça backup antes de atualizar**
   ```bash
   git stash
   # ou
   cp -r /var/www/projetovereler /backup/projeto-$(date +%Y%m%d)
   ```

2. **Teste em ambiente de desenvolvimento primeiro**

3. **Mantenha as dependências atualizadas**
   ```bash
   npm outdated
   npm update
   ```

4. **Monitore os logs após atualização**
   ```bash
   pm2 logs --lines 100
   ```

5. **Configure um domínio e SSL (HTTPS)**
   ```bash
   # Usando Certbot
   sudo certbot --nginx -d seudominio.com
   ```

## Fluxo Completo Resumido

```bash
# 1. Conectar
ssh usuario@IP_VPS

# 2. Navegar
cd /var/www/projetovereler

# 3. Atualizar
git pull origin main

# 4. Instalar
npm install

# 5. Build
npm run build

# 6. Reiniciar
pm2 restart all

# 7. Verificar
pm2 logs
```

## Desconectar do VPS

```bash
# Sair da sessão SSH
exit
```

---

**Dica:** Salve essas credenciais em local seguro:
- IP do VPS: _______________
- Usuário SSH: _______________
- Caminho do projeto: _______________
- Nome da aplicação PM2: _______________
