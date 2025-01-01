import { useState, useEffect, useContext } from "react";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { AuthContext } from "@/context/AuthContext";
import { getImages } from "@/api";
import ImageCard from "@/components/ImageCard";

const Dashboard = () => {
  const [images, setImages] = useState([]);
  const [stats, setStats] = useState({
    totalImages: 0,
    totalEdits: 0,
    recentActivity: [],
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserImages = async () => {
      try {
        const fetchedImages = await getImages();

        if (!user?.id) {
          console.warn("No user ID found - skipping image filtering");
          return;
        }

        const userImages = fetchedImages.filter((img) => {
          const uploaderStr = String(img.uploader._id);
          const userIdStr = String(user.id);
          return uploaderStr === userIdStr;
        });

        setImages(userImages);

        const stats = {
          totalImages: userImages.length,
          totalEdits: userImages.reduce(
            (total, img) => total + (img.editHistory?.length || 0),
            0
          ),
          recentActivity: userImages
            .flatMap((img) =>
              (img.editHistory || []).map((edit) => ({
                ...edit,
                imageName: img.originalName,
                imageId: img._id,
              }))
            )
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5),
        };

        setStats(stats);
      } catch (error) {
        console.error("Error in fetchUserImages:", error);
      }
    };

    if (user) {
      fetchUserImages();
    } else {
      console.warn("No user available - skipping fetch");
    }
  }, [user]);

  const handleDelete = (deletedImageId) => {
    const deletedImage = images.find((img) => img._id === deletedImageId);

    setImages((prevImages) =>
      prevImages.filter((image) => image._id !== deletedImageId)
    );

    setStats((prev) => ({
      ...prev,
      totalImages: prev.totalImages - 1,
      totalEdits: prev.totalEdits - (deletedImage?.editHistory?.length || 0),
      recentActivity: prev.recentActivity.filter(
        (activity) => activity.imageId !== deletedImageId
      ),
    }));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Images</Typography>
              <Typography variant="h3">{stats.totalImages}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Edits</Typography>
              <Typography variant="h3">{stats.totalEdits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Recent Activity</Typography>
              <List>
                {stats.recentActivity.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${activity.operation} on ${activity.imageName}`}
                      secondary={new Date(
                        activity.timestamp
                      ).toLocaleDateString()}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        My Images
      </Typography>
      <Grid container spacing={3}>
        {images.length > 0 ? (
          images.map((image) => (
            <Grid item xs={12} sm={6} md={4} key={image._id}>
              <ImageCard image={image} onDelete={handleDelete} />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body1" color="textSecondary" align="center">
              No images found. Try uploading some images!
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
