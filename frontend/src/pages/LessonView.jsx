import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { ArrowLeft, CheckCircle, LogOut } from 'lucide-react';

const LessonView = () => {
  const { courseId, moduleIdx, lessonIdx } = useParams();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizScore, setQuizScore] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const fetchLesson = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/courses/${courseId}/lessons/${moduleIdx}/${lessonIdx}`);
      setLessonData(response.data);
    } catch (error) {
      console.error("Failed to fetch lesson", error);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonIdx, moduleIdx]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  const handleQuizSubmit = async () => {
    let correct = 0;
    lessonData.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct_index) correct++;
    });
    setQuizScore(correct);
    
    if (correct === lessonData.quiz.length) {
      await api.post(`/courses/${courseId}/lessons/${lessonData._id}/complete`);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
      <p className="text-dark-muted animate-pulse">Generating your personalized lesson...</p>
    </div>
  );

  if (!lessonData) return <div className="min-h-screen bg-dark-bg text-white p-10">Lesson not found.</div>;

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to={`/course/${courseId}`} className="inline-flex items-center gap-2 text-dark-muted hover:text-white transition-colors bg-dark-bg border border-white/10 px-4 py-2 rounded-lg">
            <ArrowLeft className="w-4 h-4" /> Back to Curriculum
          </Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-dark-muted hover:text-red-400 transition-colors bg-dark-bg border border-white/10 px-4 py-2 rounded-lg">
            <LogOut className="w-4 h-4" /> Exit to Dashboard
          </Link>
        </div>
        
        <div className="mb-10">
          <span className="text-primary-400 font-medium mb-2 block">{lessonData.module_title}</span>
          <h1 className="text-4xl font-extrabold text-white">{lessonData.lesson_title}</h1>
        </div>
        
        <div className="glass-card p-8 mb-12">
          <div className="prose prose-invert prose-primary max-w-none">
            <ReactMarkdown>{lessonData.content_markdown}</ReactMarkdown>
          </div>
        </div>
        
        {lessonData.quiz && lessonData.quiz.length > 0 && (
          <div className="glass-card p-8 border-t-4 border-t-purple-500">
            <h2 className="text-2xl font-bold text-white mb-6">Knowledge Check</h2>
            
            <div className="space-y-8">
              {lessonData.quiz.map((q, qIdx) => (
                <div key={qIdx}>
                  <p className="text-lg text-white mb-4">{qIdx + 1}. {q.question}</p>
                  <div className="space-y-3">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[qIdx] === oIdx;
                      let btnClass = isSelected ? "bg-primary-500/20 border-primary-500 text-white" : "bg-dark-bg border-white/10 text-dark-muted hover:border-white/30";
                      
                      if (quizScore !== null) {
                        const isCorrect = q.correct_index === oIdx;
                        if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-400";
                        else if (isSelected && !isCorrect) btnClass = "bg-red-500/20 border-red-500 text-red-400";
                      }
                      
                      return (
                        <button
                          key={oIdx}
                          disabled={quizScore !== null}
                          onClick={() => setSelectedAnswers(prev => ({...prev, [qIdx]: oIdx}))}
                          className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${btnClass}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {quizScore === null ? (
              <button 
                onClick={handleQuizSubmit}
                disabled={Object.keys(selectedAnswers).length < lessonData.quiz.length}
                className="btn-primary mt-8 w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answers
              </button>
            ) : (
              <div className={`mt-8 p-6 rounded-xl flex items-center justify-between ${quizScore === lessonData.quiz.length ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                <div>
                  <h3 className={`text-xl font-bold ${quizScore === lessonData.quiz.length ? 'text-green-400' : 'text-red-400'}`}>
                    Score: {quizScore} / {lessonData.quiz.length}
                  </h3>
                  <p className="text-dark-muted mt-1">
                    {quizScore === lessonData.quiz.length ? "Perfect! Lesson marked as complete." : "Review the material and try again."}
                  </p>
                </div>
                {quizScore === lessonData.quiz.length && (
                  <Link to={`/course/${courseId}`} className="btn-primary flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Continue Course
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default LessonView;
