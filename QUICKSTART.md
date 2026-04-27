# 🚀 Quick Start Guide

## Get Your DeepFake Detection System Running in 5 Minutes!

### Step 1: Start the Backend ⚙️

```bash
# Navigate to backend folder
cd e:\Downloads\deep-fake\deep-backend

# Start the FastAPI server
python main.py
```

✅ Backend should be running on `http://localhost:8000`
🔗 API docs available at `http://localhost:8000/docs`

### Step 2: Start the Frontend 🎨

```bash
# Navigate to frontend folder
cd e:\Downloads\deep-fake\deep-fake-detection-ui

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

✅ Frontend should be running on `http://localhost:3000`

### Step 3: Create Your Account 🔐

1. Open `http://localhost:3000` in your browser
2. Click **"Get Started"** or navigate to `/signup`
3. Fill in:
   - Full Name
   - Email Address
   - Password (min 6 characters)
4. Click **"Create Account"**
5. You'll be automatically logged in and redirected to upload page

### Step 4: Upload & Analyze 📹

1. On the upload page, drag and drop or click to select a video
2. Click **"Start Analysis"**
3. View results on the analysis page
4. Check detailed report

---

## 🎯 First Time Setup Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] `.env.local` file created in frontend folder
- [ ] Account created and logged in
- [ ] Successfully uploaded a test video

## 🌈 Theme Highlights

Your app now features:

- **Dark futuristic theme** with neon effects
- **Blue accents** for primary actions (Login, Upload)
- **Purple accents** for secondary actions (Signup)
- **Glass morphism** effects throughout
- **Smooth animations** and transitions

## 🔑 Test Credentials

After signup, you can use your own credentials:

- Email: Your email
- Password: Your password

## 🐛 Troubleshooting

### Backend not connecting?

- Check if backend is running: `http://localhost:8000/docs`
- Verify `.env.local` has correct URL
- Check CORS settings in backend

### Can't login?

- Ensure backend database is initialized
- Check browser console for errors
- Verify email/password are correct

### Signup not working?

- Check if email is already registered
- Ensure password is at least 6 characters
- Verify backend `/api/auth/signup` endpoint is accessible

## 📞 Need Help?

Check the full `FRONTEND_README.md` for detailed documentation!

---

**You're all set! Start detecting deepfakes! 🎉**
