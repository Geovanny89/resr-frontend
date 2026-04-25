/**
 * Constants for Services feature
 */

// Available service colors for identification
export const SERVICE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

// Default empty service form
export const DEFAULT_SERVICE_FORM = {
  name: '',
  description: '',
  price: '',
  durationMin: 60,
  isTechnicalService: false,
  priceOptional: false,
  hasEmployeeCommission: true,
  imageUrl: '',
  color: '#3b82f6',
  serviceGroupId: ''
};

// Default empty service group form
export const DEFAULT_GROUP_FORM = {
  name: '',
  description: '',
  imageUrl: '',
  order: 0
};

// Default pagination settings
export const PAGINATION = {
  itemsPerPage: 5,
  initialPage: 1
};
