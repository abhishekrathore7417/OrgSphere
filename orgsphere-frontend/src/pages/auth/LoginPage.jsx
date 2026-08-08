import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaBuilding, FaSchool, FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';
import { setCredentials } from '../../features/auth/authSlice';

/* ── SVG Icon helper ─────────────────────────────────────── */
const Ic = ({ d, cls, sw = 2 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}
         strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <path d={d} />
    </svg>
);

/* ── Icon shortcuts ──────────────────────────────────────── */
const IcArrow    = cls => <Ic cls={cls} sw={2.5} d="M5 12h14M13 6l6 6-6 6" />;
const IcChevron  = cls => <Ic cls={cls} d="m6 9 6 6 6-6" />;
const IcMenu     = cls => <Ic cls={cls} d="M4 6h16M4 12h16M4 18h16" />;
const IcClose    = cls => <Ic cls={cls} d="M18 6L6 18M6 6l12 12" />;
const IcCheck    = cls => <Ic cls={cls} sw={2.5} d="M20 6L9 17l-5-5" />;
const IcMail     = cls => <Ic cls={cls} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />;
const IcPhone    = cls => <Ic cls={cls} d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.27 9.76 19.79 19.79 0 01.21 1.2 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />;
const IcBuilding = cls => <Ic cls={cls} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />;
const IcUsers    = cls => <Ic cls={cls} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />;
const IcShield   = cls => <Ic cls={cls} d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4" />;
const IcTrend    = cls => <Ic cls={cls} d="M23 6l-7.5 7.5-5-5L3 16 M23 10v-4h-4" />;
const IcClock    = cls => <Ic cls={cls} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />;
const IcCalendar = cls => <Ic cls={cls} d="M8 2v4M16 2v4M3 10h18M21 14V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h7" />;
const IcCard     = cls => <Ic cls={cls} d="M21 4H3a2 2 0 00-2 2v12a2 2 0 002 2h18a2 2 0 002-2V6a2 2 0 00-2-2z M3 10h18" />;
const IcGrad     = cls => <Ic cls={cls} d="M22 10L12 5 2 10l10 5 10-5z M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5" />;
const IcGrid     = cls => <Ic cls={cls} d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" />;
const IcBell     = cls => <Ic cls={cls} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />;
const IcLinkedin = cls => <Ic cls={cls} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 4a2 2 0 110 4 2 2 0 010-4z" />;
const IcTwitter  = cls => <Ic cls={cls} d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />;
const IcGithub   = cls => <Ic cls={cls} d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />;
const IcSearch   = cls => <Ic cls={cls} d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35" />;

const IcAlertCircle = cls => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" className={cls}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="7.5" x2="12" y2="13" />
        <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
);

/* ── Nav links ───────────────────────────────────────────── */
const NAV = [
    { label: 'Home',     href: '#home'     },
    { label: 'Features', href: '#features' },
    { label: 'About',    href: '#about'    },
    { label: 'Pricing',  href: '#pricing'  },
    { label: 'Contact',  href: '#contact'  },
];

/* ── Ticker messages ─────────────────────────────────────── */
const TICKERS = [
    { pre: 'OrgSphere — ', hi: 'Complete Management Platform', post: ' for Companies & Schools' },
    { pre: '', hi: '7-Day Free Trial', post: ' Available — No Credit Card Required' },
    { pre: 'Manage Employees, Students, Attendance, Fees & Payroll ', hi: 'in One Place', post: '' },
    { pre: '', hi: 'Real-time Dashboards', post: ' with Auto-refreshing Analytics' },
    { pre: '', hi: 'Enterprise-grade Security', post: ' with Role-based Access Control' },
    { pre: 'Now supporting ', hi: 'School Portals', post: ' — Classrooms, Fees, Teacher Management' },
];

const TickerItem = ({ t, cls = '', highlight = true }) => (
    highlight ? (
        <span className={`inline-flex items-center gap-2 ${cls}`}>
            {t.pre}<span className="font-black" style={{ color: '#d62d20' }}>{t.hi}</span>{t.post}
        </span>
    ) : (
        <span className={`inline-flex items-center gap-2 ${cls}`}>
            {t.pre}{t.hi}{t.post}
        </span>
    )
);

/* ── Hero stats ───────────────────────────────────────────── */
const HERO_STATS = [
    { val: '500',   label: 'Organizations'  },
    { val: '40K',   label: 'People Managed' },
    { val: '99.9%', label: 'Uptime'         },
    { val: '2',     label: 'Portal Types'   },
];

