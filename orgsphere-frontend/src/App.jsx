import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterCompanyPage from './pages/auth/RegisterCompanyPage';
import RegisterSchoolPage from './pages/auth/RegisterSchoolPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProtectedRoute from './routes/ProtectedRoute';

// Common Subscription & Settings pages & Guard
import SubscriptionPage from './pages/common/SubscriptionPage';
import SettingsPage from './pages/common/SettingsPage';
import SubscriptionLockGuard from './components/common/SubscriptionLockGuard';

import CompanyLayout from './components/layout/CompanyLayout';
import CompanyDashboard from './pages/company/CompanyDashboard';
import Departments from './pages/company/Departments';
import DepartmentDetail from './pages/company/DepartmentDetail';
import Employees from './pages/company/Employees';
import LeaveRequests from './pages/company/LeaveRequests';
import Attendance from './pages/company/Attendance';
import EmployeeSalary from './pages/company/EmployeeSalary';
import CompanyAllEmployees from './pages/company/CompanyAllEmployees';
import CompanyAllLeaves from './pages/company/CompanyAllLeaves';
import CompanyAllAttendance from './pages/company/CompanyAllAttendance';

import SchoolLayout from './components/layout/SchoolLayout';
import SchoolDashboard from './pages/school/SchoolDashboard';
import Classrooms from './pages/school/Classrooms';
import ClassroomDetail from './pages/school/ClassroomDetail';
import Students from './pages/school/Students';
import StudentAttendance from './pages/school/StudentAttendance';
import StudentLeaves from './pages/school/StudentLeaves';
import Fees from './pages/school/Fees';
import SchoolDepartments from './pages/school/SchoolDepartments';
import SchoolDepartmentDetail from './pages/school/SchoolDepartmentDetail';
import Teachers from './pages/school/Teachers';
import TeacherAttendance from './pages/school/TeacherAttendance';
import TeacherLeaves from './pages/school/TeacherLeaves';
import TeacherSalary from './pages/school/TeacherSalary';
import SchoolAllStudents from './pages/school/SchoolAllStudents';
import SchoolAllTeachers from './pages/school/SchoolAllTeachers';
import SchoolAllFees from './pages/school/SchoolAllFees';

// New School Pages
import FeeStructure from './pages/school/FeeStructure';
import AcademicYear from './pages/school/AcademicYear';
import Announcements from './pages/school/Announcements';

