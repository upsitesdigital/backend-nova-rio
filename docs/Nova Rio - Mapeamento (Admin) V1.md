## Dashboard (Minha Área):

- Dados de visualização:
  - Agendamentos do dia
  - Clientes ativos
  - Serviços pendentes
  - Agenda do dia (10 por página)
    - Filtros (tipo de faxina)
    - Mudar página

- Ações rápidas (links):
  - Clientes — Gerenciar clientes
  - Funcionários — Gerenciar equipe
  - Agendamentos — Ver serviços
  - Relatórios — Relatórios dos serviços

## Agendamentos:

- Botão "+ Agendar serviço"
- Agenda de serviços (tabela em 2 colunas):
  - Filtros:
    - Hoje
    - Semana
    - Funcionário
    - Unidade
  - Campos tabela:
    - Data
    - Serviço
    - Duração / Horário
    - Funcionário
    - Status
    - Pacote
    - Ações (abrem um drawer na direita):
      - Visualizar:
        - Visualiza dados do agendamento, como horário, data, status (Agendado, Cancelado ou Concluído), Cliente, Recibo, Funcionário atribuído, tipo de faxina
      - Editar:
        - Tipo de faxina e link para Recibo
        - Data e Status (Agendado, Cancelado ou Concluído)
        - Horário e Duração
        - Cliente (dropdown)
        - Funcionário (dropdown)
        - Botões de ação: Reagendar, Cancelar, Concluído (toggle)
        - Botão "Salvar alterações"
        - Reagendar abre popup com:
          - Calendário para seleção de data (não agenda Sáb, Dom e Feriados)
          - Seletor de horário
          - Dropdown de Funcionário com status de disponibilidade (Livre/Ocupado)
          - Botões Cancelar e Ok

- Estado vazio (sem agendamentos):
  - Mensagem: "Nenhuma limpeza agendada"
  - Botão "+ Agendar serviço manualmente"

- Criar Novo Agendamento (página):
  - Botão "← Voltar"
  - Informações do serviço:
    - Tipo de Serviço (dropdown)
    - Pacote (dropdown — pacotes ativos do serviço selecionado)
    - Duração (dropdown)
  - Detalhes do agendamento:
    - Cliente (dropdown)
    - Funcionário (dropdown com status de disponibilidade)
      - Validação: aviso quando funcionário já possui atendimentos simultâneos
    - Local da limpeza (campo CEP)
    - Observações (campo texto)
  - Data e horário:
    - Calendário (não agenda Sáb, Dom e Feriados)
    - Seletor de horário
  - Validação: alerta de "Conflito de horário"
  - Botão "Salvar"

## Funcionários:

- Botão "+ Novo funcionário"
- Filtros:
  - Todos
  - Ativos
  - Inativos
- Campo de busca:
  - Busca funcionário pelo nome
- Cards de funcionários:
  - Nome
  - CPF
  - WhatsApp
  - Email
  - Status (Ativo/Inativo)
  - Disponibilidade
  - Horas trabalhadas na semana
- Botões de ações:
  - Agenda:
    - Mostra agenda do funcionário em calendário mensal, dias ocupados (verde) e livres (cinza)
  - Editar (página completa):
    - Botão "← Voltar"
    - Informações pessoais:
      - Foto de perfil (alterar imagem)
      - Status (Ativo/Inativo)
      - Nome
      - Email
      - Telefone
      - CPF
      - Endereço
    - Serviços:
      - Horas trabalhadas/Semana (automático, sem input manual)
      - Disponibilidade (horário inicial e final)
      - Unidade (dropdown com as unidades)
      - Observações (campo texto)
    - Agenda:
      - Calendário mensal com legenda Ocupado/Livre
    - Botão "Salvar"

## Clientes:

- Tabela com os clientes cadastrados no sistema
- Filtros:
  - Todos
  - Ativos
  - Inativos
  - Pendentes
  - Pesquisar (nome do cliente ou unidade)
