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
        { name: 'Dashboard', path: '/company/dashboard', icon: 'solar:widget-linear' },
        { name: 'Employees', path: '/company/employees', icon: 'solar:users-group-rounded-linear' },
        { name: 'Departments', path: '/company/departments', icon: 'solar:buildings-2-linear' },
        { name: 'Leaves', path: '/company/leaves', icon: 'solar:calendar-mark-linear' },
        { name: 'Attendance', path: '/company/attendance', icon: 'solar:clock-circle-linear' },
    ],
    SCHOOL: [
        { name: 'Dashboard', path: '/school/dashboard', icon: 'solar:widget-linear' },
        { name: 'Students', path: '/school/students', icon: 'solar:users-group-rounded-linear' },
        { name: 'Teachers', path: '/school/teachers', icon: 'solar:user-check-rounded-linear' },
        { name: 'Classrooms', path: '/school/classrooms', icon: 'solar:buildings-2-linear' },
        { name: 'Fees', path: '/school/fees', icon: 'solar:wallet-money-linear' },
    ],
};