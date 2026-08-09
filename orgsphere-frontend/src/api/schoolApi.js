import axiosInstance from './axiosInstance';

export const schoolApi = {
    // ===== Student APIs =====
    createStudent: (data) =>
        axiosInstance.post('/api/school/students', data),

    getStudent: (id) =>
        axiosInstance.get(`/api/school/students/${id}`),

    getStudentByStudentId: (studentId) =>
        axiosInstance.get(`/api/school/students/student-id/${studentId}`),

    getStudentByUserId: (userId) =>
        axiosInstance.get(`/api/school/students/user/${userId}`),

    updateStudent: (id, data) =>
        axiosInstance.put(`/api/school/students/${id}`, data),

    deleteStudent: (id) =>
        axiosInstance.delete(`/api/school/students/${id}`),

    getStudentsByOrganization: (orgId) =>
        axiosInstance.get(`/api/school/students/organization/${orgId}`),

    getStudentsByClass: (orgId, className) =>
        axiosInstance.get(`/api/school/students/organization/${orgId}/class/${className}`),

    getStudentsByClassAndSection: (orgId, className, section) =>
        axiosInstance.get(`/api/school/students/organization/${orgId}/class/${className}/section/${section}`),

    getAllStudents: () =>
        axiosInstance.get('/api/school/students'),

    // ===== Teacher APIs =====
    createTeacher: (data) =>
        axiosInstance.post('/api/school/teachers', data),

    getTeacher: (id) =>
        axiosInstance.get(`/api/school/teachers/${id}`),

    getTeacherByTeacherId: (teacherId) =>
        axiosInstance.get(`/api/school/teachers/teacher-id/${teacherId}`),

    getTeacherByUserId: (userId) =>
        axiosInstance.get(`/api/school/teachers/user/${userId}`),

    updateTeacher: (id, data) =>
        axiosInstance.put(`/api/school/teachers/${id}`, data),

    deleteTeacher: (id) =>
        axiosInstance.delete(`/api/school/teachers/${id}`),

    getTeachersByOrganization: (orgId) =>
        axiosInstance.get(`/api/school/teachers/organization/${orgId}`),

    getTeachersBySpecialization: (orgId, specialization) =>
        axiosInstance.get(`/api/school/teachers/organization/${orgId}/specialization/${specialization}`),

    getAllTeachers: () =>
        axiosInstance.get('/api/school/teachers'),

    // ===== Classroom APIs =====
    createClassroom: (data) =>
        axiosInstance.post('/api/school/classrooms', data),

    getClassroom: (id) =>
        axiosInstance.get(`/api/school/classrooms/${id}`),

    getClassroomByCode: (code) =>
        axiosInstance.get(`/api/school/classrooms/code/${code}`),

    getClassroomByName: (name) =>
        axiosInstance.get(`/api/school/classrooms/name/${name}`),

    updateClassroom: (id, data) =>
        axiosInstance.put(`/api/school/classrooms/${id}`, data),

    deleteClassroom: (id) =>
        axiosInstance.delete(`/api/school/classrooms/${id}`),

    getClassroomsByOrganization: (orgId) =>
        axiosInstance.get(`/api/school/classrooms/organization/${orgId}`),

    getClassroomsByTeacher: (teacherId) =>
        axiosInstance.get(`/api/school/classrooms/teacher/${teacherId}`),

    getAllClassrooms: () =>
        axiosInstance.get('/api/school/classrooms'),

    // ===== Fee APIs =====
    createFee: (data) =>
        axiosInstance.post('/api/school/fees', data),

    getFee: (id) =>
        axiosInstance.get(`/api/school/fees/${id}`),

    updateFee: (id, data) =>
        axiosInstance.put(`/api/school/fees/${id}`, data),

    deleteFee: (id) =>
        axiosInstance.delete(`/api/school/fees/${id}`),

    payFee: (id, amount) =>
        axiosInstance.put(`/api/school/fees/${id}/pay?amount=${amount}`),

    waiveFee: (id) =>
        axiosInstance.put(`/api/school/fees/${id}/waive`),

    getFeesByStudent: (studentId) =>
        axiosInstance.get(`/api/school/fees/student/${studentId}`),

    getFeesByOrganization: (orgId) =>
        axiosInstance.get(`/api/school/fees/organization/${orgId}`),

    getPendingFees: (orgId) =>
        axiosInstance.get(`/api/school/fees/organization/${orgId}/pending`),

    getOverdueFees: (orgId) =>
        axiosInstance.get(`/api/school/fees/organization/${orgId}/overdue`),

    getFeesByDateRange: (orgId, start, end) =>
        axiosInstance.get(`/api/school/fees/organization/${orgId}/range?start=${start}&end=${end}`),

    // ===== Fee Structure APIs =====
    createFeeStructure: (data) =>
        axiosInstance.post('/api/school/fee-structures', data),
    updateFeeStructure: (id, data) =>
        axiosInstance.put(`/api/school/fee-structures/${id}`, data),
    deleteFeeStructure: (id) =>
        axiosInstance.delete(`/api/school/fee-structures/${id}`),
    getFeeStructuresByOrganization: (orgId) =>
        axiosInstance.get(`/api/school/fee-structures/organization/${orgId}`),

    // ===== Academic Year APIs =====
    createAcademicYear: (data) =>
        axiosInstance.post('/api/school/academic-years', data),
    setCurrentAcademicYear: (id, orgId) =>
        axiosInstance.put(`/api/school/academic-years/${id}/set-current?orgId=${orgId}`),
    getAcademicYearsByOrganization: (orgId) =>
        axiosInstance.get(`/api/school/academic-years/organization/${orgId}`),
    getCurrentAcademicYear: (orgId) =>
        axiosInstance.get(`/api/school/academic-years/organization/${orgId}/current`),

    // ===== Announcement APIs =====
    createAnnouncement: (data) =>
        axiosInstance.post('/api/school/announcements', data),
    deleteAnnouncement: (id) =>
        axiosInstance.delete(`/api/school/announcements/${id}`),
    getAnnouncementsByOrganization: (orgId) =>
        axiosInstance.get(`/api/school/announcements/organization/${orgId}`),

    // ===== Holiday APIs =====
    createHoliday: (data) =>
        axiosInstance.post('/api/school/holidays', data),
    deleteHoliday: (id) =>
        axiosInstance.delete(`/api/school/holidays/${id}`),
    getHolidaysByOrganization: (orgId) =>
        axiosInstance.get(`/api/school/holidays/organization/${orgId}`),
};