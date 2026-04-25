/**
 * Constants for Inventory feature
 */

export const UNITS = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'gramos', label: 'Gramos' },
  { value: 'mililitros', label: 'Mililitros' },
  { value: 'metros', label: 'Metros' },
  { value: 'porcion', label: 'Porción' }
];

export const DEFAULT_ITEM_FORM = {
  name: '',
  description: '',
  unit: 'unidad',
  currentStock: '',
  minStock: '',
  costPerUnit: '',
  supplier: ''
};

export const DEFAULT_USAGE_FORM = {
  itemId: '',
  quantity: '',
  date: new Date().toISOString().split('T')[0],
  notes: ''
};

export const TABS = {
  ITEMS: 'items',
  USAGES: 'usages'
};
