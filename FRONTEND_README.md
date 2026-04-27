# DeepFake Detection Frontend

A beautiful, modern frontend for the DeepFake Detection System built with Next.js 16, featuring a dark futuristic theme with neon blue and purple accents.

## 🎨 Theme

The application uses a **dark futuristic theme** with:

- **Primary Color**: Neon Blue (oklch(0.7 0.18 230))
- **Secondary Color**: Neon Purple (oklch(0.65 0.2 290))
- **Glass morphism effects** for modern UI components
- **Smooth animations** and transitions
- **Responsive design** for all devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:8000` (or configure in `.env.local`)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
# Create .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔐 Authentication Flow

### User Journey

1. **Landing Page** (`/`) - Public homepage with features and how it works
2. **Signup** (`/signup`) - Create a new account
   - Full Name, Email, Password required
   - Password confirmation validation
   - Auto-login after successful signup
3. **Login** (`/login`) - Sign in to existing account
   - Email and password authentication
   - JWT token stored in localStorage
   - Redirects to upload page on success
4. **Protected Routes** - Require authentication:
   - `/upload` - Upload videos for analysis
   - `/analysis` - View analysis results
   - `/report` - Detailed reports

### Authentication Features

- **JWT Token Management**: Automatic token storage and inclusion in API requests
- **Auto-logout on Token Expiry**: Redirects to login when token expires
- **Protected Routes**: Upload and analysis pages require authentication
- **User Profile Menu**: Shows user info and logout option
- **Responsive Auth UI**: Beautiful login/signup forms matching the theme

## 📁 Project Structure

```
app/
├── layout.tsx                 # Root layout with AuthProvider
├── page.tsx                   # Landing page
├── login/
│   └── page.tsx              # Login page
├── signup/
│   └── page.tsx              # Signup page
├── upload/
│   └── page.tsx              # Upload page (protected)
├── analysis/
│   └── page.tsx              # Analysis page (protected)
└── report/
    └── page.tsx              # Report page

components/
├── protected-route.tsx        # Route protection wrapper
├── ui/
│   └── navbar.tsx            # Navigation with auth buttons
└── ...

contexts/
└── auth-context.tsx          # Global authentication state

lib/
└── api.ts                    # API client with axios
```

## 🔌 API Integration

The frontend connects to the FastAPI backend with the following endpoints:

### Auth Endpoints

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout user

### Upload Endpoints

- `POST /api/upload/` - Upload video file
- `GET /api/upload/list` - List user's uploads
- `DELETE /api/upload/{video_id}` - Delete upload

### Analysis Endpoints

- `POST /api/predictions/analyze/{video_id}` - Start analysis
- `GET /api/predictions/result/{video_id}` - Get results
- `GET /api/predictions/list` - List all predictions

### Dashboard Endpoints

- `GET /api/dashboard/stats` - User statistics

## 🎯 Key Features

### 1. **Smooth Authentication**

- Beautiful login/signup forms with validation
- Real-time password matching feedback
- Error handling with user-friendly messages
- Automatic token management

### 2. **Protected Routes**

- Seamless redirect to login for unauthenticated users
- Loading states during auth check
- Preserves intended destination after login

### 3. **User Experience**

- Navbar updates based on auth state
- User profile dropdown with avatar
- Welcome message with user's name
- Smooth page transitions

### 4. **Responsive Design**

- Mobile-friendly navigation
- Adaptive layouts for all screen sizes
- Touch-optimized interactions

## 🛠️ Configuration

### Backend URL

Set the backend API URL in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update this to your production backend URL.

### Theme Customization

Theme colors are defined in `app/globals.css`. You can customize:

- Primary/Secondary colors
- Glass effects
- Neon glow effects
- Border colors

## 📦 Built With

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Radix UI** - Accessible UI components
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 🔒 Security Notes

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- Automatic token expiry handling
- Protected routes on client-side (ensure backend validates tokens)
- CORS configuration required on backend for cross-origin requests

## 🚦 Usage

1. **Start Backend**: Make sure your FastAPI backend is running on port 8000
2. **Start Frontend**: Run `npm run dev`
3. **Create Account**: Visit `/signup` to create a new account
4. **Login**: Use your credentials to login
5. **Upload**: Navigate to `/upload` to upload videos
6. **Analyze**: View results in `/analysis` page

## 📝 Next Steps

To enhance the application further:

1. **Add file upload progress** - Show upload percentage in real-time
2. **Implement analysis status polling** - Auto-refresh results when analysis completes
3. **Add user dashboard** - Show upload history and statistics
4. **Create admin panel** - For admin users to manage system
5. **Add toast notifications** - Better user feedback for actions
6. **Implement forgot password** - Password reset flow
7. **Add email verification** - Verify user emails after signup

## 📄 License

This project is part of the DeepFake Detection System.

---

**Happy DeepFake Detecting!** 🔍✨
