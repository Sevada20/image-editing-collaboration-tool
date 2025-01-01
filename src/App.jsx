import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Use Routes instead of Switch
import { Box } from "@mui/material";
import { io } from "socket.io-client";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/privateRoute/PrivateRoute";
import Editor from "./pages/Editor";
import ImageView from "./pages/ImageView";

const socket = io("http://localhost:5000");

function App() {
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to WebSocket");
    });

    return () => {
      socket.off("connect");
    };
  }, []);

  return (
    <Router>
      <Box>
        <Routes>
          <Route path="/:auth" element={<Login />} />
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/image/:id" element={<ImageView />} />
          </Route>
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
