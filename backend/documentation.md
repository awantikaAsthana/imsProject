API Documentation (OpenAPI)
---------------------------
This repository includes an OpenAPI (Swagger) specification for the backend at `openapi.yaml`.

Files
-----
- `openapi.yaml` — OpenAPI 3.0 spec describing the available endpoints and schemas.

View the spec with Swagger UI or ReDoc
-----------------------------------
Option A — ReDoc (quick, single-command):

```bash
# Install once (requires Node/npm):
npm install -g redoc-cli

# Serve the spec locally:
redoc-cli serve openapi.yaml
```

Option B — Official Swagger UI (Docker):

```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/spec/openapi.yaml -v %cd%:/spec swaggerapi/swagger-ui
# Then open http://localhost:8080
```

Quick examples
--------------
1) Login (get token)

```bash
curl -X POST http://localhost:5000/auth/login \
	-H "Content-Type: application/json" \
	-d '{"username":"admin","password":"secret"}'
```

2) List products

```bash
curl http://localhost:5000/products
```

3) Create product (example)

```bash
curl -X POST http://localhost:5000/products \
	-H "Content-Type: application/json" \
	-d '{"name":"Widget","sku":"W-001","price":9.99,"quantity":100}'
```

Notes
-----
- The OpenAPI spec is intentionally general: inspect the `routes/` implementations for exact request/response fields and validation rules.
- If you want a fully detailed spec generated from code, consider integrating `flask-smorest`, `flask-restx`, or `apispec` into the application and exposing `/openapi.json` dynamically.

Next steps I can take for you
----------------------------
- Generate a `README.md` with quickstart and example requests.
- Add `flask-smorest` integration and auto-generate `openapi.json` from code.
- Convert `openapi.yaml` into a hosted Swagger UI route inside the Flask app.

