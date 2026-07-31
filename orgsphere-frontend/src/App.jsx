import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterCompanyPage from './pages/auth/RegisterCompanyPage';
import RegisterSchoolPage from './pages/auth/RegisterSchoolPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ProtectedRoute from './routes/ProtectedRoute';

// Company pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import Departments from './pages/company/Departments';
import DepartmentDetail from './pages/company/DepartmentDetail';
import Employees from './pages/company/Employees';
import LeaveRequests from './pages/company/LeaveRequests';
import Attendance from './pages/company/Attendance';
import EmployeeSalary from './pages/company/EmployeeSalary';

// School pages
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

                {/* ── Company ── */}
                <Route element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'EMPLOYEE']} />}>
                    <Route path="/company/dashboard" element={<CompanyDashboard />} />
                    <Route path="/company/departments" element={<Departments />} />
                    <Route path="/company/departments/:deptName" element={<DepartmentDetail />} />
                    <Route path="/company/departments/:deptName/employees" element={<Employees />} />
                    <Route path="/company/departments/:deptName/leaves" element={<LeaveRequests />} />
                    <Route path="/company/departments/:deptName/attendance" element={<Attendance />} />
                    <Route path="/company/departments/:deptName/salary" element={<EmployeeSalary />} />
                    {/* legacy redirects */}
                    <Route path="/company/employees" element={<Navigate to="/company/departments" replace />} />
                    <Route path="/company/leaves"    element={<Navigate to="/company/departments" replace />} />
                    <Route path="/company/attendance" element={<Navigate to="/company/departments" replace />} />
                </Route>

                {/* ── School ── */}
                <Route element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'TEACHER']} />}>
                    <Route path="/school/dashboard" element={<SchoolDashboard />} />

                    {/* Classrooms → student context */}
                    <Route path="/school/classrooms" element={<Classrooms />} />
                    <Route path="/school/classrooms/:classroomId" element={<ClassroomDetail />} />
                    <Route path="/school/classrooms/:classroomId/students"   element={<Students />} />
                    <Route path="/school/classrooms/:classroomId/attendance" element={<StudentAttendance />} />
                    <Route path="/school/classrooms/:classroomId/fees"       element={<Fees />} />
                    <Route path="/school/classrooms/:classroomId/leaves"     element={<StudentLeaves />} />

                    {/* School Departments → teacher context */}
                    <Route path="/school/departments" element={<SchoolDepartments />} />
                    <Route path="/school/departments/:deptName" element={<SchoolDepartmentDetail />} />
                    <Route path="/school/departments/:deptName/teachers"    element={<Teachers />} />
                    <Route path="/school/departments/:deptName/attendance"  element={<TeacherAttendance />} />
                    <Route path="/school/departments/:deptName/leaves"      element={<TeacherLeaves />} />
                    <Route path="/school/departments/:deptName/salary"      element={<TeacherSalary />} />

                    {/* legacy redirects */}
                    <Route path="/school/students" element={<Navigate to="/school/classrooms" replace />} />
                    <Route path="/school/teachers" element={<Navigate to="/school/departments" replace />} />
                    <Route path="/school/fees"     element={<Navigate to="/school/classrooms" replace />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
