import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaCheck } from 'react-icons/fa';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all assignments
        const assignmentsResponse = await axios.get('/assignments/admin');
        setAssignments(assignmentsResponse.data);
        
        // Fetch all courses for filtering
        const coursesResponse = await axios.get('/courses/');
        setCourses(coursesResponse.data);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setError('Failed to load assignments. Please try again later.');
        
        // For demo purposes, set some mock data
        setAssignments([
          { 
            id: 1, 
            title: 'React Components Assignment', 
            description: 'Create a reusable component library', 
            due_date: '2023-07-15', 
            total_points: 100,
            course_id: 1,
            course_title: 'Introduction to React',
            submission_count: 8
          },
          { 
            id: 2, 
            title: 'JavaScript Algorithms', 
            description: 'Implement common sorting algorithms', 
            due_date: '2023-07-20', 
            total_points: 150,
            course_id: 2,
            course_title: 'Advanced JavaScript',
            submission_count: 5
          },
          { 
            id: 3, 
            title: 'Responsive Design Project', 
            description: 'Create a fully responsive website', 
            due_date: '2023-07-25', 
            total_points: 200,
            course_id: 3,
            course_title: 'Web Design Fundamentals',
            submission_count: 12
          }
        ]);
        
        setCourses([
          { id: 1, title: 'Introduction to React' },
          { id: 2, title: 'Advanced JavaScript' },
          { id: 3, title: 'Web Design Fundamentals' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteConfirm = (assignmentId) => {
    setDeleteConfirm(assignmentId);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(`/assignments/${assignmentId}`);
      setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting assignment:', err);
      alert('Failed to delete assignment. Please try again.');
    }
  };

  const handleCourseFilter = (e) => {
    setSelectedCourse(e.target.value);
  };

  const filteredAssignments = selectedCourse === 'all' 
    ? assignments 
    : assignments.filter(assignment => assignment.course_id.toString() === selectedCourse);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
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
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Manage Assignments</h2>
          <Link 
            to="/admin/assignments/create" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition duration-200"
          >
            <FaPlus />
            <span>Create Assignment</span>
          </Link>
        </div>
        <p className="text-gray-600 mt-2">View, edit, and grade assignments for your courses.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label htmlFor="courseFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Course
          </label>
          <select
            id="courseFilter"
            value={selectedCourse}
            onChange={handleCourseFilter}
            className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id.toString()}>{course.title}</option>
            ))}
          </select>
        </div>

        {filteredAssignments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">No assignments found. Create your first assignment!</p>
            <Link 
              to="/admin/assignments/create" 
              className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Create Assignment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                      <div className="text-sm text-gray-500">{assignment.description.substring(0, 50)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{assignment.course_title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.total_points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.submission_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {deleteConfirm === assignment.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="text-red-600 hover:text-red-900 bg-red-100 px-2 py-1 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={handleDeleteCancel}
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Link 
                            to={`/admin/assignments/${assignment.id}/edit`} 
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit className="h-5 w-5" />
                          </Link>
                          <Link 
                            to={`/admin/assignments/${assignment.id}/grade`} 
                            className="text-green-600 hover:text-green-900"
                          >
                            <FaCheck className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteConfirm(assignment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="h-5 w-5" />
                          </button>
                        </div>
                      )}
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

export default ManageAssignments;
