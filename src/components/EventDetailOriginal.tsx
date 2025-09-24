import React, { useState, useEffect } from 'react';
import { parseISO, format } from 'date-fns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Paper,
  Divider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Event, Location, Repertoire } from '../types/api';
import { apiService } from '../services/api';
import './EventDetail.css';

interface EventDetailProps {
  event?: Event | null;
  onBack: () => void;
  onSave: (event: Event) => void;
  isCreating?: boolean;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onBack, onSave, isCreating = false }) => {
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
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
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


  const handleLocationChange = (e: SelectChangeEvent<number | string>) => {
    const locationId = e.target.value as number;
    const selectedLocation = locations.find(loc => loc.id === locationId);
    
    if (selectedLocation) {
      setFormData(prev => ({
        ...prev,
        location: locationId,
        location_details: {
          name: selectedLocation.name,
          address: selectedLocation.address,
          city: selectedLocation.city
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        location: locationId,
        location_details: undefined
      }));
    }
  };

  const handleRepertoireChange = (e: SelectChangeEvent<number | string>) => {
    const repertoireId = e.target.value as number | '';
    setFormData(prev => ({
      ...prev,
      repertoire: repertoireId || null
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

  const handleCreateLocation = async () => {
    try {
      const newLocationData = await apiService.createLocation(newLocation as Omit<Location, 'id' | 'created_at' | 'updated_at'>);
      setLocations([...locations, newLocationData]);
      setFormData(prev => ({
        ...prev,
        location: newLocationData.id
      }));
      setLocationDialogOpen(false);
      setNewLocation({
        name: '',
        address: '',
        city: '',
        country: 'Argentina',
        capacity: 100,
        is_active: true
      });
    } catch (err) {
      console.error('Error creating location:', err);
      setError('Error al crear la ubicación');
    }
  };


  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
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

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <DateTimePicker
                    label="Fecha y hora de inicio"
                    value={formData.start_time ? parseISO(formData.start_time) : null}
                    onChange={(value) => handleDateTimeChange('start_time', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal' as const,
                        required: true
                      }
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <DateTimePicker
                    label="Fecha y hora de finalización (opcional)"
                    value={formData.end_time ? parseISO(formData.end_time) : null}
                    onChange={(value) => handleDateTimeChange('end_time', value)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        margin: 'normal' as const
                      }
                    }}
                  />
                </Box>
              </Stack>
            </LocalizationProvider>

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
                    value={formData.location || ''}
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
                  onClick={() => setLocationDialogOpen(true)}
                >
                  Nueva
                </Button>
              </Box>
            </Box>

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
        <Box sx={{ width: { xs: '100%', md: '400px' } }}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Vista previa del evento
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="subtitle1" color="textSecondary">
                Título:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.title || 'Sin título'}
              </Typography>

              <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
                Fecha y hora:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.start_time ? format(new Date(formData.start_time), 'PPPppp') : 'No especificado'}
              </Typography>

              {formData.location_details && (
                <>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
                    Ubicación:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.location_details.name}
                    <br />
                    {formData.location_details.address}
                    <br />
                    {formData.location_details.city}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
                Visibilidad:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formData.is_public ? 'Público' : 'Privado'}
              </Typography>

              {formData.max_attendees && (
                <>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
                    Aforo máximo:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formData.max_attendees} personas
                  </Typography>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Dialog 
        open={locationDialogOpen} 
        onClose={() => setLocationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <span>Nueva Ubicación</span>
            <IconButton onClick={() => setLocationDialogOpen(false)}>
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
                onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Ciudad"
                value={newLocation.city}
                onChange={(e) => setNewLocation({...newLocation, city: e.target.value})}
                margin="normal"
                required
              />
            </Stack>

            <TextField
              fullWidth
              label="Dirección"
              value={newLocation.address}
              onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
              margin="normal"
              required
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="País"
                value={newLocation.country}
                onChange={(e) => setNewLocation({...newLocation, country: e.target.value})}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Capacidad"
                type="number"
                value={newLocation.capacity}
                onChange={(e) => setNewLocation({...newLocation, capacity: parseInt(e.target.value) || 0})}
                margin="normal"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Email de contacto"
                type="email"
                value={newLocation.contact_email || ''}
                onChange={(e) => setNewLocation({...newLocation, contact_email: e.target.value})}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Teléfono de contacto"
                value={newLocation.contact_phone || ''}
                onChange={(e) => setNewLocation({...newLocation, contact_phone: e.target.value})}
                margin="normal"
              />
            </Stack>

            <TextField
              fullWidth
              label="Sitio web"
              value={newLocation.website || ''}
              onChange={(e) => setNewLocation({...newLocation, website: e.target.value})}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Notas adicionales"
              value={newLocation.notes || ''}
              onChange={(e) => setNewLocation({...newLocation, notes: e.target.value})}
              multiline
              rows={2}
              margin="normal"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleCreateLocation} 
            variant="contained" 
            color="primary"
            disabled={!newLocation.name || !newLocation.city || !newLocation.address}
          >
            Guardar Ubicación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventDetail;
