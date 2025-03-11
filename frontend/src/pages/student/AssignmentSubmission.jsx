import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AssignmentSubmission = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch assignment details
        const assignmentResponse = await axios.get(`/assignments/${assignmentId}`);
        setAssignment(assignmentResponse.data);
        
        // Check if student has already submitted
        const submissionResponse = await axios.get(`/assignments/${assignmentId}/submission`);
        if (submissionResponse.data) {
          setSubmission(submissionResponse.data);
          setSubmissionContent(submissionResponse.data.content || '');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching assignment data:', err);
        setError('Failed to load assignment data. Please try again later.');
        
        // For demo purposes, set some mock data
        setAssignment({
          id: assignmentId,
          title: 'React Components Assignment',
          description: 'Create a reusable component library with at least 5 components that can be used across different parts of an application.',
          due_date: '2023-07-15',
          total_points: 100,
          course_title: 'Introduction to React'
        });
        
        // Mock submission if needed
        if (Math.random() > 0.5) {
          const mockSubmission = {
            id: 1,
            assignment_id: assignmentId,
            submission_date: '2023-07-10',
            content: 'https://github.com/myusername/react-components',
            status: 'submitted',
            points: null,
            feedback: ''
          };
          setSubmission(mockSubmission);
          setSubmissionContent(mockSubmission.content);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage('');

    try {
      const payload = {
        assignment_id: assignmentId,
        content: submissionContent
      };
      
      let response;
      if (submission) {
        // Update existing submission
        response = await axios.put(`/assignments/submissions/${submission.id}`, payload);
      } else {
        // Create new submission
        response = await axios.post('/assignments/submissions/', payload);
      }
      
      setSubmission(response.data);
      setSuccessMessage('Your assignment has been submitted successfully!');
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError(err.response?.data?.detail || 'Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> Assignment not found.</span>
      </div>
    );
  }

  const isOverdue = new Date(assignment.due_date) < new Date();
  const isGraded = submission && submission.status === 'graded';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{assignment.title}</h2>
          <button
            onClick={() => navigate('/student/assignments')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Back to Assignments
          </button>
        </div>
        <p className="text-gray-600 mt-2">Course: {assignment.course_title}</p>
      </div>

      {/* Assignment Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Assignment Details</h3>
        <p className="text-gray-700 mb-4">{assignment.description}</p>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700">
            Due: {new Date(assignment.due_date).toLocaleDateString()}
          </div>
          <div className="bg-green-50 px-3 py-1 rounded-full text-sm text-green-700">
            Points: {assignment.total_points}
          </div>
          {isOverdue && !submission && (
            <div className="bg-red-50 px-3 py-1 rounded-full text-sm text-red-700">
              Overdue
            </div>
          )}
          {submission && (
            <div className={`px-3 py-1 rounded-full text-sm ${isGraded ? 'bg-purple-50 text-purple-700' : 'bg-yellow-50 text-yellow-700'}`}>
              {isGraded ? `Graded: ${submission.points}/${assignment.total_points}` : 'Submitted'}
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Submission Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {submission ? 'Your Submission' : 'Submit Your Assignment'}
        </h3>
        
        {isGraded ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-1">Your Submission:</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 break-all">{submission.content}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-1">Grade:</h4>
              <p className="text-lg font-semibold">{submission.points} / {assignment.total_points}</p>
            </div>
            
            {submission.feedback && (
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-1">Feedback:</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-700">{submission.feedback}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="submissionContent" className="block text-sm font-medium text-gray-700 mb-1">
                Submission (GitHub link, text, or other content as specified)
              </label>
              <textarea
                id="submissionContent"
                rows="6"
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your submission here..."
                required
              ></textarea>
            </div>
            
            {submission && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-700">
                  You have already submitted this assignment on {new Date(submission.submission_date).toLocaleDateString()}. 
                  Submitting again will update your previous submission.
                </p>
              </div>
            )}
            
            {isOverdue && !submission && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">
                  This assignment is past the due date. Your submission may be marked as late.
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignmentSubmission;
