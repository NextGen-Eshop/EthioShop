# EthioShop Backend

Express and MongoDB API for EthioShop.

## Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file from the example:

```bash
cp .env.example .env
```

3. Fill in the required values in `.env`:

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`

## Run

Development:

```bash
npm run dev
```

Production-style local run:

```bash
npm start
```

Default local base URL:

```text
http://localhost:5000
```

## API Routes

### Health

- `GET /`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `GET /api/auth/users` admin only
- `POST /api/auth/users` admin only
- `DELETE /api/auth/users/:id` admin only

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users/register`
- `POST /api/users/login`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:id`
- `DELETE /api/cart/:id`

### Orders

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`

## Notes

- Protected auth routes require `Authorization: Bearer <token>`.
- Cart item update and delete operations require a user identifier in the query or request body.
- Product creation requires `name`, `category`, `description`, `price`, `stock`, and `imageUrl`.
- `GET /api/products` supports `search`, `category`, `minPrice`, `maxPrice`, `isSuperDeal`, and `sort` query params.
- Product sort values supported by `GET /api/products` are `price_asc`, `price_desc`, `newest`, `oldest`, `name_asc`, and `name_desc`.
- Order creation requires `userId` or `user`, `items`, `totalPrice`, and `shippingAddress`.

## Current Backend Helpers

- `src/middleware/errorMiddleware.js` handles 404s and JSON error responses.
- `src/middleware/roleMiddleware.js` provides reusable role guards.
- `src/validations/app.js` contains shared validation helpers.
