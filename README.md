# 🏠 RentVerseAI

> **AI-Powered No-Broker Rental Platform** built with **React, FastAPI, MongoDB, Gemini AI, Razorpay, Cloudinary & JWT Authentication**.

RentVerseAI is a production-ready rental platform that connects tenants directly with verified property owners without any brokerage. The platform leverages AI-powered property verification, secure owner KYC, intelligent search, real-time messaging, online payments, premium subscriptions, visit scheduling, and a complete admin control panel to ensure a trusted, secure, and seamless rental experience.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

- JWT Authentication
- Secure Login & Signup
- Password Encryption
- Protected Routes
- Role-Based Access Control
- Tenant Dashboard
- Owner Dashboard
- Admin Dashboard

---

# 🏠 Smart Property Management

Property owners can easily publish rental listings by filling only the essential information.

### Required Details

- Property Type
- Property Title
- Property Images
- Complete Address
- Google Maps Location
- Monthly Rent
- Security Deposit
- Available From Date
- Number of Rooms
- Furnishing Status
- Short Description

### Optional Details

Owners can enhance their listing later by adding:

- Amenities
- Internet Availability
- Food Availability
- Nearby Places
- Parking
- Safety Features
- House Rules
- Additional Property Information

Adding optional information improves search visibility, ranking, and tenant trust without making the listing process complicated.

---

# 🤖 AI Property Verification

Powered by **Google Gemini AI**.

Every newly submitted property automatically undergoes AI verification before becoming publicly visible.

AI automatically detects:

- Duplicate Listings
- Fake Properties
- Spam Content
- Suspicious Descriptions
- Invalid Information
- Low Quality Listings
- Potential Fraud Attempts

Every property remains in **Pending** status until:

- AI successfully verifies the listing
- OR
- An administrator manually approves it

This ensures that only authentic and trustworthy properties are published.

---

# ✅ Owner KYC Verification

To improve trust and platform security, every owner must complete KYC verification.

Supported Documents

- Aadhaar Card
- PAN Card
- Government Identity Proof

Admin can:

- Approve KYC
- Reject KYC
- Suspend Verification
- Request Additional Documents

Only verified owners receive the **Verified Owner Badge**, helping tenants identify trusted property owners.

---

# 📅 Visit Booking Calendar

Tenants can schedule property visits directly through the platform.

Features include:

- Select Visit Date
- Select Preferred Time Slot
- Send Visit Request

Owners can:

- Accept Visit
- Reject Visit
- Reschedule Visit

Complete booking history is available for both tenants and owners.

---

# 💬 Real-Time Chat

Secure in-app messaging between tenants and property owners.

Features

- Property-Based Conversations
- Conversation History
- Instant Messaging
- Secure Communication
- Contact Privacy

---

# 💳 Razorpay Secure Contact Unlock

Owner contact details remain completely hidden until payment is completed.

After a successful Razorpay payment, tenants permanently unlock access to:

- Owner Name
- Phone Number
- Email Address

Unlocked contacts remain permanently available inside the tenant dashboard and never require another payment.

---

# 👑 Premium Membership

Premium members receive:

- Unlimited Contact Unlocks
- Automatic Contact Access
- Priority Property Visibility
- Premium Badge
- Better Search Ranking
- Faster Customer Support

During an active Premium subscription, every eligible property's contact information is automatically unlocked without requiring individual payments.

---

# 🔒 Privacy & Contact Protection

Owner contact information is never publicly displayed.

Before payment:

- Phone Number Hidden
- Email Hidden

After successful Razorpay payment:

- Phone Number Visible
- Email Visible

This protects owner privacy while ensuring genuine tenant inquiries.

---

# 🛡 Admin Control Panel

The administrator has complete control over every aspect of the platform.

### Property Management

- Pending Listings
- Approved Listings
- Rejected Listings
- Suspended Listings
- Request Additional Information

### User Management

- View Users
- Suspend Users
- Promote Admin
- Remove Accounts

### Owner KYC

- Pending Verification
- Approved
- Rejected
- Suspended

