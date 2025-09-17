# Backend - Sistema_Nss_Senhora (Express + MongoDB + Cloudinary)

## Setup rápido

1. Copie `.env.example` para `.env` e preencha as variáveis:
   - `MONGODB_URI` (URI do MongoDB Atlas ou local)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `PORT` (opcional)

2. Instale dependências:
   ```bash
   npm install
   ```

3. Rodar em dev:
   ```bash
   npm run dev
   ```

## Endpoints principais
- `GET /api/items` - lista todos
- `GET /api/items/:id` - busca por id
- `POST /api/items` - cria (form-data: campo `imagem` para enviar arquivo)
- `PUT /api/items/:id` - atualiza (pode enviar imagem também)
- `DELETE /api/items/:id` - deleta

## Observações
- Uploads de imagem vão para o Cloudinary; o campo salvo no banco é `imagemUrl`.
- No frontend, envie a imagem como `form-data` com chave `imagem`.
- Se preferir usar outro banco (Postgres/Supabase), posso adaptar.