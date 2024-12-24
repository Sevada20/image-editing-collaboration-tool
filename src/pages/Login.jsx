import { useContext, useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "@/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      username: userData.username,
      password: userData.password,
    };

    try {
      let response;
      if (isRegistering) {
        response = await registerUser(data);
        login(response.token, response.user);
      } else {
        response = await loginUser(data);
        login(response.token, response.user);
      }

      navigate("/");
    } catch (error) {
      console.log("Request failed", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: "0 auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        {isRegistering ? "Register" : "Login"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          name="username"
          value={userData.username}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Password"
          variant="outlined"
          type="password"
          name="password"
          value={userData.password}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Button fullWidth variant="contained" type="submit">
          {isRegistering ? "Register" : "Login"}{" "}
        </Button>
      </form>
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          onClick={() => setIsRegistering(!isRegistering)}
          color="primary"
        >
          {isRegistering
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Button>
      </Box>
    </Box>
  );
};

export default Login;
