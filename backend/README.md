# Backend Setup - MongoDB + Firebase Auth

## Environment Variables


## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password  
- `POST /api/auth/firebase` - Authenticate with Firebase token
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/auth/test` - Test route to verify connections

### Usage Examples

#### Local Authentication
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

#### Firebase Authentication
```bash
# Authenticate with Firebase token
curl -X POST http://localhost:5000/api/auth/firebase \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

## Running the Server

```bash
npm start
```

The server will start on port 5000 and connect to MongoDB. 
