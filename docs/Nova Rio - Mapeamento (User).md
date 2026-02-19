## Login:

- Logo Nova Rio
- Campos:
  - E-mail
  - Senha (com toggle de visibilidade)
- Botão "Entrar"
- Link "Esqueceu sua senha?"
- Copyright: "©2025 Nova Rio Pay Per Use"

## Criar Conta (Cadastro):

- Logo Nova Rio
- Campos:
  - Nome
  - E-mail
  - Telefone
  - Senha (com toggle de visibilidade)
  - Confirmar senha (com toggle de visibilidade)
- Botão "Criar conta"
- Link "Já possui uma conta? Entre aqui"

## Agendar Serviço (Fluxo LP — usuário não logado):

- Stepper de progresso: 1. Agendar serviço → 2. Criar conta → 3. Dia e horário → 4. Pagamento
- Etapa 1 — Agendar serviço:
  - Seleção de tipo de serviço (cards):
    - Faxina Regular
    - Faxina Premium
    - Faxina Pós-Obra
    - Cada card exibe: ícone, nome, descrição e valor ("A partir de R$")
  - Configurar Recorrência:
    - Avulso
    - Pacote
      - Ao selecionar Pacote, exibe dropdown com pacotes disponíveis do serviço escolhido (ex: "Pacote 10 horas — R$ 1.200")
    - Recorrência (badge "5% OFF")
      - Ao selecionar Recorrência, exibe dropdown "Selecione o tipo de recorrência" (Mensal, Semanal, Quinzenal)
      - Nota de desconto: "5% de desconto para recorrências mensais e 10% para semanais e quinzenais"
  - Botão "Continuar"
- Etapa 2 - Cadastrar e-mail (para usuários novos):
  - Campos: Nome, E-mail, Telefone, Senha (com toggle de visibilidade)
  - Botão "Cadastrar e-mail"
  - Botão "Voltar"
  - Sucesso: modal "E-mail cadastrado com sucesso!" com botão "Prosseguir para o pagamento"
- Etapa 3 — Dia, horário e local da limpeza:
  - Calendário com navegação mensal (não agenda Sáb, Dom e Feriados)
  - Seletor de horário
  - Local da Limpeza: campo CEP
  - Botões "Voltar" e "Continuar"
- Etapa 4 — Realizar pagamento:
  - Método de pagamento:
    - Cartão de crédito (Visa, Mastercard, Elo)
    - PIX (Pagamento Instantâneo)
    - Cartão de débito (Débito em conta)
  - Dados do Cartão (quando cartão selecionado):
    - Número do cartão
    - Validade
    - CVV
    - Nome no cartão
  - Informações pessoais:
    - Nome/Razão Social
    - CPF/CNPJ
    - Endereço de cobrança
    - Complemento (opcional)
  - Resumo do pedido:
    - Serviço
    - Subtotal
    - Taxa de serviço
    - Total
    - Botão "Pagar R$ [valor]"
    - Nota: "Ao confirmar o pagamento, você concorda com nossos termos de serviço"
  - Banner "Pagamento Seguro — Seus dados são protegidos com criptografia SSL"
- Confirmação:
  - "Agendamento confirmado com sucesso!"
  - Resumo do pedido: Serviço, Dia do serviço, Horário
  - Botão "Acessar minha área"

## Dashboard (Minha Área — usuário logado):

- Sidebar:
  - Botão "+ Agendar serviço"
  - Minha Área
  - Meus serviços
  - Pagamentos
  - Sair
- Saudação: "Olá, [Nome]"
- Banner promocional: "Descontos exclusivos"
- Estado vazio (sem agendamentos):
  - "Você ainda não possui nenhuma limpeza agendada"
  - Botão "+ Agendar serviço"
- Estado com dados:
  - Próximo serviço:
    - Data
    - Nota: "Cancelamento com 1h de antecedência"
  - Agendamentos:
    - Quantidade total
    - Período ("Nos últimos X meses")
  - Histórico de serviços:
    - Filtro "Mais recentes"
    - Lista agrupada por mês com: data, nome do serviço, tipo (Recorrência/Avulso)
    - Ícones de ação: visualizar e editar
  - Cartões cadastrados:
    - Cards salvos com botão "Editar"
  - Pagamentos recentes ("Este mês"):
    - Método de pagamento, serviço, valor e status (Aprovado/Pendente)

