import { InspectionReport, ParameterStatus, UserRole } from './types';

// Roles for participants in an active inspection room
export const PARTICIPANTS: UserRole[] = [
    UserRole.INSPECTOR,
    UserRole.SUPERVISOR,
    UserRole.CLIENT,
    UserRole.END_USER
];

// All possible user roles for creation in Admin Panel
export const ALL_USER_ROLES: UserRole[] = [
    UserRole.INSPECTOR,
    UserRole.SUPERVISOR,
    UserRole.CLIENT,
    UserRole.END_USER
];

// Standard GD&T Symbols
export const GDT_SYMBOLS = [
  { symbol: '⌖', name: 'Position' },
  { symbol: '⌀', name: 'Diameter' },
  { symbol: '⟂', name: 'Perpendicularity' },
  { symbol: '∠', name: 'Angularity' },
  { symbol: '∥', name: 'Parallelism' },
  { symbol: '─', name: 'Straightness' },
  { symbol: '⌓', name: 'Profile of a Surface' },
  { symbol: '○', name: 'Circularity' },
  { symbol: '⌭', name: 'Symmetry' },
  { symbol: ' flatness', name: 'Flatness' }, // Using text as symbol is not ideal, but a placeholder.
  { symbol: ' concentricity', name: 'Concentricity' },
];


export const generateNewInspectionReport = (title: string, scheduledById: string): InspectionReport => ({
  id: `INSP-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
  title,
  scheduledById,
  productDetails: {
    productName: 'Turbine Blade',
    partNumber: 'TB-789-A',
    drawingNumber: 'DRW-TB-789-A-01',
    revision: 'B',
    uom: 'mm'
  },
  parameters: [
    { id: 1, description: 'Overall Length', nominal: 150.00, utl: 150.05, ltl: 149.95, toleranceType: '+/-', toleranceValue: 0.05, status: ParameterStatus.PENDING },
    { id: 2, description: 'Blade Width at Base', nominal: 25.00, utl: 25.02, ltl: 24.98, toleranceType: '+/-', toleranceValue: 0.02, status: ParameterStatus.PENDING },
    { id: 3, description: 'Blade Thickness', nominal: 5.00, utl: 5.01, ltl: 4.99, toleranceType: '+/-', toleranceValue: 0.01, status: ParameterStatus.PENDING },
    { id: 4, description: 'Root Fillet Radius', nominal: 2.00, utl: 2.05, ltl: 1.95, toleranceType: '+/-', toleranceValue: 0.05, status: ParameterStatus.PENDING },
    { id: 5, description: 'Surface Roughness (Ra)', nominal: 0.8, utl: 1.0, ltl: 0.6, toleranceType: '+/-', toleranceValue: 0.2, status: ParameterStatus.PENDING },
    { id: 6, description: 'Hole Diameter #1', gdtSymbol: '⌀', nominal: 3.00, utl: 3.01, ltl: 2.99, toleranceType: '+/-', toleranceValue: 0.01, status: ParameterStatus.PENDING },
    { id: 7, description: 'Hole Position X', gdtSymbol: '⌖', nominal: 10.00, utl: 10.05, ltl: 9.95, toleranceType: '+/-', toleranceValue: 0.05, status: ParameterStatus.PENDING },
    { id: 8, description: 'Hole Position Y', gdtSymbol: '⌖', nominal: 15.00, utl: 15.05, ltl: 14.95, toleranceType: '+/-', toleranceValue: 0.05, status: ParameterStatus.PENDING },
    { id: 9, description: 'Profile of a Surface', gdtSymbol: '⌓', nominal: 0, utl: 0.05, ltl: 0, toleranceType: '+', toleranceValue: 0.05, status: ParameterStatus.PENDING },
    { id: 10, description: 'Perpendicularity', gdtSymbol: '⟂', nominal: 0, utl: 0.03, ltl: 0, toleranceType: '+', toleranceValue: 0.03, status: ParameterStatus.PENDING },
  ],
  evidence: [],
  signatures: {
    [UserRole.ADMIN]: { signed: false, comment: '' },
    [UserRole.INSPECTOR]: { signed: false, comment: '' },
    [UserRole.SUPERVISOR]: { signed: false, comment: '' },
    [UserRole.CLIENT]: { signed: false, comment: '' },
    [UserRole.END_USER]: { signed: false, comment: '' },
  },
  isComplete: false,
});