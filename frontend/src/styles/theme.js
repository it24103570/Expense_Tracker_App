const COMMON_COLORS = {
  green: '#639922',
  greenLight: '#EAF3DE',
  greenDark: '#27500A',
  red: '#E24B4A',
  redLight: '#FCEBEB',
  amber: '#BA7517',
  amberLight: '#FAEEDA',
  blue: '#185FA5',
  blueLight: '#E6F1FB',
  white: '#FFFFFF',
  black: '#000000',
};

export const LIGHT_COLORS = {
  ...COMMON_COLORS,
  bg: '#FFFFFF',
  bg2: '#F5F5F0',
  bg3: '#F0EFE9',
  text: '#1A1A18',
  text2: '#7A7A72',
  border: '#E2E0D8',
};

export const DARK_COLORS = {
  ...COMMON_COLORS,
  bg: '#1A1A18',
  bg2: '#262624',
  bg3: '#121211',
  text: '#F5F5F0',
  text2: '#A1A19A',
  border: '#3D3D3A',
  greenLight: '#273814',
  greenDark: '#B4D68F',
};

// Default export for backward compatibility where possible, 
// but components should ideally use the theme context.
export const COLORS = LIGHT_COLORS; 

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const RADIUS = {
  sm: 8,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
};

export const CAT_ICONS = {
  food: '🍔',
  transport: '🚌',
  shopping: '🛍️',
  health: '💊',
  entertainment: '🎮',
  education: '📚',
  utilities: '💡',
  salary: '💼',
  other: '📦',
};

export const CAT_COLORS = {
  food: '#FAEEDA',
  transport: '#E6F1FB',
  shopping: '#FBEAF0',
  health: '#FCEBEB',
  entertainment: '#EEEDFE',
  education: '#EAF3DE',
  utilities: '#E1F5EE',
  salary: '#EAF3DE',
  other: '#F1EFE8',
};

export const CAT_TEXT_COLORS = {
  food: '#BA7517',
  transport: '#185FA5',
  shopping: '#993556',
  health: '#A32D2D',
  entertainment: '#534AB7',
  education: '#3B6D11',
  utilities: '#0F6E56',
  salary: '#27500A',
  other: '#5F5E5A',
};

export const CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'health', label: 'Health' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'education', label: 'Education' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salary', label: 'Salary' },
  { value: 'other', label: 'Other' },
];

export const BUDGET_CATEGORIES = CATEGORIES.filter((c) => c.value !== 'salary');
