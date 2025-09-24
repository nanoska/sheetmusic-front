import React, { useState, useEffect } from 'react';
import { Event } from '../types/api';
import { apiService } from '../services/api';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, TablePagination, TableSortLabel, Box, IconButton, Tooltip } from '@mui/material';
import { Add, Edit, Delete, LocationOn, Event as EventIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './EventTable.css';

interface EventTableProps {
  onEventSelect: (event: Event) => void;
  onCreateNew: () => void;
}

const EventTable: React.FC<EventTableProps> = ({ onEventSelect, onCreateNew }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Event>('start_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchTerm, sortField, sortDirection]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1, // API is 1-indexed, MUI is 0-indexed
        page_size: rowsPerPage,
        ordering: `${sortDirection === 'desc' ? '-' : ''}${sortField}`,
        search: searchTerm || undefined
      };
      const { results, count } = await apiService.getEvents(params);
      setEvents(results);
      setTotalCount(count);
    } catch (err: any) {
      setError('Error al cargar los eventos');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let filtered = events.filter(event => {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        (event.description && event.description.toLowerCase().includes(searchLower)) ||
        (typeof event.location !== 'number' && 
          (event.location.name.toLowerCase().includes(searchLower) ||
           event.location.city.toLowerCase().includes(searchLower)))
      );
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    setFilteredEvents(filtered);
  };

  const handleSort = (field: keyof Event) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';
    setSortDirection(newDirection);
    setSortField(field);
    setPage(0);
    loadEvents();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    loadEvents();
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadEvents();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Load events when search term changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      try {
        await apiService.deleteEvent(id);
        setEvents(events.filter(event => event.id !== id));
      } catch (err) {
        console.error('Error deleting event:', err);
        alert('No se pudo eliminar el evento');
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "PPpp", { locale: es });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'status-scheduled';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  if (loading) {
    return <div>Cargando eventos...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="event-table-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <h2>Eventos</h2>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={onCreateNew}
        >
          Nuevo Evento
        </Button>
      </Box>

      <Box mb={2}>
        <TextField
          label="Buscar eventos..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'title'}
                  direction={sortField === 'title' ? sortDirection : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Título
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'start_time'}
                  direction={sortField === 'start_time' ? sortDirection : 'asc'}
                  onClick={() => handleSort('start_time')}
                >
                  Fecha y Hora
                </TableSortLabel>
              </TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortDirection : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Estado
                </TableSortLabel>
              </TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvents
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((event) => (
                <TableRow 
                  key={event.id} 
                  hover 
                  onClick={() => onEventSelect(event)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <div className="event-title">
                      <EventIcon color="action" style={{ marginRight: 8 }} />
                      {event.title}
                    </div>
                    {event.description && (
                      <div className="event-description">
                        {event.description.length > 100
                          ? `${event.description.substring(0, 100)}...`
                          : event.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(event.start_time)}</TableCell>
                  <TableCell>
                    {typeof event.location !== 'number' && (
                      <div className="event-location">
                        <LocationOn fontSize="small" color="action" style={{ marginRight: 4 }} />
                        {event.location.name}, {event.location.city}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`status-badge ${getStatusColor(event.status)}`}>
                      {event.status === 'scheduled' ? 'Programado' : 
                       event.status === 'completed' ? 'Completado' : 'Cancelado'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Editar">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventSelect(event);
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleDelete(event.id, e)}
                      >
                        <Delete fontSize="small" color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
      />
    </div>
  );
};

export default EventTable;
