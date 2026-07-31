import DashboardLayout from './DashboardLayout';
import { useSchoolSidebar } from '../../hooks/useSchoolSidebar.jsx';

// Drop-in replacement for DashboardLayout in all school pages.
// Automatically shows the tree sidebar with Classrooms + Departments.
const SchoolLayout = ({ children }) => {
    const { treeItems, fetchChildren } = useSchoolSidebar();

    return (
        <DashboardLayout
            treeItems={treeItems}
            fetchChildren={fetchChildren}
            orgLabel="School Portal"
        >
            {children}
        </DashboardLayout>
    );
};

export default SchoolLayout;
