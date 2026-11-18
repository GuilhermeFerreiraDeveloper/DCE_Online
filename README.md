# DCE · Departamento de Custódia do Estado (GTA RP)

Sistema full-stack para gestão penitenciária e consulta pública de fichas criminais, desenvolvido com **ASP.NET Core 8** (Backend) e **React + Tailwind CSS** (Frontend).

## 🚀 Stack Tecnológica

- **Frontend:** React, TypeScript, Tailwind CSS, Lucide React, Zustand.
- **Backend:** ASP.NET Core 8, Entity Framework Core, Npgsql, BCrypt.
- **Banco de Dados:** PostgreSQL (Hospedado no Neon.tech ou Render).

## 🛠️ Como Configurar

### 1. Banco de Dados (Neon.tech)
1. Crie um projeto no [Neon.tech](https://neon.tech).
2. Execute o script contido em `Backend/schema.sql` no editor SQL do Neon para criar as tabelas e popular os dados iniciais.
3. Copie a **Connection String**.

### 2. Backend (.NET)
1. Navegue até a pasta `Backend/`.
2. Crie ou edite o arquivo `appsettings.json` (ou use variáveis de ambiente):
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "SUA_CONNECTION_STRING_AQUI"
     },
     "Jwt": {
       "Key": "UMA_CHAVE_SECRETA_LONGA_E_SEGURA",
       "Issuer": "DCE-API",
       "Audience": "DCE-App"
     }
   }
   ```
3. Execute `dotnet run`.

### 3. Frontend (React)
1. Navegue até a pasta `Frontend/`.
2. Crie um arquivo `.env` baseado no `.env.example`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Execute `npm install` e depois `npm run dev`.

## 📦 Deploy no Git

Para subir as alterações para o seu repositório (GitHub/GitLab):

1. **Abra o Git Bash** na pasta raiz do projeto.
2. Adicione os arquivos:
   ```bash
   git add .
   ```
3. Crie o commit:
   ```bash
   git commit -m "feat: setup projeto inicial e schema do banco de dados"
   ```
4. Configure o repositório remoto (se ainda não fez):
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   ```
5. Envie os arquivos:
   ```bash
   git push -u origin main
   ```

---
*Uso restrito ao Departamento de Custódia do Estado.*
