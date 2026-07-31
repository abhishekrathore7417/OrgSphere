export const API_BASE_URL = 'http://localhost:8080';

export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ORG_ADMIN: 'ORG_ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
};

export const ORGANIZATION_TYPES = {
    COMPANY: 'COMPANY',
    SCHOOL: 'SCHOOL',
};

export const NAV_ITEMS = {
    COMPANY: [
        { name: 'Dashboard', path: '/company/dashboard', icon: '📊' },
        { name: 'Employees', path: '/company/employees', icon: '👥' },
        { name: 'Departments', path: '/company/departments', icon: '🏢' },
        { name: 'Leaves', path: '/company/leaves', icon: '📋' },
        { name: 'Attendance', path: '/company/attendance', icon: '⏰' },
    ],
    SCHOOL: [
        { name: 'Dashboard', path: '/school/dashboard', icon: '📊' },
        { name: 'Students', path: '/school/students', icon: '🎓' },
        { name: 'Teachers', path: '/school/teachers', icon: '👨‍🏫' },
        { name: 'Classrooms', path: '/school/classrooms', icon: '🏫' },
        { name: 'Fees', path: '/school/fees', icon: '💰' },
    ],
};