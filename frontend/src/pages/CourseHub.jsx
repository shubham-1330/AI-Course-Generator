import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Certificate from '../components/Certificate';
import { CheckCircle, Circle, ChevronRight, LogOut, Clock, Award } from 'lucide-react';

const CourseHub = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  const fetchCourseDetails = useCallback(async () => {
    try {
      const [courseRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/progress`).catch(() => ({ data: { completed_lesson_ids: [] } }))
      ]);
      setCourse(courseRes.data);
      setProgress(progressRes.data.completed_lesson_ids || []);
    } catch (error) {
      console.error("Failed to fetch course details", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  if (loading) return <div className="min-h-screen bg-dark-bg flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div></div>;
  if (!course) return <div className="min-h-screen bg-dark-bg text-white p-10">Course not found.</div>;

  const totalLessons = course.modules?.reduce((acc, mod) => acc + mod.lessons.length, 0) || 0;
  const completedLessons = progress.length;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const estimatedTimeMins = totalLessons * 15;
  const estimatedTimeDisplay = estimatedTimeMins >= 60 
    ? `${Math.floor(estimatedTimeMins / 60)}h ${estimatedTimeMins % 60}m` 
    : `${estimatedTimeMins}m`;

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-4 flex justify-between items-center">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-dark-muted hover:text-red-400 transition-colors bg-dark-bg border border-white/10 px-4 py-2 rounded-lg">
            <LogOut className="w-4 h-4" /> Exit to Dashboard
          </Link>
        </div>
        <div className="mb-10">
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-3 py-1 bg-primary-500/20 text-primary-400 text-sm font-semibold rounded-full uppercase tracking-wider">
              {course.difficulty} • {course.topic}
            </span>
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm font-semibold rounded-full uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-4 h-4" /> Est. Time: {estimatedTimeDisplay}
            </span>
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-4">{course.title}</h1>
          <p className="text-xl text-dark-muted max-w-3xl mb-8">{course.description}</p>
          
          {/* Progress Bar */}
          <div className="bg-dark-card/50 p-6 rounded-xl border border-white/10 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-dark-muted font-medium mb-1 uppercase tracking-wider">Course Progress</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">{progressPercent}%</span>
                  <span className="text-dark-muted font-medium">({completedLessons}/{totalLessons} lessons)</span>
                </div>
              </div>
              
              {progressPercent === 100 && (
                <button 
                  onClick={() => setShowCertificate(true)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/50 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all duration-300 animate-pulse hover:animate-none hover:scale-105 shadow-lg shadow-yellow-500/20"
                >
                  <Award className="w-5 h-5" /> Generate Certificate
                </button>
              )}
            </div>
            
            <div className="w-full bg-dark-bg rounded-full h-3 overflow-hidden shadow-inner border border-white/5">
              <div 
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>
          
          {course.modules?.map((module, mIdx) => (
            <div key={mIdx} className="glass-card overflow-hidden">
              <div className="bg-white/5 px-6 py-4 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">Module {mIdx + 1}: {module.title}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {module.lessons?.map((lesson, lIdx) => {
                  const lessonDbId = `${courseId}_${mIdx}_${lIdx}`;
                  const isCompleted = progress.includes(lessonDbId);
                  
                  return (
                    <Link 
                      key={lIdx} 
                      to={`/course/${courseId}/lessons/${mIdx}/${lIdx}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-dark-muted group-hover:text-primary-500 transition-colors" />
                        )}
                        <div>
                          <p className={`font-medium ${isCompleted ? 'text-dark-muted line-through' : 'text-white'}`}>
                            {lesson.title}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-dark-muted group-hover:text-white transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {showCertificate && (
        <Certificate 
          user={user} 
          course={course} 
          onClose={() => setShowCertificate(false)} 
        />
      )}
    </div>
  );
};

export default CourseHub;
