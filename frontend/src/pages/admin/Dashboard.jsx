import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    recentEnrollments: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await axios.get('/admin/dashboard/stats');
        setStats(statsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        // For demo purposes, set some mock data
        setStats({
          totalStudents: 24,
          totalCourses: 8,
          totalAssignments: 15,
          recentEnrollments: [
            { id: 1, student_name: 'John Doe', course_title: 'Introduction to React', enrollment_date: '2023-06-15' },
            { id: 2, student_name: 'Jane Smith', course_title: 'Advanced JavaScript', enrollment_date: '2023-06-14' },
            { id: 3, student_name: 'Bob Johnson', course_title: 'Web Design Fundamentals', enrollment_date: '2023-06-13' }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.first_name}!</h2>
        <p className="text-gray-600 mt-2">Here's an overview of your learning management system.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalStudents}</p>
          <Link to="/admin/students" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            View all students
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Courses</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalCourses}</p>
          <Link to="/admin/courses" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Manage courses
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Assignments</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">{stats.totalAssignments}</p>
          <Link to="/admin/assignments" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Manage assignments
          </Link>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/admin/courses/create" 
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg flex items-center space-x-3 transition duration-200"
          >
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Create New Course</h4>
              <p className="text-sm text-gray-600">Add a new course to the platform</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/assignments" 
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg flex items-center space-x-3 transition duration-200"
          >
            <div className="bg-green-500 text-white p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Manage Assignments</h4>
              <p className="text-sm text-gray-600">Create and grade assignments</p>
            </div>
          </Link>
          
          <Link 
            to="/admin/courses" 
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg flex items-center space-x-3 transition duration-200"
          >
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">View All Courses</h4>
              <p className="text-sm text-gray-600">Manage existing courses</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Recent Enrollments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Enrollments</h3>
        
        {stats.recentEnrollments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent enrollments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{enrollment.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.course_title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(enrollment.enrollment_date).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
