import React, { useState } from 'react';
import { Event } from '../types/api';
import EventTable from './EventTable';
import EventDetail from './EventDetail';

const EventManager: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    setIsCreating(false);
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setIsCreating(true);
  };

  const handleBack = () => {
    setSelectedEvent(null);
    setIsCreating(false);
  };

  const handleSave = (event: Event) => {
    // Actualizar el evento en la lista o agregarlo si es nuevo
    setSelectedEvent(event);
    setIsCreating(false);
    // Aquí podrías agregar lógica adicional como refrescar la tabla
  };

  if (selectedEvent || isCreating) {
    return (
      <EventDetail
        event={selectedEvent}
        onBack={handleBack}
        onSave={handleSave}
        isCreating={isCreating}
      />
    );
  }

  return (
    <EventTable 
      onEventSelect={handleEventSelect}
      onCreateNew={handleCreateNew}
    />
  );
};

export default EventManager;
