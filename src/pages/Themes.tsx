import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, Chip } from '@mui/material';
import { Plus } from 'lucide-react';
import DataTable, { Column } from '../components/common/DataTable';
import FormDialog, { FormField } from '../components/common/FormDialog';
import Layout from '../components/common/Layout';
import { Theme } from '../types/api';
import { apiService } from '../services/api';

const themeFields: FormField[] = [
  { key: 'title', label: 'Título', type: 'text', required: true },
  { key: 'artist', label: 'Artista', type: 'text', required: true },
  { key: 'tonality', label: 'Tonalidad', type: 'text' },
  { key: 'description', label: 'Descripción', type: 'textarea' },
];

const columns: Column<Theme>[] = [
  {
    key: 'title',
    label: 'Título',
    sortable: true,
  },
  {
    key: 'artist',
    label: 'Artista',
    sortable: true,
  },
  {
    key: 'tonality',
    label: 'Tonalidad',
    render: (value) => value ? (
      <Chip label={value} size="small" variant="outlined" />
    ) : '-',
  },
  {
    key: 'version_count',
    label: 'Versiones',
    render: (value) => (
      <Chip
        label={value || 0}
        size="small"
        color={value > 0 ? 'primary' : 'default'}
      />
    ),
  },
];

export default function Themes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
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
      const data = await apiService.getThemes();

      setThemes(Array.isArray(data) ? data : data.results || []);
      setTotalCount(Array.isArray(data) ? data.length : data.count || 0);
    } catch (err) {
      setError('Error al cargar los temas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTheme(null);
    setFormData({
      title: '',
      artist: '',
      tonality: '',
      description: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
    setFormData({ ...theme });
    setDialogOpen(true);
  };

  const handleDelete = async (theme: Theme) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${theme.title}"?`)) {
      return;
    }

    try {
      await apiService.deleteTheme(theme.id);
      await loadData();
    } catch (err) {
      setError('Error al eliminar el tema');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (editingTheme) {
        await apiService.updateTheme(editingTheme.id, formData);
      } else {
        await apiService.createTheme(formData as Omit<Theme, 'id' | 'created_at' | 'updated_at'>);
      }

      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar el tema');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Layout title="Temas Musicales">
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
            Nuevo Tema
          </Button>
        </Box>

        <DataTable
          title="Temas Musicales"
          data={themes}
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
          title={editingTheme ? 'Editar Tema' : 'Nuevo Tema'}
          fields={themeFields}
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