- Informações visíveis dos clientes:
  - Nome
  - Empresa
  - CPF/CNPJ
  - Unidade
  - Status
  - Cadastro
  - E-mail
  - Ações (abrem um popup):
    - Visualizar:
      - Visualiza dados do cliente, como nome, empresa, CPF, unidade e e-mail
      - Caso cadastro esteja pendente de aprovação, ficam visíveis 2 botões: "Aprovar cadastro" e "Reprovar cadastro"

## Pagamentos:

- Histórico completo de transações:
  - Filtros
  - Dados da tabela:
    - Data
    - Serviço
    - Cliente
    - Método de pagamento
    - Status
    - Valor
    - Pacote
    - Ações (abrem um popup):
      - Visualizar:
        - Nome do(a) Cliente
        - Status (Aprovado, Pendente ou Cancelado)
        - Se cancelado/recusado, mostra o motivo
        - Serviço
        - CPF Cliente
        - Unidade
        - E-mail
        - Método de pagamento utilizado
        - Botões: "Excluir" e "Aprovar pagamento"

## Relatórios:

- Dados de visualização:
  - Vendas concluídas (no último mês)
  - Total de clientes ativos
  - Horas vendidas por serviço
  - Histórico de transações (gráfico):
    - Filtros:
      - Faturamento
      - Horas por serviço
      - Período (dropdown)
      - Região (Unidade)
    - Botão para exportar em CSV

## Serviços:

- Botão "+ Criar serviço"
- Cards com os serviços criados:
  - Ícone
  - Nome
  - Descrição
  - Valor ("A partir de R$")
  - Botões: Editar e Excluir
  - Excluir exibe popup de confirmação: "Sim, quero excluir" ou "Manter o serviço"

- Criação de serviço (página completa):
  - Botão "← Voltar"
  - Definir ícone
  - Nome
  - Descrição
  - Valor
  - Opções de pagamento (toggles):
    - Avulso
    - Pacote
    - Recorrência:
      - Semanal
      - Quinzenal
      - Mensal
  - Botão "Salvar"
  - Estado de sucesso: toast "Serviço criado com sucesso!"

- Edição de serviço (drawer lateral):
  - Alterar ícone
  - Nome
  - Descrição
  - Valor
  - Opções de pagamento (toggles):
    - Avulso
    - Pacote
    - Recorrência:
      - Semanal
      - Quinzenal
      - Mensal
  - Botão "Salvar alterações"

- Pacotes do serviço:
  - Cada serviço pode ter múltiplos pacotes (ex: "Pacote 10 horas", "Pacote 20 horas")
  - Botão "+ Criar pacote"
  - Listagem de pacotes do serviço:
    - Nome
    - Descrição
    - Total de horas
    - Preço
    - Status (Ativo/Inativo)
    - Ações: Editar, Desativar, Reativar
  - Criação/Edição de pacote:
    - Nome
    - Descrição (opcional)
    - Total de horas (opcional)
    - Preço
    - Serviço (dropdown — apenas serviços ativos)
    - Botão "Salvar"

## Usuários:

- Botão "+ Criar usuário"
- Admin consegue visualizar os usuários Admin cadastrados no sistema
- Filtros:
  - Todos
  - Ativos
  - Campo de busca (Nome do usuário)
- Tabela de usuários:
  - Nome
  - Role
  - E-mail
  - Status
  - Cadastro
  - Ações:
    - Visualizar detalhes
    - Excluir (exibe popup de confirmação: "Sim, quero excluir" ou "Manter o usuário")

- Criar novo usuário (modal/popup):
  - Nome
  - Email
  - Senha
  - Role (dropdown):
    - Admin master
    - Admin básico
  - Status Ativo/Inativo (dropdown)
  - Botão "Salvar alterações"
  - Estado de sucesso: toast "Usuário criado com sucesso!"
  - **Nota:** _Apenas admin master consegue criar outro admin master, por padrão a criação será com admin básico (regra de segurança)_
  - **Nota 2:** _Usuários cadastrados como admin básico não conseguem criar usuários com role Admin master, campo desabilitado por padrão na UI_
