import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, BookOpen, Clock } from 'lucide-react';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Dashboard</h1>
            <p className="text-dark-muted">Manage your AI-generated curriculums.</p>
          </div>
          <Link to="/course/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" /> Create Course
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <BookOpen className="w-16 h-16 text-dark-muted mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No courses yet</h3>
            <p className="text-dark-muted mb-6">You haven't generated any courses. Let's create your first one!</p>
            <Link to="/course/new" className="btn-primary">
              Generate a Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course._id} to={`/course/${course._id}`} className="block group">
                <div className="glass-card p-6 h-full border border-white/5 group-hover:border-primary-500/50 transition-all duration-300 transform group-hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {course.difficulty}
                    </span>
                    <Clock className="w-4 h-4 text-dark-muted" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-dark-muted text-sm mb-4 line-clamp-3">{course.description}</p>
                  
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-sm text-dark-muted">{course.modules?.length || 0} Modules</span>
                    <span className="text-sm font-medium text-primary-400 group-hover:text-primary-300">View Course &rarr;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
