import React, { useState, useEffect } from 'react';
import { Box, Button, Alert } from '@mui/material';
import { Plus } from 'lucide-react';
import DataTable, { Column, formatDate, formatStatus } from '../components/common/DataTable';
import FormDialog, { FormField } from '../components/common/FormDialog';
import Layout from '../components/common/Layout';
import { Event, Location, Repertoire } from '../types/api';
import { apiService } from '../services/api';

const eventFields: FormField[] = [
  { key: 'title', label: 'Título', type: 'text', required: true },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  {
    key: 'event_type',
    label: 'Tipo de Evento',
    type: 'select',
    required: true,
    options: [
      { value: 'CONCERT', label: 'Concierto' },
      { value: 'REHEARSAL', label: 'Ensayo' },
      { value: 'RECORDING', label: 'Grabación' },
      { value: 'WORKSHOP', label: 'Taller' },
      { value: 'OTHER', label: 'Otro' },
    ]
  },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    required: true,
    options: [
      { value: 'DRAFT', label: 'Borrador' },
      { value: 'CONFIRMED', label: 'Confirmado' },
      { value: 'CANCELLED', label: 'Cancelado' },
      { value: 'COMPLETED', label: 'Completado' },
    ]
  },
  { key: 'start_datetime', label: 'Fecha y Hora de Inicio', type: 'datetime-local', required: true },
  { key: 'end_datetime', label: 'Fecha y Hora de Fin', type: 'datetime-local' },
  { key: 'location_id', label: 'Ubicación', type: 'select', options: [] },
  { key: 'repertoire_id', label: 'Repertorio', type: 'select', options: [] },
  { key: 'is_public', label: 'Evento Público', type: 'boolean' },
  { key: 'max_attendees', label: 'Máximo de Asistentes', type: 'number' },
];

const columns: Column<Event>[] = [
  {
    key: 'title',
    label: 'Título',
    sortable: true,
  },
  {
    key: 'event_type',
    label: 'Tipo',
    render: (value) => {
      const types: Record<string, string> = {
        CONCERT: 'Concierto',
        REHEARSAL: 'Ensayo',
        RECORDING: 'Grabación',
        WORKSHOP: 'Taller',
        OTHER: 'Otro',
      };
      return types[value] || value;
    },
  },
  {
    key: 'start_datetime',
    label: 'Fecha de Inicio',
    sortable: true,
    render: (value) => formatDate(value),
  },
  {
    key: 'location',
    label: 'Ubicación',
    render: (value, row) => {
      if (typeof value === 'object' && value) {
        return `${value.name}, ${value.city}`;
      }
      return '-';
    },
  },
  {
    key: 'status',
    label: 'Estado',
    render: (value) => formatStatus(value),
  },
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [repertoires, setRepertoires] = useState<Repertoire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, locationsData, repertoiresData] = await Promise.all([
        apiService.getEvents({ page: page + 1, page_size: rowsPerPage }),
        apiService.getLocations(),
        apiService.getRepertoires(),
      ]);

      setEvents(eventsData.results || []);
      setTotalCount(eventsData.count || 0);
      setLocations(locationsData.results || []);
      setRepertoires(repertoiresData.results || []);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      event_type: 'OTHER',
      status: 'DRAFT',
      is_public: false,
      max_attendees: 0,
    });
    setDialogOpen(true);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      ...event,
      location_id: event.location_id || null,
      repertoire_id: event.repertoire_id || null,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (event: Event) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${event.title}"?`)) {
      return;
    }

    try {
      await apiService.deleteEvent(event.id);
      await loadData();
    } catch (err) {
      setError('Error al eliminar el evento');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const eventData = {
        ...formData,
        location_id: formData.location_id || undefined,
        repertoire_id: formData.repertoire_id || undefined,
      };

      if (editingEvent) {
        await apiService.updateEvent(editingEvent.id, eventData);
      } else {
        await apiService.createEvent(eventData as Omit<Event, 'id' | 'created_at' | 'updated_at'>);
      }

      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar el evento');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Update field options
  const fieldsWithOptions = eventFields.map(field => {
    if (field.key === 'location_id') {
      return {
        ...field,
        options: locations.map(loc => ({
          value: loc.id,
          label: `${loc.name}, ${loc.city}`,
        })),
      };
    }
    if (field.key === 'repertoire_id') {
      return {
        ...field,
        options: repertoires.map(rep => ({
          value: rep.id,
          label: rep.name,
        })),
      };
    }
    return field;
  });

  return (
    <Layout title="Eventos">
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleCreate}
          >
            Nuevo Evento
          </Button>
        </Box>

        <DataTable
          title="Eventos"
          data={events}
          columns={columns}
          loading={loading}
          error={error}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <FormDialog
          open={dialogOpen}
          title={editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
          fields={fieldsWithOptions}
          values={formData}
          onChange={handleFormChange}
          onClose={() => setDialogOpen(false)}
          onSave={handleSave}
          loading={saving}
          error={error}
        />
      </Box>
    </Layout>
  );
}