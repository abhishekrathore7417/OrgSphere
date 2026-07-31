import axiosInstance from './axiosInstance';

export const companyApi = {
    // ===== Employee APIs =====
    createEmployee: (data) =>
        axiosInstance.post('/api/company/employees', data),

    getEmployee: (id) =>
        axiosInstance.get(`/api/company/employees/${id}`),

    getEmployeeByEmployeeId: (employeeId) =>
        axiosInstance.get(`/api/company/employees/employee-id/${employeeId}`),

    updateEmployee: (id, data) =>
        axiosInstance.put(`/api/company/employees/${id}`, data),

    deleteEmployee: (id) =>
        axiosInstance.delete(`/api/company/employees/${id}`),

    getEmployeesByOrganization: (orgId) =>
        axiosInstance.get(`/api/company/employees/organization/${orgId}`),

    getEmployeesByDepartment: (orgId, department) =>
        axiosInstance.get(`/api/company/employees/organization/${orgId}/department/${department}`),

    getAllEmployees: () =>
        axiosInstance.get('/api/company/employees'),

    // ===== Department APIs =====
    createDepartment: (data) =>
        axiosInstance.post('/api/company/departments', data),

    getDepartment: (id) =>
        axiosInstance.get(`/api/company/departments/${id}`),

    getDepartmentByName: (name) =>
        axiosInstance.get(`/api/company/departments/name/${name}`),

    updateDepartment: (id, data) =>
        axiosInstance.put(`/api/company/departments/${id}`, data),

    deleteDepartment: (id) =>
        axiosInstance.delete(`/api/company/departments/${id}`),

    getDepartmentsByOrganization: (orgId) =>
        axiosInstance.get(`/api/company/departments/organization/${orgId}`),

    getAllDepartments: () =>
        axiosInstance.get('/api/company/departments'),

    // ===== Leave APIs =====
    applyLeave: (data) =>
        axiosInstance.post('/api/company/leaves', data),

    getLeave: (id) =>
        axiosInstance.get(`/api/company/leaves/${id}`),

    updateLeave: (id, data) =>
        axiosInstance.put(`/api/company/leaves/${id}`, data),

    cancelLeave: (id) =>
        axiosInstance.delete(`/api/company/leaves/${id}`),

    approveLeave: (id) =>
        axiosInstance.put(`/api/company/leaves/${id}/approve`),

    rejectLeave: (id) =>
        axiosInstance.put(`/api/company/leaves/${id}/reject`),

    getLeavesByUser: (userId) =>
        axiosInstance.get(`/api/company/leaves/user/${userId}`),

    getLeavesByOrganization: (orgId) =>
        axiosInstance.get(`/api/company/leaves/organization/${orgId}`),

    getPendingLeaves: (orgId) =>
        axiosInstance.get(`/api/company/leaves/organization/${orgId}/pending`),

    // ===== Attendance APIs =====
    markAttendance: (data) =>
        axiosInstance.post('/api/company/attendance', data),

    getAttendance: (id) =>
        axiosInstance.get(`/api/company/attendance/${id}`),

    updateAttendance: (id, data) =>
        axiosInstance.put(`/api/company/attendance/${id}`, data),

    deleteAttendance: (id) =>
        axiosInstance.delete(`/api/company/attendance/${id}`),

    getAttendanceByUser: (userId) =>
        axiosInstance.get(`/api/company/attendance/user/${userId}`),

    getAttendanceByOrganization: (orgId) =>
        axiosInstance.get(`/api/company/attendance/organization/${orgId}`),

    getAttendanceByDate: (orgId, date) =>
        axiosInstance.get(`/api/company/attendance/organization/${orgId}/date/${date}`),

    getTodayAttendance: (userId) =>
        axiosInstance.get(`/api/company/attendance/today/${userId}`),

    getAttendanceByDateRange: (userId, start, end) =>
        axiosInstance.get(`/api/company/attendance/user/${userId}/range?start=${start}&end=${end}`),
};