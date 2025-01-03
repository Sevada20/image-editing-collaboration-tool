import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Box, Container } from "@mui/material";

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
      <Container maxWidth="lg" sx={{ pb: 1 }}>
        <Box sx={{ px: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>
      </Container>
    </Box>
  );
};

export default MainLayout;
