import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Paper,
  Stack
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Event, Location, Repertoire } from '../types/api';
import { apiService } from '../services/api';
import EventPreview from './EventPreview';
import DateTimeFields from './DateTimeFields';
import LocationSelector from './LocationSelector';
import './EventDetail.css';

interface EventDetailProps {
  event?: Event | null;
  onBack: () => void;
  onSave: (event: Event) => void;
  isCreating?: boolean;
}

const EventDetail: React.FC<EventDetailProps> = ({
  event,
  onBack,
  onSave,
  isCreating = false
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    location: number | null;
    repertoire: number | null;
    start_time: string;
    end_time: string;
    is_public: boolean;
    max_attendees?: number;
    notes?: string;
    location_details?: {
      name: string;
      address: string;
      city: string;
    };
  }>({
    title: '',
    description: '',
    location: null,
    repertoire: null,
    start_time: new Date().toISOString(),
    end_time: '',
    is_public: false,
    max_attendees: undefined,
    notes: ''
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [repertoires, setRepertoires] = useState<Repertoire[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useState('');

  useEffect(() => {
    if (event) {
      const locationId = typeof event.location === 'object' ? event.location.id : event.location;
      const repertoireId = event.repertoire ? (typeof event.repertoire === 'object' ? event.repertoire.id : event.repertoire) : null;

      setFormData({
        title: event.title,
        description: event.description || '',
        start_time: event.start_time || new Date().toISOString(),
        end_time: event.end_time || '',
        location: locationId,
        repertoire: repertoireId,
        is_public: event.is_public,
        max_attendees: event.max_attendees,
        notes: event.notes || '',
        location_details: event.location_details
      });
    }
    loadDependencies();
  }, [event]);

  const loadDependencies = async () => {
    try {
      setLoading(true);
      const [locationsData, repertoiresData] = await Promise.all([
        apiService.getLocations(),
        apiService.getRepertoires()
      ]);
      setLocations(locationsData);
      setRepertoires(repertoiresData);
    } catch (err) {
      console.error('Error loading dependencies:', err);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleDateTimeChange = (field: 'start_time' | 'end_time', value: Date | null) => {
    if (value) {
      setFormData(prev => ({
        ...prev,
        [field]: value.toISOString()
      }));
    }
  };

  const handleLocationChange = (locationId: number, locationDetails?: {
    name: string;
    address: string;
    city: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      location: locationId,
      location_details: locationDetails
    }));
  };

  const handleLocationCreated = (location: Location) => {
    setLocations([...locations, location]);
  };

  const handleRepertoireChange = (e: SelectChangeEvent<number | string>) => {
    const repertoireId = e.target.value as number | '';
    setFormData(prev => ({
      ...prev,
      repertoire: repertoireId || null
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const eventToSave: Partial<Event> & { status: string } = {
        ...formData,
        id: event?.id || 0,
        created_at: event?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'scheduled',
        location: formData.location || 0,
        repertoire: formData.repertoire || undefined,
        start_time: formData.start_time,
        end_time: formData.end_time || undefined,
        is_public: formData.is_public,
        max_attendees: formData.max_attendees,
        notes: formData.notes,
        location_details: formData.location_details
      };

      if (isCreating) {
        const savedEvent = await apiService.createEvent(eventToSave as Event);
        onSave(savedEvent);
      } else if (event?.id) {
        const savedEvent = await apiService.updateEvent(event.id, eventToSave as Event);
        onSave(savedEvent);
      } else {
        throw new Error('No event ID provided for update');
      }
    } catch (err) {
      console.error('Error saving event:', err);
      setError('Error al guardar el evento. Por favor intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        if (event?.id) {
          await apiService.deleteEvent(event.id);
          onBack();
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Error al eliminar el evento');
      }
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Main Form */}
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h2">
                {isCreating ? 'Nuevo Evento' : 'Editar Evento'}
              </Typography>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack}
                color="inherit"
              >
                Volver
              </Button>
            </Box>

            {/* Basic Information */}
            <TextField
              fullWidth
              label="Título del evento"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              required
              margin="normal"
            />

            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              multiline
              rows={4}
              margin="normal"
            />

            {/* Date and Time Fields */}
            <DateTimeFields
              startTime={formData.start_time}
              endTime={formData.end_time}
              onChange={handleDateTimeChange}
            />

            {/* Location Selector */}
            <LocationSelector
              locations={locations}
              selectedLocationId={formData.location}
              onLocationChange={handleLocationChange}
              onLocationCreated={handleLocationCreated}
            />

            {/* Repertoire Selection */}
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Repertorio (opcional)
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel id="repertoire-label">Seleccionar repertorio</InputLabel>
                <Select
                  labelId="repertoire-label"
                  id="repertoire"
                  name="repertoire"
                  value={formData.repertoire || ''}
                  onChange={handleRepertoireChange}
                  fullWidth
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {repertoires.map((rep) => (
                    <MenuItem key={rep.id} value={rep.id}>
                      {rep.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Additional Settings */}
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Configuración adicional
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }} alignItems="flex-start">
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.is_public}
                        onChange={handleCheckboxChange}
                        name="is_public"
                        color="primary"
                      />
                    }
                    label="Evento público"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Aforo máximo (opcional)"
                    type="number"
                    name="max_attendees"
                    value={formData.max_attendees || ''}
                    onChange={handleInputChange}
                    margin="normal"
                    slotProps={{ htmlInput: { min: 1 } }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Notes */}
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Notas adicionales
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                placeholder="Agregar notas adicionales sobre el evento..."
                variant="outlined"
                margin="normal"
              />
            </Box>

            {/* Action Buttons */}
            <Box mt={4} display="flex" justifyContent="space-between">
              <div>
                {!isCreating && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Eliminar
                  </Button>
                )}
              </div>
              <div>
                <Button
                  variant="outlined"
                  onClick={onBack}
                  sx={{ mr: 1 }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </Box>
          </Paper>
        </Box>

        {/* Event Preview */}
        <Box sx={{ width: { xs: '100%', md: '400px' } }}>
          <EventPreview
            title={formData.title}
            startTime={formData.start_time}
            locationDetails={formData.location_details}
            isPublic={formData.is_public}
            maxAttendees={formData.max_attendees}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EventDetail;