## Agendar Serviço (Fluxo usuário logado):

- Mesmo stepper e etapas do fluxo LP, porém dentro do layout do dashboard com sidebar
- Etapa de pagamento exibe cartões já salvos com opção "Remover" e "Adicionar cartão"
- PIX:
  - Modal "Código gerado" com QR Code
  - Instruções passo a passo
  - Código PIX copiável
  - Botão "Copiar código Pix"
- Botão de pagamento: "Finalizar pagamento" (ao invés de "Pagar R$ [valor]", quando selecionado PIX)
- Confirmação: modal "Agendamento confirmado com sucesso!" com botão "Ver meus serviços"

## Meus Serviços:

- Histórico de serviços:
  - Filtro "Filtrar por: Todos"
  - Lista agrupada por mês com: data, nome do serviço
  - Ícones de ação: visualizar e editar
  - Paginação ("Mostrando 10 de 20")
- Próximo serviço:
  - Data
  - Nota: "Cancelamento com 1h de antecedência"
  - Link "Recibo"
  - Botões "Reagendar" e "Cancelar"
- Agendamentos:
  - Quantidade total
  - Período
- Configurar Recorrência:
  - Dropdown de tipo de recorrência
  - Nota de descontos
- Ações sobre serviço:
  - Visualizar (popup):
    - Nome do serviço, link Recibo
    - Data
    - Método de pagamento, valor e status
    - Local (Unidade)
    - Tipo de recorrência (Avulso/Pacote/Recorrência)
    - Pacote vinculado (nome e total de horas, quando aplicável)
  - Editar (drawer lateral):
    - Nome do serviço, link Recibo
    - Data
    - Configurar Recorrência (Avulso, Pacote, Recorrência com 5% OFF)
      - Ao selecionar Pacote, exibe dropdown com pacotes ativos do serviço
    - Método de pagamento, valor e status
    - Local da limpeza expandível: CEP, Endereço, Complemento
    - Botões "Reagendar" e "Cancelar"
    - Nota: "Cancelamento com 1h de antecedência"
    - Botão "Salvar alterações"
    - Reagendar abre popup com calendário e seletor de horário (não agenda Sáb, Dom e Feriados)

## Pagamentos:

- Histórico completo de transações:
  - Filtro (dropdown): Todos, Aprovado, Pendente, Cancelado, Preço
  - Dados da tabela:
    - Data
    - Serviço
    - Método
    - Status (Aprovado, Pendente, Cancelado)
    - Valor
    - Recibo (botão "Baixar" com ícone de download — ativo apenas para status Aprovado)

## Perfil:

- Abas: Perfil e Minha conta
- Aba Perfil:
  - Informações pessoais (modo visualização):
    - Avatar
    - Nome
    - E-mail
    - Telefone
    - Empresa
    - Endereço
    - Botão "Editar"
  - Editar informações (modal):
    - Alterar imagem de perfil
    - Nome
    - Telefone
    - Empresa
    - Endereço
    - Botão "Salvar alterações"
- Aba Minha Conta:
  - Dados do usuário: Nome, e-mail, foto de perfil
  - Ações:
    - Alterar e-mail
      - Abre pop-up perguntando por onde deseja receber um código de verificação (SMS/WhatsApp), para confirmar a mudança de e-mail
    - Alterar senha
      - Abre pop-up perguntando por onde deseja receber um código de verificação (SMS/WhatsApp), para confirmar a mudança de senha
      - Libera a mudança de senha, com 2 campos: Nova Senha e Confirmar senha
    - Deletar conta (vermelho)
      - Exibe um pop-up perguntando se o usuário realmente deseja apagar a conta, para continuar, o usuário deve digitar "Apagar minha conta" para prosseguir com a ação
  - Cartões cadastrados:
    - Lista de cartões salvos com botão "Remover"
    - Botão "+ Adicionar"
