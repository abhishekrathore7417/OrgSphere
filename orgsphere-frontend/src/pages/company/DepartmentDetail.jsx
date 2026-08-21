import { useParams, useNavigate, NavLink } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const COMPANY_NAV = [
    { path: '/company/dashboard',   label: 'Dashboard',   icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { path: '/company/departments', label: 'Departments', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
];

const DepartmentDetail = () => {
    const { deptName } = useParams();
    const navigate = useNavigate();
    const decoded = decodeURIComponent(deptName);

    const tabs = [
        { label: 'Employees',   path: `/company/departments/${deptName}/employees`   },
        { label: 'Leaves',      path: `/company/departments/${deptName}/leaves`       },
        { label: 'Attendance',  path: `/company/departments/${deptName}/attendance`   },
        { label: 'Salary',      path: `/company/departments/${deptName}/salary`       },
    ];

    return (
        <>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
                    <button onClick={() => navigate('/company/departments')} className="hover:text-violet-600 transition-colors">
                        Departments
                    </button>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-700 font-medium">{decoded}</span>
                </div>

                {/* Dept header */}
                <div className="bg-violet-600 rounded-xl p-6 text-white mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{decoded}</h2>
                            <p className="text-violet-200 text-sm mt-0.5">Department Overview</p>
                        </div>
                    </div>
                </div>

                {/* Tab cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.path}
                            to={tab.path}
                            className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-violet-300 hover:shadow-sm transition-all group"
                        >
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-violet-700">{tab.label}</p>
                            <p className="text-xs text-gray-400 mt-1">View {decoded} {tab.label.toLowerCase()}</p>
                        </NavLink>
                    ))}
                </div>
            </div>
        </>
    );
};

export default DepartmentDetail;
