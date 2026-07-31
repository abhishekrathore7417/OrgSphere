import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterCompanyPage from '../pages/auth/RegisterCompanyPage';
import RegisterSchoolPage from '../pages/auth/RegisterSchoolPage';
import CompanyDashboard from '../pages/company/CompanyDashboard';
import Employees from '../pages/company/Employees';
import Departments from '../pages/company/Departments';
import LeaveRequests from '../pages/company/LeaveRequests';
import Attendance from '../pages/company/Attendance';
import SchoolDashboard from '../pages/school/SchoolDashboard';
import Students from '../pages/school/Students';
import Teachers from '../pages/school/Teachers';
import Classrooms from '../pages/school/Classrooms';
import Fees from '../pages/school/Fees';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/company" element={<RegisterCompanyPage />} />
            <Route path="/register/school" element={<RegisterSchoolPage />} />

            {/* Company Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'EMPLOYEE']} />}>
                <Route path="/company/dashboard" element={<CompanyDashboard />} />
                <Route path="/company/employees" element={<Employees />} />
                <Route path="/company/departments" element={<Departments />} />
                <Route path="/company/leaves" element={<LeaveRequests />} />
                <Route path="/company/attendance" element={<Attendance />} />
            </Route>

            {/* School Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'TEACHER']} />}>
                <Route path="/school/dashboard" element={<SchoolDashboard />} />
                <Route path="/school/students" element={<Students />} />
                <Route path="/school/teachers" element={<Teachers />} />
                <Route path="/school/classrooms" element={<Classrooms />} />
                <Route path="/school/fees" element={<Fees />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;