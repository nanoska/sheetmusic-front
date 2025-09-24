import React from 'react';
import { format } from 'date-fns';
import {
  Paper,
  Typography,
  Divider,
  Box
} from '@mui/material';

interface LocationDetails {
  name: string;
  address: string;
  city: string;
}

interface EventPreviewProps {
  title: string;
  startTime: string;
  locationDetails?: LocationDetails;
  isPublic: boolean;
  maxAttendees?: number;
}

const EventPreview: React.FC<EventPreviewProps> = ({
  title,
  startTime,
  locationDetails,
  isPublic,
  maxAttendees
}) => {
  return (
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
          {title || 'Sin título'}
        </Typography>

        <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
          Fecha y hora:
        </Typography>
        <Typography variant="body1" gutterBottom>
          {startTime ? format(new Date(startTime), 'PPPppp') : 'No especificado'}
        </Typography>

        {locationDetails && (
          <>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
              Ubicación:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {locationDetails.name}
              <br />
              {locationDetails.address}
              <br />
              {locationDetails.city}
            </Typography>
          </>
        )}

        <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
          Visibilidad:
        </Typography>
        <Typography variant="body1" gutterBottom>
          {isPublic ? 'Público' : 'Privado'}
        </Typography>

        {maxAttendees && (
          <>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 2 }}>
              Aforo máximo:
            </Typography>
            <Typography variant="body1" gutterBottom>
              {maxAttendees} personas
            </Typography>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default EventPreview;