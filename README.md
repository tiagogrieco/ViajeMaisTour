# Viaje Mais Tour CRM

Sistema de CRM completo para agência de viagens, desenvolvido com React, TypeScript, Shadcn UI e Vite.

## Funcionalidades

- **Agenda**: Gerenciamento de compromissos e tarefas.
- **Clientes**: Cadastro e gestão de clientes e dependentes.
- **Fornecedores**: Cadastro de operadoras, hotéis, cias aéreas, etc.
- **Produtos**: Catálogo de produtos e serviços.
- **Cotações**: Criação e gerenciamento de cotações de viagens.
- **Integração com Google Sheets**: Backup e sincronização de dados (opcional).
- **Exportação/Importação**: Backup local em JSON e CSV.

## Como Rodar o Projeto Localmente

### Pré-requisitos

- Node.js instalado (versão 18 ou superior recomendada).
- Gerenciador de pacotes (npm, pnpm ou yarn).

### Instalação

1. Baixe e extraia o arquivo ZIP do projeto.
2. Abra o terminal na pasta do projeto.
3. Instale as dependências:

```bash
npm install
# ou
pnpm install
```

### Desenvolvimento

Para rodar o servidor de desenvolvimento:

```bash
npm run dev
# ou
pnpm run dev
```

O projeto estará acessível em `http://localhost:8080` (ou outra porta indicada).

### Build (Produção)

Para gerar a versão otimizada para produção:

```bash
npm run build
# ou
pnpm run build
```

Os arquivos gerados estarão na pasta `dist`.

## Estrutura do Projeto

- `src/components`: Componentes React reutilizáveis e abas do sistema.
- `src/hooks`: Hooks personalizados (ex: integração com Google Sheets).
- `src/services`: Serviços de API e lógica de negócios.
- `src/types`: Definições de tipos TypeScript.
- `src/utils`: Funções utilitárias (formatação, exportação CSV).
- `src/pages`: Páginas da aplicação.

## Tecnologias

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (Ícones)
- [React Router](https://reactrouter.com/)

## Licença

Proprietário: Viaje Mais Tour