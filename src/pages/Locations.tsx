import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, Chip } from '@mui/material';
import { Plus, MapPin } from 'lucide-react';
import DataTable, { Column } from '../components/common/DataTable';
import FormDialog, { FormField } from '../components/common/FormDialog';
import Layout from '../components/common/Layout';
import { Location } from '../types/api';
import { apiService } from '../services/api';

const locationFields: FormField[] = [
  { key: 'name', label: 'Nombre', type: 'text', required: true },
  { key: 'address', label: 'Dirección', type: 'text', required: true },
  { key: 'city', label: 'Ciudad', type: 'text', required: true },
  { key: 'postal_code', label: 'Código Postal', type: 'text' },
  { key: 'capacity', label: 'Capacidad', type: 'number' },
  { key: 'contact_email', label: 'Email de Contacto', type: 'email' },
  { key: 'contact_phone', label: 'Teléfono', type: 'text' },
  { key: 'website', label: 'Sitio Web', type: 'text' },
  { key: 'notes', label: 'Notas', type: 'textarea' },
];

const columns: Column<Location>[] = [
  {
    key: 'name',
    label: 'Nombre',
    sortable: true,
    render: (value, row) => (
      <Box display="flex" alignItems="center" gap={1}>
        <MapPin size={16} />
        {value}
      </Box>
    ),
  },
  {
    key: 'address',
    label: 'Dirección',
    render: (value, row) => `${value}, ${row.city}`,
  },
  {
    key: 'capacity',
    label: 'Capacidad',
    render: (value) => value ? (
      <Chip
        label={`${value} personas`}
        size="small"
        color="primary"
        variant="outlined"
      />
    ) : '-',
  },
  {
    key: 'contact_email',
    label: 'Contacto',
    render: (value, row) => {
      const contacts = [];
      if (value) contacts.push(value);
      if (row.contact_phone) contacts.push(row.contact_phone);
      return contacts.length > 0 ? contacts.join(' • ') : '-';
    },
  },
];

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
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
      const data = await apiService.getLocations();

      setLocations(Array.isArray(data) ? data : data.results || []);
      setTotalCount(Array.isArray(data) ? data.length : data.count || 0);
    } catch (err) {
      setError('Error al cargar las ubicaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      postal_code: '',
      capacity: 0,
      contact_email: '',
      contact_phone: '',
      website: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({ ...location });
    setDialogOpen(true);
  };

  const handleDelete = async (location: Location) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${location.name}"?`)) {
      return;
    }

    try {
      await apiService.deleteLocation(location.id);
      await loadData();
    } catch (err) {
      setError('Error al eliminar la ubicación');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const locationData = {
        ...formData,
        capacity: formData.capacity || 0,
      };

      if (editingLocation) {
        await apiService.updateLocation(editingLocation.id, locationData);
      } else {
        await apiService.createLocation(locationData as Omit<Location, 'id' | 'created_at' | 'updated_at'>);
      }

      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar la ubicación');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Layout title="Ubicaciones">
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
            Nueva Ubicación
          </Button>
        </Box>

        <DataTable
          title="Ubicaciones"
          data={locations}
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
          title={editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}
          fields={locationFields}
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