const TRUST_BADGES = ['Company', 'School', 'JWT Auth', 'RBAC'];

/* ── About accordion ─────────────────────────────────────── */
const ABOUT_TABS = [
    {
        title: 'For Companies',
        body: 'Manage your entire workforce — employees, departments, attendance, leaves and payroll — from a single unified dashboard. Built for teams of 10 to 10,000.',
    },
    {
        title: 'For Schools',
        body: 'Handle student enrollment, classroom management, fee collection, teacher salary, attendance and leaves. Everything a school needs to run smoothly.',
    },
    {
        title: 'All Organizations',
        body: 'OrgSphere is built to scale across any type of organization. Whether you run a company, school or both — one platform handles it all.',
    },
];

/* ── Services ────────────────────────────────────────────── */
const SERVICES = [
    { icon: IcUsers,    title: 'Employee & Student Management', desc: 'Complete profiles, roles, departments and classroom records in one place.' },
    { icon: IcClock,    title: 'Attendance Tracking',           desc: 'Daily attendance for employees and students with check-in/out history.'   },
    { icon: IcCalendar, title: 'Leave Management',              desc: 'Apply, approve and track leave requests digitally — no paperwork.'        },
    { icon: IcCard,     title: 'Payroll & Fee Management',      desc: 'Employee salary records and student fee collection with payment history.'  },
    { icon: IcGrid,     title: 'Department & Classroom Setup',  desc: 'Organize teams, departments and school classrooms with a tree view.'      },
    { icon: IcTrend,    title: 'Real-time Analytics',           desc: 'Auto-refreshing dashboards, KPI charts and recent activity feeds.'        },
];

/* ── Notices ─────────────────────────────────────────────── */
const NOTICES = [
    { title: 'OrgSphere v2.0 launched — New school portal features',      date: '5 Aug 2026' },
    { title: 'Free 7-day trial now available for all plans',               date: '3 Aug 2026' },
    { title: 'New: Department-wise attendance filtering added',            date: '1 Aug 2026' },
    { title: 'Employee salary management — bulk update support added',     date: '28 Jul 2026' },
    { title: 'Student fee tracking — partial payment support live',        date: '25 Jul 2026' },
];

/* ── FAQ ─────────────────────────────────────────────────── */
const FAQS = [
    { q: 'What is OrgSphere?',                          a: 'OrgSphere is a complete SaaS management platform for companies and schools — employee/student management, attendance, fees, leaves and payroll, all in one place.' },
    { q: 'Is there a free trial?',                      a: 'Yes — 7 days free with every feature unlocked. No credit card required.' },
    { q: 'Can I manage both a company and a school?',   a: 'Yes. One account supports multiple organization types — each with its own portal, roles and data.' },
    { q: 'Is my data secure?',                          a: 'We use JWT authentication, role-based access control and encrypted storage. Your data is fully isolated per organization.' },
    { q: 'How do I get started?',                       a: 'Click "Get Started", choose your organization type (Company or School), register and you\'re live in under 2 minutes.' },
];

/* ── Pricing plans ───────────────────────────────────────── */
const PLANS = [
    { name: 'Free Trial',  price: 'Free',  sub: '7 days · All features',
        items: ['All features included', 'Up to 50 users', 'Community support'],               cta: 'Start Free',   hot: false },
    { name: 'Pro',         price: '₹499',  sub: 'per month',
        items: ['All features', 'Up to 200 users', 'Email support', 'Advanced analytics'],     cta: 'Get Pro',      hot: true  },
    { name: 'Annual',      price: '₹4,999',sub: 'per year · Save 17%',
        items: ['All features', 'Unlimited users', 'Priority support', 'Custom branding'],     cta: 'Go Annual',    hot: false },
];

/* ── Footer columns ──────────────────────────────────────── */
const FOOTER_COLS = [
    { title: 'Platform',  links: ['Features', 'Pricing', 'Changelog', 'API Docs'] },
    { title: 'Company',   links: ['About Us', 'Careers', 'Blog', 'Press']         },
    { title: 'Support',   links: ['Help Center', 'Documentation', 'Community', 'Status'] },
];

/* ── Palette ── */
const NAVY   = '#1a2b3c';   /* darker grey */
const RED    = '#d62d20';
const RED_D  = '#c62828';
const GOLD   = '#f0a500';
const TOPBAR_NAVY = '#1a3a5a';

/* ── Logo ────────────────────────────────────────────────── */
const Logo = () => (
    <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 flex items-center justify-center shrink-0" style={{ background: RED }}>
            <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ color: NAVY }}>OrgSphere</span>
    </div>
);

