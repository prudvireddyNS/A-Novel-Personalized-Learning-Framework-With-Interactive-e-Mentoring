import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-4">
          <h1 className="text-white text-center text-2xl font-bold">Learning Management System</h1>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
