import { useNavigate } from 'react-router-dom';
import { FaSchool, FaBuilding, FaTimes } from 'react-icons/fa';

const RegistrationPopup = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSelect = (type) => {
        navigate(type === 'company' ? '/register/company' : '/register/school');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-white/20 animate-fadeIn">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100"
                >
                    <FaTimes size={20} />
                </button>

                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">OrgSphere</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Join OrgSphere</h2>
                    <p className="text-gray-500 text-sm mt-1">Choose your organization type</p>
                </div>

                <div className="space-y-4">
                    {/* Company Option */}
                    <button
                        onClick={() => handleSelect('company')}
                        className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition shrink-0">
                            <FaBuilding className="text-blue-600 text-xl" />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="text-base font-semibold text-gray-800">Company</h3>
                            <p className="text-xs text-gray-500">Manage employees & departments</p>
                        </div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* School Option */}
                    <button
                        onClick={() => handleSelect('school')}
                        className="w-full p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition shrink-0">
                            <FaSchool className="text-green-600 text-xl" />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="text-base font-semibold text-gray-800">School</h3>
                            <p className="text-xs text-gray-500">Manage students & teachers</p>
                        </div>
                        <div className="text-green-600 opacity-0 group-hover:opacity-100 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>

                <div className="mt-6 text-center pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Already have an account?{' '}
                        <button onClick={onClose} className="text-blue-600 hover:underline font-medium">
                            Login here
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPopup;