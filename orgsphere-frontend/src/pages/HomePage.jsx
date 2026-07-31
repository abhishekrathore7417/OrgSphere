import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaBuilding,
    FaSchool,
    FaUsers,
    FaChartLine,
    FaShieldAlt,
    FaHeadset,
    FaArrowRight,
} from 'react-icons/fa';
import Navbar from '../components/common/Navbar';
import RegistrationPopup from '../components/auth/RegistrationPopup';

const HomePage = () => {
    const [showRegisterPopup, setShowRegisterPopup] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 pb-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Manage Your{' '}
                        <span className="text-yellow-300">Company</span> &{' '}
                        <span className="text-yellow-300">School</span>
                        <br /> All in One Place
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
                        OrgSphere is the complete management solution for companies and schools.
                        Streamline your operations with our powerful SaaS platform.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => setShowRegisterPopup(true)}
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center gap-2"
                        >
                            Get Started <FaArrowRight />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                        Everything You Need to Manage
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaBuilding className="text-blue-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">For Companies</h3>
                            <p className="text-gray-600 mt-2">
                                Manage employees, departments, attendance, leave requests, and more.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaSchool className="text-green-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">For Schools</h3>
                            <p className="text-gray-600 mt-2">
                                Manage students, teachers, classrooms, fees, and academic records.
                            </p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaUsers className="text-purple-600 text-2xl" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">User Management</h3>
                            <p className="text-gray-600 mt-2">
                                Role-based access control for employees, teachers, students, and admins.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                        Why Choose OrgSphere?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <FaShieldAlt className="text-4xl text-blue-600 mx-auto mb-3" />
                            <h4 className="font-semibold text-gray-800">Secure & Reliable</h4>
                            <p className="text-sm text-gray-600">Enterprise-grade security with data encryption</p>
                        </div>
                        <div className="text-center">
                            <FaChartLine className="text-4xl text-green-600 mx-auto mb-3" />
                            <h4 className="font-semibold text-gray-800">Real-time Analytics</h4>
                            <p className="text-sm text-gray-600">Track performance with live dashboards</p>
                        </div>
                        <div className="text-center">
                            <FaHeadset className="text-4xl text-purple-600 mx-auto mb-3" />
                            <h4 className="font-semibold text-gray-800">24/7 Support</h4>
                            <p className="text-sm text-gray-600">Dedicated support team for your organization</p>
                        </div>
                        <div className="text-center">
                            <FaBuilding className="text-4xl text-orange-600 mx-auto mb-3" />
                            <h4 className="font-semibold text-gray-800">Scalable Solution</h4>
                            <p className="text-sm text-gray-600">Grow your business without limits</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Start Your 7-Day Free Trial Today!
                    </h2>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                        No credit card required. Get started with OrgSphere and transform your organization.
                    </p>
                    <button
                        onClick={() => setShowRegisterPopup(true)}
                        className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
                    >
                        Get Started Free
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-xl font-bold text-blue-400">OrgSphere</p>
                    <p className="text-gray-400 mt-2">
                        © 2026 OrgSphere. All rights reserved. Made with ❤️ for companies & schools.
                    </p>
                </div>
            </footer>

            {/* Registration Popup */}
            <RegistrationPopup isOpen={showRegisterPopup} onClose={() => setShowRegisterPopup(false)} />
        </div>
    );
};

export default HomePage;