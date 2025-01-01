import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { fabric } from "fabric-pure-browser";
import {
  Button,
  Box,
  Stack,
  IconButton,
  Tooltip,
  ButtonGroup,
} from "@mui/material";
import {
  Undo,
  Redo,
  RotateLeft,
  RotateRight,
  Save,
  Crop,
} from "@mui/icons-material";
import { saveImageChanges } from "@/api";
import debounce from "lodash/debounce";

const socket = io("http://localhost:5000");

const RealTimeEditor = ({
  imageId,
  imageUrl,
  filters,
  onFiltersChange,
  isMobile,
}) => {
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [isCropping, setIsCropping] = useState(false);

  const initCanvas = () => {
    if (fabricRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const maxWidth = Math.min(containerWidth, 800);
    const ratio = 600 / 800;
    const height = maxWidth * ratio;

    fabricRef.current = new fabric.Canvas(canvasRef.current, {
      width: maxWidth,
      height: height,
      backgroundColor: "#f0f0f0",
      preserveObjectStacking: true,
    });
  };

  const loadImage = () => {
    if (!imageUrl || !fabricRef.current) return;

    setIsLoading(true);
    fabric.Image.fromURL(
      imageUrl,
      (img) => {
        if (!fabricRef.current) return;

        const containerWidth = containerRef.current?.clientWidth || 800;
        const maxWidth = Math.min(containerWidth, 800);
        const ratio = 600 / 800;
        const height = maxWidth * ratio;

        const imgRatio = img.height / img.width;
        const scale =
          imgRatio > ratio ? height / img.height : maxWidth / img.width;

        img.scale(scale);

        fabricRef.current.setBackgroundImage(img, () => {
          img.center();
          fabricRef.current.renderAll();
          setIsLoading(false);
          saveToHistory();
        });
      },
      {
        crossOrigin: "anonymous",
      }
    );
  };

  const updateCanvasSize = () => {
    if (!fabricRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const maxWidth = Math.min(containerWidth, 800);
    const ratio = 600 / 800;
    const height = maxWidth * ratio;

    fabricRef.current.setDimensions({
      width: maxWidth,
      height: height,
    });

    if (fabricRef.current.backgroundImage) {
      const img = fabricRef.current.backgroundImage;
      const imgRatio = img.height / img.width;
      const scale =
        imgRatio > ratio ? height / img.height : maxWidth / img.width;

      img.scale(scale);
      img.center();
      fabricRef.current.renderAll();
    }
  };

  useEffect(() => {
    const setupCanvas = () => {
      try {
        initCanvas();
        loadImage();
      } catch (error) {
        console.error("Error setting up canvas:", error);
      }
    };

    if (containerRef.current) {
      setupCanvas();
    }

    const debouncedResize = debounce(updateCanvasSize, 250);
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      if (fabricRef.current) {
        try {
          fabricRef.current.dispose();
        } catch (error) {
          console.error("Error disposing canvas:", error);
        }
        fabricRef.current = null;
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    if (fabricRef.current?.backgroundImage && !isLoading) {
      try {
        const img = fabricRef.current.backgroundImage;
        img.filters = [];

        if (filters.brightness !== 100) {
          img.filters.push(
            new fabric.Image.filters.Brightness({
              brightness: (filters.brightness - 100) / 100,
            })
          );
        }

        if (filters.contrast !== 100) {
          img.filters.push(
            new fabric.Image.filters.Contrast({
              contrast: (filters.contrast - 100) / 100,
            })
          );
        }

        if (filters.grayscale > 0) {
          img.filters.push(new fabric.Image.filters.Grayscale());
        }

        if (filters.sepia) {
          img.filters.push(new fabric.Image.filters.Sepia());
        }

        img.applyFilters();
        fabricRef.current.renderAll();

        const currentState = {
          canvas: fabricRef.current.toJSON(),
          filters: { ...filters },
          rotation: img.angle,
        };

        const lastState = history[currentStep];
        if (
          !lastState ||
          JSON.stringify(currentState) !== JSON.stringify(lastState)
        ) {
          saveToHistory();
        }

        socket.emit("edit", { imageId, filters });
      } catch (error) {
        console.error("Error applying filters:", error);
      }
    }
  }, [filters]);

  const saveToHistory = () => {
    const currentState = {
      canvas: fabricRef.current.toJSON(),
      filters: { ...filters },
      rotation: fabricRef.current.backgroundImage?.angle || 0,
    };

    setHistory((prev) => [...prev.slice(0, currentStep + 1), currentState]);
    setCurrentStep((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (currentStep > 0) {
      const previousState = history[currentStep - 1];

      fabricRef.current.loadFromJSON(previousState.canvas, () => {
        if (fabricRef.current.backgroundImage) {
          fabricRef.current.backgroundImage.rotate(previousState.rotation);
        }

        onFiltersChange(previousState.filters);

        fabricRef.current.renderAll();
      });

      setCurrentStep((prev) => prev - 1);

      socket.emit("edit", {
        imageId,
        state: previousState,
      });
    }
  };

  const handleRedo = () => {
    if (currentStep < history.length - 1) {
      const nextState = history[currentStep + 1];

      fabricRef.current.loadFromJSON(nextState.canvas, () => {
        if (fabricRef.current.backgroundImage) {
          fabricRef.current.backgroundImage.rotate(nextState.rotation);
        }

        onFiltersChange(nextState.filters);

        fabricRef.current.renderAll();
      });

      setCurrentStep((prev) => prev + 1);

      socket.emit("edit", {
        imageId,
        state: nextState,
      });
    }
  };

  const handleRotate = (angle) => {
    const img = fabricRef.current.backgroundImage;
    if (img) {
      img.rotate(img.angle + angle);
      fabricRef.current.renderAll();

      saveToHistory();

      socket.emit("edit", {
        imageId,
        rotation: img.angle,
        state: history[currentStep],
      });
    }
  };

  const handleSave = async () => {
    try {
      if (!imageId) {
        throw new Error("No image ID provided");
      }

      const dataUrl = fabricRef.current.toDataURL({
        format: "jpeg",
        quality: 0.8,
      });

      await saveImageChanges(imageId, {
        imageData: dataUrl,
        filters,
      });
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert(error.message || "Failed to save changes");
    }
  };

  const handleCrop = () => {
    if (!isCropping) {
      const img = fabricRef.current.backgroundImage;
      if (!img) return;

      const cropRect = new fabric.Rect({
        width: (img.width * img.scaleX) / 3,
        height: (img.height * img.scaleY) / 3,
        fill: "transparent",
        stroke: "black",
        strokeWidth: 2,
        strokeDashArray: [5, 5],
        cornerColor: "white",
        cornerStrokeColor: "black",
        transparentCorners: false,
      });

      cropRect.set({
        left: img.left + (img.width * img.scaleX - cropRect.width) / 2,
        top: img.top + (img.height * img.scaleY - cropRect.height) / 2,
      });

      fabricRef.current.add(cropRect);
      fabricRef.current.setActiveObject(cropRect);
      setIsCropping(true);
    } else {
      const cropRect = fabricRef.current.getActiveObject();
      const img = fabricRef.current.backgroundImage;

      if (cropRect && img) {
        const imgElement = img._element;
        const scale = 1 / img.scaleX;

        const left = Math.max(0, (cropRect.left - img.left) * scale);
        const top = Math.max(0, (cropRect.top - img.top) * scale);
        const width = Math.min(
          cropRect.width * cropRect.scaleX * scale,
          imgElement.width - left
        );
        const height = Math.min(
          cropRect.height * cropRect.scaleY * scale,
          imgElement.height - top
        );

        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d");
        tempCanvas.width = width;
        tempCanvas.height = height;

        tempContext.drawImage(
          imgElement,
          left,
          top,
          width,
          height,
          0,
          0,
          width,
          height
        );

        fabric.Image.fromURL(
          tempCanvas.toDataURL(),
          async (croppedImg) => {
            const canvasWidth = fabricRef.current.width;
            const canvasHeight = fabricRef.current.height;
            const scale = Math.min(canvasWidth / width, canvasHeight / height);

            croppedImg.scale(scale);
            croppedImg.center();

            fabricRef.current.setBackgroundImage(
              croppedImg,
              fabricRef.current.renderAll.bind(fabricRef.current)
            );

            fabricRef.current.remove(cropRect);
            fabricRef.current.renderAll();

            try {
              const dataUrl = fabricRef.current.toDataURL({
                format: "jpeg",
                quality: 0.8,
              });

              await saveImageChanges(imageId, {
                imageData: dataUrl,
                filters,
              });

              saveToHistory();

              socket.emit("edit", {
                imageId,
                imageData: dataUrl,
                filters,
              });
            } catch (error) {
              console.error("Error saving cropped image:", error);
              alert("Failed to save cropped image");
            }
          },
          { crossOrigin: "anonymous" }
        );
      }

      setIsCropping(false);
    }
  };

  useEffect(() => {
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      alert("Lost connection to server. Changes may not be saved.");
    });

    socket.on("reconnect", () => {
      console.log("Reconnected to server");
    });

    return () => {
      socket.off("connect_error");
      socket.off("reconnect");
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 1, sm: 2 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1, sm: 2 }}
        alignItems="center"
      >
        <ButtonGroup
          variant="contained"
          orientation={isMobile ? "vertical" : "horizontal"}
        >
          <Tooltip title="Undo">
            <span>
              <IconButton
                onClick={handleUndo}
                disabled={currentStep <= 0}
                size={isMobile ? "large" : "medium"}
              >
                <Undo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo">
            <span>
              <IconButton
                onClick={handleRedo}
                disabled={currentStep >= history.length - 1}
                size={isMobile ? "large" : "medium"}
              >
                <Redo />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup variant="contained">
          <Tooltip title="Rotate Left">
            <span>
              <IconButton
                onClick={() => handleRotate(-90)}
                size={isMobile ? "large" : "medium"}
              >
                <RotateLeft />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rotate Right">
            <span>
              <IconButton
                onClick={() => handleRotate(90)}
                size={isMobile ? "large" : "medium"}
              >
                <RotateRight />
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>

        <Button
          variant="contained"
          color="success"
          startIcon={<Save />}
          onClick={handleSave}
          fullWidth={isMobile}
          size={isMobile ? "large" : "medium"}
        >
          Save Changes
        </Button>

        <Tooltip title="Crop">
          <IconButton
            onClick={handleCrop}
            color={isCropping ? "primary" : "default"}
          >
            <Crop />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box
        ref={containerRef}
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          overflow: "hidden",
          width: "100%",
          height: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          position: "relative",
          "& .canvas-container": {
            margin: "0 auto",
            position: "relative !important",
          },
        }}
      >
        <canvas ref={canvasRef} />
      </Box>
    </Box>
  );
};

export default RealTimeEditor;
