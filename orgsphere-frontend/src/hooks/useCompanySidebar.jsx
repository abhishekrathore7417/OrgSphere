import { useSelector } from 'react-redux';
import { companyApi } from '../api/companyApi';

// Returns treeItems config and fetchChildren for Company sidebar
export const useCompanySidebar = () => {
    const { user, organizationId: reduxOrgId } = useSelector(s => s.auth);
    const rawOrgId = reduxOrgId || user?.organizationId;
    const lsOrgId  = localStorage.getItem('organizationId');
    const orgId    = rawOrgId || (lsOrgId && lsOrgId !== 'null' ? parseInt(lsOrgId, 10) : null);

    const treeItems = [
        {
            path:  '/company/dashboard',
            label: 'Dashboard',
            icon:  'solar:widget-linear',
        },
        {
            path:        '/company/departments',
            label:       'Departments',
            groupKey:    'departments',
            basePath:    '/company/departments',
            icon:        'solar:buildings-2-linear',
        },
        {
            path:  '/company/subscription',
            label: 'Subscription & Billing',
            icon:  'solar:card-linear',
        },
        {
            path:  '/company/settings',
            label: 'Settings',
            icon:  'solar:settings-linear',
        },
    ];

    const fetchChildren = async (groupKey) => {
        if (groupKey !== 'departments') return [];
        try {
            const res   = await companyApi.getDepartmentsByOrganization(orgId);
            const items = res.data.data || [];
            return items.map(d => {
                // API may return either `name` or `departmentName`
                const name = d.name || d.departmentName || '';
                return {
                    path:  `/company/departments/${encodeURIComponent(name)}/employees`,
                    label: name,
                };
            });
        } catch { return []; }
    };

    return { treeItems, fetchChildren };
};
