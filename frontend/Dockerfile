FROM node:20-bookworm-slim
WORKDIR /app

COPY package.json ./

RUN npm install --no-audit --no-fund

COPY . .

ENV VITE_API_BASE=http://localhost:3000
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]