### Payments

- Razorpay Transactions
- Contact Unlock Purchases
- Premium Membership Purchases

### Analytics

- Total Users
- Total Owners
- Total Properties
- Premium Members
- Revenue
- KYC Statistics
- Property Approval Statistics

---

# 🔍 Smart Property Search

Advanced filtering options include:

- City
- Locality
- Property Type
- Budget
- Furnishing
- Rooms
- Availability
- Verified Owners
- Premium Listings

---

# ☁ Image Management

Property images are securely stored using Cloudinary.

Features

- Multiple Image Upload
- Automatic Optimization
- Fast Delivery
- Secure Storage

---

# 🏗 Tech Stack

## Frontend

- React.js
- Tailwind CSS
- CRACO
- Axios
- React Router

## Backend

- FastAPI
- Python
- JWT Authentication
- Pydantic

## Database

- MongoDB

## AI

- Google Gemini AI

## Cloud Storage

- Cloudinary

## Payments

- Razorpay

## Deployment

- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

# 📂 Project Structure

```text
RentVerseAI
│
├── backend
│   ├── api
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── uploads
│   ├── utils
│   ├── server.py
│   └── requirements.txt
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── services
│   │   └── context
│   └── package.json
│
└── README.md
```

---

# ⚙ Environment Variables

Create a `.env` file inside the **backend** folder.

```env
MONGO_URL=your_mongodb_connection_string
DB_NAME=rentverse_ai

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

CORS_ORIGINS=http://localhost:3000
```

---

# 🚀 Backend Setup

```bash
git clone https://github.com/Chanchal2004/RentVerseAI.git

cd RentVerseAI/backend

python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux / Mac
source .venv/bin/activate

pip install -r requirements.txt

python server.py
```

Backend will run at

```
http://localhost:8000
```

---

# 🚀 Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend will run at

```
http://localhost:3000
```

---

# 🌐 Live Demo

| Service | Link |
|----------|------|
| 🌍 Frontend (Vercel) | https://your-vercel-app.vercel.app |
| ⚡ Backend API (Render) | https://your-render-service.onrender.com |

---

# 📸 Screenshots

- 🏠 Home Page
- 🔍 Property Search
- 🏡 Property Details
- 👤 Tenant Dashboard
- 🏠 Owner Dashboard
- 🛡 Admin Dashboard
- 💳 Payment Page
- 💬 Chat Module
- 📅 Visit Booking Calendar

---

# 🔒 Security

- JWT Authentication
- Password Hashing
- Protected APIs
- Role-Based Authorization
- Secure Razorpay Payments
- Owner Contact Privacy
- AI Listing Verification
- Owner KYC Verification
- Cloudinary Secure Uploads
- Input Validation
- MongoDB Data Protection

---

# 🚀 Production Ready

This project is designed as a complete production-ready rental platform.

✔ No Placeholder Pages

✔ No Dummy Buttons

✔ No Mock APIs

✔ Fully Functional Backend APIs

✔ Connected MongoDB Database

✔ JWT Authentication

✔ Working Razorpay Integration

✔ Google Gemini AI Verification

✔ Cloudinary Image Upload

✔ Real-Time Chat

✔ Owner KYC Verification

✔ Visit Booking Calendar

✔ Admin Approval Workflow

✔ Permanent Contact Unlock System

✔ Premium Subscription System

Every frontend feature is connected to a real backend API with production-ready business logic, secure authentication, persistent database storage, payment processing, and admin moderation.

---

# 🚀 Future Enhancements

- Mobile Application
- Email Notifications
- SMS Notifications
- Push Notifications
- AI Property Price Prediction
- AI Property Recommendation Engine
- Nearby Facility Detection
- Rental Agreement Generator
- Multi-language Support

---

# 👨‍💻 Author

**Chanchal Chaudhary**

**GitHub**

https://github.com/Chanchal2004


---

# ⭐ Support

If you found this project helpful, please consider giving it a ⭐ on GitHub. Your support helps improve the project and motivates future development.
