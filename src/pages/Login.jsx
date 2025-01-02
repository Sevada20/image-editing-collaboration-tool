import { useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { loginUser, registerUser } from "@/api";
import { AuthContext } from "../context/AuthContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = () => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { auth } = useParams();

  useEffect(() => {
    setIsRegistering(auth === "register");
  }, [auth]);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!userData.username || !userData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const data = {
        username: userData.username,
        password: userData.password,
      };

      let response;
      if (isRegistering) {
        response = await registerUser(data);
      } else {
        response = await loginUser(data);
      }

      if (response.token && response.user) {
        login(response.token, response.user);
        navigate("/");
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.log("Request failed", error);
      setError(error.message || "An error occurred");
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "0 auto", mt: 5, px: 2 }}>
      <Typography variant="h5" gutterBottom align="center">
        {isRegistering ? "Register" : "Login"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          name="username"
          value={userData.username}
          onChange={handleChange}
          sx={{ mb: 2 }}
          error={!!error && !userData.username}
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          name="password"
          value={userData.password}
          onChange={handleChange}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          error={!!error && !userData.password}
        />
        <Button fullWidth variant="contained" type="submit" sx={{ mb: 2 }}>
          {isRegistering ? "Register" : "Login"}
        </Button>
      </form>

      <Button
        fullWidth
        onClick={() => {
          setIsRegistering(!isRegistering);
          navigate(`/${isRegistering ? "login" : "register"}`);
          setError("");
          setUserData({ username: "", password: "" });
        }}
        sx={{ textTransform: "none" }}
      >
        {isRegistering
          ? "Already have an account? Login"
          : "Don't have an account? Register"}
      </Button>
    </Box>
  );
};

export default Login;
