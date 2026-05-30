import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType, auth } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Edit, Clock, Lock, Users, CheckCircle2, Trophy, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import firebaseConfig from '@/firebase-applet-config.json';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Exam {
  id: string;
  title: string;
  platform: 'it-education' | 'academic-care';
  startTime: string;
  endTime: string;
  duration: number;
  password: string;
  questions: Question[];
  createdAt: any;
}

export default function ExamsAdmin() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'add' | 'update'>('add');
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedExamResults, setSelectedExamResults] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagInfo, setDiagInfo] = useState<string>('Initializing...');
  
  const [formData, setFormData] = useState({
    title: '',
    platform: 'it-education' as 'it-education' | 'academic-care',
    startTime: '',
    endTime: '',
    duration: '',
    password: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });

  useEffect(() => {
    const userRole = auth.currentUser?.email === 'ekkhon2@gmail.com' ? 'Admin (Owner)' : 'User';
    setDiagInfo(`Auth: ${auth.currentUser?.email || 'Not Logged In'} | Role: ${userRole} | DB: ${firebaseConfig.firestoreDatabaseId}`);
    
    console.log('ExamsAdmin starting listeners...');
    const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Exams Snapshot:', snapshot.docs.length, 'records');
      setExams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam)));
    }, (error) => {
      console.error('Exams Listener Error:', error);
      setErrorMessage(`Error: ${error.message}. Please check if Firestore rules are deployed.`);
    });

    const subQ = query(collection(db, 'exam_submissions'), orderBy('timestamp', 'desc'));
    const subUnsubscribe = onSnapshot(subQ, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error('Submissions Listener Error:', error));

    return () => {
      unsubscribe();
      subUnsubscribe();
    };
  }, []);

  const bootstrapDemo = async () => {
    if (exams.length > 0) {
      alert('সিস্টেমে ইতিমধ্যে পরীক্ষা রয়েছে। নতুন ডেমো প্রয়োজন নেই।');
      return;
    }
    await seedExams();
  };

  const seedExams = async () => {
    const seedData = [
      {
        title: 'IT Basics Demo - Quiz 1',
        platform: 'it-education',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: '2026-05-01T23:59',
        duration: 30,
        password: '123',
        questions: [
          { question: 'What is HTML?', options: ['Markup Language', 'Browser', 'Database', 'OS'], correctAnswer: 0 },
          { question: 'Solve $2x+5=15$', options: ['$x=5$', '$x=10$', '$x=3$', '$x=2$'], correctAnswer: 0 }
        ]
      },
      {
        title: 'Math Special Demo',
        platform: 'academic-care',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: '2026-05-01T23:59',
        duration: 60,
        password: '123',
        questions: [
          { question: 'Calculate $\\sqrt{144}$', options: ['12', '14', '10', '16'], correctAnswer: 0 }
        ]
      }
    ];

    try {
      setIsProcessing(true);
      console.log('Force Seeding via setDoc...');
      let count = 0;
      for (const e of seedData) {
        // Use setDoc to ensure document creation with a predictable path
        const docId = `demo-exam-${++count}-${Date.now()}`;
        await setDoc(doc(db, 'exams', docId), {
          ...e,
          createdAt: serverTimestamp()
        });
        console.log('Created:', docId);
      }
      alert('ডেমো ডাটা সফলভাবে ফায়ারস্টোর ডাটাবেসে যোগ করা হয়েছে!');
    } catch (err: any) {
      console.error('Seed Error:', err);
      alert('ERROR: ' + err.message + '\n\nTips: Make sure you are logged in as ekkhon2@gmail.com');
    } finally {
      setIsProcessing(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.duration || !formData.password) {
      alert('সব তথ্য পূরণ করুন');
      return;
    }

    try {
      setIsProcessing(true);
      const durationVal = parseInt(formData.duration);
      const examData = {
        title: formData.title,
        platform: formData.platform,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: isNaN(durationVal) ? 30 : durationVal,
        password: formData.password,
        questions: formData.questions,
        createdAt: serverTimestamp()
      };

      if (editingExam) {
        await updateDoc(doc(db, 'exams', editingExam.id), examData);
      } else {
        await addDoc(collection(db, 'exams'), examData);
      }
      
      setIsDialogOpen(false);
      setShowSuccess(true);
      setSuccessType(editingExam ? 'update' : 'add');
      resetForm();
    } catch (err: any) {
      console.error('Submit error:', err);
      alert('Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...formData.questions];
    (newQuestions[index] as any)[field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[oIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const viewResults = (examId: string) => {
    const results = submissions.filter(s => s.examId === examId);
    setSelectedExamResults(results);
    setShowResults(true);
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

  const resetForm = () => {
    setEditingExam(null);
    setFormData({
      title: '',
      platform: 'it-education',
      startTime: '',
      endTime: '',
      duration: '',
      password: '',
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    });
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      platform: exam.platform,
      startTime: exam.startTime,
      endTime: exam.endTime,
      duration: exam.duration?.toString() || '',
      password: exam.password,
      questions: exam.questions
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this exam?')) {
      try {
        setIsProcessing(true);
        await deleteDoc(doc(db, 'exams', id));
        alert('সফলভাবে মুছে ফেলা হয়েছে।');
      } catch (err: any) {
        alert('মুছতে সমস্যা হয়েছে: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="space-y-8 p-4">
      {/* Diagnostic Status Bar */}
      <div className="bg-slate-900 text-slate-400 p-2 rounded-lg text-[10px] font-mono flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${exams.length > 0 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            Status: {exams.length > 0 ? 'Exams Loaded' : 'No Exams Found'}
          </span>
          <span>{diagInfo}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={bootstrapDemo} disabled={isProcessing} className="hover:text-white underline decoration-accent uppercase mr-2">
            Force Create Demo Exam
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Exam Panel</h2>
          {errorMessage && <p className="text-red-500 font-bold">{errorMessage}</p>}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={seedExams} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Seed Data'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-white font-bold">
                <Plus className="mr-2 h-5 w-5" /> Create Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingExam ? 'Edit' : 'Create'} Exam</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Exam Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  <Select value={formData.platform} onValueChange={(v: any) => setFormData({...formData, platform: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it-education">IT Education</SelectItem>
                      <SelectItem value="academic-care">Academic Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Input type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
                  <Input type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} required />
                  <Input type="number" placeholder="Duration (m)" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
                </div>
                <Input placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold">Questions ({formData.questions.length})</h3>
                    <Button type="button" size="sm" onClick={addQuestion}>Add</Button>
                  </div>
                  {formData.questions.map((q, qIdx) => (
                    <Card key={qIdx}>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex gap-2">
                          <Input className="flex-1" placeholder="Question" value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} required />
                          <Button type="button" variant="destructive" size="icon" onClick={() => removeQuestion(qIdx)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-2 items-center">
                              <input type="radio" checked={q.correctAnswer === oIdx} onChange={() => updateQuestion(qIdx, 'correctAnswer', oIdx)} />
                              <Input placeholder={`Opt ${oIdx+1}`} value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} required />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? 'Saving...' : (editingExam ? 'Update' : 'Publish')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {exams.map(exam => (
          <Card key={exam.id}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">{exam.title}</h3>
                <p className="text-sm text-secondary">{exam.platform} | {exam.duration}m | Pwd: {exam.password}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => viewResults(exam.id)}>Results</Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(exam)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(exam.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Results</DialogTitle></DialogHeader>
          <div className="mt-4">
            {selectedExamResults.length === 0 ? <p>No results.</p> : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Name</th>
                    <th className="p-2">Batch/Roll</th>
                    <th className="p-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExamResults.map(res => (
                    <tr key={res.id} className="border-b">
                      <td className="p-2 font-bold">{res.studentName}</td>
                      <td className="p-2">{res.batch} / {res.roll}</td>
                      <td className="p-2">{res.score} / {res.totalQuestions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="text-center p-8 uppercase font-bold">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          Successfully {successType === 'update' ? 'Updated' : 'Created'}!
          <Button onClick={() => setShowSuccess(false)} className="mt-6 w-full">Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
