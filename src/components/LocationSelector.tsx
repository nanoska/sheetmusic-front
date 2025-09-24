import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Location } from '../types/api';
import LocationDialog from './LocationDialog';

interface LocationSelectorProps {
  locations: Location[];
  selectedLocationId: number | null;
  onLocationChange: (locationId: number, locationDetails?: {
    name: string;
    address: string;
    city: string;
  }) => void;
  onLocationCreated: (location: Location) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  locations,
  selectedLocationId,
  onLocationChange,
  onLocationCreated
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLocationChange = (e: SelectChangeEvent<number | string>) => {
    const locationId = e.target.value as number;
    const selectedLocation = locations.find(loc => loc.id === locationId);

    if (selectedLocation) {
      onLocationChange(locationId, {
        name: selectedLocation.name,
        address: selectedLocation.address,
        city: selectedLocation.city
      });
    } else {
      onLocationChange(locationId);
    }
  };

  const handleLocationCreated = (location: Location) => {
    onLocationCreated(location);
    onLocationChange(location.id, {
      name: location.name,
      address: location.address,
      city: location.city
    });
  };

  return (
    <>
      <Box mt={2}>
        <Typography variant="subtitle1" gutterBottom>
          Ubicación
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="location-label">Ubicación</InputLabel>
            <Select
              labelId="location-label"
              id="location"
              name="location"
              value={selectedLocationId || ''}
              onChange={handleLocationChange}
              fullWidth
            >
              {locations.map((loc) => (
                <MenuItem key={loc.id} value={loc.id}>
                  {loc.name}, {loc.city}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            Nueva
          </Button>
        </Box>
      </Box>

      <LocationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onLocationCreated={handleLocationCreated}
      />
    </>
  );
};

export default LocationSelector;