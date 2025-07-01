# Backend Setup - MongoDB + Firebase Auth

## Environment Variables

Add the following to your `.env` file:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/trip_packer

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=tripwise-7d40a
FIREBASE_PRIVATE_KEY_ID=a8ca1d7dd0f44635af675e8398c5baf58169a381
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDq1ilkzkpxD/nn\nXsMFh7ax1+2ZwKNuGzwOrAWwnz7bNZIezZYO2+vyBKlHBj+opKRgHywhVkXd8C8t\nk5yFOFIdxTtQDyZtN//UjI9y50Ek3sTj9nF4x2F+ve1BS/WsYdE8YuvFMkBrP8E8\naaHNAXQTq26NbAwhV8ujRkeNxL+s9UVkHVlEK3U6TFAoxXDVTPTJjEJPxtXx0DQW\nC1xl9Dpf+J2tSC0OdsJFBQ1JSX8/xJJQmbarcOdJ5B+YvUwla1ChNSbNHnFzmanU\nNbqD4JCaRLtRtWVQClxwJA+wTg7apnEb+v0eTZeCnJUcnRfacDWwFWVfYpwf6d1/\nyy1hFS5HAgMBAAECggEAVLtSMy+lt3bCviM4bcHifvfAoLXbogpMmKSj5u8GcHS7\nVMbsCk96qhfZdimAhZpmPtJwi1TEH8ieVS0KEB1ar6gu9vuIa2cFtUzEI3riS+nf\nE7ujhKc3+9GOjf1Y1spygv3UQRIZITlfQSuB+GS6W7CC0p82Hz+815wvjCz91er2\nlM9Pcl2552fbAhdKiUJOcHJLnE8Ar/ngDrZtSU0UwWWaAwrF234LMHOkovRA8UlC\ncu2XLmwGznuzKFRLZBds2VGOiYFzVFEc53S5yAu/iWZi2pg5bUk7as35KJoDh+r2\nICxk6e84NP0UUXZoj582Zhunrbu0HEOKIrOptfRtuQKBgQD6e7UGd5auGM6/BgiA\nc3vXvs4vTba7dT2MwoEPi8AmrfJA7HIbKt+LZuqZ3Sy61ikAPMFWxXVpIWdBA7ne\nc8RC67SPyi5mDLKJz+NLJQwrUxwhnNTr5Ff8S6R87BbhPSngq3dU0HEzr9MauFZi\nf96Qlwy9TTqgJq6Foo3+cTjsqQKBgQDwAjwCYty27DT3xfth+YUH25/oGPsHy6gz\n4YfMpDhq58+DQp9E5Lkb5PPhwBS8QS5F3W7DudeO9GzDmmI4PFvfRem8G0T/un9V\nJTXbXnHs+fgaHvCHenIWezCR7pp2kVm/NlsqsiRRM0AIHFQneiEpRqIELkoF92fu\nhJouQ7OpbwKBgQCrgVKEuBNi5zeAUhg2I1xzb4DroLFyjybynycRRuXtVgLec0b5\n1RQ09eXCLk93KjXupKrYx+DJeAaj3HJCn0+NZqg+H/g/BYillcMSa652Z7SGS0T6\ns2GPLRfWNSzBUki/PYg6eXJZKpVH4Vm8ncL9i388iomOqI2skI3a3xlT6QKBgH/I\n4MRweI0X9BebnH0MiaymXVwIuNbssrB0uoXVRYh9xXlgZkYa9QeJ/eNLDn8wwP9H\npyqkbsVZE/OM5hCE6nFU2t5hMnpphFQEDMmwXj3K1TKrGGs5YTbg/fokrK7GMp9g\nxGdWE4n8HHJ1CsU9/Bvq1GYfcx/8GqTeiuxo9WYXAoGBAL4qc8Q7NUg6/ruH4aip\nCawEg02g9gm5hXa7iB2iznf+HEf/g5hoLo6ByyuxxJfxxsqE6IqmRcQblUn/o1X3\nXkf0jpv7L0MqZjWoF62+D8O7m7Gs3A4RryDBDJwLXaacBm9RJJety7oDAOEKyfEb\ndjO82I07qt/Jb1ir1I5j+nwE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tripwise-7d40a.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=103813215879376694286
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tripwise-7d40a.iam.gserviceaccount.com

# Server Configuration
PORT=5000
NODE_ENV=development
```

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