function App() {
    return (
        <Router>
            <ToastContainer position="top-right" autoClose={3000} />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register/company" element={<RegisterCompanyPage />} />
                <Route path="/register/school" element={<RegisterSchoolPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* 🏢 Company 🏢 */}
                <Route element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'EMPLOYEE']} />}>
                    <Route element={<CompanyLayout />}>
                        <Route path="/company/dashboard" element={<CompanyDashboard />} />
                        <Route path="/company/subscription" element={<SubscriptionPage />} />
                        <Route path="/company/settings" element={<SettingsPage />} />

                        {/* ERP features locked when subscription is expired */}
                        <Route path="/company/departments" element={<SubscriptionLockGuard><Departments /></SubscriptionLockGuard>} />
                        <Route path="/company/departments/:deptName" element={<SubscriptionLockGuard><DepartmentDetail /></SubscriptionLockGuard>} />
                        <Route path="/company/departments/:deptName/employees" element={<SubscriptionLockGuard><Employees /></SubscriptionLockGuard>} />
                        <Route path="/company/departments/:deptName/leaves" element={<SubscriptionLockGuard><LeaveRequests /></SubscriptionLockGuard>} />
                        <Route path="/company/departments/:deptName/attendance" element={<SubscriptionLockGuard><Attendance /></SubscriptionLockGuard>} />
                        <Route path="/company/departments/:deptName/salary" element={<SubscriptionLockGuard><EmployeeSalary /></SubscriptionLockGuard>} />
                        {/* Overview pages */}
                        <Route path="/company/all-employees"  element={<SubscriptionLockGuard><CompanyAllEmployees /></SubscriptionLockGuard>} />
                        <Route path="/company/all-leaves"     element={<SubscriptionLockGuard><CompanyAllLeaves /></SubscriptionLockGuard>} />
                        <Route path="/company/all-attendance" element={<SubscriptionLockGuard><CompanyAllAttendance /></SubscriptionLockGuard>} />
                        {/* legacy redirects */}
                        <Route path="/company/employees"  element={<Navigate to="/company/departments" replace />} />
                        <Route path="/company/leaves"     element={<Navigate to="/company/departments" replace />} />
                        <Route path="/company/attendance" element={<Navigate to="/company/departments" replace />} />
                    </Route>
                </Route>

                {/* 🏫 School 🏫 */}
                <Route element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'TEACHER']} />}>
                    <Route element={<SchoolLayout />}>
                        <Route path="/school/dashboard" element={<SchoolDashboard />} />
                        <Route path="/school/subscription" element={<SubscriptionPage />} />
                        <Route path="/school/settings" element={<SettingsPage />} />

                        {/* ERP features locked when subscription is expired */}
                        <Route path="/school/fee-structure" element={<SubscriptionLockGuard><FeeStructure /></SubscriptionLockGuard>} />
                        <Route path="/school/academic-year" element={<SubscriptionLockGuard><AcademicYear /></SubscriptionLockGuard>} />
                        <Route path="/school/announcements" element={<SubscriptionLockGuard><Announcements /></SubscriptionLockGuard>} />
                        <Route path="/school/all-students" element={<SubscriptionLockGuard><SchoolAllStudents /></SubscriptionLockGuard>} />
                        <Route path="/school/all-teachers" element={<SubscriptionLockGuard><SchoolAllTeachers /></SubscriptionLockGuard>} />
                        <Route path="/school/all-fees"     element={<SubscriptionLockGuard><SchoolAllFees /></SubscriptionLockGuard>} />

                        {/* Classrooms → student context */}
                        <Route path="/school/classrooms" element={<SubscriptionLockGuard><Classrooms /></SubscriptionLockGuard>} />
                        <Route path="/school/classrooms/:classroomId" element={<SubscriptionLockGuard><ClassroomDetail /></SubscriptionLockGuard>} />
                        <Route path="/school/classrooms/:classroomId/students"   element={<SubscriptionLockGuard><Students /></SubscriptionLockGuard>} />
                        <Route path="/school/classrooms/:classroomId/attendance" element={<SubscriptionLockGuard><StudentAttendance /></SubscriptionLockGuard>} />
                        <Route path="/school/classrooms/:classroomId/fees"       element={<SubscriptionLockGuard><Fees /></SubscriptionLockGuard>} />
                        <Route path="/school/classrooms/:classroomId/leaves"     element={<SubscriptionLockGuard><StudentLeaves /></SubscriptionLockGuard>} />

                        {/* School Departments → teacher context */}
                        <Route path="/school/departments" element={<SubscriptionLockGuard><SchoolDepartments /></SubscriptionLockGuard>} />
                        <Route path="/school/departments/:deptName" element={<SubscriptionLockGuard><SchoolDepartmentDetail /></SubscriptionLockGuard>} />
                        <Route path="/school/departments/:deptName/teachers"    element={<SubscriptionLockGuard><Teachers /></SubscriptionLockGuard>} />
                        <Route path="/school/departments/:deptName/attendance"  element={<SubscriptionLockGuard><TeacherAttendance /></SubscriptionLockGuard>} />
                        <Route path="/school/departments/:deptName/leaves"      element={<SubscriptionLockGuard><TeacherLeaves /></SubscriptionLockGuard>} />
                        <Route path="/school/departments/:deptName/salary"      element={<SubscriptionLockGuard><TeacherSalary /></SubscriptionLockGuard>} />

                        {/* legacy redirects */}
                        <Route path="/school/students" element={<Navigate to="/school/classrooms" replace />} />
                        <Route path="/school/teachers" element={<Navigate to="/school/departments" replace />} />
                        <Route path="/school/fees"     element={<Navigate to="/school/classrooms" replace />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
