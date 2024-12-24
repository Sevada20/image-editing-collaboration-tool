import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Paper, Container } from "@mui/material";
import { getImages } from "@/api";

const ImageView = () => {
  const { id } = useParams();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const images = await getImages();
        const foundImage = images.find((img) => img._id === id);
        setImage(foundImage);
      } catch (error) {
        console.error("Error fetching image:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!image) {
    return (
      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography color="error">Image not found</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h4" gutterBottom>
          {image.originalName}
        </Typography>
        <Box
          component="img"
          src={`http://localhost:5000/uploads/${image.filename}`}
          alt={image.originalName}
          sx={{
            width: "100%",
            height: "auto",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">
            Uploaded: {new Date(image.createdAt).toLocaleDateString()}
          </Typography>
          {image.editHistory && image.editHistory.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Edit History</Typography>
              {image.editHistory.map((edit, index) => (
                <Typography key={index} variant="body2">
                  {edit.operation} - {new Date(edit.timestamp).toLocaleString()}
                </Typography>
              ))}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default ImageView;
