import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const GradeAssignments = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch assignment details
        const assignmentResponse = await axios.get(`/assignments/${assignmentId}`);
        setAssignment(assignmentResponse.data);
        
        // Fetch submissions for this assignment
        const submissionsResponse = await axios.get(`/assignments/${assignmentId}/submissions`);
        setSubmissions(submissionsResponse.data);
        
        setError('');
      } catch (err) {
        console.error('Error fetching assignment data:', err);
        setError('Failed to load assignment data. Please try again.');
        
        // For demo purposes, set some mock data
        setAssignment({
          id: assignmentId,
          title: 'React Components Assignment',
          description: 'Create a reusable component library with at least 5 components that can be used across different parts of an application.',
          due_date: '2023-07-15',
          total_points: 100,
          course_title: 'Introduction to React'
        });
        
        setSubmissions([
          {
            id: 1,
            student_id: 101,
            student_name: 'John Doe',
            submission_date: '2023-07-14',
            content: 'https://github.com/johndoe/react-components',
            status: 'submitted',
            points: null,
            feedback: ''
          },
          {
            id: 2,
            student_id: 102,
            student_name: 'Jane Smith',
            submission_date: '2023-07-13',
            content: 'https://github.com/janesmith/component-library',
            status: 'submitted',
            points: null,
            feedback: ''
          },
          {
            id: 3,
            student_id: 103,
            student_name: 'Bob Johnson',
            submission_date: '2023-07-15',
            content: 'https://github.com/bobjohnson/react-ui-kit',
            status: 'graded',
            points: 85,
            feedback: 'Good work, but missing proper documentation.'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || '');
    setPoints(submission.points || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    
    setIsSaving(true);
    setError('');

    try {
      await axios.post(`/assignments/submissions/${selectedSubmission.id}/grade`, {
        points,
        feedback
      });
      
      // Update the local state
      const updatedSubmissions = submissions.map(sub => {
        if (sub.id === selectedSubmission.id) {
          return {
            ...sub,
            status: 'graded',
            points,
            feedback
          };
        }
        return sub;
      });
      
      setSubmissions(updatedSubmissions);
      setSelectedSubmission({
        ...selectedSubmission,
        status: 'graded',
        points,
        feedback
      });
      
      alert('Submission graded successfully!');
    } catch (err) {
      console.error('Error grading submission:', err);
      setError(err.response?.data?.detail || 'Failed to grade submission. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Grade Assignments</h2>
          <button
            onClick={() => navigate('/admin/assignments')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Back to Assignments
          </button>
        </div>
        <p className="text-gray-600 mt-2">Review and grade student submissions for this assignment.</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {assignment && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-800">{assignment.title}</h3>
          <p className="text-gray-600 mt-2">{assignment.description}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="bg-blue-50 px-3 py-1 rounded-full text-sm text-blue-700">
              Course: {assignment.course_title}
            </div>
            <div className="bg-orange-50 px-3 py-1 rounded-full text-sm text-orange-700">
              Due: {new Date(assignment.due_date).toLocaleDateString()}
            </div>
            <div className="bg-green-50 px-3 py-1 rounded-full text-sm text-green-700">
              Points: {assignment.total_points}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student Submissions</h3>
          
          {submissions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div 
                  key={submission.id} 
                  onClick={() => handleSubmissionSelect(submission)}
                  className={`p-3 rounded-lg cursor-pointer transition duration-200 ${selectedSubmission?.id === submission.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{submission.student_name}</h4>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(submission.submission_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {submission.status === 'graded' ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Graded: {submission.points}/{assignment?.total_points}
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grading Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          {selectedSubmission ? (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Submission by {selectedSubmission.student_name}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 break-all">{selectedSubmission.content}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                    Points (out of {assignment?.total_points})
                  </label>
                  <input
                    id="points"
                    type="number"
                    min="0"
                    max={assignment?.total_points}
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    rows="4"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide feedback to the student..."
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Submit Grade'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Select a submission from the list to grade
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradeAssignments;
