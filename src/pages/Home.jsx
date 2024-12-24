import { useState, useEffect, useContext } from "react";
import { Grid, Button, Box, Typography } from "@mui/material";
import { AuthContext } from "@/context/AuthContext";
import { getImages, uploadImage } from "@/api";
import ImageCard from "@/components/ImageCard";

const Home = () => {
  const [images, setImages] = useState([]);
  const { isAuth } = useContext(AuthContext);

  useEffect(() => {
    const fetchImages = async () => {
      const fetchedImages = await getImages();
      setImages(fetchedImages);
    };

    fetchImages();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      await uploadImage(formData);
      const newImages = await getImages();
      setImages(newImages);
    }
  };

  const handleDelete = (deletedImageId) => {
    setImages((prevImages) =>
      prevImages.filter((image) => image._id !== deletedImageId)
    );
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Image Editor
      </Typography>
      <Button variant="contained" component="label">
        Upload Image
        <input type="file" hidden onChange={handleUpload} />
      </Button>
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {images.map((image) => (
          <Grid item xs={12} sm={6} md={4} key={image._id}>
            <ImageCard image={image} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
