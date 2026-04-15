# msw-backend-poc

Backend minimalista para testar comportamento de CORS + Private Network Access (PNA).

## Rodar

```bash
npm install
npm start
```

Servidor em `http://localhost:3000`.

## Configuracoes (env vars)

- `PORT` (default: `3000`)
- `CORS_ALLOWED_ORIGINS` (default: `*`) - lista separada por virgula
- `ALLOWED_ORIGIN` (compatibilidade legado, opcional)
- `ALLOW_CREDENTIALS` (default: `false`)
- `ENABLE_PNA` (default: `true`)

Exemplo:

```bash
CORS_ALLOWED_ORIGINS="http://localhost:5173,https://preview.exemplo.com,https://homolog.exemplo.com" ALLOW_CREDENTIALS=true ENABLE_PNA=true npm start
```

## Rotas

- `GET /health`
- `POST /echo`
- `OPTIONS *` (preflight)

## Teste de preflight com PNA

```bash
curl -i -X OPTIONS "http://localhost:3000/echo" \
  -H "Origin: https://frontend.local" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -H "Access-Control-Request-Private-Network: true"
```

Se `ENABLE_PNA=true`, a resposta inclui:

`Access-Control-Allow-Private-Network: true`
