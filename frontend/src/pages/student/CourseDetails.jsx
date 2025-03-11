import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      // Validate courseId before making API calls
      if (!courseId || courseId === 'undefined') {
        setError('Invalid course ID. Please select a valid course.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch course details
        const courseResponse = await axios.get(`/courses/${courseId}`);
        setCourse(courseResponse.data);
        
        // Fetch course assignments
        const assignmentsResponse = await axios.get(`/courses/${courseId}/assignments`);
        setAssignments(assignmentsResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching course details:', err);
        if (err.response && err.response.status === 404) {
          setError('Course not found. Please select a different course.');
        } else if (err.response && err.response.status === 400) {
          setError('Invalid course ID. Please select a valid course.');
        } else {
          setError('Failed to load course details. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

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
        <button
          onClick={() => navigate('/student/courses')}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Course not found!</strong>
        <span className="block sm:inline"> The requested course could not be found.</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-48 bg-gray-200 relative">
          {course.image_url ? (
            <img 
              src={course.image_url} 
              alt={course.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-100">
              <span className="text-blue-500 font-semibold text-xl">No Course Image</span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-wrap justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {course.level}
                </span>
                <span className="text-sm text-gray-600">{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Description */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Description</h2>
        <p className="text-gray-700 whitespace-pre-line">{course.description}</p>
      </div>
      
      {/* Course Content/Modules */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Content</h2>
        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module, index) => (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer">
                  <h3 className="font-medium text-gray-800">Module {index + 1}: {module.title}</h3>
                </div>
                <div className="p-4 space-y-2">
                  {module.lessons && module.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-3 hover:bg-gray-50 rounded flex items-center">
                      <span className="text-blue-500 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <span className="text-gray-700">{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No content available for this course yet.</p>
        )}
      </div>
      
      {/* Course Assignments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Assignments</h2>
        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Link 
                key={assignment.id} 
                to={`/student/assignments/${assignment.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description.substring(0, 100)}...</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-red-600">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{assignment.total_points} points</p>
                  </div>
                </div>
                <div className="mt-2">
                  {assignment.submitted ? (
                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      Submitted
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      Not Submitted
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No assignments available for this course yet.</p>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
