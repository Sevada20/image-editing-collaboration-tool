import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: "none",
            color: "inherit",
            flexGrow: isMobile ? 0 : 1,
          }}
        >
          Image Editor
        </Typography>

        {user ? (
          <>
            {isMobile ? (
              <Box>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  onClick={handleMenu}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <MenuItem
                    component={Link}
                    to="/dashboard"
                    onClick={handleClose}
                  >
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Hello, {user.username}
                </Typography>
                <Avatar
                  alt={user.username}
                  src={user.profilePicture}
                  sx={{
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                  }}
                >
                  {user.username[0].toUpperCase()}
                </Avatar>
                <Button
                  color="inherit"
                  component={Link}
                  to="/dashboard"
                  sx={{
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={logout}
                  sx={{
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Logout
                </Button>
              </Box>
            )}
          </>
        ) : (
          <Button
            color="inherit"
            component={Link}
            to="/login"
            sx={{
              whiteSpace: "nowrap",
            }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
