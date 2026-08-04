import DashboardLayout from './DashboardLayout';
import { useCompanySidebar } from '../../hooks/useCompanySidebar';

// Drop-in replacement for DashboardLayout in all company pages.
// Automatically shows tree sidebar with expanding Departments.
const CompanyLayout = ({ children }) => {
    const { treeItems, fetchChildren } = useCompanySidebar();

    return (
        <DashboardLayout
            treeItems={treeItems}
            fetchChildren={fetchChildren}
            orgLabel="Company Portal"
        >
            {children}
        </DashboardLayout>
    );
};

export default CompanyLayout;