const BtnPrimary = ({ children, onClick, className = '' }) => (
    <button onClick={onClick}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white transition-all hover:brightness-110 ${className}`}
            style={{ background: RED }}>
        {children}
    </button>
);

const BtnSecondary = ({ children, onClick, className = '' }) => (
    <button onClick={onClick}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white transition-all hover:brightness-110 ${className}`}
            style={{ background: NAVY }}>
        {children}
    </button>
);

const BLUE = '#2563eb';
const BtnBlue = ({ children, onClick, className = '' }) => (
    <button onClick={onClick}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white transition-all hover:brightness-110 ${className}`}
            style={{ background: BLUE }}>
        {children}
    </button>
);

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const HomePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [navOpen,  setNavOpen]  = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [openFaq,  setOpenFaq]  = useState(-1);
    const [regOpen,  setRegOpen]  = useState(false);

    // Login modal state
    const [loginOpen, setLoginOpen] = useState(false);
    const [loginStep, setLoginStep] = useState(0); // 0: choose type, 1: login form
    const [orgType, setOrgType] = useState('company');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Login handler (copied from your original LoginPage)
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                email: identifier,
                password,
            });
            const data = response.data;
            if (data.token) {
                if (orgType === 'company' && data.organizationType === 'SCHOOL') {
                    toast.error('This email is registered as SCHOOL', { autoClose: 1500 });
                    setLoading(false);
                    return;
                }
                if (orgType === 'school' && data.organizationType === 'COMPANY') {
                    toast.error('This email is registered as COMPANY', { autoClose: 1500 });
                    setLoading(false);
                    return;
                }
                const userData = {
                    id: data.userId,
                    fullName: data.fullName,
                    email: data.email,
                    role: data.role,
                    organizationType: data.organizationType,
                    organizationName: data.organizationName,
                    organizationId: data.organizationId,
                };
                dispatch(setCredentials({
                    user: userData,
                    token: data.token,
                    organizationType: data.organizationType,
                }));
                toast.success('✅ Login successful!', { autoClose: 1000 });
                setLoginOpen(false);
                setLoginStep(0);
                setIdentifier('');
                setPassword('');
                setTimeout(() => {
                    if (data.organizationType === 'COMPANY') {
                        navigate('/company/dashboard');
                    } else {
                        navigate('/school/dashboard');
                    }
                }, 500);
            } else {
                toast.error(data.message || 'Login failed', { autoClose: 1500 });
            }
        } catch (error) {
            toast.error('Invalid email or password', { autoClose: 1500 });
        } finally {
            setLoading(false);
        }
    };

    // Reset login state when modal closes
    const closeLogin = () => {
        setLoginOpen(false);
        setLoginStep(0);
        setIdentifier('');
        setPassword('');
        setShowPassword(false);
        setLoading(false);
        document.body.style.overflow = 'auto';
    };

    // Lock body scroll when modal opens
    useEffect(() => {
        if (loginOpen || regOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [loginOpen, regOpen]);

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 antialiased" style={{ fontFamily: "'Segoe UI','Inter',Arial,sans-serif" }}>
            <style>{`
                @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                @keyframes tickerUpdates { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                .ticker-track { animation: ticker 35s linear infinite; display: flex; gap: 60px; white-space: nowrap; }
                .ticker-track-gap { animation: tickerUpdates 55s linear infinite; display: flex; gap: 80px; white-space: nowrap; }
                .au { animation: fadeUp .55s ease both }
                html { scroll-behavior: smooth }
                .nav-link { position:relative; font-size:14px; font-weight:500; color:#1e293b; transition:color .2s; padding:4px 0; }
                .nav-link:hover { color:${RED} }
                .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; background:${RED}; transform:scaleX(0); transition:transform .2s; }
                .nav-link:hover::after { transform:scaleX(1) }
                .service-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.1) }
                .service-card { transition: all .25s ease }
                .updates-row {
                    max-height: 34px;
                    overflow: hidden;
                    transition: max-height .3s ease, opacity .25s ease;
                    opacity: 1;
                    border-top: 1px solid rgba(255,255,255,0.08);
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }
                .updates-row.is-hidden { max-height: 0; opacity: 0; border: none; }
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 38vw;
                    font-weight: 900;
                    letter-spacing: 0.1em;
                    color: rgba(255, 255, 255, 0.06);
                    white-space: nowrap;
                    pointer-events: none;
                    user-select: none;
                    text-transform: none;
                }
                @media (min-width: 768px) {
                    .watermark { font-size: 32vw; }
                }
            `}</style>

            {/* ══ STICKY HEADER GROUP ══ */}
            <div className="sticky top-0 z-50">
                {/* Top info bar */}
                <div className="hidden md:flex items-center gap-4 text-white text-xs py-1" style={{ background: TOPBAR_NAVY }}>
                    <span className="shrink-0 flex items-center gap-1 font-bold px-2.5 py-0.5 text-[11px] rounded-full ml-4" style={{ background: GOLD, color: NAVY }}>
                        Free Trial — 7 Days
                    </span>
                    <div className="flex-1 overflow-hidden max-w-7xl">
                        <div className="ticker-track font-medium opacity-95">
                            {[...TICKERS, ...TICKERS].map((t, i) => (
                                <span key={i} className="inline-flex items-center gap-2">
                                    <TickerItem t={t} highlight={false} />
                                    <span className="opacity-40">|</span>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-4 pr-4">
                        <span className="flex items-center gap-1.5 opacity-90">
                            {IcPhone('w-3 h-3')} +91 7417015597
                        </span>
                        <span className="opacity-30">|</span>
                        <span className="flex items-center gap-1.5 opacity-90">
                            {IcMail('w-3 h-3')} abhishekrathore7417@gmail.com
                        </span>
                        <span className="opacity-30">|</span>
                        <button onClick={() => setRegOpen(true)} className="font-bold hover:underline flex items-center gap-1">
                            Register {IcArrow('w-3 h-3')}
                        </button>
                    </div>
                </div>

                {/* Navbar */}
                <nav className={`bg-white transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-[72px] gap-6">
                            <Link to="/"><Logo /></Link>
                            <div className="hidden lg:flex items-center gap-7">
                                {NAV.map(l => <a key={l.href} href={l.href} className="nav-link">{l.label}</a>)}
                            </div>
                            <div className="hidden md:flex items-center gap-3">
                                <button aria-label="Search" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-slate-300 transition-colors">
                                    {IcSearch('w-4 h-4')}
                                </button>
                                <button
                                    onClick={() => setLoginOpen(true)}
                                    className="text-sm font-bold text-slate-600 px-2 hover:text-red-600 transition-colors"
                                >
                                    Sign In
                                </button>
                                <BtnPrimary onClick={() => setRegOpen(true)}>Register</BtnPrimary>
                                <button aria-label="Menu" onClick={() => setNavOpen(v => !v)}
                                        className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ background: NAVY }}>
                                    {IcMenu('w-4 h-4 text-white')}
                                </button>
                            </div>
                            <button className="md:hidden" onClick={() => setNavOpen(v => !v)}>
                                {navOpen ? IcClose('w-5 h-5 text-slate-700') : IcMenu('w-5 h-5 text-slate-700')}
                            </button>
                        </div>
                    </div>
                    {navOpen && (
                        <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3 shadow-lg">
                            {NAV.map(l => <a key={l.href} href={l.href} className="text-sm font-semibold text-slate-600 hover:text-red-600" onClick={() => setNavOpen(false)}>{l.label}</a>)}
                            <hr className="border-slate-100" />
                            <button onClick={() => { setLoginOpen(true); setNavOpen(false); }} className="text-sm font-semibold text-slate-600 text-left">Sign In</button>
                            <BtnPrimary onClick={() => { setRegOpen(true); setNavOpen(false); }} className="w-full">Register</BtnPrimary>
                        </div>
                    )}
                </nav>

                {/* UPDATES ticker */}
                <div className={`overflow-hidden updates-row ${scrolled ? 'is-hidden' : ''}`} style={{ background: NAVY }}>
                    <div className="flex items-stretch">
                        <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-black text-white px-2.5" style={{ background: RED }}>
                            {IcAlertCircle('w-3.5 h-3.5')} UPDATES
                        </div>
                        <div className="overflow-hidden flex-1 flex items-center py-1.5">
                            <div className="ticker-track-gap text-[11px] text-slate-200 font-semibold">
                                {[...TICKERS, ...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => (
                                    <TickerItem key={i} t={t} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ HERO ══ */}
            <section id="home" className="relative overflow-hidden" style={{ background: NAVY, minHeight: '560px' }}>
                <div className="absolute inset-0 opacity-[0.04]"
                     style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-1 text-white au">
                        <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
                            <span className="w-8 h-0.5 inline-block" style={{ background: GOLD }} />
                            THE COMPLETE ORG MANAGEMENT PLATFORM
                        </p>
                        <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-5" style={{ letterSpacing: '-0.02em' }}>
                            One Platform for<br />
                            <span style={{ color: RED }}>Companies + Schools</span><br />
                            + All Organizations
                        </h1>
                        <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-xl">
                            Manage employees, students, attendance, fees, payroll and leaves — all from a single dashboard. Built for companies, schools and every organization in between.
                        </p>
                        <div className="flex flex-col gap-2 mb-8">
                            <div className="flex flex-wrap gap-2">
                                {['Employee Management', 'School Portal', 'Attendance Tracking'].map(b => (
                                    <span key={b} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border text-slate-200"
                                          style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.07)' }}>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: RED }} />
                                        {b}
                                    </span>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['Fee Management', 'Payroll'].map(b => (
                                    <span key={b} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border text-slate-200"
                                          style={{ borderColor: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.07)' }}>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: RED }} />
                                        {b}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <BtnPrimary onClick={() => setRegOpen(true)} className="text-xs px-5 py-2.5">
                                {IcArrow('w-4 h-4')} Apply Now
                            </BtnPrimary>
                            <BtnBlue onClick={() => setRegOpen(true)} className="text-xs px-5 py-2.5">
                                {IcArrow('w-4 h-4')} Book a Demo
                            </BtnBlue>
                        </div>
                    </div>

                    <div className="au w-full lg:w-96 shrink-0" style={{ animationDelay: '.15s' }}>
                        <div className="rounded-2xl p-6 sm:p-7" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                                {HERO_STATS.map(s => (
                                    <div key={s.label}>
                                        <p className="font-bold text-white" style={{ fontSize: '1.9rem', lineHeight: 1 }}>
                                            {s.val}{!s.val.includes('%') && <span style={{ color: RED }}>+</span>}
                                        </p>
                                        <p className="text-xs mt-1.5" style={{ color: '#8fa0b8' }}>{s.label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                {TRUST_BADGES.map(b => (
                                    <div key={b} className="text-center rounded-lg py-2.5 px-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <p className="text-[11px] font-semibold" style={{ color: '#dbe3ec' }}>{b}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ ABOUT ══ */}
            <section id="about" className="py-14 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        <div className="au">
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: RED }}>ABOUT ORGSPHERE</p>
                            <h2 className="text-3xl font-black text-slate-900 mb-5" style={{ letterSpacing: '-0.02em' }}>
                                One Goal — Smarter Organization Management
                            </h2>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                OrgSphere is a unified SaaS platform designed to eliminate the complexity of managing organizations. Whether you run a <strong>company with departments and employees</strong> or a <strong>school with classrooms, teachers and students</strong> — we've built one platform for all of it.
                            </p>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                From attendance tracking and leave management to payroll, fee collection and real-time analytics — every feature is crafted for the way modern organizations actually work.
                            </p>
                            <div className="flex flex-wrap gap-6">
                                {[{ n: '500+', l: 'Organizations' }, { n: '10K+', l: 'Users' }, { n: '2', l: 'Portals' }].map(s => (
                                    <div key={s.l}>
                                        <p className="text-2xl font-black" style={{ color: RED }}>{s.n}</p>
                                        <p className="text-xs text-slate-500 font-medium">{s.l}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="au" style={{ animationDelay: '.12s' }}>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">WE SERVE</p>
                            <div className="space-y-2">
                                {ABOUT_TABS.map((t, i) => {
                                    const open = activeTab === i;
                                    return (
                                        <div key={t.title} className="border rounded-xl overflow-hidden transition-all"
                                             style={{ borderColor: open ? RED : '#e2e8f0' }}>
                                            <button onClick={() => setActiveTab(i)}
                                                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                                                    style={{ background: open ? RED : 'white' }}>
                                                <span className={`font-bold text-sm ${open ? 'text-white' : 'text-slate-700'}`}>{t.title}</span>
                                                {IcChevron(`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180 text-white' : 'text-slate-400'}`)}
                                            </button>
                                            {open && (
                                                <div className="px-5 py-4 bg-white border-t" style={{ borderColor: '#fecaca' }}>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{t.body}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ SERVICES ══ */}
            <section id="features" className="py-14 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 mb-3" style={{ letterSpacing: '-0.02em' }}>Our Services</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Enterprise-class solutions tailored for companies, schools and all growing organizations.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SERVICES.map((s, i) => (
                            <div key={s.title} className="service-card au bg-white rounded-xl p-5 text-center shadow-sm border border-slate-100 cursor-default"
                                 style={{ animationDelay: `${i * 0.07}s` }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#fdf1f0' }}>
                                    {s.icon('w-5 h-5 text-red-600')}
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm mb-1.5">{s.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ NOTICES + HIGHLIGHT ══ */}
            <section className="py-14 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="au">
                            <div className="flex items-center justify-between mb-4 px-5 py-3 rounded-t-xl text-white font-bold text-sm" style={{ background: RED }}>
                                <span className="flex items-center gap-2">{IcBell('w-4 h-4')} Latest Updates</span>
                                <button className="text-xs text-red-100 hover:text-white font-semibold">View All →</button>
                            </div>
                            <div className="border border-t-0 border-slate-100 rounded-b-xl divide-y divide-slate-100 overflow-hidden">
                                {NOTICES.map((n, i) => (
                                    <div key={i} className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                        <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: RED }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 leading-snug">{n.title}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{n.date}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="px-5 py-3 text-center">
                                    <button className="text-sm font-semibold hover:underline" style={{ color: RED }}>View All Updates →</button>
                                </div>
                            </div>
                        </div>

                        <div className="au" style={{ animationDelay: '.1s' }}>
                            <div className="flex items-center gap-2 mb-4 px-5 py-3 rounded-t-xl text-white font-bold text-sm" style={{ background: NAVY }}>
                                {IcShield('w-4 h-4')} Why OrgSphere
                            </div>
                            <div className="border border-t-0 border-slate-100 rounded-b-xl p-6 space-y-5">
                                {[
                                    { icon: IcShield,   title: 'Secure by Default',    desc: 'JWT auth, role-based access, encrypted storage for every organization.' },
                                    { icon: IcTrend,    title: 'Real-time Analytics',  desc: 'Auto-refreshing dashboards, charts and activity feeds.' },
                                    { icon: IcUsers,    title: 'Multi-Portal System',  desc: 'Company portal + School portal — both under one account.' },
                                    { icon: IcGrid,     title: 'Scales with You',      desc: 'Handles 10 to 10,000 users — no config changes needed.' },
                                ].map(w => (
                                    <div key={w.title} className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#fdf1f0' }}>
                                            {w.icon('w-5 h-5 text-red-600')}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm mb-0.5">{w.title}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed">{w.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ PRICING ══ */}
            <section id="pricing" className="py-14 bg-slate-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-9">
                        <h2 className="text-3xl font-black text-slate-900 mb-3" style={{ letterSpacing: '-0.02em' }}>Simple Pricing</h2>
                        <p className="text-slate-500">Start free. No hidden fees. Cancel anytime.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                        {PLANS.map((p, i) => (
                            <div key={p.name} className={`au rounded-2xl p-5 flex flex-col transition-all hover:-translate-y-1 ${p.hot ? 'text-white shadow-xl' : 'bg-white border border-slate-100 shadow-sm hover:shadow-md'}`}
                                 style={{ ...(p.hot ? { background: NAVY, boxShadow: '0 16px 40px rgba(26,43,60,0.3)' } : {}), animationDelay: `${i * 0.08}s` }}>
                                {p.hot && <span className="self-start text-[10px] font-black px-2.5 py-0.5 rounded-full mb-2.5" style={{ background: RED, color: 'white' }}>Most Popular</span>}
                                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${p.hot ? 'text-blue-300' : 'text-slate-500'}`}>{p.name}</p>
                                <div className="flex items-end gap-1 mb-0.5">
                                    <span className={`text-3xl font-black ${p.hot ? 'text-white' : 'text-slate-900'}`}>{p.price}</span>
                                </div>
                                <p className={`text-xs mb-4 ${p.hot ? 'text-blue-200' : 'text-slate-400'}`}>{p.sub}</p>
                                <ul className="space-y-2 flex-1 mb-5">
                                    {p.items.map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs">
                                            {IcCheck(`w-3.5 h-3.5 shrink-0 ${p.hot ? 'text-blue-300' : 'text-red-600'}`)}
                                            <span className={p.hot ? 'text-blue-100' : 'text-slate-600'}>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => setRegOpen(true)}
                                        className={`w-full py-2 rounded-md text-[11px] font-black transition-all hover:opacity-90 ${p.hot ? 'bg-white text-blue-900' : 'text-white'}`}
                                        style={p.hot ? {} : { background: RED }}>
                                    {p.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FAQ ══ */}
            <section className="py-14 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-9">
                        <h2 className="text-3xl font-black text-slate-900 mb-3" style={{ letterSpacing: '-0.02em' }}>Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-2">
                        {FAQS.map((f, i) => {
                            const open = openFaq === i;
                            return (
                                <div key={f.q} className="rounded-xl border overflow-hidden transition-all"
                                     style={{ borderColor: open ? RED : '#e2e8f0' }}>
                                    <button onClick={() => setOpenFaq(open ? -1 : i)}
                                            className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                                        <span className="font-semibold text-slate-800 text-sm">{f.q}</span>
                                        {IcChevron(`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ${open ? 'rotate-180' : ''}`)}
                                    </button>
                                    <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                        <div className="overflow-hidden">
                                            <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{f.a}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ CTA BANNER (Reimagine) ══ */}
            <section className="py-10" style={{ background: NAVY }}>
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
                        Reimagine Your <span style={{ color: RED }}>Organization</span>
                    </h2>
                    <p className="text-slate-300 mb-8">Join 500+ companies and schools using OrgSphere. Free 7-day trial, no card needed.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <BtnPrimary onClick={() => setRegOpen(true)} className="px-6 py-3 text-xs">
                            {IcArrow('w-4 h-4')} Get Started Free
                        </BtnPrimary>
                        <BtnBlue onClick={() => setRegOpen(true)} className="px-6 py-3 text-xs">
                            Book a Demo
                        </BtnBlue>
                    </div>
                </div>
            </section>

            {/* Red action strip */}
            <div className="py-6 px-4" style={{ background: RED }}>
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-white font-black text-lg text-center sm:text-left">
                        A Fulfilling Future Awaits Your Organization
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <button onClick={() => setRegOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold bg-white transition-all hover:opacity-90" style={{ color: RED }}>
                            {IcArrow('w-4 h-4')} Get Started
                        </button>
                        <button onClick={() => setRegOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-all">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ FOOTER ══ */}
            <footer id="contact" style={{ background: NAVY }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-9 h-9 flex items-center justify-center" style={{ background: RED }}>
                                    <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg>
                                </div>
                                <span className="font-bold text-lg text-white">OrgSphere</span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-xs">
                                Complete management platform for companies and schools. Manage smarter, grow faster.
                            </p>
                            <div className="space-y-2">
                                <a href="mailto:abhishekrathore7417@gmail.com" className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
                                    {IcMail('w-3.5 h-3.5')} abhishekrathore7417@gmail.com
                                </a>
                                <a href="tel:7417015597" className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
                                    {IcPhone('w-3.5 h-3.5')} +91 7417015597
                                </a>
                            </div>
                            <div className="flex gap-2 mt-5">
                                {[IcLinkedin, IcTwitter, IcGithub].map((ic, i) => (
                                    <a key={i} href="#contact" className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white transition-all">
                                        {ic('w-4 h-4')}
                                    </a>
                                ))}
                            </div>
                        </div>
                        {FOOTER_COLS.map(col => (
                            <div key={col.title}>
                                <p className="text-sm font-bold mb-4" style={{ color: '#fb9d97' }}>{col.title}</p>
                                <ul className="space-y-2.5">
                                    {col.links.map(l => (
                                        <li key={l}><a href="#contact" className="text-sm text-slate-400 hover:text-red-400 transition-colors">{l}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-t py-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-xs text-slate-500">© 2026 OrgSphere. All rights reserved. Made for companies &amp; schools.</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                            <a href="#contact" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                            <a href="#contact" className="hover:text-slate-300 transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ══ REGISTER MODAL (existing) ══ */}
            {regOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRegOpen(false)} />
                    <div className="relative bg-white w-full max-w-sm p-8" style={{ borderTop: `4px solid ${RED}` }}>
                        <button onClick={() => setRegOpen(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors hover:bg-slate-50">
                            {IcClose('w-4 h-4')}
                        </button>
                        <div className="mb-7">
                            <div className="w-11 h-11 flex items-center justify-center mb-4" style={{ background: NAVY }}>
                                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg" style={{ color: NAVY }}>Create your account</h3>
                            <p className="text-sm mt-1 text-slate-500">Select your organisation type</p>
                        </div>
                        <button onClick={() => { navigate('/register/company'); setRegOpen(false); }}
                                className="w-full flex items-center gap-4 p-4 border-2 hover:bg-slate-50 transition-all text-left group mb-3"
                                style={{ borderColor: '#e4e0d6' }}>
                            <span className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: '#f7f5f0', color: NAVY }}>
                                {IcBuilding('w-5 h-5')}
                            </span>
                            <div className="flex-1">
                                <p className="font-bold text-sm" style={{ color: NAVY }}>Register as Company</p>
                                <p className="text-xs mt-0.5 text-slate-400">Employees, departments, payroll</p>
                            </div>
                            {IcArrow('w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform')}
                        </button>
                        <button onClick={() => { navigate('/register/school'); setRegOpen(false); }}
                                className="w-full flex items-center gap-4 p-4 border-2 hover:bg-slate-50 transition-all text-left group"
                                style={{ borderColor: '#e4e0d6' }}>
                            <span className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: '#f7f5f0', color: RED }}>
                                {IcGrad('w-5 h-5')}
                            </span>
                            <div className="flex-1">
                                <p className="font-bold text-sm" style={{ color: NAVY }}>Register as School</p>
                                <p className="text-xs mt-0.5 text-slate-400">Students, classrooms, fees</p>
                            </div>
                            {IcArrow('w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform')}
                        </button>
                        <p className="text-center text-sm mt-5 text-slate-500">
                            Already have an account?{' '}
                            <button onClick={() => { setRegOpen(false); setLoginOpen(true); }} className="font-bold hover:underline" style={{ color: RED_D }}>
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* ══ LOGIN MODAL (with blur effect) ══ */}
            {loginOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeLogin} />
                    <div className="relative bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl" style={{ borderTop: `4px solid ${RED}` }}>
                        <button onClick={closeLogin}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors hover:bg-slate-50 rounded-full">
                            {IcClose('w-4 h-4')}
                        </button>

                        {loginStep === 0 ? (
                            // Step 1: Choose organisation type
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-14 h-14 flex items-center justify-center mx-auto mb-4 rounded-full" style={{ background: NAVY }}>
                                        <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800">Welcome Back</h2>
                                    <p className="text-sm text-slate-500 mt-1">Choose your organisation type to sign in</p>
                                </div>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => { setOrgType('company'); setLoginStep(1); }}
                                        className="w-full flex items-center gap-4 p-4 border-2 rounded-xl hover:bg-slate-50 transition-all text-left group"
                                        style={{ borderColor: '#e4e0d6' }}
                                    >
                                        <span className="w-12 h-12 flex items-center justify-center shrink-0 rounded-lg" style={{ background: '#f7f5f0', color: NAVY }}>
                                            <FaBuilding size={20} />
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm" style={{ color: NAVY }}>Company</p>
                                            <p className="text-xs text-slate-400">Employees, departments, payroll</p>
                                        </div>
                                        {IcArrow('w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform')}
                                    </button>
                                    <button
                                        onClick={() => { setOrgType('school'); setLoginStep(1); }}
                                        className="w-full flex items-center gap-4 p-4 border-2 rounded-xl hover:bg-slate-50 transition-all text-left group"
                                        style={{ borderColor: '#e4e0d6' }}
                                    >
                                        <span className="w-12 h-12 flex items-center justify-center shrink-0 rounded-lg" style={{ background: '#f7f5f0', color: RED }}>
                                            <FaSchool size={20} />
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm" style={{ color: NAVY }}>School</p>
                                            <p className="text-xs text-slate-400">Students, classrooms, fees</p>
                                        </div>
                                        {IcArrow('w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform')}
                                    </button>
                                </div>
                                <p className="text-center text-sm mt-6 text-slate-500">
                                    Don't have an account?{' '}
                                    <button onClick={() => { closeLogin(); setRegOpen(true); }} className="font-bold hover:underline" style={{ color: RED_D }}>
                                        Register
                                    </button>
                                </p>
                            </>
                        ) : (
                            // Step 2: Login form
                            <>
                                <div className="flex items-center gap-3 mb-6">
                                    <button onClick={() => setLoginStep(0)} className="text-slate-400 hover:text-slate-600 transition">
                                        {IcArrow('w-5 h-5')}
                                    </button>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">Sign in as {orgType === 'company' ? 'Company' : 'School'}</h3>
                                    </div>
                                </div>
                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                                        <input
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full px-4 py-3 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(p => !p)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 transition"
                                            >
                                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
                                        style={{ background: RED }}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Logging in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </button>
                                </form>
                                <div className="text-center mt-4">
                                    <Link to="/forgot-password" className="text-sm font-semibold text-red-600 hover:text-red-800 transition">
                                        Forgot your password?
                                    </Link>
                                </div>
                                <p className="text-center text-sm mt-4 text-slate-500">
                                    Don't have an account?{' '}
                                    <button onClick={() => { closeLogin(); setRegOpen(true); }} className="font-bold hover:underline" style={{ color: RED_D }}>
                                        Register
                                    </button>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;