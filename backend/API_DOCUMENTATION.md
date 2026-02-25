
# API Documentation

## Auth APIs

### Register
POST /auth/register

Body:
{
  "email": "user@mail.com",
  "password": "123456",
  "name": "User"
}

---

### Login
POST /auth/login

Returns JWT tokens

---

## Product APIs

GET /product -> Get all products
POST /product -> Create product

---

## Stock APIs

GET /stock -> View stock

---

## Supply APIs

POST /supply -> Add supply

---

## Dispatch APIs

POST /dispatch -> Dispatch product

---

## Report APIs

GET /report -> View reports
