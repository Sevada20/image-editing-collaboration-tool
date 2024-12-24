import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { Link } from "react-router-dom";
import { deleteImage } from "@/api";
import { useState } from "react";

const ImageCard = ({ image, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteImage(image._id);
      onDelete(image._id);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleDeleteClick = () => {
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    await handleDelete();
    setOpenDialog(false);
  };

  return (
    <>
      <Card>
        <CardMedia
          component="img"
          height="200"
          image={`http://localhost:5000/uploads/${image.filename}`}
          alt={image.originalName}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {image.originalName}
          </Typography>
          <Typography variant="caption" display="block">
            Uploaded: {new Date(image.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
        <CardActions>
          <Link
            to={`/editor/${image._id}`}
            state={{
              imageUrl: `http://localhost:5000/uploads/${image.filename}`,
            }}
          >
            <Button size="small" color="primary">
              Edit
            </Button>
          </Link>
          <Link to={`/image/${image._id}`}>
            <Button size="small" color="primary">
              View
            </Button>
          </Link>
          <Button size="small" color="error" onClick={handleDeleteClick}>
            Delete
          </Button>
        </CardActions>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Are you sure you want to delete this image?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ImageCard;
