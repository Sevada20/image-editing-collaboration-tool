import { useState, useCallback, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Stack,
  Slider,
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import RealTimeEditor from "@/components/RealTimeEditor";
import debounce from "lodash/debounce";
import { getImage } from "@/api";

const Editor = () => {
  const { id } = useParams();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);

  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    grayscale: 0,
  });

  const debouncedSetFilters = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
    }, 300),
    []
  );

  const handleFilterChange = (filter) => (event, value) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [filter]: value,
      };
      debouncedSetFilters(newFilters);
      return newFilters;
    });
  };

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  useEffect(() => {
    return () => {
      debouncedSetFilters.cancel();
    };
  }, []);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);

        // Сначала пробуем получить URL из location.state
        if (location.state?.imageUrl) {
          setImageUrl(location.state.imageUrl);
          setLoading(false);
          return;
        }

        // Если нет location.state, получаем данные с сервера
        const imageData = await getImage(id);
        if (!imageData) {
          throw new Error("Image not found");
        }

        const fullImageUrl = `http://localhost:5000/uploads/${imageData.filename}`;
        setImageUrl(fullImageUrl);

        // Если есть сохраненные фильтры, применяем их
        if (imageData.currentFilters) {
          setFilters(imageData.currentFilters);
        }
      } catch (error) {
        console.error("Error loading image:", error);
        // Можно добавить уведомление пользователю
        alert("Error loading image: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchImage();
    }
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: { xs: 2, sm: 4, md: 8 },
        p: { xs: 1, sm: 2, md: 3 },
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <RealTimeEditor
          imageId={id}
          imageUrl={imageUrl}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          isMobile={isMobile}
        />
      </Box>
      <Box
        sx={{
          width: { xs: "100%", md: 250 },
          position: { xs: "static", md: "sticky" },
          top: { md: 24 },
          alignSelf: { md: "flex-start" },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Editing Tools
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography>Brightness</Typography>
            <Slider
              value={filters.brightness}
              onChange={handleFilterChange("brightness")}
              min={0}
              max={200}
              step={5}
              sx={{
                width: "100%",
                "& .MuiSlider-thumb": {
                  width: isMobile ? 20 : 16,
                  height: isMobile ? 20 : 16,
                },
              }}
            />
          </Box>
          <Box>
            <Typography>Contrast</Typography>
            <Slider
              value={filters.contrast}
              onChange={handleFilterChange("contrast")}
              min={0}
              max={200}
              step={5}
              sx={{
                width: "100%",
                "& .MuiSlider-thumb": {
                  width: isMobile ? 20 : 16,
                  height: isMobile ? 20 : 16,
                },
              }}
            />
          </Box>
          <Box>
            <Typography>Grayscale</Typography>
            <Slider
              value={filters.grayscale}
              onChange={handleFilterChange("grayscale")}
              min={0}
              max={100}
              step={5}
              sx={{
                width: "100%",
                "& .MuiSlider-thumb": {
                  width: isMobile ? 20 : 16,
                  height: isMobile ? 20 : 16,
                },
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Editor;
