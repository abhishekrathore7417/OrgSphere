import { useSelector } from 'react-redux';
import { schoolApi } from '../api/schoolApi';
import { companyApi } from '../api/companyApi';

// Returns treeItems config and fetchChildren for School sidebar
export const useSchoolSidebar = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const treeItems = [
        {
            path:  '/school/dashboard',
            label: 'Dashboard',
            icon:  'solar:widget-linear',
        },
        {
            path:      '/school/classrooms',
            label:     'Classrooms',
            groupKey:  'classrooms',
            basePath:  '/school/classrooms',
            icon:      'solar:buildings-2-linear',
        },
        {
            path:      '/school/departments',
            label:     'Departments',
            groupKey:  'departments',
            basePath:  '/school/departments',
            icon:      'solar:users-group-rounded-linear',
        },
        {
            path:  '/school/academic-year',
            label: 'Academic Year',
            icon:  'solar:calendar-mark-linear',
        },
        {
            path:  '/school/fee-structure',
            label: 'Fee Structure',
            icon:  'solar:wallet-money-linear',
        },
        {
            path:  '/school/announcements',
            label: 'Announcements',
            icon:  'solar:bell-linear',
        },
        {
            path:  '/school/subscription',
            label: 'Subscription & Billing',
            icon:  'solar:card-linear',
        },
        {
            path:  '/school/settings',
            label: 'Settings',
            icon:  'solar:settings-linear',
        },
    ];

    const fetchChildren = async (groupKey) => {
        try {
            if (groupKey === 'classrooms') {
                const res = await schoolApi.getClassroomsByOrganization(orgId);
                const items = (res.data.data || []).filter(c => c.status === 'ACTIVE');
                return items.map(c => ({
                    path:  `/school/classrooms/${c.id}/students`,
                    label: c.classroomName,
                }));
            }
            if (groupKey === 'departments') {
                const res = await companyApi.getDepartmentsByOrganization(orgId);
                const items = res.data.data || [];
                return items.map(d => {
                    const name = d.name || d.departmentName || '';
                    return {
                        path:  `/school/departments/${encodeURIComponent(name)}/teachers`,
                        label: name,
                    };
                });
            }
        } catch { /* silent */ }
        return [];
    };

    return { treeItems, fetchChildren };
};
