import React, { useState, useEffect } from 'react';
import { 
  User, 
  Book, 
  Target, 
  Clock, 
  FileText, 
  Calendar,
  Home,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Activity,
  Users,
  Award,
  TrendingUp,
  GraduationCap,
  Brain,
  Stethoscope,
  Loader
} from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const config = {
    method,
    headers: getAuthHeaders()
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
};

// Main App Component
const PremedHQ = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <Header user={user} />
        <div className="p-6">
          <PageContent currentPage={currentPage} />
        </div>
      </main>
    </div>
  );
};

const LoginPage = ({ onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Name is required');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
    }

    try {
      const result = isLogin 
        ? await onLogin(formData.email, formData.password)
        : await onRegister(formData.name, formData.email, formData.password);
      
      if (!result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    }
    
    setLoading(false);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const result = await onLogin('demo@premedHQ.com', 'demo123');
    if (!result.success) {
      setError(result.message || 'Demo login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-red-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">PremedHQ Ontario</h1>
          <p className="text-gray-600 mt-2">Your path to Canadian medical schools</p>
        </div>
        
        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-center rounded-l-lg ${isLogin 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-600'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-center rounded-r-lg ${!isLogin 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-600'}`}
          >
            Sign Up
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                placeholder="Confirm your password"
                required={!isLogin}
              />
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
          
          {isLogin && (
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Loading Demo...
                </div>
              ) : (
                'Try Demo Account'
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

const Sidebar = ({ currentPage, setCurrentPage, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'gpa', label: 'GPA Tracker', icon: BookOpen },
    { id: 'tests', label: 'Tests & Scores', icon: Brain },
    { id: 'activities', label: 'EC Tracker', icon: Users },
    { id: 'applications', label: 'OMSAS Apps', icon: FileText },
    { id: 'journal', label: 'Journal', icon: Edit2 },
    { id: 'timeline', label: 'Timeline', icon: Calendar }
  ];

  return (
    <div className="bg-white w-64 shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-red-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
            <Stethoscope className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">PremedHQ</h2>
            <p className="text-xs text-gray-500">Ontario Edition</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors mt-8 border-t border-gray-200 pt-4"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </nav>
    </div>
  );
};

const Header = ({ user }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {user?.name}!</h1>
        <div className="flex items-center">
          <div className="bg-red-100 w-10 h-10 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

const PageContent = ({ currentPage }) => {
  switch (currentPage) {
    case 'dashboard':
      return <Dashboard />;
    case 'gpa':
      return <GPATracker />;
    case 'tests':
      return <TestTracker />;
    case 'activities':
      return <ECTracker />;
    case 'applications':
      return <ApplicationTracker />;
    case 'journal':
      return <Journal />;
    case 'timeline':
      return <TimelinePlanner />;
    default:
      return <Dashboard />;
  }
};

// Dashboard Component with API integration
const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiCall('/dashboard');
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load dashboard data. Please refresh the page.
      </div>
    );
  }

  // Calculate cGPA (cumulative GPA) using Ontario scale
  const calculatecGPA = () => {
    if (!dashboardData.courses || dashboardData.courses.length === 0) return '0.00';
    
    const gradePoints = { 
      'A+': 4.0, 'A': 4.0, 'A-': 3.7, 
      'B+': 3.3, 'B': 3.0, 'B-': 2.7, 
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 
      'D+': 1.3, 'D': 1.0, 'D-': 0.7,
      'F': 0.0 
    };
    
    const totalCredits = dashboardData.courses.reduce((sum, course) => sum + course.credits, 0);
    const totalPoints = dashboardData.courses.reduce((sum, course) => sum + (gradePoints[course.grade] || 0) * course.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };
  
  const totalECHours = dashboardData.activities ? dashboardData.activities.reduce((sum, activity) => sum + activity.hours, 0) : 0;
  
  // Find next upcoming test
  const upcomingTests = dashboardData.tests ? dashboardData.tests.filter(test => 
    test.status !== 'Completed' && new Date(test.date) > new Date()
  ).sort((a, b) => new Date(a.date) - new Date(b.date)) : [];
  const nextTest = upcomingTests[0];
  
  // Days until next test
  const daysUntilTest = nextTest ? Math.ceil((new Date(nextTest.date) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{calculatecGPA()}</h3>
          <p className="text-gray-600 font-medium">Cumulative GPA</p>
          <p className="text-sm text-gray-500">4.0 Scale</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {nextTest ? `${daysUntilTest} days` : 'No tests'}
          </h3>
          <p className="text-gray-600 font-medium">
            {nextTest ? `Next ${nextTest.name}` : 'Upcoming Tests'}
          </p>
          <p className="text-sm text-gray-500">
            {nextTest ? new Date(nextTest.date).toLocaleDateString() : 'All tests completed'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{totalECHours}</h3>
          <p className="text-gray-600 font-medium">EC Hours</p>
          <p className="text-sm text-gray-500">Total logged hours</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{dashboardData.applications ? dashboardData.applications.length : 0}</h3>
          <p className="text-gray-600 font-medium">OMSAS Apps</p>
          <p className="text-sm text-gray-500">Schools applied to</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Courses</h3>
          <div className="space-y-3">
            {dashboardData.courses && dashboardData.courses.slice(-3).map((course) => (
              <div key={course._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{course.name}</p>
                  <p className="text-sm text-gray-600">{course.semester} - Year {course.year}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{course.grade}</p>
                  <p className="text-sm text-gray-600">{course.credits} FCE</p>
                </div>
              </div>
            ))}
            {(!dashboardData.courses || dashboardData.courses.length === 0) && (
              <p className="text-gray-500 text-center py-4">No courses added yet</p>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Progress</h3>
          <div className="space-y-3">
            {dashboardData.tests && dashboardData.tests.map((test) => (
              <div key={test._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{test.name}</p>
                  <p className="text-sm text-gray-600">{new Date(test.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    test.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    test.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {test.status}
                  </span>
                  {test.score && <p className="text-sm text-gray-600 mt-1">{test.score}</p>}
                </div>
              </div>
            ))}
            {(!dashboardData.tests || dashboardData.tests.length === 0) && (
              <p className="text-gray-500 text-center py-4">No tests added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// GPA Tracker Component with API integration
const GPATracker = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: 'A',
    credits: 0.5,
    semester: 'Fall',
    year: 1
  });

  const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
  const semesterOptions = ['Fall', 'Winter', 'Spring', 'Summer'];
  const creditOptions = [0.5, 1.0];
  const gradePoints = { 
    'A+': 4.0, 'A': 4.0, 'A-': 3.7, 
    'B+': 3.3, 'B': 3.0, 'B-': 2.7, 
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0 
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await apiCall('/courses');
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatecGPA = () => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const totalPoints = courses.reduce((sum, course) => sum + (gradePoints[course.grade] || 0) * course.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const calculate2YearGPA = () => {
    const recent2Years = courses.filter(course => course.year >= Math.max(...courses.map(c => c.year)) - 1);
    const totalCredits = recent2Years.reduce((sum, course) => sum + course.credits, 0);
    const totalPoints = recent2Years.reduce((sum, course) => sum + (gradePoints[course.grade] || 0) * course.credits, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade || !formData.credits || !formData.semester || !formData.year) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const courseData = {
        name: formData.name,
        grade: formData.grade,
        credits: parseFloat(formData.credits),
        semester: formData.semester,
        year: parseInt(formData.year)
      };

      if (editingCourse) {
        const updatedCourse = await apiCall(`/courses/${editingCourse._id}`, 'PUT', courseData);
        setCourses(courses.map(course => course._id === editingCourse._id ? updatedCourse : course));
      } else {
        const newCourse = await apiCall('/courses', 'POST', courseData);
        setCourses([...courses, newCourse]);
      }

      setShowForm(false);
      setEditingCourse(null);
      setFormData({ name: '', grade: 'A', credits: 0.5, semester: 'Fall', year: 1 });
    } catch (error) {
      alert('Failed to save course: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      grade: course.grade,
      credits: course.credits,
      semester: course.semester,
      year: course.year
    });
    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      await apiCall(`/courses/${courseId}`, 'DELETE');
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) {
      alert('Failed to delete course: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">GPA Tracker</h2>
          <p className="text-gray-600">Track your courses and monitor your cGPA and 2-year GPA</p>
        </div>
        <div className="text-right space-y-2">
          <div>
            <p className="text-sm text-gray-600">Cumulative GPA</p>
            <p className="text-2xl font-bold text-red-600">{calculatecGPA()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">2-Year GPA</p>
            <p className="text-xl font-bold text-blue-600">{calculate2YearGPA()}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Course
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Course Name (e.g., Biology I)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {gradeOptions.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {creditOptions.map(credit => (
                  <option key={credit} value={credit}>{credit} FCE</option>
                ))}
              </select>
              <select
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {semesterOptions.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 1 })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                max="6"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {editingCourse ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  editingCourse ? 'Update Course' : 'Add Course'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCourse(null);
                  setFormData({ name: '', grade: 'A', credits: 0.5, semester: 'Fall', year: 1 });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-800">Course Name</th>
                <th className="text-left p-4 font-semibold text-gray-800">Grade</th>
                <th className="text-left p-4 font-semibold text-gray-800">Credits (FCE)</th>
                <th className="text-left p-4 font-semibold text-gray-800">Semester</th>
                <th className="text-left p-4 font-semibold text-gray-800">Year</th>
                <th className="text-left p-4 font-semibold text-gray-800">Points</th>
                <th className="text-left p-4 font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="border-t border-gray-200">
                  <td className="p-4 text-gray-800">{course.name}</td>
                  <td className="p-4 text-gray-800">{course.grade}</td>
                  <td className="p-4 text-gray-800">{course.credits}</td>
                  <td className="p-4 text-gray-600">{course.semester}</td>
                  <td className="p-4 text-gray-600">{course.year}</td>
                  <td className="p-4 text-gray-800">{(gradePoints[course.grade] * course.credits).toFixed(1)}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {courses.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No courses added yet. Click "Add Course" to get started!
          </div>
        )}
      </div>
    </div>
  );
};

// Test Tracker Component with API integration
const TestTracker = () => {
  const [tests, setTests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: 'MCAT',
    date: '',
    score: '',
    status: 'Scheduled',
    notes: ''
  });

  const testTypes = ['MCAT', 'CASPer', 'AAMC Preview'];
  const statusOptions = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const data = await apiCall('/tests');
      setTests(data);
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.date || !formData.status) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const testData = {
        name: formData.name,
        date: formData.date,
        score: formData.score,
        status: formData.status,
        notes: formData.notes,
        sections: formData.name === 'MCAT' ? {
          'Chemical and Physical Foundations': '',
          'Critical Analysis and Reasoning Skills': '',
          'Biological and Biochemical Foundations': '',
          'Psychological, Social, and Biological Foundations': ''
        } : {}
      };

      if (editingTest) {
        const updatedTest = await apiCall(`/tests/${editingTest._id}`, 'PUT', testData);
        setTests(tests.map(test => test._id === editingTest._id ? updatedTest : test));
      } else {
        const newTest = await apiCall('/tests', 'POST', testData);
        setTests([...tests, newTest]);
      }

      setShowForm(false);
      setEditingTest(null);
      setFormData({ name: 'MCAT', date: '', score: '', status: 'Scheduled', notes: '' });
    } catch (error) {
      alert('Failed to save test: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      name: test.name,
      date: test.date.split('T')[0], // Convert to YYYY-MM-DD format
      score: test.score || '',
      status: test.status,
      notes: test.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await apiCall(`/tests/${testId}`, 'DELETE');
      setTests(tests.filter(test => test._id !== testId));
    } catch (error) {
      alert('Failed to delete test: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tests & Scores</h2>
          <p className="text-gray-600">Track your MCAT, CASPer, and other test scores</p>
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Test
      </button>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingTest ? 'Edit Test' : 'Add New Test'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {testTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder={formData.name === 'MCAT' ? 'Total Score (e.g., 520)' : 'Score/Result'}
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <textarea
              placeholder="Notes (study plan, test center, etc.)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {editingTest ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  editingTest ? 'Update Test' : 'Add Test'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingTest(null);
                  setFormData({ name: 'MCAT', date: '', score: '', status: 'Scheduled', notes: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div key={test._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{test.name}</h3>
                <p className="text-gray-600">{new Date(test.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                  {test.status}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(test)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(test._id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {test.score && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-red-600">{test.score}</p>
              </div>
            )}
            
            {test.notes && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Notes</p>
                <p className="text-gray-600 text-sm">{test.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {tests.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-500">
          No tests added yet. Click "Add Test" to track your MCAT and CASPer!
        </div>
      )}
    </div>
  );
};

// Simplified placeholder components for Activities, Applications, Journal, and Timeline
// These would be implemented similarly to the above components

const ECTracker = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">EC Tracker</h2>
      <p className="text-gray-600 mb-6">This component will track your extracurricular activities with full API integration.</p>
      <p className="text-sm text-gray-500">Implementation in progress...</p>
    </div>
  );
};

const ApplicationTracker = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">OMSAS Applications</h2>
      <p className="text-gray-600 mb-6">Track your Ontario medical school applications with full API integration.</p>
      <p className="text-sm text-gray-500">Implementation in progress...</p>
    </div>
  );
};

const Journal = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Journal</h2>
      <p className="text-gray-600 mb-6">Write and track your reflections with full API integration.</p>
      <p className="text-sm text-gray-500">Implementation in progress...</p>
    </div>
  );
};

const TimelinePlanner = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Timeline Planner</h2>
      <p className="text-gray-600 mb-6">Plan your premed milestones with full API integration.</p>
      <p className="text-sm text-gray-500">Implementation in progress...</p>
    </div>
  );
};

export default PremedHQ;
    