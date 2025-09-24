import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  Box,
  Stack
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Location } from '../types/api';
import { apiService } from '../services/api';

interface LocationDialogProps {
  open: boolean;
  onClose: () => void;
  onLocationCreated: (location: Location) => void;
}

const LocationDialog: React.FC<LocationDialogProps> = ({
  open,
  onClose,
  onLocationCreated
}) => {
  const [newLocation, setNewLocation] = useState<Partial<Location>>({
    name: '',
    address: '',
    city: '',
    country: 'Argentina',
    capacity: 100,
    contact_email: '',
    contact_phone: '',
    website: '',
    notes: '',
    is_active: true
  });

  const [creating, setCreating] = useState(false);

  const handleClose = () => {
    setNewLocation({
      name: '',
      address: '',
      city: '',
      country: 'Argentina',
      capacity: 100,
      contact_email: '',
      contact_phone: '',
      website: '',
      notes: '',
      is_active: true
    });
    onClose();
  };

  const handleCreate = async () => {
    try {
      setCreating(true);
      const createdLocation = await apiService.createLocation(
        newLocation as Omit<Location, 'id' | 'created_at' | 'updated_at'>
      );
      onLocationCreated(createdLocation);
      handleClose();
    } catch (error) {
      console.error('Error creating location:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleChange = (field: keyof Location) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'capacity'
      ? parseInt(e.target.value) || 0
      : e.target.value;

    setNewLocation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>Nueva Ubicación</span>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Nombre del lugar"
              value={newLocation.name}
              onChange={handleChange('name')}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Ciudad"
              value={newLocation.city}
              onChange={handleChange('city')}
              margin="normal"
              required
            />
          </Stack>

          <TextField
            fullWidth
            label="Dirección"
            value={newLocation.address}
            onChange={handleChange('address')}
            margin="normal"
            required
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="País"
              value={newLocation.country}
              onChange={handleChange('country')}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Capacidad"
              type="number"
              value={newLocation.capacity}
              onChange={handleChange('capacity')}
              margin="normal"
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Email de contacto"
              type="email"
              value={newLocation.contact_email || ''}
              onChange={handleChange('contact_email')}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Teléfono de contacto"
              value={newLocation.contact_phone || ''}
              onChange={handleChange('contact_phone')}
              margin="normal"
            />
          </Stack>

          <TextField
            fullWidth
            label="Sitio web"
            value={newLocation.website || ''}
            onChange={handleChange('website')}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Notas adicionales"
            value={newLocation.notes || ''}
            onChange={handleChange('notes')}
            multiline
            rows={2}
            margin="normal"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={creating}>
          Cancelar
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          color="primary"
          disabled={creating || !newLocation.name || !newLocation.city || !newLocation.address}
        >
          {creating ? 'Guardando...' : 'Guardar Ubicación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationDialog;