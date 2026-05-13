# 🎥 videoOnn - Full Stack Video Platform

**videoOnn** is a robust, production-ready video streaming and social interaction platform. It features a complete backend API and a modern, responsive frontend built with React and Tailwind CSS.

---

## ✨ Key Features

### 🎞️ Video Management
- **Upload & Stream**: Seamless video uploads using Cloudinary.
- **Publishing Control**: Toggle video visibility (public/private).
- **Engagement**: View counters and interactive dashboards.

### 👤 User Features
- **Secure Auth**: JWT-based authentication with cookie support.
- **Profile Customization**: Update avatars, cover images, and channel details.
- **History**: Track watched videos and channel subscriptions.

### 💬 Social & Interaction
- **Comments & Likes**: Engage with videos, comments, and community "Tweets".
- **Subscriptions**: Subscribe to your favorite creators.
- **Playlists**: Create and manage personalized video collections.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Redux Toolkit, Tailwind CSS, Vite |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Media Storage** | Cloudinary |
| **Authentication** | JWT, Bcrypt |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Priyanshu-prakash/videoOnn.git
   cd videoOnn
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.sample
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🔑 Environment Variables

To run this project, you will need to add the following variables to your `/backend/.env` file:

- `PORT`: Server port (e.g., 8000)
- `MONGODB_URI`: Your MongoDB connection string
- `ACCESS_TOKEN_SECRET`: A long random string for JWT
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

---

## 📁 Project Structure

```text
videoOnn/
├── backend/            # Express API
│   ├── src/
│   │   ├── controllers/ # Logic for routes
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API endpoints
│   │   └── utils/       # Helpers (Cloudinary, AsyncHandlers)
└── frontend/           # React Frontend
    ├── src/
    │   ├── components/  # Reusable UI parts
    │   ├── pages/       # Route-level components
    │   └── store/       # Redux state management
```

---

