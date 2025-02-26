import { useState } from 'react'
import { FaSearch, FaUserCircle, FaBook, FaChartLine, FaClock, FaTrophy, FaCalendarAlt, FaBell } from 'react-icons/fa'
import './App.css'

const enrolledCourses = [
  {
    id: 3,
    title: 'INTRODUCTION TO LINUX',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    details: 'This is long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable.',
    progress: 35,
    nextLesson: 'System Administration Basics',
    nextLessonTime: '2024-02-20T10:00:00',
    recentGrade: 85
  }
]

const courses = [
  {
    id: 1,
    title: 'MACHINE LEARNING',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    details: 'This is long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable.',
    duration: '12 weeks',
    level: 'Intermediate'
  },
  {
    id: 2,
    title: 'PYTHON PROGRAMMING',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    details: 'This is long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable.',
    duration: '8 weeks',
    level: 'Beginner'
  },
  {
    id: 3,
    title: 'INTRODUCTION TO LINUX',
    image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    details: 'This is long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable.',
    duration: '6 weeks',
    level: 'Beginner'
  }
]

const notifications = [
  {
    id: 1,
    message: 'New assignment due in Linux course',
    time: '2 hours ago'
  },
  {
    id: 2,
    message: 'Your recent quiz grade is available',
    time: '1 day ago'
  }
]

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'courses', or 'myCourses'
  const [showNotifications, setShowNotifications] = useState(false)

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const Dashboard = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Enrolled Courses</p>
              <p className="text-2xl font-bold">{enrolledCourses.length}</p>
            </div>
            <FaBook className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Average Progress</p>
              <p className="text-2xl font-bold">35%</p>
            </div>
            <FaChartLine className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-purple-500 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Study Time</p>
              <p className="text-2xl font-bold">12.5 hrs</p>
            </div>
            <FaClock className="text-3xl opacity-80" />
          </div>
        </div>
        
        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Achievements</p>
              <p className="text-2xl font-bold">5</p>
            </div>
            <FaTrophy className="text-3xl opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Lessons</h2>
          {enrolledCourses.map(course => (
            <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <FaCalendarAlt className="text-blue-500 text-xl" />
              <div>
                <p className="font-semibold">{course.nextLesson}</p>
                <p className="text-sm text-gray-500">
                  {new Date(course.nextLessonTime).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Recent Performance</h2>
          {enrolledCourses.map(course => (
            <div key={course.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{course.title}</p>
                <p className="text-lg font-bold text-green-500">{course.recentGrade}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${course.recentGrade}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const MyCourses = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">My Courses/Content</h1>
      {enrolledCourses.map(course => (
        <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex">
            <img src={course.image} alt={course.title} className="w-64 h-48 object-cover" />
            <div className="p-6 flex-1">
              <h2 className="text-xl font-bold mb-2">{course.title}</h2>
              <p className="text-gray-600 mb-4">{course.details}</p>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                    View Course Content
                  </button>
                  <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition">
                    Calculated Performance
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                    View Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const AllCourses = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Courses</h1>
        
        <div className="flex items-center gap-2 max-w-md">
          <select className="p-2 border rounded">
            <option value="ALL">ALL</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="What do you want to learn?"
              className="w-full p-2 pr-10 border rounded"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex">
              <img src={course.image} alt={course.title} className="w-64 h-48 object-cover" />
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{course.title}</h2>
                <div className="flex gap-4 mb-4">
                  <span className="text-sm text-gray-600">
                    <FaClock className="inline mr-1" /> {course.duration}
                  </span>
                  <span className="text-sm text-gray-600">
                    <FaBook className="inline mr-1" /> {course.level}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{course.details}</p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                  Enroll
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="fixed top-0 left-64 right-0 bg-white shadow-sm z-10">
        <div className="flex justify-end items-center p-4">
          <div className="relative">
            <button 
              className="p-2 hover:bg-gray-100 rounded-full relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <FaBell className="text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  {notifications.map(notification => (
                    <div key={notification.id} className="py-2 border-b last:border-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 text-white p-4">
        <div className="flex items-center gap-2 mb-8">
          <FaUserCircle className="text-3xl" />
          <div>
            <div className="font-semibold">Student A</div>
            <div className="text-sm text-gray-400">Online</div>
          </div>
        </div>
        
        <nav>
          <ul className="space-y-2">
            <li 
              className={`p-2 hover:bg-gray-700 rounded cursor-pointer ${currentView === 'dashboard' ? 'bg-gray-700' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              Dashboard
            </li>
            <li 
              className={`p-2 hover:bg-gray-700 rounded cursor-pointer ${currentView === 'myCourses' ? 'bg-gray-700' : ''}`}
              onClick={() => setCurrentView('myCourses')}
            >
              My Courses
            </li>
            <li 
              className={`p-2 hover:bg-gray-700 rounded cursor-pointer ${currentView === 'courses' ? 'bg-gray-700' : ''}`}
              onClick={() => setCurrentView('courses')}
            >
              Courses
            </li>
            <li className="p-2 hover:bg-gray-700 rounded cursor-pointer">Post Evaluation</li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 pt-16 p-8">
        {currentView === 'dashboard' ? <Dashboard /> : 
         currentView === 'myCourses' ? <MyCourses /> : 
         <AllCourses />}
      </div>
    </div>
  )
}

export default App