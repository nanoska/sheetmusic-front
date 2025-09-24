import React from 'react';
import { parseISO } from 'date-fns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Stack, Box } from '@mui/material';

interface DateTimeFieldsProps {
  startTime: string;
  endTime: string;
  onChange: (field: 'start_time' | 'end_time', value: Date | null) => void;
}

const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  startTime,
  endTime,
  onChange
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
        <Box sx={{ flex: 1 }}>
          <DateTimePicker
            label="Fecha y hora de inicio"
            value={startTime ? parseISO(startTime) : null}
            onChange={(value) => onChange('start_time', value)}
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
            value={endTime ? parseISO(endTime) : null}
            onChange={(value) => onChange('end_time', value)}
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
  );
};

export default DateTimeFields;