# Dummy Backend (Node.js)

This is a simple Node.js Express backend with **15 example APIs** and Swagger UI.  
It uses an in-memory JSON file (data/data.json) — **no database required**.

## Quick start
1. Extract the zip.
2. Run:
   ```bash
   npm install
   npm start
   ```
3. Server runs on http://localhost:3000  
   Swagger docs: http://localhost:3000/api-docs

## Endpoints (examples)
- GET /api/v1/users
- GET /api/v1/users/:id
- POST /api/v1/users
- PUT /api/v1/users/:id
- DELETE /api/v1/users/:id
- GET /api/v1/products
- GET /api/v1/products/:id
- POST /api/v1/products
- PUT /api/v1/products/:id
- DELETE /api/v1/products/:id
- POST /api/v1/auth/login
- GET /api/v1/orders
- POST /api/v1/orders
- GET /api/v1/stats
- POST /api/v1/wishlist/:productId/toggle

Data is persisted to `data/data.json` when modifications are made.
"# Dummy-backend" 
