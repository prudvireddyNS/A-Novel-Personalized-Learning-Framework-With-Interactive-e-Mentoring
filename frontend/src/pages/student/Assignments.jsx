import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/assignments/student');
        setAssignments(response.data);
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
            course_title: 'Introduction to React',
            status: 'pending'
          },
          { 
            id: 2, 
            title: 'JavaScript Algorithms', 
            description: 'Implement common sorting algorithms', 
            due_date: '2023-07-20', 
            total_points: 150,
            course_title: 'Advanced JavaScript',
            status: 'completed',
            grade: 135,
            feedback: 'Excellent work on the implementation of quicksort and mergesort!'
          },
          { 
            id: 3, 
            title: 'Responsive Design Project', 
            description: 'Create a fully responsive website', 
            due_date: '2023-07-25', 
            total_points: 200,
            course_title: 'Web Design Fundamentals',
            status: 'pending'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredAssignments = filter === 'all' 
    ? assignments 
    : assignments.filter(assignment => assignment.status === filter);

  const getStatusBadge = (status, grade, totalPoints) => {
    if (status === 'completed') {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
          Completed - {grade}/{totalPoints}
        </span>
      );
    } else if (new Date(assignment.due_date) < new Date()) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
          Overdue
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
          Pending
        </span>
      );
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
        <h2 className="text-2xl font-bold text-gray-800">Your Assignments</h2>
        <p className="text-gray-600 mt-2">View and manage your course assignments.</p>
      </div>
      
      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => handleFilterChange('all')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${filter === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              All Assignments
            </button>
            <button
              onClick={() => handleFilterChange('pending')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${filter === 'pending' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Pending
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${filter === 'completed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Completed
            </button>
          </nav>
        </div>
        
        {/* Assignments List */}
        <div className="p-6">
          {filteredAssignments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No assignments found.</p>
          ) : (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <Link 
                  key={assignment.id} 
                  to={`/student/assignments/${assignment.id}`}
                  className="block bg-gray-50 rounded-lg p-4 hover:shadow-md transition duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{assignment.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{assignment.description.substring(0, 100)}...</p>
                      <p className="text-sm text-gray-500 mt-2">Course: {assignment.course_title}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(assignment.status, assignment.grade, assignment.total_points)}
                      <p className="text-sm text-gray-500 mt-2">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{assignment.total_points} points</p>
                    </div>
                  </div>
                  
                  {assignment.status === 'completed' && assignment.feedback && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Feedback:</span> {assignment.feedback}
                      </p>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
