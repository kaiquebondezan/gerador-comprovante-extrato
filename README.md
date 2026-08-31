# Comprovante API (simulador)

API simples, sem autenticação, que gera comprovantes de transferência **fictícios** em PDF e/ou PNG — pensada para simular o bot de um banco em ambiente de teste/demonstração.

> ⚠️ PS: Readme gerado por IA

## Como rodar

```bash
npm install
npm start
```

O servidor sobe em `http://localhost:3000` (ou na porta definida em `PORT`).

`npm start` já verifica se o Chromium do Playwright está instalado e, se não estiver (primeira vez rodando numa máquina nova), baixa sozinho antes de subir o servidor — não precisa mais rodar `npx playwright install chromium` na mão.

Para desenvolvimento, `npm run dev` faz a mesma coisa mas reinicia o servidor automaticamente sempre que um arquivo é salvo (usa [nodemon](https://www.npmjs.com/package/nodemon)).

Se preferir apontar para um Chromium específico (por exemplo, um já instalado em outro caminho do sistema), defina a variável de ambiente `CHROMIUM_PATH` com o caminho do executável antes de rodar `npm start`.

## Endpoint

### `POST /comprovante`

Query params:
- `format` — `pdf` (padrão), `png`, `both` (retorna JSON com os dois em base64) ou `url` (gera o arquivo, guarda temporariamente e retorna `{ "url": "..." }` com o link para baixá-lo).
- `tipo` — só usado com `format=url`: `png` (padrão) ou `pdf`. Define qual dos dois formatos é gerado e disponibilizado no link.

Body (JSON):

```json
{
  "logo_base64": null,
  "titulo": "Pix enviado",
  "valor": 80.00,
  "protocolo": "202608261234567",
  "recebedor": {
    "nome": "Loja Exemplo LTDA",
    "cpf_cnpj": "23010551000131",
    "instituicao": "Banco Exemplo S.A."
  },
  "pagador": {
    "nome": "FULANO DE TAL",
    "cpf_cnpj": "12345678909",
    "instituicao": "ColmeIA Bank"
  }
}
```

Campos:
- `logo_base64` (opcional): PNG do símbolo em base64 (com ou sem o prefixo `data:image/png;base64,`). Se omitido, usa `public/default-logo.png`.
- `titulo` (opcional): título da transação (ex.: "Pix enviado", "Transferência enviada"). Padrão: "Transferência enviada".
- `valor` (obrigatório): número, formatado automaticamente como R$.
- `protocolo` (opcional): texto livre, exibido em "Sobre a transação". Se omitido, a API gera um número aleatório de 15 dígitos.
- `recebedor` / `pagador`: objetos com `nome` (obrigatório), `cpf_cnpj` (mascarado automaticamente, igual ao padrão de bancos reais) e `instituicao`.

Se `valor`, `recebedor.nome` ou `pagador.nome` não forem enviados (ou `valor` não for um número), a API responde `400` com um JSON `{ "error": ..., "details": [...] }` listando o que falta, em vez de gerar um comprovante com campos em branco.

Campos preenchidos automaticamente pela API (não são mais entrada do request — se enviados no body, são ignorados):
- `banco_nome` / `brand_color`: sempre "ColmeIA Bank" / `#4d4d4d`.
- `data_pagamento` e `horario`: data/hora do momento em que a requisição é recebida, sempre no fuso `America/Sao_Paulo` (independente do fuso do servidor onde a API estiver rodando).
- `id_transacao`: gerado aleatoriamente a cada request, no mesmo formato do exemplo original (`E` + 8 dígitos + data + hora em UTC + 11 caracteres alfanuméricos) — apenas para fins de teste, não corresponde a uma transação real.

### Exemplos

PDF:
```bash
curl -X POST "http://localhost:3000/comprovante?format=pdf" \
  -H "Content-Type: application/json" \
  -d @exemplo.json -o comprovante.pdf
```

PNG:
```bash
curl -X POST "http://localhost:3000/comprovante?format=png" \
  -H "Content-Type: application/json" \
  -d @exemplo.json -o comprovante.png
```

Os dois de uma vez (JSON com base64):
```bash
curl -X POST "http://localhost:3000/comprovante?format=both" \
  -H "Content-Type: application/json" \
  -d @exemplo.json
```

Link para o arquivo (em vez do binário/base64 direto):
```bash
curl -X POST "http://localhost:3000/comprovante?format=url&tipo=png" \
  -H "Content-Type: application/json" \
  -d @exemplo.json
```
Resposta: `{ "url": "http://localhost:3000/arquivos/<id>.png" }`. Basta abrir/baixar essa URL (ela também aceita ser carregada direto numa `<img>` ou usada como link de download).

> ⚠️ O link de `format=url` só funciona enquanto a instância estiver **acordada**: o arquivo fica salvo numa pasta local sem persistência (`generated/`), então some a cada sono, reinício ou novo deploy. Não é uma opção para guardar comprovantes por muito tempo — só para servir o resultado logo após ser gerado, dentro da mesma sessão de uso.

## Trocar o símbolo

Troque o arquivo `public/default-logo.png` pelo seu PNG (fica sempre como logo padrão), ou envie `logo_base64` em cada request para usar um símbolo diferente por chamada.

### `GET /extrato`

Gera o extrato fictício de uma das 4 contas cadastradas em `data/extratos.json`, filtrado por período.

Query params:
- `contaId` (obrigatório): `1`, `2`, `3` ou `4`. Se não existir, responde `404`.
- `inicio` / `fim` (opcionais): datas no formato `AAAA-MM-DD`, inclusivas. Se omitidas, o extrato cobre toda a história disponível da conta (da movimentação mais antiga à mais recente).
- `format` — `pdf` (padrão), `png`, `both` ou `url`, igual ao `/comprovante`.
- `tipo` — só usado com `format=url`: `png` (padrão) ou `pdf`.

```bash
curl "http://localhost:3000/extrato?contaId=4&inicio=2026-08-01&fim=2026-08-31&format=pdf" -o extrato.pdf
```

Link para o arquivo:
```bash
curl "http://localhost:3000/extrato?contaId=4&format=url&tipo=png"
```
Resposta: `{ "url": "http://localhost:3000/arquivos/<id>.png" }` — mesmo aviso de disponibilidade do `/comprovante`: só existe enquanto a instância estiver acordada.

O comprovante calcula automaticamente, a partir das movimentações do período: total de entradas, total de saídas e o saldo do período (entradas − saídas). O "saldo atual" exibido é o valor de `saldo` cadastrado na conta — um retrato do momento, não recalculado por período.

Se `inicio`/`fim` estiverem num formato inválido, `inicio` for depois de `fim`, ou não houver movimentações no intervalo pedido, a API responde de forma previsível (`400` nos dois primeiros casos, um extrato vazio com totais zerados no terceiro).

Para adicionar/editar contas fictícias, edite `data/extratos.json` diretamente — cada chave é o `contaId`.

## Estrutura

- `server.js` — bootstrap: monta o Express, registra as rotas e cuida do encerramento gracioso (Ctrl+C / SIGTERM fecham o Chromium antes de sair).
- `config.js` — constantes e variáveis de ambiente (porta, nome/cor do banco, caminhos de arquivo, `CHROMIUM_PATH`).
- `lib/format.js` — formatação (moeda, data/hora em `America/Sao_Paulo`, máscara de CPF/CNPJ).
- `lib/ids.js` — geração do ID de transação e do protocolo fictícios.
- `lib/statement.js` — filtro de movimentações por período e cálculo de totais do extrato.
- `lib/render.js` — monta o HTML do comprovante e do extrato a partir dos templates + dados.
- `lib/browser.js` — gerencia a instância do Chromium headless (Playwright) e a geração de PDF/PNG.
- `lib/storage.js` — salva os arquivos gerados com `format=url` em `generated/` (pasta sem persistência, apagada a cada sono/reinício/redeploy) e monta a URL pública de download.
- `routes/comprovante.js` — rota `POST /comprovante`, com a validação de entrada.
- `routes/extrato.js` — rota `GET /extrato`, com a validação de conta/período.
- `routes/health.js` — rota `GET /health`.
- `scripts/ensure-chromium.js` / `scripts/start.js` — usados por `npm start`/`npm run dev` para garantir o Chromium instalado antes de subir o servidor.
- `templates/receipt.html` — template HTML/CSS do comprovante.
- `templates/statement.html` — template HTML/CSS do extrato.
- `data/extratos.json` — dados fictícios das 4 contas (saldo, titular e movimentações).
- `public/default-logo.png` — símbolo padrão (placeholder genérico).
- `generated/` — criada automaticamente em tempo de execução para guardar os arquivos de `format=url`. Não é versionada (está no `.gitignore`/`.dockerignore`) e não tem persistência entre deploys/reinícios.
