import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaBook, FaClipboardList, FaSignOutAlt, FaUser } from 'react-icons/fa';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold">LMS Portal</h1>
          <p className="text-sm text-blue-300 mt-1">Student Dashboard</p>
        </div>
        
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-full">
              <FaUser className="text-white" />
            </div>
            <div>
              <p className="font-medium">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-blue-300">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/student/dashboard" 
                className={({ isActive }) => 
                  `flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive ? 'bg-blue-700' : ''}`
                }
              >
                <FaHome />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/student/courses" 
                className={({ isActive }) => 
                  `flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive ? 'bg-blue-700' : ''}`
                }
              >
                <FaBook />
                <span>My Courses</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/student/assignments" 
                className={({ isActive }) => 
                  `flex items-center space-x-2 p-2 rounded hover:bg-blue-700 ${isActive ? 'bg-blue-700' : ''}`
                }
              >
                <FaClipboardList />
                <span>Assignments</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-blue-700">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-blue-300 hover:text-white w-full"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow p-4">
          <h1 className="text-xl font-semibold text-gray-800">Student Portal</h1>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
