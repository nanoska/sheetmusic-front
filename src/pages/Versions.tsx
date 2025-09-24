import React, { useState, useEffect } from 'react';
import { Box, Button, Alert, Chip, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Plus, FileMusic, Music } from 'lucide-react';
import DataTable, { Column } from '../components/common/DataTable';
import FormDialog, { FormField } from '../components/common/FormDialog';
import Layout from '../components/common/Layout';
import { Version, Theme } from '../types/api';
import { apiService } from '../services/api';

const versionFields: FormField[] = [
  { key: 'title', label: 'Título', type: 'text', required: true },
  { key: 'theme_id', label: 'Tema', type: 'select', required: true, options: [] },
  {
    key: 'version_type',
    label: 'Tipo de Versión',
    type: 'select',
    required: true,
    options: [
      { value: 'Standard', label: 'Standard' },
      { value: 'Ensamble', label: 'Ensamble' },
      { value: 'Dueto', label: 'Dueto' },
      { value: 'Grupo Reducido', label: 'Grupo Reducido' },
    ]
  },
  { key: 'notes', label: 'Notas', type: 'textarea' },
];

const columns: Column<Version>[] = [
  {
    key: 'title',
    label: 'Título',
    sortable: true,
    render: (value) => (
      <Box display="flex" alignItems="center" gap={1}>
        <FileMusic size={16} />
        {value}
      </Box>
    ),
  },
  {
    key: 'theme',
    label: 'Tema',
    render: (value, row) => {
      if (typeof value === 'object' && value) {
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Music size={16} />
            {value.title}
          </Box>
        );
      }
      return '-';
    },
  },
  {
    key: 'version_type',
    label: 'Tipo',
    render: (value) => (
      <Chip
        label={value}
        size="small"
        color="primary"
        variant="outlined"
      />
    ),
  },
  {
    key: 'sheet_music_count',
    label: 'Partituras',
    render: (value) => (
      <Chip
        label={value || 0}
        size="small"
        color={value > 0 ? 'success' : 'default'}
      />
    ),
  },
];

export default function Versions() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedTheme, setSelectedTheme] = useState<number | ''>('');
  const [selectedType, setSelectedType] = useState<string | ''>('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage, selectedTheme, selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [versionsData, themesData] = await Promise.all([
        apiService.getVersions(),
        apiService.getThemes(),
      ]);

      let filteredVersions = Array.isArray(versionsData) ? versionsData : versionsData.results || [];

      // Apply filters
      if (selectedTheme) {
        filteredVersions = filteredVersions.filter(v =>
          (typeof v.theme === 'object' ? v.theme.id : v.theme_id) === selectedTheme
        );
      }

      if (selectedType) {
        filteredVersions = filteredVersions.filter(v => v.version_type === selectedType);
      }

      setVersions(filteredVersions);
      setTotalCount(filteredVersions.length);
      setThemes(Array.isArray(themesData) ? themesData : themesData.results || []);
    } catch (err) {
      setError('Error al cargar las versiones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingVersion(null);
    setFormData({
      title: '',
      theme_id: '',
      version_type: 'Standard',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEdit = (version: Version) => {
    setEditingVersion(version);
    setFormData({
      ...version,
      theme_id: typeof version.theme === 'object' ? version.theme.id : version.theme_id,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (version: Version) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${version.title}"?`)) {
      return;
    }

    try {
      await apiService.deleteVersion(version.id);
      await loadData();
    } catch (err) {
      setError('Error al eliminar la versión');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (editingVersion) {
        await apiService.updateVersion(editingVersion.id, formData);
      } else {
        await apiService.createVersion(formData as Omit<Version, 'id' | 'created_at' | 'updated_at'>);
      }

      setDialogOpen(false);
      await loadData();
    } catch (err) {
      setError('Error al guardar la versión');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Update field options with themes
  const fieldsWithOptions = versionFields.map(field => {
    if (field.key === 'theme_id') {
      return {
        ...field,
        options: themes.map(theme => ({
          value: theme.id,
          label: theme.title,
        })),
      };
    }
    return field;
  });

  return (
    <Layout title="Versiones de Temas">
      <Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters and Actions */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar por Tema</InputLabel>
            <Select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as number | '')}
              label="Filtrar por Tema"
            >
              <MenuItem value="">Todos los temas</MenuItem>
              {themes.map((theme) => (
                <MenuItem key={theme.id} value={theme.id}>
                  {theme.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Filtrar por Tipo</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              label="Filtrar por Tipo"
            >
              <MenuItem value="">Todos los tipos</MenuItem>
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Ensamble">Ensamble</MenuItem>
              <MenuItem value="Dueto">Dueto</MenuItem>
              <MenuItem value="Grupo Reducido">Grupo Reducido</MenuItem>
            </Select>
          </FormControl>

          <Box flexGrow={1} />

          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleCreate}
          >
            Nueva Versión
          </Button>
        </Box>

        <DataTable
          title="Versiones de Temas Musicales"
          data={versions}
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
          title={editingVersion ? 'Editar Versión' : 'Nueva Versión'}
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