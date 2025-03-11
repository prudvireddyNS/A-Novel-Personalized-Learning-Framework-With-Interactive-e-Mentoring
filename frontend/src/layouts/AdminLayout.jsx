import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaBook, FaClipboardList, FaSignOutAlt, FaUser, FaPlus } from 'react-icons/fa';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">LMS Portal</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
        </div>
        
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-700 p-2 rounded-full">
              <FaUser className="text-white" />
            </div>
            <div>
              <p className="font-medium">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/admin/dashboard" 
                className={({ isActive }) => 
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? 'bg-gray-800' : ''}`
                }
              >
                <FaHome />
                <span>Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/courses" 
                className={({ isActive }) => 
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? 'bg-gray-800' : ''}`
                }
              >
                <FaBook />
                <span>Manage Courses</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/courses/create" 
                className={({ isActive }) => 
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? 'bg-gray-800' : ''}`
                }
              >
                <FaPlus />
                <span>Create Course</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/assignments" 
                className={({ isActive }) => 
                  `flex items-center space-x-2 p-2 rounded hover:bg-gray-800 ${isActive ? 'bg-gray-800' : ''}`
                }
              >
                <FaClipboardList />
                <span>Manage Assignments</span>
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-400 hover:text-white w-full"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow p-4">
          <h1 className="text-xl font-semibold text-gray-800">Admin Portal</h1>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
