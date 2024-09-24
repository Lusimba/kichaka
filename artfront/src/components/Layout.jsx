import React, { useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { URL } from '../utils/api';

const menuItems = [
    { text: 'New Task', path: '/new-task' },
    { text: 'Production Tracking', path: '/' },
    { text: 'Order Management', path: '/orders' },
    { text: 'Inventory Management', path: '/inventory' },
    { text: 'Human Resources', path: '/hr' },
    { text: 'Payroll', path: '/payroll' },
    { text: 'Defect Tracking', path: '/quality' },
    { text: 'Admin Section', path: '/admin', isExternal: true },
    { text: 'Logout', path: '/logout' },
    // { text: 'Reports', path: '/reports' },
];

function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname.startsWith('/production');
        }
        return location.pathname.startsWith(path);
    };
    console.log( URL );

    const handleLogout = () => {
        dispatch(logoutUser()).then(() => {
            navigate('/login');
        });
    };

    return (
        <div className="flex h-screen bg-gray-100 font-inria">
            <nav className="w-64 bg-white shadow-lg">
                <div className="px-4 py-5 bg-[#DDBEA9]">
                    <h1 className="text-[#653239] text-3xl font-bold font-inder text-center">
                        ArtFlow 360
                    </h1>
                </div>
                <ul className="mt-6">
                    {menuItems.map((item) => (
                        <li key={item.text}>
                            {item.text === 'Logout' ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-[#A5A58D] hover:text-white transition-colors duration-200 text-gray-600"
                                >
                                    {item.text}
                                </button>
                            ) : item.isExternal ? (  // For external links like Admin
                                <a
                                    href={`${URL}/admin/`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block px-4 py-2 hover:bg-[#A5A58D] hover:text-white transition-colors duration-200 text-gray-600"
                                >
                                    {item.text}
                                </a>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`block px-4 py-2 hover:bg-[#A5A58D] hover:text-white transition-colors duration-200 ${
                                        isActive(item.path)
                                            ? "text-[gray-900] bg-[#FFE8D6] font-medium"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {item.text}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                <div className="container mx-auto px-6 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
