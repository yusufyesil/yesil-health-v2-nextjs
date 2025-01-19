# Yesil Health AI - Virtual Hospital Project Instructions

## Project Overview
Yesil Health AI is a virtual hospital platform that provides AI-powered medical consultations. The system uses specialized medical databases for different specialties to provide evidence-based responses to health-related questions.

## Core Features
1. Authentication with Google
2. Credit-based consultation system
3. Multi-specialty AI consultations
4. Real-time consultation process
5. Payment integration with LemonSqueezy
6. Monthly free credits system

## Technical Requirements

### Frontend Requirements
- React (or Next.js for original version)
- Firebase Authentication
- Firebase Firestore
- TailwindCSS for styling
- Framer Motion for animations
- React Markdown for rendering responses

### Backend Requirements
- Python backend for AI processing
- Firebase Admin SDK
- LemonSqueezy API integration
- Streaming response capability

### External Services
1. **Firebase**
   - Authentication (Google Sign-in)
   - Firestore Database
   - Admin SDK for server operations

2. **LemonSqueezy**
   - Payment processing
   - Webhook integration
   - Product/variant setup

## Project Structure

### Authentication System
1. **User States**:
   - Unauthenticated: Redirect to onboarding
   - New User: Show pricing page
   - Existing User with Credits: Show main app
   - Existing User without Credits: Show pricing page

2. **User Data Structure (Firestore)**:
```javascript
{
  email: string,
  credits: number,
  createdAt: timestamp,
  lastFreeCreditsReset: timestamp
}
```

### Credit System
1. **Free Plan**:
   - 10 free credits per month
   - Auto-reset monthly if credits < 100

2. **Premium Plan**:
   - 100 credits for $5
   - No expiration
   - Purchase through LemonSqueezy

### AI Consultation Process
1. **Question Processing**:
   - Determine relevant medical specialties
   - Handle non-health questions
   - Stream responses in real-time

2. **Response Structure**:
   - Individual specialty consultations
   - Combined final response
   - Evidence-based disclaimers

## API Integration

### 1. Firebase Setup
```javascript
// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // ... other config
};
```

### 2. LemonSqueezy Integration
1. **Environment Variables**:
```
LEMONSQUEEZY_SIGNING_SECRET=your_signing_secret
NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID=your_variant_id
```

2. **Webhook Endpoint**:
- Handle order_created events
- Verify webhook signatures
- Update user credits

### 3. AI Backend Integration
1. **Consultation Endpoint**:
- Stream responses
- Process specialties
- Handle non-health questions

## Key Components

### 1. Chat Interface
- Real-time message updates
- Specialty consultation display
- Loading states
- Error handling with retry
- Evidence-based information display

### 2. Credit Management
- Display current credits
- Purchase integration
- Monthly reset system

### 3. Authentication Flow
- Google sign-in
- User state management
- Route protection

## Environment Variables Required
```
# Firebase
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=

# Firebase Admin (Backend)
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# LemonSqueezy
LEMONSQUEEZY_SIGNING_SECRET=
REACT_APP_LEMONSQUEEZY_VARIANT_ID=
```

## Implementation Steps

1. **Initial Setup**
   - Create React project
   - Install dependencies
   - Configure Firebase
   - Set up environment variables

2. **Authentication**
   - Implement Google sign-in
   - Create AuthContext
   - Set up protected routes

3. **Database**
   - Set up Firestore
   - Create user document structure
   - Implement credit management

4. **Payment Integration**
   - Configure LemonSqueezy
   - Set up webhook endpoint
   - Implement credit purchase

5. **AI Integration**
   - Set up Python backend
   - Create consultation endpoint
   - Implement streaming responses

6. **UI Components**
   - Build chat interface
   - Create consultation display
   - Implement loading states
   - Add error handling

## Security Considerations

1. **Authentication**
   - Protect routes
   - Validate user sessions
   - Handle token expiration

2. **Webhooks**
   - Verify signatures
   - Validate order data
   - Secure credit updates

3. **API Endpoints**
   - Validate requests
   - Rate limiting
   - Error handling

## Testing

1. **User Flows**
   - Authentication process
   - Credit purchase
   - Consultation process
   - Error scenarios

2. **Integration Tests**
   - Webhook handling
   - Credit updates
   - AI responses

## Deployment Considerations

1. **Frontend**
   - Build optimization
   - Environment variables
   - CDN setup

2. **Backend**
   - API scaling
   - Error logging
   - Monitoring

3. **Database**
   - Indexing
   - Backup strategy
   - Security rules 