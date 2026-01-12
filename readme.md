
# Sales application

## Install dependancies and run 
Compatible with node 20+
```
mv .env.example .env
npm install
npm run dev
```
yarn/pnpm will also work.

# Project structure
* /index.ts - server start
* /api - API implementation
* /services - All Mock services
* /config - runtime config

## Usage/Examples
#### Create order

```sh
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "userId: 6641abf1-5c34-485e-884f-8099aef08de4" \
  -d '{
  "items": [
    {
      "productId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "quantity": 2
    },
    {
      "productId": "9b3f8e7a-4d2c-4a1e-9f5b-8c6d3e2a1b0c",
      "quantity": 1
    },
    {
      "productId": "2e9f6a8b-7c5d-4e3f-a1b2-9d8c7b6a5e4f",
      "quantity": 5
    }
  ]
}'
```
```
{"orderId":"c266a915-45cd-4027-9d0b-e4a4f27f6d4f","status":"PENDING_SHIPMENT"}
```

#### Get order (Make sure to carry the orderId from previous API)

```sh
curl  http://localhost:3000/api/orders/c266a915-45cd-4027-9d0b-e4a4f27f6d4f \
  -H "Content-Type: application/json" \
  -H "userId: 6641abf1-5c34-485e-884f-8099aef08de4"
```

#### Update order shipping status

```sh
curl -X PATCH http://localhost:3000/api/orders/c266a915-45cd-4027-9d0b-e4a4f27f6d4f \
  -H "Content-Type: application/json" \
  -d '{
  "status": "SHIPPED"
}'
```