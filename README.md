# Express Authentication API

A beginner-friendly Node.js and Express API for account registration, email OTP verification, login, JWT access/refresh tokens, and password resets. MongoDB stores user accounts, and Gmail SMTP is used to send OTP emails.

## Features

- Register an account and send an email verification OTP.
- Verify an account and request a replacement verification OTP.
- Log in with an email address and password.
- Issue a short-lived access token and a refresh token. The refresh token is also set in an HTTP-only cookie.
- Request a password-reset OTP and use it to set a new password.
- Allow cross-origin requests from any origin through global CORS middleware.

## Technologies and libraries

| Library | Purpose |
| --- | --- |
| [Express](https://expressjs.com/) | HTTP server, middleware, and API routes |
| [Mongoose](https://mongoosejs.com/) | MongoDB connection and user model |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | Password hashing and verification |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | Signing and verifying access and refresh JWTs |
| [Nodemailer](https://nodemailer.com/) | Sending OTP emails through Gmail |
| [cors](https://www.npmjs.com/package/cors) | Cross-origin resource sharing (CORS) middleware |
| [cookie-parser](https://www.npmjs.com/package/cookie-parser) | Reading the refresh-token cookie |
| [dotenv](https://www.npmjs.com/package/dotenv) | Loading local settings from `.env` |
| [Nodemon](https://nodemon.io/) | Restarting the server automatically during development |
| Node.js `crypto` module | Generating OTP values; this is built into Node.js |

## Requirements

- Node.js 20 or newer and npm.
- A MongoDB server running locally, or a MongoDB Atlas connection string.
- A Gmail account and an [app password](https://support.google.com/accounts/answer/185833) if you want the API to deliver OTP emails. A normal Gmail account password is not supported.

## Run locally

1. **Get the project.** Clone the repository and open a terminal in its root folder (the folder containing `package.json`).

   ```sh
   git clone https://github.com/faizan1699/express-js-server.git
   cd express-js-server
   ```

2. **Install dependencies.**

   ```sh
   npm install
   ```

3. **Create your local environment file.** Copy `.env.example` to `.env`. In PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

   Edit `.env` and replace the example values. Generate separate random JWT secrets with:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   Run the command twice and use the first result for `JWT_ACCESS_SECRET` and the second for `JWT_REFRESH_SECRET`.

4. **Start MongoDB.** Start your local MongoDB service, or set `MONGO_URI` to your Atlas connection string. For local MongoDB, the example URI uses the database name `express_auth`.

5. **Start the API.**

   ```sh
   npm run dev
   ```

   For a normal start without automatic restarts, run `npm start`. The default address is `http://localhost:3000`; set `PORT` to use another port. A `GET /` request returns `Hello, World!`.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | HTTP port. Defaults to `3000`. |
| `NODE_ENV` | No | Set to `production` in production; this makes the refresh cookie secure-only. |
| `MONGO_URI` | Yes | MongoDB connection string, such as `mongodb://127.0.0.1:27017/express_auth`. |
| `JWT_ACCESS_SECRET` | Yes (recommended) | Secret used to sign access tokens. If omitted, the app falls back to `JWT_SECRET`. |
| `JWT_REFRESH_SECRET` | Yes | Separate secret used to sign refresh tokens. |
| `JWT_SECRET` | No | Legacy/fallback access-token secret; prefer `JWT_ACCESS_SECRET`. |
| `GMAIL_USER` | For OTP email | Gmail address used to authenticate with Gmail SMTP. |
| `GMAIL_PASS` | For OTP email | Gmail app password used by Nodemailer. |
| `SMTP_USER` | For OTP email | Sender address placed in the email's `From` field; normally the same Gmail address as `GMAIL_USER`. |

Keep `.env` private and never commit real credentials. The repository ignores `.env` files; `.env.example` contains placeholders only.

## API endpoints

All authentication routes are prefixed with `/api`. Send and receive JSON (`Content-Type: application/json`).

| Method | Path | Required JSON fields | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/signup` | `name`, `email`, `password` | Create an account and send its verification OTP |
| `POST` | `/api/verify-otp` | `email`, `otp` | Verify the account |
| `POST` | `/api/resend-otp` | `email` | Send a replacement verification OTP |
| `POST` | `/api/login` | `email`, `password` | Log in and receive access and refresh tokens |
| `POST` | `/api/refresh-token` | None (uses the refresh-token cookie) | Return a new access token |
| `POST` | `/api/forgot-password` | `email` | Send a password-reset OTP |
| `POST` | `/api/update-password` | `email`, `otp`, `password`, `confirmPassword` | Verify the reset OTP and set a new password |

Example signup request:

```json
{
  "name": "Alex Example",
  "email": "alex@example.com",
  "password": "choose-a-password"
}
```

Example login request:

```json
{
  "email": "alex@example.com",
  "password": "choose-a-password"
}
```

The login response contains the access token and user details. The refresh token is returned in the response and set as an HTTP-only cookie. Access tokens are valid for 1000 minutes; refresh tokens are valid for 7 days.

## CORS

CORS middleware is enabled globally with any origin allowed. This lets browser applications hosted on different origins make requests to the API; it does **not** authenticate users or replace API security. Cross-origin credentials are not enabled. In particular, browsers will not send the refresh-token cookie cross-origin under this configuration. Do not treat the open CORS policy as suitable access control for a production API.

## Project layout

```text
config/db/db.js                   Connects to MongoDB
controllers/authController.js    Registration, verification, login, and reset logic
hooks/hook.js                     OTP generation and shared field validation
hooks/nodeMailer.js               OTP email delivery
middleware/validateRequestFields.js
                                  Required-field validation middleware
models/users/users-modal.js       MongoDB user schema
routes/index.js                   Authentication route definitions
index.js                           Express app setup and server entry point
```

## Notes

- The OTP email says codes expire after 10 minutes, but the current API does not enforce an OTP expiration time in the database. Do not rely on that message as a security guarantee.
- There is no automated test script configured in this repository yet.
