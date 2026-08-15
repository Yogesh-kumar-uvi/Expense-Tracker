# Expense Tracker

A full-stack expense tracking application with user authentication, transaction management, budgets, goals, bills, notifications, and more.

## Features

- User registration, login, JWT authentication
- Income and expense transactions
- Category management
- Budgets with spending tracking
- Financial goals
- Recurring bills
- Dashboard overview
- Email notifications (welcome, password reset)
- File uploads via Cloudinary
- RESTful API with Express & MongoDB
- React frontend (assumed)

## Project Structure

- `Backend/` – Node.js/Express server
- `Frontend/` – React client (if applicable)

## Setup

1. Clone the repository
2. Install backend dependencies: `cd Backend && npm install`
3. Create a `.env` file in `Backend/` based on the example below
4. Install frontend dependencies (if applicable): `cd Frontend && npm install`
5. Run the backend: `npm run dev` (or `node server.js`)
6. Run the frontend: `npm start`

## Environment Variables

Create a `.env` file in the `Backend/` directory:

```
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense_tracker?retryWrites=true&w=majority
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
JWT_COOKIE_EXPIRE=7d
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<your_smtp_user>
SMTP_PASS=<your_smtp_key>
EMAIL_FROM=Expense Tracker <your_email@domain.com>
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_cloudinary_key>
CLOUDINARY_API_SECRET=<your_cloudinary_secret>
```

## License
MIT