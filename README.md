Xpose - Smart Crime Reporting System
A secure, anonymous, and AI-powered platform for reporting crimes, enhancing public safety through technology.

Overview
Xpose is a comprehensive crime reporting system that bridges the gap between citizens and law enforcement. 
It enables anonymous crime reporting, AI-powered content validation, real-time status tracking, and immutable record-keeping using blockchain technology.

Key Features:
  Anonymous Reporting: Submit crimes without revealing identity.

  AI-Powered Validation: Automated spam, toxicity, and urgency classification using BERT and Detoxify models.
  
  Blockchain Storage: Tamper-proof record-keeping with a custom Go-based blockchain.
  
  Multilingual Support: Language translation via Gemini AI.
  
  Real-Time Notifications: Live updates via WebSocket.
  
  Emergency SOS: Instant alerts with location sharing.
  
  Police and Admin Dashboards: Case management and analytics via Next.js portals.
  
  Guest Mode: Report without registration.

Technology Stack:
  Frontend: Flutter (Mobile App)
  
  Backend: Spring Boot (REST APIs)
  
  AI/ML: FastAPI, BERT, Detoxify, SHAP, Gemini API
  
  Blockchain: Go, LevelDB
  
  Database: PostgreSQL
  
  Authentication: Firebase OTP, JWT
  
  Web Dashboards: Next.js
  
  APIs: Google Maps, Places, NewsAPI

Project Structure:
  Xpose/
  ├── xpose_app/                 # Flutter Mobile App
  │   ├── lib/
  │   │   ├── components/        # Reusable UI components
  │   │   ├── helpers/           # Utility functions
  │   │   ├── models/            # Data models
  │   │   ├── pages/             # App screens
  │   │   ├── providers/         # State management
  │   │   ├── services/          # API services
  │   │   └── main.dart          # App entry point
  │   └── pubspec.yaml           # Dependencies
  ├── xpose-backend/             # Spring Boot Backend
  │   └── src/main/java/com/crimereport/xpose/
  │       ├── config/            # Security, WebSocket config
  │       ├── controllers/       # REST API endpoints
  │       ├── models/            # JPA entities
  │       ├── repository/        # Data access layer
  │       ├── services/          # Business logic
  │       └── resources/         # Application config
  ├── xpose-admin/               # Next.js Admin & Police Portal
  │   └── src/app/
  │       ├── admin/             # Admin dashboard pages
  │       ├── police/            # Police dashboard pages
  │       └── components/        # Shared components
  ├── xpose_fastapi/             # Python ML Service
  │   ├── xpose_ml/
  │   │   ├── classifier.py      # ML classification logic
  │   │   ├── models.py          # Pydantic models
  │   │   └── routes.py          # FastAPI endpoints
  │   └── requirements.txt       # Python dependencies
  └── xpose_chain/               # Go Blockchain Service
      ├── blockchain/            # Blockchain core logic
      ├── handlers/              # HTTP handlers
      ├── routes/                # API routes
      └── main.go                # Service entry point

    
System Workflow:
  Users submit crime reports via the Flutter app (anonymous or registered).
  
  Reports undergo AI validation (spam, toxicity, urgency).
  
  Validated reports are stored immutably on the blockchain.
  
  Law enforcement accesses and updates cases via the Next.js dashboard.
  
  Real-time notifications keep users informed of case progress.

Future Enhancements:
  Offline report drafting
  
  Voice-to-text reporting
  
  Predictive crime analytics
  
  Enhanced regional language support
  
  Integration with law enforcement databases

Conclusion:
Xpose demonstrates the effective use of modern technologies to improve public safety, foster transparency, and build trust between citizens and law enforcement.

