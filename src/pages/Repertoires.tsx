import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, Chip } from '@mui/material';
import { Plus, Users } from 'lucide-react';
import DataTable, { Column } from '../components/common/DataTable';
import FormDialog, { FormField } from '../components/common/FormDialog';
import Layout from '../components/common/Layout';
import { Repertoire } from '../types/api';
import { apiService } from '../services/api';

const repertoireFields: FormField[] = [
  { key: 'name', label: 'Nombre', type: 'text', required: true },
  { key: 'description', label: 'Descripción', type: 'textarea' },
  { key: 'is_active', label: 'Activo', type: 'boolean' },
];

const columns: Column<Repertoire>[] = [
  {
    key: 'name',
    label: 'Nombre',
    sortable: true,
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Users size={16} />
        {value}
      </Box>
    ),
  },
  {
    key: 'description',
    label: 'Descripción',
    render: (value) => value || '-',
  },
  {
    key: 'version_count',
    label: 'Versiones',
    render: (value) => (
      <Chip
        label={value || 0}
        size="small"
        color={value > 0 ? 'success' : 'default'}
        variant="outlined"
      />
    ),
  },
  {
    key: 'is_active',
    label: 'Estado',
    render: (value) => (
      <Chip
        label={value ? 'Activo' : 'Inactivo'}
        size="small"
        color={value ? 'success' : 'default'}
      />
    ),
  },
];

export default function Repertoires() {
  const [repertoires, setRepertoires] = useState<Repertoire[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRepertoire, setEditingRepertoire] = useState<Repertoire | null>(null);
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
      const data = await apiService.getRepertoires();

      setRepertoires(Array.isArray(data) ? data : data.results || []);
      setTotalCount(Array.isArray(data) ? data.length : data.count || 0);
    } catch (err) {
      setError('Error al cargar los repertorios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRepertoire(null);
    setFormData({
      name: '',
      description: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (repertoire: Repertoire) => {
    setEditingRepertoire(repertoire);
    setFormData({ ...repertoire });
    setDialogOpen(true);
  };

  const handleDelete = async (repertoire: Repertoire) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${repertoire.name}"?`)) {
      return;
    }

    try {
      await apiService.deleteRepertoire(repertoire.id);
      await loadData();
    } catch (err) {
      setError('Error al eliminar el repertorio');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const repertoireData = {
        ...formData,
        version_count: 0, // Will be calculated by backend
        versions: [], // Empty initially
      };

      if (editingRepertoire) {
        await apiService.updateRepertoire(editingRepertoire.id, repertoireData);
      } else {
        await apiService.createRepertoire(repertoireData as Omit<Repertoire, 'id' | 'created_at' | 'updated_at'>);
      }

      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar el repertorio');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Layout title="Repertorios">
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
            Nuevo Repertorio
          </Button>
        </Box>

        <DataTable
          title="Repertorios"
          data={repertoires}
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
          title={editingRepertoire ? 'Editar Repertorio' : 'Nuevo Repertorio'}
          fields={repertoireFields}
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