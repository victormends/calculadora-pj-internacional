# Calculadora PJ Internacional

[![CI](https://github.com/victormends/calculadora-pj-internacional/actions/workflows/ci.yml/badge.svg)](https://github.com/victormends/calculadora-pj-internacional/actions/workflows/ci.yml)
[![Deploy](https://github.com/victormends/calculadora-pj-internacional/actions/workflows/deploy.yml/badge.svg)](https://github.com/victormends/calculadora-pj-internacional/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Uma calculadora simples e direta para desenvolvedores brasileiros que trabalham como Pessoa Jurídica (PJ) para o exterior. Calcula impostos (DAS, IRRF, INSS) e taxas (remessa, contabilidade) a partir de um salário em dólar (USD).

🌐 **[Acessar a Calculadora Online](https://victormends.github.io/calculadora-pj-internacional/)**

## Como Funciona

Insira seu salário mensal em Dólar e as taxas (remessa, contabilidade, % DAS) e a calculadora exibirá o salário líquido no Brasil, categorizando a empresa em MEI, ME, EPP ou OUT (Lucro Presumido/Real).

A aplicação:
- Obtém a cotação do Dólar ao vivo via [AwesomeAPI](https://docs.awesomeapi.com.br/api-de-moedas).
- Salva o estado da sua simulação na URL para que você possa compartilhar facilmente (via botão "Copiar Link").
- Permite exportar a simulação para PDF ou CSV.
- Suporta Dark Mode via tailwindcss com base na preferência do sistema ou seleção manual.

## Compartilhamento via URL
A calculadora hidrata automaticamente a partir da query string, aceitando:
- `usd`: Salário em USD (ex: 5000)
- `rate`: Taxa de câmbio (ex: 5.25)
- `fee`: Taxa de remessa em % (ex: 1.2)
- `das`: Alíquota do Simples/DAS em % (ex: 6.0)
- `acc`: Custo mensal da contabilidade (ex: 200)

Exemplo: `?usd=5000&rate=5.50&fee=1&das=6&acc=300`

## Stack
- React + TypeScript
- Vite
- Tailwind CSS
- Vitest + Happy DOM
- jsPDF + jsPDF-AutoTable

## Setup Local

```bash
# Instalar dependências
npm install

# Rodar os testes
npm test

# Executar em modo de desenvolvimento
npm run dev

# Fazer o build de produção
npm run build
```

## Licença

[MIT](LICENSE) © 2026 João Victor Mendes
