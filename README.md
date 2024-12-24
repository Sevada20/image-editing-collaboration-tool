# Image Editor Pro

A real-time collaborative image editing web application.

## Features

- 🔐 User Authentication
- 📸 Image Upload & Management
- ✏️ Editing Tools:
  - Brightness & Contrast adjustment
  - Grayscale filter
  - Image rotation
  - Crop functionality
- 👥 Real-time Collaboration
- ↩️ Undo/Redo functionality
- 📱 Responsive Design

## Tech Stack

### Frontend

- React 18
- Material-UI for UI components
- Fabric.js for canvas manipulation
- Socket.io-client for real-time features
- Vite for build tooling

### Backend

- Node.js + Express
- MongoDB for data storage
- Socket.io for WebSocket connections
- JWT for authentication

## Installation & Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (v6.0.0+)
- npm or yarn

### Setup Steps

1. Clone the repository:

```bash
git clone [repository-url]
cd image-editing-collaboration-tool
```

2. Install dependencies:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../
npm install
```

3. Create `.env` file in server directory:

```bash
MONGODB_URI=mongodb://localhost:27017/image-editor
JWT_SECRET=your_secret_key
PORT=5000
```

4. Start the application:

```bash
# Start backend (in server directory)
npm start

# Start frontend (in root directory)
npm run dev
```

The application will be available at: `http://localhost:5173`

## Project Structure

```
image-editor/
├── src/
│   ├── components/
│   │   ├── ImageCard.jsx       # Image card component for gallery
│   │   ├── Navbar.jsx         # Navigation bar component
│   │   └── RealTimeEditor.jsx # Main editor component
│   ├── pages/
│   │   ├── Home.jsx          # Gallery page
│   │   ├── Editor.jsx        # Image editing page
│   │   ├── Login.jsx         # Login page
│   │   └── ImageView.jsx     # Image view page
│   ├── context/
│   │   └── AuthContext.jsx   # Authentication context
│   ├── api/
│   │   └── index.js         # API integration
│   ├── routes/
│   │   └── privateRoute/    # Protected routes
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── server/
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── image.js        # Image handling routes
│   ├── models/
│   │   ├── User.js        # User model
│   │   └── Image.js       # Image model
│   ├── middleware/
│   │   ├── auth.js        # Auth middleware
│   │   └── wsAuth.js      # WebSocket auth
│   ├── uploads/           # Image storage
│   └── app.js            # Main server file
├── public/
│   └── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Dependencies

### Frontend

```json
{
  "dependencies": {
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.14.18",
    "@mui/material": "^5.14.18",
    "axios": "^1.6.2",
    "fabric-pure-browser": "^5.1.0",
    "lodash": "^4.17.21",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.19.0",
    "socket.io-client": "^4.7.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

## API Documentation

### Authentication

- POST `/api/auth/register` - Register new user
  ```json:README.md
  {
    "username": "string",
    "password": "string"
  }
  ```
- POST `/api/auth/login` - Login user
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### Images

- GET `/api/images` - Get all images
- POST `/api/images/upload` - Upload image (multipart/form-data)
- GET `/api/images/:id` - Get specific image
- POST `/api/images/:id/save` - Save changes
  ```json
  {
    "imageData": "base64string",
    "filters": {
      "brightness": "number",
      "contrast": "number",
      "grayscale": "number"
    }
  }
  ```

## WebSocket Events

```javascript
// Client-side events
socket.emit("edit", {
  imageId: "string",
  filters: Object,
  imageData: "base64string",
});

// Server-side events
socket.on("edit", (data) => {
  // Handle real-time updates
});
```

## Key Components

### RealTimeEditor

Main image editing component:

- Canvas management via Fabric.js
- Editing tools (crop, rotate)
- Real-time change synchronization
- Edit history (undo/redo)

### Editor

Editing page component:

- RealTimeEditor integration
- Filter management
- Responsive design
- Image loading and saving

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
