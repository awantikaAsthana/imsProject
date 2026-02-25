
# Inventory Backend API

## Overview
This backend provides APIs for:

- Authentication
- Product Management
- Stock Tracking
- Supply Management
- Dispatch Handling
- Reports

## Tech Stack
- Flask
- SQLite
- JWT Authentication

## Running the Project

1. Install dependencies
```
pip install -r requirements.txt
```

2. Run the server
```
python app.py
```

Server runs at:
```
http://localhost:5000
```

## Authentication

Login returns:

- Access Token
- Refresh Token

Use access token in headers:

```
Authorization: Bearer <token>
```

## Main Modules

| Module | Purpose |
|--------|--------|
| Auth | User login & registration |
| Product | Manage products |
| Stock | Track inventory |
| Supply | Incoming stock |
| Dispatch | Outgoing stock |
| Report | Analytics |
