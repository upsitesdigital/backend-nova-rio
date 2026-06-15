# API Vindi — Documentação de Referência

> Material repassado pelo suporte Vindi.

## Configuração da API

- **Dicas para utilizar a Vindi (vídeo):** https://www.youtube.com/watch?v=spy2_SWgMGs&t=1s
- **Introdução à arquitetura da API Vindi:** https://atendimento.vindi.com.br/a/203020644
- **Swagger API Vindi Sandbox:** https://vindi.github.io/api-docs/dist/?url=https://sandbox-app.vindi.com.br/api/v1/docs#/customers

## Autenticação

> ⚠️ **Atenção:** As APIs de Recorrência da Vindi passaram a exigir o padrão **RFC 2617** de autenticação.

- **Padrão de autenticação Vindi:** https://atendimento.vindi.com.br/hc/pt-br/articles/29176832455963-APIs-de-Vindi-Recorr%C3%AAncia-passar%C3%A3o-a-exigir-o-padr%C3%A3o-RFC2617-de-autentica%C3%A7%C3%A3o

## Retornos e Entidades

- **Códigos de retorno HTTP da API de Recorrência:** https://atendimento.vindi.com.br/a/203063084-Quais-s%C3%A3o-os-c%C3%B3digos-de-retorno-HTTP-da-API
- **Cartões para teste (Trial e Sandbox):** https://atendimento.vindi.com.br/a/208756888-Modo-Trial-e-Sandbox-quais-n%C3%BAmeros-de-cart%C3%B5es-posso-usar-para-teste
- **Entidades básicas da plataforma de recorrência:** https://atendimento.vindi.com.br/hc/pt-br/articles/203051744-Entidades-b%C3%A1sicas-da-plataforma-de-recorr%C3%AAncia
- **Índice da base de conhecimento Vindi Recorrência:** https://atendimento.vindi.com.br/hc/pt-br/articles/10768089165083-%C3%8Dndice-da-Base-de-conhecimento-Vindi-Recorr%C3%AAncia

## ⚠️ Observação Importante — Sandbox vs. Produção

Os ambientes de produção e sandbox **não são espelhos** um do outro; portanto, as configurações realizadas em sandbox **não** serão automaticamente refletidas em produção. Será necessário configurar novamente no ambiente de produção itens como:

- Novos produtos (que terão IDs diferentes);
- Planos (com IDs distintos);
- Chaves API (que devem ser geradas especificamente para comunicação com o ambiente de produção).

## Configuração de Webhooks

Passo a passo para configurar o webhook na plataforma:

- **O que são e como funcionam os Webhooks:** https://atendimento.vindi.com.br/hc/pt-br/articles/203305800-O-que-s%C3%A3o-e-como-funcionam-os-Webhooks
- **HTTPS e versões suportadas do TLS:** https://atendimento.vindi.com.br/hc/pt-br/articles/214623777-HTTPS-e-vers%C3%B5es-suportadas-do-TLS
- **Endereços IP que a Vindi utiliza para enviar webhooks:** https://atendimento.vindi.com.br/hc/pt-br/articles/214920737-Quais-endere%C3%A7os-IP-a-Vindi-utiliza-para-enviar-webhooks

> 💡 Para garantir redundância, a empresa pode configurar **duas URLs** de Webhooks para receber os dados. Se uma das URLs ficar indisponível, a outra continuará ativa como alternativa.
