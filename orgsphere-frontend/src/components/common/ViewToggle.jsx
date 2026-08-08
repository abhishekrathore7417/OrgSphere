import { useState } from 'react';

// Icons
const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
);
const GridIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

/**
 * ViewToggle - A reusable component to switch between "list" and "grid" view modes.
 * Usage:
 *   const [viewMode, setViewMode] = useViewMode('list');
 *   <ViewToggle viewMode={viewMode} onChange={setViewMode} />
 */
export const ViewToggle = ({ viewMode, onChange }) => (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
        <button
            type="button"
            onClick={() => onChange('list')}
            title="List View"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                viewMode === 'list'
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            <ListIcon /> List
        </button>
        <button
            type="button"
            onClick={() => onChange('grid')}
            title="Grid View"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                viewMode === 'grid'
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            <GridIcon /> Grid
        </button>
    </div>
);

/**
 * useViewMode - A simple hook to persist view mode in localStorage.
 * @param {string} defaultMode - 'list' or 'grid'
 * @param {string} key - localStorage key to save preference
 */
export const useViewMode = (defaultMode = 'list', key = 'viewMode') => {
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem(key) || defaultMode;
    });
    const handleChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem(key, mode);
    };
    return [viewMode, handleChange];
};
