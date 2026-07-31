import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { organizationApi } from '../../api/organizationApi';

const OrganizationProfile = () => {
    const { user } = useSelector((state) => state.auth);
    const [organization, setOrganization] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        organizationName: '',
        contactNumber: '',
        address: '',
    });

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        try {
            const response = await organizationApi.getOrganization(1);
            const data = response.data.data;
            setOrganization(data);
            setFormData({
                organizationName: data.organizationName,
                contactNumber: data.contactNumber,
                address: data.address,
            });
        } catch (error) {
            toast.error('Failed to fetch organization');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await organizationApi.updateOrganization(1, formData);
            if (response.data.success) {
                toast.success('Organization updated successfully!');
                setIsEditing(false);
                fetchOrganization();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Organization Profile</h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleUpdate}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Organization Name</label>
                            <input
                                type="text"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Contact Number</label>
                            <input
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Organization Name</label>
                        <p className="text-lg font-semibold text-gray-800">{organization?.organizationName}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-lg text-gray-800">{organization?.email}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Contact Number</label>
                        <p className="text-lg text-gray-800">{organization?.contactNumber}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-lg text-gray-800">{organization?.address}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <p className="text-lg text-gray-800">
              <span className={`px-3 py-1 rounded-full text-sm ${
                  organization?.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
              }`}>
                {organization?.status}
              </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrganizationProfile;