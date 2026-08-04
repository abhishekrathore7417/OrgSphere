import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';

/* ---------------------------------- Icons --------------------------------- */
const Icon = ({path, className, strokeWidth = 2}) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d={path}/>
    </svg>
);

// ----- Stat Icons -----
const BuildingIcon = ({className}) => (
    <Icon
        path="M3 8v14h18V8M3 8l9-5 9 5M6 12h12M6 16h12M6 20h12"
        className={className}
    />
);
const UsersIcon = ({className}) => (
    <Icon
        path="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
        className={className}
    />
);
const StarIcon = ({className}) => (
    <Icon
        path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        className={className}
    />
);
const ShieldIcon = ({className}) => (
    <Icon
        path="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4"
        className={className}
    />
);

// ----- Tab Icons -----
const BriefcaseIcon = ({className}) => (
    <Icon
        path="M20 7h-4.5L15 4.5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2L8.5 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M8 7h8 M12 11v6"
        className={className}
    />
);
const GraduationCapIcon = ({className}) => (
    <Icon
        path="M22 10L12 5 2 10l10 5 10-5z M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5"
        className={className}
    />
);
const UserCogIcon = ({className}) => (
    <Icon
        path="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
        className={className}
    />
);

// ----- Feature Card Icons -----
const ClockIcon = ({className}) => (
    <Icon
        path="M12 2v4M12 22v-4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M22 12h-4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        className={className}
    />
);
const CalendarIcon = ({className}) => (
    <Icon
        path="M8 2v4M16 2v4M3 10h18M21 14V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7"
        className={className}
    />
);
const CreditCardIcon = ({className}) => (
    <Icon
        path="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z M3 10h18 M7 15h.01 M11 15h2"
        className={className}
    />
);
const LayoutGridIcon = ({className}) => (
    <Icon
        path="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z"
        className={className}
    />
);
const TrendingUpIcon = ({className}) => (
    <Icon
        path="M23 6l-7.5 7.5-5-5L3 16 M23 10v-4h-4"
        className={className}
    />
);
const SchoolIcon = ({className}) => (
    <Icon
        path="M22 10L12 5 2 10l10 5 10-5z M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5 M12 5v14"
        className={className}
    />
);
const FileTextIcon = ({className}) => (
    <Icon
        path="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8"
        className={className}
    />
);
const BookOpenIcon = ({className}) => (
    <Icon
        path="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
        className={className}
    />
);

// ----- Other Icons (already defined) -----
const SparklesIcon = ({className}) => (
    <Icon
        path="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        className={className}
    />
);
const ArrowRightIcon = ({className}) => (
    <Icon path="M5 12h14M13 6l6 6-6 6" className={className} strokeWidth={2.5}/>
);
const PlayIcon = ({className}) => (
    <Icon path="M5 3l14 9-14 9V3z" className={className}/>
);
const QuoteIcon = ({className}) => (
    <Icon
        path="M10 11h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4c0 2.5-2 4-4 4m8 0h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4c0 2.5-2 4-4 4"
        className={className}
    />
);
const CheckIcon = ({className}) => (
    <Icon path="M20 6L9 17l-5-5" className={className} strokeWidth={2.5}/>
);
const ChevronDownIcon = ({className}) => (
    <Icon path="m6 9 6 6 6-6" className={className}/>
);
const MenuIcon = ({className}) => (
    <Icon path="M4 6h16M4 12h16M4 18h16" className={className}/>
);
const CloseIcon = ({className}) => (
    <Icon path="M18 6L6 18M6 6l12 12" className={className}/>
);
const MailIcon = ({className}) => (
    <Icon
        path="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6"
        className={className}
    />
);
const AwardIcon = ({className}) => (
    <Icon
        path="M12 15v4m-4-1v2m8-2v2M6 9h12M6 9a6 6 0 0 1 12 0v2H6V9z"
        className={className}
    />
);
const ClipboardListIcon = ({className}) => (
    <Icon
        path="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 15h4M9 11h.01M9 15h.01"
        className={className}
    />
);

// Social icons
const LinkedinIcon = ({className}) => (
    <Icon
        path="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
        className={className}
    />
);
const TwitterIcon = ({className}) => (
    <Icon
        path="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
        className={className}
    />
);
const YoutubeIcon = ({className}) => (
    <Icon
        path="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z M9.75 15.02L15.5 11.75 9.75 8.48v6.54z"
        className={className}
    />
);
const GithubIcon = ({className}) => (
    <Icon
        path="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
        className={className}
    />
);

/* ---------------------------------- Data ---------------------------------- */

const NAV_LINKS = [
    {label: 'Features', href: '#features'},
    {label: 'Why Us', href: '#why-us'},
    {label: 'Pricing', href: '#pricing'},
    {label: 'Contact', href: '#contact'},
];

const STATS = [
    {icon: BuildingIcon, value: '500+', label: 'Organizations'},
    {icon: UsersIcon, value: '10,000+', label: 'Active Users'},
    {icon: StarIcon, value: '98%', label: 'Satisfaction Rate'},
    {icon: ShieldIcon, value: '24/7', label: 'Dedicated Support'},
];

const FEATURE_TABS = [
    {
        id: 'companies',
        label: 'For Companies',
        icon: BriefcaseIcon,
        features: [
            {icon: UsersIcon, title: 'Employee Management', desc: 'Manage employees, roles, and departments'},
            {icon: ClockIcon, title: 'Attendance Tracking', desc: 'Track daily attendance with ease'},
            {icon: CalendarIcon, title: 'Leave Management', desc: 'Approve and track leave requests'},
            {icon: CreditCardIcon, title: 'Payroll & Salary', desc: 'Manage salaries and generate payslips'},
            {icon: LayoutGridIcon, title: 'Department Management', desc: 'Organize teams and departments'},
            {icon: TrendingUpIcon, title: 'Performance Reviews', desc: 'Track and evaluate employee performance'},
        ],
    },
    {
        id: 'schools',
        label: 'For Schools',
        icon: GraduationCapIcon,
        features: [
            {icon: UsersIcon, title: 'Student Management', desc: 'Manage students, profiles, and records'},
            {icon: SchoolIcon, title: 'Classrooms & Sections', desc: 'Create and manage classes and sections'},
            {icon: CreditCardIcon, title: 'Fee Management', desc: 'Track fee collections and dues'},
            {icon: FileTextIcon, title: 'Exam / Results', desc: 'Manage exams and publish results'},
            {icon: BookOpenIcon, title: 'Teacher Management', desc: 'Manage teachers and assignments'},
            {icon: CalendarIcon, title: 'Timetable', desc: 'Create and manage class schedules'},
        ],
    },
    {
        id: 'users',
        label: 'User Management',
        icon: UserCogIcon,
        features: [
            {icon: ShieldIcon, title: 'Role-based Access', desc: 'Admin, Employee, Student, Teacher roles'},
            {icon: UsersIcon, title: 'Single Sign-On', desc: 'Secure and easy authentication'},
            {icon: UserCogIcon, title: 'Profile Management', desc: 'Users can update their own profiles'},
            {icon: CalendarIcon, title: 'Activity Logs', desc: 'Track all user activities'},
        ],
    },
];

const STEPS = [
    {num: '1', title: 'Sign Up', desc: 'Create your free account. No credit card required.'},
    {num: '2', title: 'Set Up', desc: 'Add your organization, departments, and users.'},
    {num: '3', title: 'Start Managing', desc: 'Track attendance, fees, and payroll instantly.'},
];

const WHY_CARDS = [
    {
        icon: ShieldIcon,
        title: 'Secure & Reliable',
        desc: 'Enterprise-grade security with data encryption and role-based access'
    },
    {
        icon: TrendingUpIcon,
        title: 'Real-time Analytics',
        desc: 'Track performance with live dashboards and custom reports'
    },
    {icon: UsersIcon, title: '24/7 Support', desc: 'Dedicated support team for your organization, always available'},
    {
        icon: SparklesIcon,
        title: 'Scalable Solution',
        desc: 'Grow your business without limits, from startups to enterprises'
    },
];

const TESTIMONIALS = [
    {
        text: 'OrgSphere transformed our school management. Fee collection and attendance tracking are now a breeze!',
        name: 'Rajesh Kumar',
        role: 'Principal, ABC School',
        initials: 'RK'
    },
    {
        text: 'We manage 200+ employees across 6 departments with ease. The payroll feature is a lifesaver.',
        name: 'Priya Sharma',
        role: 'HR Manager, XYZ Company',
        initials: 'PS'
    },
    {
        text: 'The user-friendly interface and 24/7 support make OrgSphere the best choice for our organization.',
        name: 'Amit Verma',
        role: 'CTO, TechStart Inc.',
        initials: 'AV'
    },
];

const PLANS = [
    {
        name: 'Free Trial', price: '7 Days', period: 'Free', highlighted: true,
        features: ['All features included', 'No credit card required', 'Cancel anytime'],
        cta: 'Start Free Trial',
    },
    {
        name: 'Pro Monthly', price: '₹499', period: '/month', highlighted: false,
        features: ['All features included', 'Up to 100 users', 'Email support'],
        cta: 'Buy Now',
    },
    {
        name: 'Pro Annual', price: '₹4,999', period: '/year', highlighted: false, badge: 'Save 16%',
        features: ['Save 16%', 'All features included', 'Up to 500 users', 'Priority support'],
        cta: 'Buy Now',
    },
];

const FAQS = [
    {
        q: 'What is OrgSphere?',
        a: 'OrgSphere is a complete management solution for companies and schools, offering features like employee/student management, attendance, fees, leaves, and payroll.'
    },
    {
        q: 'Is it free?',
        a: 'Yes, we offer a 7-day free trial. After that, choose a plan that fits your organization\'s needs.'
    },
    {q: 'Can I switch plans?', a: 'Yes, you can upgrade or downgrade your plan anytime from your account settings.'},
    {
        q: 'Is my data secure?',
        a: 'Absolutely. We use enterprise-grade encryption, regular backups, and role-based access to keep your data safe.'
    },
    {q: 'Do you offer support?', a: 'Yes, we provide 24/7 support via live chat and email for all paid plans.'},
];

