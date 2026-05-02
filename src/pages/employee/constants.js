export const STATUS_LABELS = { 
  pending: 'Pendiente', 
  confirmed: 'Confirmada',
  on_the_way: 'En Camino',
  arrived: 'Llegó',
  attention: 'En Atención', 
  done: 'Terminado', 
  cancelled: 'Cancelada' 
};

export const STATUS_COLORS = { 
  pending: '#f6ad55', 
  confirmed: '#68d391', 
  on_the_way: '#3b82f6',
  arrived: '#06b6d4',
  attention: '#63b3ed', 
  done: '#48bb78',
  cancelled: '#fc8181'
};

export const BEAUTY_BUSINESS_TYPES = ['barberia', 'spa', 'unas', 'salon', 'peluqueria', 'masajes', 'tatuajes', 'estetica'];

export const STATUS_PRIORITY = {
  'attention': 1,
  'in_progress': 1,
  'on_the_way': 2,
  'arrived': 2,
  'confirmed': 3,
  'pending': 4,
  'done': 5,
  'completed': 5,
  'cancelled': 6
};
