# KYC Verification Web App

A secure Know Your Customer (KYC) verification web application built with Next.js and TypeScript. This application is designed for mobile usage but accessible from any device.

## Features

- **Mobile-First Design**: Optimized for mobile devices with responsive UI
- **Device Detection**: Shows QR code for desktop users to continue on mobile
- **Step-by-Step KYC Process**:
  - User information form (pre-filled name)
  - Liveness check (selfie capture)
  - ID document capture
- **Secure API Integration**: Uses JWT tokens for authentication
- **Form Validation**: Ensures all required data is collected

## Requirements

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

```bash
cd kyc-app
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000?token=YOUR_JWT_TOKEN&id=USER_ID in your browser.

## Usage

The app requires two URL parameters:

- `token`: JWT token for API authentication
- `id`: Unique user ID

## Building for Production

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## Technologies Used

- Next.js
- TypeScript
- Tailwind CSS
- React Webcam
- QR Code generation
- JWT authentication
