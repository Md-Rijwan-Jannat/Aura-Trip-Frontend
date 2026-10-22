# Aura Trip - Frontend

## Live Site

Check out the live site [here](https://traveltipsdestinationcommunity.vercel.app)

## Project Overview

**Aura Trip** (formerly "Travel Tips & Destination Guides") is a travel social platform that allows users to share travel tips, guides, and stories, as well as engage with fellow travelers. It features user authentication, profile management, post creation with rich text editing, premium content access, and social interaction features. This README outlines the setup and development instructions for the frontend part of the project.

## Features

- **User Authentication**: Secure login, registration, and profile management using JWT.
- **Post Creation**: Rich text editor (Quill) for creating posts with images hosted on Cloudinary.
- **Upvote & Downvote System**: Users can upvote/downvote posts and comments.
- **Social Features**: Follow/unfollow users and engage with travel content.
- **Premium Content Access**: Users can pay for verified accounts and access exclusive content via payment integration.
- **Responsive Design**: The platform works across all devices (mobile, tablet, and desktop).
- **Micro Animations**: Smooth animations using Framer Motion.

## Technologies Used

- **Next.js**: Server-side rendered React framework for the frontend.
- **TypeScript**: For type-safe development.
- **Redux**: For state management.
- **Quill.js**: Rich text editor for post creation.
- **Cloudinary**: For image hosting and management.
- **Tailwind CSS**: For styling and responsive design.
- **Axios**: For API calls to the backend.
- **Framer Motion**: For animations.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Md-Rijwan-Jannat/Aura-Trip-Frontend.git
   ```

2. **Navigate into the project directory**:

   ```bash
   cd Aura-Trip-Frontend
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

   _or_

   ```bash
   bun install
   ```

4. **Create a `.env.local` file in the root directory and add your environment variables**:

   ```bash
   # important links
   NEXT_PUBLIC_WORKSPACE=development
   NEXT_PUBLIC_BASE_API=http://localhost:5000/api/v1
   NEXT_PUBLIC_LIVE_API=https://Aura-Tripco.vercel.app/api/v1
   # Jwt credentials
   NEXT_PUBLIC_JWT_ACCESS_TOKEN=your_jwt_access_token_here
   # cloudinary credentials
   NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your_cloud_name/image/upload
   # Google credentials
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   NEXTAUTH_SECRET=your_nextauth_secret_here
   NEXTAUTH_URL=http://localhost:3000
   ```

## Project Structure

```bash
Tips-Destination-Frontend/
├── public/                     # Public assets like images and favicons
├── src/
│   ├── app/                    # Next.js App-related code
│   │   ├── layouts/            # Layout components for different areas of the app
│   │   │   ├── CommonLayout/   # Layout for general public views
│   │   │   │   ├── _components/ # Shared UI modules for CommonLayout
│   │   │   ├── AuthLayout/     # Layout for authenticated areas (login, signup)
│   │   │   │   ├── _components/ # Shared UI modules for AuthLayout
│   │   │   ├── DashboardLayout/# Layout for dashboard views
│   │   │   │   ├── _components/ # Shared UI modules for DashboardLayout
│   ├── assets/                 # Static assets (fonts, images, etc.)
│   ├── components/             # Reusable components
│   │   ├── Modal/              # Modal component
│   │   ├── SharedUI/           # Shared UI components used across layouts and pages
│   ├── config/                 # Application configuration (e.g., environment, API config)
│   ├── lib/                    # Utility libraries and services
│   ├── redux/                  # Redux slices for state management
│   ├── schema/                 # Validation schemas (e.g., for form validation)
│   ├── service/                # API services and other external services
│   ├── constants/              # Global constants
│   ├── providers/              # React providers for context
│   ├── styles/                 # Global styles (Tailwind)
│   ├── utils/                  # Utility functions (e.g., API helpers)
│   └── types/                  # TypeScript types and interfaces
├── .env.local                  # Environment variables
├── next.config.js              # Next.js configuration
└── package.json                # Project dependencies and scripts


```

## Scripts

### Run the Development Server

To run the development server, use the following command:

```bash
npm run dev
```

or

```bash
bun dev
```

### Build the Production App

To build the production app, use the command:

```bash
npm run build
```

### Start the Production Server

To start the production server, run:

```bash
npm run start
```

or

```bash
bun start
```

## Additional Features

- **Rich Text Editing**: Using Quill for creating rich posts with image support.
- **Cloudinary Image Upload**: Upload travel images to Cloudinary via an API request.
- **Payment Integration**: Stripe for handling premium content payments.
- **PDF Generation**: Enable users to download PDF versions of travel guides or posts for offline reading.
- **Search with Debouncing**: Optimize search functionality with a debouncing mechanism to prevent excessive server requests.