const FOOTER_COLS = [
    {title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog']},
    {title: 'Company', links: ['About', 'Careers', 'Blog', 'Contact']},
    {title: 'Resources', links: ['Help Center', 'Documentation', 'API', 'Community']},
];

/* ------------------------------- Component -------------------------------- */

const HomePage = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState('companies');
    const [openFaq, setOpenFaq] = useState(0);
    const [registerOpen, setRegisterOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const currentTab = FEATURE_TABS.find((t) => t.id === activeTab);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
            {/* Animations */}
            <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes blob { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-30px) scale(1.1); } 66% { transform: translate(-20px,20px) scale(0.95); } }
        .animate-fade-up { animation: fadeUp .7s ease-out both; }
        .animate-floaty { animation: floaty 6s ease-in-out infinite; }
        .animate-blob { animation: blob 12s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
      `}</style>

            {/* ============================ 1. NAVBAR ============================ */}
            <nav
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 flex justify-center px-4 pt-5 ${
                    scrolled ? 'bg-white/80 shadow-md backdrop-blur-lg' : 'bg-transparent'
                }`}
            >
                <div
                    className={`flex items-center justify-between gap-6 px-5 py-2.5 w-full max-w-4xl transition-all duration-300 rounded-full ${
                        scrolled
                            ? 'bg-white/80 shadow-md backdrop-blur-lg'
                            : 'bg-transparent'
                    }`}
                    style={{
                        borderRadius: 999,
                        border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        background: scrolled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    {/* logo */}
                    <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{background: 'linear-gradient(135deg, #7c3aed, #4f46e5)'}}>
              <SparklesIcon className="h-4 w-4 text-white"/>
            </span>
                        <span className="font-bold text-sm tracking-tight text-slate-900">OrgSphere</span>
                    </Link>

                    {/* desktop links */}
                    <div className="hidden md:flex items-center gap-6">
                        {NAV_LINKS.map((l) => (
                            <a
                                key={l.href}
                                href={l.href}
                                className="text-xs font-medium transition-colors hover:text-violet-600"
                                style={{color: '#4b5563'}}
                                onMouseEnter={e => e.target.style.color = '#7c3aed'}
                                onMouseLeave={e => e.target.style.color = '#4b5563'}
                            >
                                {l.label}
                            </a>
                        ))}
                    </div>

                    {/* desktop actions */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link
                            to="/login"
                            className="text-xs font-medium px-4 py-1.5 rounded-full transition-all hover:bg-slate-100"
                            style={{color: '#4b5563', border: 'none', background: 'transparent'}}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                                e.currentTarget.style.color = '#1f2937'
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#4b5563'
                            }}
                        >
                            Sign in
                        </Link>
                        <button
                            onClick={() => setRegisterOpen(true)}
                            className="text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1 transition-all hover:scale-105 active:scale-95"
                            style={{background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff'}}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 15px rgba(124,58,237,0.4)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                            Get Started
                            <ArrowRightIcon className="w-3 h-3"/>
                        </button>
                    </div>

                    {/* mobile toggle */}
                    <button className="md:hidden" onClick={() => setMenuOpen(v => !v)}>
                        {menuOpen ? <CloseIcon className="w-5 h-5"/> : <MenuIcon className="w-5 h-5"/>}
                    </button>
                </div>

                {/* mobile menu */}
                {menuOpen && (
                    <div className="absolute top-20 left-4 right-4 p-5 flex flex-col gap-3 rounded-2xl" style={{
                        background: 'rgba(255,255,255,0.95)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(12px)'
                    }}>
                        {NAV_LINKS.map(l => <a key={l.href} href={l.href} className="text-sm hover:text-violet-600"
                                               style={{color: '#4b5563'}}
                                               onClick={() => setMenuOpen(false)}>{l.label}</a>)}
                        <Link to="/login" className="text-sm hover:text-violet-600" style={{color: '#4b5563'}}
                              onClick={() => setMenuOpen(false)}>Sign in</Link>
                        <button
                            className="text-sm font-semibold rounded-full py-2 text-center transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff' }}
                            onClick={() => { setRegisterOpen(true); setMenuOpen(false); }}
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </nav>

            {/* ============================= 2. HERO ============================= */}
            <header
                className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-white to-white pt-32 pb-20 sm:pt-40">
                {/* decorative blobs */}
                <div
                    className="pointer-events-none absolute -top-20 -left-24 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl animate-blob"/>
                <div
                    className="pointer-events-none absolute top-10 right-0 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl animate-blob"
                    style={{animationDelay: '3s'}}/>

                <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span
              className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-sm backdrop-blur">
            <span aria-hidden>🚀</span> New: 7-Day Free Trial Available
          </span>

                    <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
                        Manage Your{' '}
                        <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Company &amp; School
            </span>{' '}
                        All in One Place
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600">
                        OrgSphere is the complete management solution for companies and schools. Streamline your
                        operations with our powerful SaaS platform.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <button
                            onClick={() => setRegisterOpen(true)}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-violet-500/30 transition-transform hover:scale-105"
                        >
                            Get Started <ArrowRightIcon className="h-5 w-5"/>
                        </button>
                        <button
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                            <PlayIcon className="h-5 w-5 text-violet-600"/> Watch Demo
                        </button>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className="h-4 w-4 fill-amber-400 text-amber-400"/>
                            ))}
                        </div>
                        Trusted by 500+ organizations worldwide
                    </div>

                    {/* Dashboard mockup */}
                    <div className="mx-auto mt-14 max-w-4xl animate-fade-up">
                        <div
                            className="rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-violet-500/10">
                            <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 sm:p-14">
                                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                                    {[
                                        {icon: BuildingIcon, label: 'Companies'},
                                        {icon: GraduationCapIcon, label: 'Schools'},
                                        {icon: UsersIcon, label: 'Users'},
                                        {icon: TrendingUpIcon, label: 'Analytics'},
                                    ].map((item, i) => (
                                        <div
                                            key={item.label}
                                            className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 p-5 text-white backdrop-blur animate-floaty"
                                            style={{animationDelay: `${i * 0.6}s`}}
                                        >
                                            <item.icon className="h-8 w-8"/>
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ============================ 3. STATS ============================ */}
            <section className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
                <div
                    className="mx-auto grid max-w-6xl grid-cols-2 gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl sm:gap-6 lg:grid-cols-4">
                    {STATS.map((stat) => (
                        <div key={stat.label}
                             className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center transition-colors hover:bg-violet-50">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <stat.icon className="h-6 w-6"/>
              </span>
                            <span className="text-2xl font-extrabold sm:text-3xl">{stat.value}</span>
                            <span className="text-sm text-slate-500">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* =========================== 4. FEATURES ========================== */}
            <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">Everything You Need to Manage</h2>
                    <p className="mt-4 text-lg text-slate-600">
                        Designed for both educational institutions and corporate environments.
                    </p>
                </div>

                {/* Tabs */}
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                    {FEATURE_TABS.map((tab) => {
                        const active = tab.id === activeTab;
                        const IconComp = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                                    active
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <IconComp className="h-5 w-5"/>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Feature grid */}
                <div key={activeTab} className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {currentTab.features.map((f, i) => {
                        const IconComp = f.icon;
                        return (
                            <div
                                key={f.title}
                                className="group animate-fade-up rounded-2xl border border-slate-100 bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                                style={{animationDelay: `${i * 0.08}s`}}
                            >
                <span
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                  <IconComp className="h-6 w-6"/>
                </span>
                                <h3 className="text-lg font-bold">{f.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ========================= 5. HOW IT WORKS ======================== */}
            <section className="bg-slate-50 py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">Get Started in 3 Simple
                            Steps</h2>
                    </div>

                    <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
                        {STEPS.map((step, i) => (
                            <div key={step.num} className="relative flex flex-col items-center text-center">
                <span
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-extrabold text-white shadow-lg shadow-violet-500/30">
                  {step.num}
                </span>
                                {i < STEPS.length - 1 && (
                                    <ArrowRightIcon
                                        className="absolute top-6 left-[calc(50%+3.5rem)] hidden h-8 w-8 text-violet-300 md:block"/>
                                )}
                                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                                <p className="mt-2 max-w-xs text-slate-600">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================== 6. WHY US ============================ */}
            <section id="why-us" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">Why Choose OrgSphere?</h2>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {WHY_CARDS.map((card, i) => {
                        const IconComp = card.icon;
                        return (
                            <div
                                key={card.title}
                                className="animate-fade-up rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                                style={{animationDelay: `${i * 0.08}s`}}
                            >
                <span
                    className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
                  <IconComp className="h-7 w-7"/>
                </span>
                                <h3 className="text-lg font-bold">{card.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ======================== 7. TESTIMONIALS ========================= */}
            <section className="bg-gradient-to-b from-violet-50 to-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">What Our Users Say</h2>
                    </div>

                    <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
                        {TESTIMONIALS.map((t, i) => (
                            <div
                                key={t.name}
                                className="animate-fade-up flex flex-col rounded-2xl border border-slate-100 bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                                style={{animationDelay: `${i * 0.1}s`}}
                            >
                                <QuoteIcon className="h-8 w-8 text-violet-300"/>
                                <p className="mt-4 flex-1 leading-relaxed text-slate-700">{t.text}</p>
                                <div className="mt-6 flex items-center gap-3">
                  <span
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
                    {t.initials}
                  </span>
                                    <div>
                                        <p className="text-sm font-bold">{t.name}</p>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =========================== 8. PRICING =========================== */}
            <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">Start Your 7-Day Free Trial
                        Today!</h2>
                    <p className="mt-4 text-lg text-slate-600">
                        No credit card required. Get started with OrgSphere and transform your organization.
                    </p>
                </div>

                <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col rounded-3xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl ${
                                plan.highlighted
                                    ? 'border-2 border-transparent bg-gradient-to-b from-violet-600 to-indigo-600 text-white shadow-violet-500/30'
                                    : 'border border-slate-100'
                            }`}
                        >
                            {plan.highlighted && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-amber-950 shadow">
                  MOST POPULAR
                </span>
                            )}
                            {plan.badge && !plan.highlighted && (
                                <span
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-100 px-4 py-1 text-xs font-bold text-violet-700">
                  {plan.badge}
                </span>
                            )}

                            <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                            <div className="mt-4 flex items-end gap-1">
                                <span className="text-4xl font-extrabold">{plan.price}</span>
                                <span
                                    className={`mb-1 text-sm ${plan.highlighted ? 'text-violet-100' : 'text-slate-500'}`}>{plan.period}</span>
                            </div>

                            <ul className="mt-6 flex-1 space-y-3">
                                {plan.features.map((feat) => (
                                    <li key={feat} className="flex items-center gap-2 text-sm">
                                        <CheckIcon
                                            className={`h-5 w-5 shrink-0 ${plan.highlighted ? 'text-amber-300' : 'text-violet-600'}`}/>
                                        <span
                                            className={plan.highlighted ? 'text-violet-50' : 'text-slate-600'}>{feat}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => setRegisterOpen(true)}
                                className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-105 ${
                                    plan.highlighted
                                        ? 'bg-white text-violet-700 shadow-lg'
                                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
                                }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* ============================= 9. FAQ ============================= */}
            <section className="bg-slate-50 py-24">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-balance text-3xl font-extrabold sm:text-4xl">Frequently Asked Questions</h2>
                    </div>

                    <div className="mt-12 space-y-4">
                        {FAQS.map((faq, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={faq.q}
                                     className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <button
                                        onClick={() => setOpenFaq(open ? -1 : i)}
                                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                                        aria-expanded={open}
                                    >
                                        <span className="font-semibold">{faq.q}</span>
                                        <ChevronDownIcon
                                            className={`h-5 w-5 shrink-0 text-violet-600 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}/>
                                    </button>
                                    <div
                                        className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            <p className="px-6 pb-5 leading-relaxed text-slate-600">{faq.a}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ============================ 10. FOOTER ========================== */}
            <footer id="contact" className="bg-slate-950 text-slate-300">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
                        {/* Brand */}
                        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                            <Link to="/" className="flex items-center gap-2">
                <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  <SparklesIcon className="h-5 w-5"/>
                </span>
                                <span className="text-xl font-extrabold text-white">OrgSphere</span>
                            </Link>
                            <p className="mt-4 text-sm text-slate-400">Manage smarter.</p>
                            <div className="mt-5 flex gap-3">
                                <a href="#contact"
                                   className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-violet-600 hover:text-white"><LinkedinIcon
                                    className="h-4 w-4"/></a>
                                <a href="#contact"
                                   className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-violet-600 hover:text-white"><TwitterIcon
                                    className="h-4 w-4"/></a>
                                <a href="#contact"
                                   className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-violet-600 hover:text-white"><YoutubeIcon
                                    className="h-4 w-4"/></a>
                                <a href="#contact"
                                   className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors hover:bg-violet-600 hover:text-white"><GithubIcon
                                    className="h-4 w-4"/></a>
                            </div>
                        </div>

                        {FOOTER_COLS.map((col) => (
                            <div key={col.title}>
                                <h4 className="text-sm font-bold text-white">{col.title}</h4>
                                <ul className="mt-4 space-y-3">
                                    {col.links.map((link) => (
                                        <li key={link}>
                                            <a href="#contact"
                                               className="text-sm text-slate-400 transition-colors hover:text-violet-400">
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}

                        {/* Contact col */}
                        <div>
                            <h4 className="text-sm font-bold text-white">Contact</h4>
                            <ul className="mt-4 space-y-3 text-sm text-slate-400">
                                <li className="flex items-center gap-2"><MailIcon
                                    className="h-4 w-4"/> hello@orgsphere.com
                                </li>
                                <li className="flex items-center gap-2"><AwardIcon className="h-4 w-4"/> ISO 27001
                                    Certified
                                </li>
                                <li className="flex items-center gap-2"><ClipboardListIcon className="h-4 w-4"/> GDPR
                                    Compliant
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
                        © 2026 OrgSphere. All rights reserved. Made with{' '}
                        <span className="text-rose-500">❤</span> for companies &amp; schools.
                    </div>
                </div>
            </footer>

            {/* Register Modal */}
            {registerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                         onClick={() => setRegisterOpen(false)}/>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Create your account</h3>
                        <p className="text-sm text-slate-500 mb-6">Choose your organisation type to register.</p>
                        <button
                            onClick={() => {
                                navigate('/register/company');
                                setRegisterOpen(false);
                            }}
                            className="w-full flex items-center gap-4 border border-slate-200 rounded-xl p-4 mb-3 hover:border-violet-500 hover:bg-violet-50 transition-all text-left group"
                        >
                <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all shrink-0">
                  <BuildingIcon className="h-5 w-5"/>
                </span>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">Register as Company</p>
                                <p className="text-xs text-slate-500">Employees, departments, payroll</p>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                navigate('/register/school');
                                setRegisterOpen(false);
                            }}
                            className="w-full flex items-center gap-4 border border-slate-200 rounded-xl p-4 hover:border-violet-500 hover:bg-violet-50 transition-all text-left group"
                        >
                <span
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all shrink-0">
                  <GraduationCapIcon className="h-5 w-5"/>
                </span>
                            <div>
                                <p className="font-semibold text-slate-800 text-sm">Register as School</p>
                                <p className="text-xs text-slate-500">Students, classrooms, fees</p>
                            </div>
                        </button>
                        <button onClick={() => setRegisterOpen(false)}
                                className="mt-4 w-full text-sm text-slate-400 hover:text-slate-600">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;