import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all available courses
        const coursesResponse = await axios.get('/courses/');
        setCourses(coursesResponse.data);
        
        // Fetch user's enrolled courses
        const enrolledResponse = await axios.get('/enrollments/student');
        setEnrolledCourses(enrolledResponse.data);
        
        // Create a map of course IDs to enrollment status
        const statusMap = {};
        enrolledResponse.data.forEach(course => {
          statusMap[course.id] = true;
        });
        setEnrollmentStatus(statusMap);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await axios.post('/enrollments/', { course_id: courseId });
      
      // Update enrollment status
      setEnrollmentStatus(prev => ({
        ...prev,
        [courseId]: true
      }));
      
      // Add the course to enrolled courses
      const course = courses.find(c => c.id === courseId);
      setEnrolledCourses(prev => [...prev, course]);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      alert('Failed to enroll in course. Please try again.');
    }
  };

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
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800">Available Courses</h2>
        <p className="text-gray-600 mt-2">Browse and enroll in our available courses.</p>
      </div>
      
      {/* Enrolled Courses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Enrolled Courses</h3>
        
        {enrolledCourses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">You are not enrolled in any courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Link 
                key={course.id} 
                to={`/student/courses/${course.id}`}
                className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200"
              >
                <div className="h-40 bg-gray-200 overflow-hidden">
                  {course.image_url ? (
                    <img 
                      src={course.image_url} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100">
                      <span className="text-blue-500 font-semibold">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800">{course.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{course.description.substring(0, 100)}...</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {course.level}
                    </span>
                    <span className="text-xs text-gray-500">{course.duration}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* Available Courses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">All Courses</h3>
        
        {courses.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No courses available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isEnrolled = enrollmentStatus[course.id];
              
              return (
                <div 
                  key={course.id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200"
                >
                  <div className="h-40 bg-gray-200 overflow-hidden">
                    {course.image_url ? (
                      <img 
                        src={course.image_url} 
                        alt={course.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100">
                        <span className="text-blue-500 font-semibold">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-800">{course.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{course.description.substring(0, 100)}...</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {course.level}
                      </span>
                      <span className="text-xs text-gray-500">{course.duration}</span>
                    </div>
                    <div className="mt-4">
                      {isEnrolled ? (
                        <Link 
                          to={`/student/courses/${course.id}`}
                          className="w-full block text-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
                        >
                          View Course
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                        >
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseList;
