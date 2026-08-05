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
            icon:  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
        },
        {
            path:        '/company/departments',
            label:       'Departments',
            groupKey:    'departments',
            basePath:    '/company/departments',
            // auto-expand departments on mount so they show without clicking
            defaultOpen: true,
            icon:        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
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
