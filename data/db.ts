import { User, UserRole, InspectionReport } from '../types';
import { generateNewInspectionReport } from '../constants';

// --- In-memory database ---
const users: User[] = [
    { id: 'user-0', username: 'admin', password: 'password', role: UserRole.ADMIN },
    { id: 'user-1', username: 'inspector1', password: 'password', role: UserRole.INSPECTOR },
    { id: 'user-2', username: 'supervisor1', password: 'password', role: UserRole.SUPERVISOR },
    { id: 'user-3', username: 'inspector2', password: 'password', role: UserRole.INSPECTOR },
];

let inspections: InspectionReport[] = [
    generateNewInspectionReport('Sample Inspection for Turbine Blade', 'user-1'),
    generateNewInspectionReport('FAI for Landing Gear Strut', 'user-3'),
];


// --- API functions to interact with the database ---

export const authenticateUser = (username: string, password: string): User | undefined => {
    return users.find(u => u.username === username && u.password === password);
};

export const createUser = (username: string, password: string, role: UserRole): User | null => {
    if (users.some(u => u.username === username)) {
        return null; // Username already exists
    }
    const newUser: User = {
        id: `user-${users.length}`,
        username,
        password,
        role,
    };
    users.push(newUser);
    return newUser;
};

export const getUsers = (): Omit<User, 'password'>[] => {
    return users.map(({ password, ...user }) => user);
};

export const scheduleInspection = (title: string, inspectorId: string): InspectionReport => {
    const newInspection = generateNewInspectionReport(title, inspectorId);
    inspections.push(newInspection);
    return newInspection;
};

export const getInspectionsForInspector = (inspectorId: string): InspectionReport[] => {
    return inspections.filter(insp => insp.scheduledById === inspectorId).sort((a,b) => b.id.localeCompare(a.id));
};

export const getAllInspections = (): InspectionReport[] => {
    return [...inspections].sort((a, b) => b.id.localeCompare(a.id));
};

export const getInspectionById = (inspectionId: string): InspectionReport | undefined => {
    return inspections.find(insp => insp.id === inspectionId);
};