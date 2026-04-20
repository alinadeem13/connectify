# CW2 Slide Notes

## Slide 1: Title

- Connectify
- COM769 Coursework 2
- Scalable social networking web application

## Slide 2: Problem Definition

- Users need a modern social platform to connect, share posts, and engage through comments
- The solution should support authenticated access, persistent data, and scalable backend patterns
- The project focuses on a cloud-ready web architecture using frontend and backend integration

## Slide 3: Proposed Solution

- Next.js full-stack web application
- REST API route handlers for authentication, posts, and comments
- Session-based authentication using secure cookies
- Role-aware functionality for creators and consumers

## Slide 4: Architecture

- Frontend: Next.js React UI
- Backend: Next.js route handlers
- Persistence: Supabase tables for users, sessions, posts, comments, and ratings
- Storage: Supabase Storage for uploaded images
- Middleware: route protection for authenticated areas

## Slide 5: Key Features

- Signup and login
- Logout and protected routes
- Stories carousel
- Feed with lazy loading
- Post owner identity
- Comment system
- Creator-only post publishing

## Slide 6: Advanced / Enhanced Functionality

- Role-based access for publishing
- Dynamic backend-driven feed instead of static frontend-only mock data
- Real-time style UX update after post creation
- Persistent comments stored through backend APIs

## Slide 7: Demonstration Flow

- Register a creator account
- Login
- Create a new post from the dashboard
- Show post appearing in the feed
- Add comments to a post
- Logout and show redirect to login

## Slide 8: Scalability Discussion

- Current structure is cloud-ready in design
- REST backend and separation of concerns support future scaling
- Future scale path:
  - managed Supabase database
  - object storage for images
  - CDN
  - container or serverless deployment

## Slide 9: Limitations

- Not yet deployed to cloud
- No formal automated tests yet
- Local file persistence is not ideal for multi-instance deployment
- Social interactions such as likes/shares are currently UI-level only

## Slide 10: Conclusion

- The coursework demonstrates a functional full-stack social platform
- It combines frontend design, backend services, authentication, authorization, and persistence
- The next steps are cloud deployment, architecture write-up, and formal testing
