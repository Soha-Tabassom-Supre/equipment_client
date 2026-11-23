# Equipment Rental Marketplace — Frontend

A responsive equipment rental marketplace where customers can explore and rent equipment, owners can manage their listings, and administrators can manage the platform.

The frontend is built with Next.js and communicates with a separate Express.js backend API.

## Live Demo

- **Live Website:** https://equipment-client-umber.vercel.app/
- **Frontend Repository:** https://github.com/Soha-Tabassom-Supre/equipment_client
- **Backend Repository:** https://github.com/Soha-Tabassom-Supre/equipment_backend
- **Backend API:** https://equipment-backend-gwok.onrender.com

## Features

- **Responsive Design:** User-friendly interface for desktop, tablet, and mobile devices.
- **Authentication:** Email/password authentication and Google login.
- **Role-Based Access:** Separate experiences and protected routes for customers, owners, and administrators.
- **Equipment Browsing:** Explore available equipment and view equipment details.
- **Dynamic Categories:** Browse equipment using categories fetched from the backend.
- **Search and Filtering:** Search and filter equipment based on available criteria.
- **Equipment Management:** Owners can add, edit, and manage their equipment listings.
- **Booking System:** Customers can create and manage rental bookings.
- **Online Payments:** Integrated Stripe Checkout for rental payments.
- **Favorites:** Save and manage favorite equipment.
- **Review System:** Customers can submit and manage equipment reviews.
- **Dashboards:** Dedicated dashboard experiences for different user roles.
- **Toast Notifications:** Feedback messages for important user actions.

## Technologies Used

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Better Auth
- MongoDB
- Stripe Checkout integration through the backend
- Framer Motion
- Lucide React
- JOSE
- React OAuth

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/Soha-Tabassom-Supre/equipment_client.git
```

### 2. Navigate to the project directory

```bash
cd equipment_client
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000

BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret

MONGODB_URI=your_mongodb_connection_string

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Use your own credentials and keep all secret values private. For production, configure the corresponding environment variables in Vercel.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |

## Authentication and User Roles

The application uses Better Auth for authentication.

The platform supports three user roles:

- **Customer:** Browse equipment, manage favorites, make bookings, and submit reviews.
- **Owner:** Manage equipment listings and rental-related activities.
- **Admin:** Access administrative features and manage platform resources.

Protected dashboard routes restrict access based on authentication and authorization.

## Backend Integration

The frontend communicates with a separate Express.js backend.

The backend handles equipment data, bookings, favorites, reviews, payment processing, and administrative operations.

The backend API URL is configured through:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Payment Integration

Stripe Checkout is used for rental payments.

The frontend initiates the checkout process through the backend API and redirects customers to the Stripe Checkout page to complete payment.

## Deployment

The frontend is deployed on Vercel.

**Production URL:** https://equipment-client-umber.vercel.app/

Production environment variables are configured through the Vercel dashboard.

## Author

Developed by Soha Tabassom Supre.