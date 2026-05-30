import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, onSnapshot, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Lock, User, GraduationCap, CheckCircle2, Trophy, AlertCircle, ChevronRight, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/src/context/LanguageContext';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Exam {
  id: string;
  title: string;
  platform: string;
  startTime: string;
  endTime: string;
  duration: number;
  password: string;
  questions: Question[];
}

export default function ExamCenter() {
  const { platform } = useParams<{ platform: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [step, setStep] = useState<'list' | 'login' | 'exam' | 'result'>('list');
  
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    class: '',
    batch: '',
    roll: '',
    password: ''
  });
  
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!platform) return;
    
    const q = query(collection(db, 'exams'), where('platform', '==', platform));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam));
      // Sort in memory to avoid index requirement
      list.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setExams(list);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'exams'));

    const subQ = query(collection(db, 'exam_submissions'), where('platform', '==', platform));
    const subUnsubscribe = onSnapshot(subQ, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a: any, b: any) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setSubmissions(list);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'exam_submissions'));

    return () => {
      unsubscribe();
      subUnsubscribe();
    };
  }, [platform]);

  useEffect(() => {
    if (step === 'exam' && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    } else if (step === 'exam' && timeLeft === 0) {
      handleSubmitExam();
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMath = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
    return (
      <span>
        {parts.map((part, i) => {
          if (part.startsWith('$$') && part.endsWith('$$')) {
            return <BlockMath key={i} math={part.slice(2, -2)} />;
          }
          if (part.startsWith('$') && part.endsWith('$')) {
            return <InlineMath key={i} math={part.slice(1, -1)} />;
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const handleEnterExam = (exam: Exam) => {
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);

    if (now < start) {
      alert(language === 'bn' ? 'পরীক্ষা এখনো শুরু হয়নি!' : 'Exam has not started yet!');
      return;
    }
    if (now > end) {
      alert(language === 'bn' ? 'পরীক্ষার সময় শেষ হয়ে গেছে!' : 'Exam time is over!');
      return;
    }

    setSelectedExam(exam);
    setStep('login');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentInfo.password !== selectedExam?.password) {
      setError(language === 'bn' ? 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।' : 'Incorrect password! Try again.');
      return;
    }
    setError('');
    setAnswers(new Array(selectedExam.questions.length).fill(-1));
    setTimeLeft((selectedExam.duration || 30) * 60);
    setStep('exam');
  };

  const handleSubmitExam = async () => {
    if (!selectedExam) return;
    
    let finalScore = 0;
    selectedExam.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        finalScore++;
      }
    });

    setScore(finalScore);
    
    try {
      await addDoc(collection(db, 'exam_submissions'), {
        examId: selectedExam.id,
        examTitle: selectedExam.title,
        studentName: studentInfo.name,
        class: studentInfo.class,
        batch: studentInfo.batch,
        roll: studentInfo.roll,
        score: finalScore,
        totalQuestions: selectedExam.questions.length,
        platform,
        timestamp: serverTimestamp()
      });
      setStep('result');
    } catch (err) {
      console.error(err);
    }
  };

  if (step === 'result') {
    const examResults = submissions.filter(s => s.examId === selectedExam?.id);
    
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl animate-in zoom-in duration-500">
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <div className="bg-emerald-500 p-12 text-center text-white">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <Trophy className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-4xl font-black mb-2">{language === 'bn' ? 'অভিনন্দন!' : 'Congratulations!'}</h2>
            <p className="text-white/80 font-bold text-lg">{studentInfo.name}, {language === 'bn' ? 'আপনার পরীক্ষা সফলভাবে সম্পন্ন হয়েছে।' : 'your exam has been submitted successfully.'}</p>
          </div>
          <CardContent className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{language === 'bn' ? 'আপনার স্কোর' : 'Your Score'}</p>
                  <div className="text-6xl font-black text-primary">
                    {score} <span className="text-2xl text-slate-300">/ {selectedExam?.questions.length}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-primary flex items-center gap-2">
                    <User className="h-5 w-5 text-accent" /> {language === 'bn' ? 'আপনার তথ্য' : 'Your Info'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{language === 'bn' ? 'ব্যাচ' : 'Batch'}</p>
                      <p className="font-bold text-primary">{studentInfo.batch}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{language === 'bn' ? 'রোল' : 'Roll'}</p>
                      <p className="font-bold text-primary">{studentInfo.roll}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate(`/${platform}`)}
                  className="w-full h-14 text-lg font-black rounded-2xl bg-primary text-white shadow-xl shadow-primary/20"
                >
                  {language === 'bn' ? 'হোমপেজে ফিরে যান' : 'Back to Home'}
                </Button>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-black text-primary flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" /> {language === 'bn' ? 'লিডারবোর্ড' : 'Leaderboard'}
                </h3>
                <div className="space-y-3">
                  {examResults
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5)
                    .map((res, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        res.studentName === studentInfo.name ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-slate-100'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            idx === 0 ? 'bg-amber-100 text-amber-600' :
                            idx === 1 ? 'bg-slate-100 text-slate-600' :
                            idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400'
                          }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-primary text-sm">{res.studentName}</p>
                            <p className="text-[10px] font-bold text-slate-400">{res.batch} / {res.roll}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-primary">{res.score}</p>
                          <p className="text-[10px] font-bold text-slate-300">Score</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'exam') {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-4 z-10">
            <div>
              <h2 className="text-xl font-black text-primary">{selectedExam?.title}</h2>
              <p className="text-xs font-bold text-secondary">{studentInfo.name} | Roll: {studentInfo.roll}</p>
            </div>
            <div className="text-right flex gap-6 items-center">
              <div className="text-right">
                <div className={`text-2xl font-black ${timeLeft !== null && timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-accent'}`}>
                  {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'সময় বাকি' : 'Time Left'}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-primary">
                  {answers.filter(a => a !== -1).length} <span className="text-sm text-slate-300">/ {selectedExam?.questions.length}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'bn' ? 'উত্তর দেওয়া হয়েছে' : 'Answered'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {selectedExam?.questions.map((q, qIdx) => (
              <Card key={qIdx} className="border-none shadow-md rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-primary shrink-0">
                      {qIdx + 1}
                    </div>
                    <h3 className="text-lg font-bold text-primary leading-relaxed pt-1">
                      {renderMath(q.question)}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pl-14">
                    {q.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => {
                          const newAnswers = [...answers];
                          newAnswers[qIdx] = oIdx;
                          setAnswers(newAnswers);
                        }}
                        className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left font-bold ${
                          answers[qIdx] === oIdx 
                            ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all ${
                          answers[qIdx] === oIdx ? 'border-primary bg-primary' : 'border-slate-200'
                        }`}>
                          {answers[qIdx] === oIdx && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        {renderMath(opt)}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12">
            <Button 
              onClick={handleSubmitExam}
              disabled={answers.some(a => a === -1)}
              className="w-full h-16 text-xl font-black rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 gap-3"
            >
              <Send className="h-6 w-6" /> {language === 'bn' ? 'পরীক্ষা জমা দিন' : 'Submit Exam'}
            </Button>
            {answers.some(a => a === -1) && (
              <p className="text-center mt-4 text-sm font-bold text-amber-600 flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4" /> {language === 'bn' ? 'সবগুলো প্রশ্নের উত্তর দিন' : 'Please answer all questions'}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <div className="bg-primary p-10 text-center text-white relative">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <Lock className="w-40 h-40 -ml-10 -mt-10" />
             </div>
             <h2 className="text-2xl font-black mb-2">{language === 'bn' ? 'পরীক্ষায় প্রবেশ করুন' : 'Enter Exam'}</h2>
             <p className="text-white/60 text-sm font-medium">{selectedExam?.title}</p>
          </div>
          <CardContent className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-primary">{language === 'bn' ? 'আপনার নাম' : 'Your Name'}</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      required 
                      value={studentInfo.name} 
                      onChange={e => setStudentInfo({...studentInfo, name: e.target.value})}
                      className="h-12 pl-12 rounded-xl border-slate-200"
                      placeholder="e.g. Rahim Ahmed"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">{language === 'bn' ? 'ব্যাচ' : 'Batch'}</Label>
                    <Input 
                      required 
                      value={studentInfo.batch} 
                      onChange={e => setStudentInfo({...studentInfo, batch: e.target.value})}
                      className="h-12 rounded-xl border-slate-200"
                      placeholder="e.g. B1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-primary">{language === 'bn' ? 'রোল' : 'Roll'}</Label>
                    <Input 
                      required 
                      value={studentInfo.roll} 
                      onChange={e => setStudentInfo({...studentInfo, roll: e.target.value})}
                      className="h-12 rounded-xl border-slate-200"
                      placeholder="e.g. 101"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-primary">{language === 'bn' ? 'পরীক্ষার পাসওয়ার্ড' : 'Exam Password'}</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      type="password"
                      required 
                      value={studentInfo.password} 
                      onChange={e => setStudentInfo({...studentInfo, password: e.target.value})}
                      className="h-12 pl-12 rounded-xl border-slate-200"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1 h-14 font-bold rounded-2xl"
                  onClick={() => setStep('list')}
                >
                  {language === 'bn' ? 'পিছনে যান' : 'Back'}
                </Button>
                <Button 
                  type="submit" 
                  className="flex-[2] h-14 text-lg font-black rounded-2xl bg-primary text-white shadow-xl shadow-primary/20"
                >
                  {language === 'bn' ? 'শুরু করুন' : 'Start Now'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex p-4 bg-white rounded-3xl shadow-sm border border-slate-100 mb-4">
            <Trophy className="h-12 w-12 text-amber-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">
            {language === 'bn' ? 'অনলাইন এক্সাম সেন্টার' : 'Online Exam Center'}
          </h1>
          <p className="text-secondary font-medium max-w-2xl mx-auto">
            {language === 'bn' 
              ? 'আপনার মেধা যাচাই করুন এবং নিজেকে আরও দক্ষ করে তুলুন। নিচে আপনার পরীক্ষার তালিকা দেখুন।' 
              : 'Test your knowledge and improve your skills. Check the list of exams below.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exams.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400">
                {language === 'bn' ? 'বর্তমানে কোনো পরীক্ষা নেই' : 'No exams available right now'}
              </h3>
            </div>
          ) : (
            exams.map(exam => {
              const now = new Date();
              const start = new Date(exam.startTime);
              const end = new Date(exam.endTime);
              const isActive = now >= start && now <= end;
              const isUpcoming = now < start;
              const isEnded = now > end;

              return (
                <Card key={exam.id} className="group border-none shadow-lg hover:shadow-2xl transition-all rounded-[2.5rem] bg-white overflow-hidden flex flex-col">
                  <div className={`h-3 w-full ${isActive ? 'bg-emerald-500' : isUpcoming ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <Badge className={isActive ? 'bg-emerald-500' : isUpcoming ? 'bg-amber-500' : 'bg-slate-500'}>
                        {isActive ? (language === 'bn' ? 'চলমান' : 'Live') : 
                         isUpcoming ? (language === 'bn' ? 'আসন্ন' : 'Upcoming') : 
                         (language === 'bn' ? 'শেষ হয়েছে' : 'Ended')}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {format(start, 'MMM d, h:mm a')}
                      </div>
                    </div>

                    <h3 className="text-2xl font-black text-primary mb-4 group-hover:text-accent transition-colors">{exam.title}</h3>
                    
                    <div className="space-y-3 mb-8 flex-1">
                      <div className="flex items-center gap-3 text-sm font-bold text-secondary">
                        <Clock className="h-4 w-4 text-accent" />
                        {exam.duration} {language === 'bn' ? 'মিনিট' : 'Minutes'}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-secondary">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {exam.questions.length} {language === 'bn' ? 'টি প্রশ্ন' : 'Questions'}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-secondary">
                        <Lock className="h-4 w-4 text-amber-500" />
                        {language === 'bn' ? 'পাসওয়ার্ড প্রোটেক্টেড' : 'Password Protected'}
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleEnterExam(exam)}
                      disabled={isEnded}
                      className={`w-full h-14 text-lg font-black rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02]' 
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isActive ? (language === 'bn' ? 'পরীক্ষায় অংশগ্রহণ করুন' : 'Enter Exam') : 
                       isUpcoming ? (language === 'bn' ? 'অপেক্ষা করুন' : 'Wait for Start') : 
                       (language === 'bn' ? 'সময় শেষ' : 'Time Over')}
                      {isActive && <ChevronRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
