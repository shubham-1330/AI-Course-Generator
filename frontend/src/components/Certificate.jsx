import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Award, Download, X } from 'lucide-react';

const Certificate = ({ user, course, onClose }) => {
  const certificateRef = useRef(null);

  const handleDownload = async () => {
    const element = certificateRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${course.title.replace(/\s+/g, '_')}_Certificate.pdf`);
  };

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-dark-bg border border-white/10 rounded-2xl max-w-4xl w-full flex flex-col my-8 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Award className="text-yellow-400" /> Course Completion</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-dark-muted hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 overflow-x-auto flex justify-center bg-dark-card/50">
          {/* Certificate Container */}
          <div 
            ref={certificateRef}
            className="w-[800px] h-[565px] bg-white text-slate-900 relative p-12 flex flex-col items-center justify-center shadow-lg shrink-0"
            style={{ backgroundImage: 'radial-gradient(circle, #f8fafc 0%, #e2e8f0 100%)' }}
          >
            <div className="absolute inset-4 border-4 border-double border-slate-300 rounded-sm pointer-events-none"></div>
            <div className="absolute inset-6 border border-slate-200 rounded-sm pointer-events-none"></div>
            
            <Award className="w-20 h-20 text-yellow-500 mb-6" />
            <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-widest uppercase mb-2 text-center">Certificate of Completion</h1>
            <p className="text-slate-500 italic mb-8 text-lg">This proudly certifies that</p>
            
            <h2 className="text-5xl font-bold text-slate-900 mb-8 border-b-2 border-slate-300 px-16 pb-2 text-center w-full max-w-2xl">{user?.name || 'Student'}</h2>
            
            <p className="text-slate-600 mb-4 text-lg text-center">has successfully completed the comprehensive curriculum on</p>
            <h3 className="text-3xl font-bold text-slate-800 text-center max-w-2xl mb-12 px-4">{course.title}</h3>
            
            <div className="flex justify-between w-full px-16 mt-auto">
              <div className="text-center w-40">
                <div className="border-b border-slate-400 pb-1 mb-2">
                  <span className="font-semibold text-slate-700">{today}</span>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date Issued</p>
              </div>
              
              <div className="text-center w-40">
                <div className="border-b border-slate-400 pb-1 mb-2">
                  <span className="font-bold font-serif text-slate-700 text-lg">AI CourseGen</span>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Issuing Authority</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-white/10 flex justify-end gap-4 bg-dark-card rounded-b-2xl">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <button onClick={handleDownload} className="btn-primary flex items-center gap-2 !bg-yellow-500 hover:!bg-yellow-600 !text-white shadow-yellow-500/30">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
