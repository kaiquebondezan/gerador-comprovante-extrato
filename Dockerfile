# Imagem oficial do Playwright: já vem com Chromium + todas as dependências de
# sistema (fontes, libnss3, etc.) instaladas, então não precisa do passo
# "npx playwright install" na hora do deploy.
FROM mcr.microsoft.com/playwright:v1.62.1-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

# A plataforma de deploy define a porta real via a variável PORT;
# 3000 aqui é só o valor padrão para rodar localmente com `docker run`.
EXPOSE 3000

CMD ["npm", "start"]
