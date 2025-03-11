import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch enrolled courses
        const coursesResponse = await axios.get('/enrollments/student');
        setEnrolledCourses(coursesResponse.data);
        
        // Fetch upcoming assignments
        const assignmentsResponse = await axios.get('/assignments/student/upcoming');
        setUpcomingAssignments(assignmentsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.first_name}!</h2>
        <p className="text-gray-600 mt-2">Here's what's happening with your courses today.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Enrolled Courses</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{enrolledCourses.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Upcoming Assignments</h3>
          <p className="text-3xl font-bold text-orange-500 mt-2">{upcomingAssignments.length}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Completed Assignments</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
      </div>
      
      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Your Courses</h3>
          <Link to="/student/courses" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</Link>
        </div>
        
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">You are not enrolled in any courses yet.</p>
            <Link to="/student/courses" className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.slice(0, 3).map((course) => (
              <Link 
                key={course.id} 
                to={`/student/courses/${course.id}`}
                className="block bg-gray-50 rounded-lg p-4 hover:shadow-md transition duration-200"
              >
                <div className="h-40 bg-gray-200 rounded-lg mb-3 overflow-hidden">
                  {course.image_url && (
                    <img 
                      src={course.image_url} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h4 className="font-semibold text-gray-800">{course.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{course.description.substring(0, 60)}...</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Upcoming Assignments */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Upcoming Assignments</h3>
          <Link to="/student/assignments" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</Link>
        </div>
        
        {upcomingAssignments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No upcoming assignments.</p>
        ) : (
          <div className="space-y-3">
            {upcomingAssignments.slice(0, 3).map((assignment) => (
              <Link 
                key={assignment.id} 
                to={`/student/assignments/${assignment.id}`}
                className="block bg-gray-50 rounded-lg p-4 hover:shadow-md transition duration-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">Course: {assignment.course_title}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-red-600">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{assignment.total_points} points</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
