import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Box } from "@mui/material";

const MainLayout = () => {
  return (
    <Box
      sx={{
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      <Navbar />
      <Box sx={{ px: { xs: 2, sm: 3 } }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
