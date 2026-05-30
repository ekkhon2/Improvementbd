import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, Keyboard, RotateCcw, Award, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/src/context/LanguageContext';

const PARAGRAPHS = {
  en: [
    "Bangladesh is a land of natural beauty with the longest sea beach in Cox's Bazar and the largest mangrove forest, the Sundarbans. It has a rich history and vibrant culture that attracts people from all over the world.",
    "Islam is a religion of peace, promoting brotherhood, charity, and kindness to all living beings. It teaches us to be honest, patient, and respectful towards everyone, regardless of their background or beliefs.",
    "Education is the backbone of a nation, providing the light of knowledge to overcome the darkness of ignorance. It empowers individuals to think critically and contribute meaningfully to the progress of society.",
    "Reading books is a great habit that expands our imagination and helps us learn from the experiences of others. It is like a window to a different world, offering wisdom and perspective that we might not find elsewhere.",
    "Technology is changing the world rapidly, and coding is an essential skill for the future digital generation. Learning to code helps in developing problem-solving skills and logical thinking in a modern environment.",
    "The importance of discipline in life cannot be overstated. It helps us stay focused on our goals and ensures that we make the best use of our time and resources to achieve success in any field we choose.",
    "Nature provides us with everything we need to survive, from the air we breathe to the food we eat. We must take responsibility to protect our environment and preserve it for future generations to enjoy.",
    "Kindness is a language that the deaf can hear and the blind can see. A small act of kindness can make a huge difference in someone's life and spread positivity in the community around us.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. We should never be afraid of making mistakes, as they are often the best teachers on our journey towards excellence.",
    "Health is wealth, and maintaining a balanced diet along with regular exercise is key to a long and happy life. We should prioritize our physical and mental well-being to live life to its fullest potential."
  ],
  bn: [
    "বাংলাদেশ একটি প্রাকৃতিক সৌন্দর্যের লীলাভূমি, যেখানে বিশ্বের দীর্ঘতম সমুদ্র সৈকত কক্সবাজার এবং বৃহত্তম ম্যানগ্রোভ বন সুন্দরবন অবস্থিত। এর সমৃদ্ধ ইতিহাস ও প্রাণবন্ত সংস্কৃতি সারা বিশ্বের মানুষকে আকৃষ্ট করে।",
    "ইসলাম শান্তির ধর্ম, যা ভ্রাতৃত্ব, দানশীলতা এবং পৃথিবীর সকল জীবের প্রতি দয়ার শিক্ষা প্রদান করে। এটি আমাদের সৎ, ধৈর্যশীল এবং সবার প্রতি শ্রদ্ধাশীল হতে শেখায়, তাদের পটভূমি বা বিশ্বাস নির্বিশেষে।",
    "শিক্ষা জাতির মেরুদণ্ড, যা আমাদের অজ্ঞতার অন্ধকার দূর করে জ্ঞানের আলোয় আলোকিত করে। এটি ব্যক্তিদের গঠনমূলক চিন্তা করতে এবং সমাজের অগ্রগতিতে অর্থপূর্ণ অবদান রাখতে সক্ষম করে তোলে।",
    "বই পড়ার অভ্যাস আমাদের কল্পনাশক্তি বৃদ্ধি করে এবং অন্যের অভিজ্ঞতা থেকে শিখতে সাহায্য করে। এটি ভিন্ন জগতের জানালার মতো, যা আমাদের প্রজ্ঞা এবং দৃষ্টিভঙ্গি প্রদান করে যা আমরা অন্য কোথাও খুঁজে পাই না।",
    "প্রযুক্তি বিশ্বকে দ্রুত পরিবর্তন করছে এবং কোডিং ভবিষ্যৎ ডিজিটাল প্রজন্মের জন্য একটি অপরিহার্য দক্ষতা। কোডিং শেখা আধুনিক পরিবেশে সমস্যা সমাধানের দক্ষতা এবং যৌক্তিক চিন্তাভাবনা বিকাশে সহায়তা করে।",
    "জীবনে শৃঙ্খলার গুরুত্ব অপরিসীম। এটি আমাদের লক্ষ্য অর্জনে মনোনিবেশ করতে সাহায্য করে এবং নিশ্চিত করে যে আমরা আমাদের সময় এবং সম্পদের সর্বোত্তম ব্যবহার করছি যেকোনো ক্ষেত্রে সফল হওয়ার জন্য।",
    "প্রকৃতি আমাদের বেঁচে থাকার জন্য প্রয়োজনীয় সবকিছু সরবরাহ করে, শ্বাস নেওয়ার বাতাস থেকে শুরু করে খাবার পর্যন্ত। আমাদের পরিবেশ রক্ষা করা এবং ভবিষ্যৎ প্রজন্মের জন্য এটি সংরক্ষণ করার দায়িত্ব নিতে হবে।",
    "দয়া এমন একটি ভাষা যা বধিররা শুনতে পায় এবং অন্ধরা দেখতে পায়। দয়ার একটি ছোট কাজ কারো জীবনে বিশাল পরিবর্তন আনতে পারে এবং আমাদের চারপাশের সমাজে ইতিবাচকতা ছড়িয়ে দিতে পারে।",
    "সাফল্যই শেষ নয়, ব্যর্থতা মানেই মৃত্যু নয়: এগিয়ে যাওয়ার সাহসই আসল। আমাদের ভুল করতে ভয় পাওয়া উচিত নয়, কারণ সেগুলো প্রায়ই শ্রেষ্ঠত্বের পথে আমাদের সেরা শিক্ষক হিসেবে কাজ করে।",
    "স্বাস্থ্যই সম্পদ, এবং নিয়মিত ব্যায়ামের পাশাপাশি সুষম খাদ্য গ্রহণ দীর্ঘ ও সুখী জীবনের চাবিকাঠি। আমাদের শারীরিক ও মানসিক সুস্থতাকে অগ্রাধিকার দেওয়া উচিত যাতে আমরা জীবনের পূর্ণ সম্ভাবনা উপভোগ করতে পারি।"
  ]
};

type Language = 'en' | 'bn';
type Level = 'Baby' | 'Beginner' | 'Intermediate' | 'Pro';

export default function TypingTest() {
  const navigate = useNavigate();
  const { language: siteLang } = useLanguage();
  
  const [testLang, setTestLang] = useState<Language>('en');
  const [duration, setDuration] = useState<number>(60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [paragraph, setParagraph] = useState('');
  const [userInput, setUserInput] = useState('');
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    resetTest();
  }, [testLang]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        calculateStats();
      }, 1000);
    } else if (timeLeft === 0) {
      finishTest();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const resetTest = () => {
    const langParas = PARAGRAPHS[testLang];
    const randomPara = langParas[Math.floor(Math.random() * langParas.length)];
    setParagraph(randomPara);
    setUserInput('');
    setTimeLeft(duration);
    setIsActive(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setStartTime(null);
  };

  const startTest = () => {
    setIsActive(true);
    setStartTime(Date.now());
    if (inputRef.current) inputRef.current.focus();
  };

  const finishTest = () => {
    setIsActive(false);
    setIsFinished(true);
    calculateStats();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    if (!isActive) startTest();
    
    const value = e.target.value;
    setUserInput(value);
    calculateStats(value);
  };

  const calculateStats = (currentInput = userInput) => {
    if (!startTime) return;

    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    if (timeElapsed <= 0) return;

    // WPM = (characters / 5) / time
    const wordsTyped = currentInput.length / 5;
    const currentWpm = Math.round(wordsTyped / timeElapsed);
    setWpm(currentWpm);

    // Accuracy
    let correctChars = 0;
    const inputChars = currentInput.split('');
    const paraChars = paragraph.split('');
    
    inputChars.forEach((char, index) => {
      if (char === paraChars[index]) {
        correctChars++;
      }
    });

    const currentAccuracy = currentInput.length > 0 
      ? Math.round((correctChars / currentInput.length) * 100) 
      : 100;
    setAccuracy(currentAccuracy);
  };

  const getLevel = (wpmValue: number): Level => {
    if (wpmValue < 20) return 'Baby';
    if (wpmValue < 40) return 'Beginner';
    if (wpmValue < 60) return 'Intermediate';
    return 'Pro';
  };

  const getLevelColor = (level: Level) => {
    switch (level) {
      case 'Baby': return 'bg-slate-100 text-slate-600';
      case 'Beginner': return 'bg-blue-100 text-blue-600';
      case 'Intermediate': return 'bg-orange-100 text-orange-600';
      case 'Pro': return 'bg-green-100 text-green-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/it-education')}
          className="mb-8 hover:bg-white rounded-xl font-bold text-slate-600"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> {siteLang === 'bn' ? 'পিছনে যান' : 'Go Back'}
        </Button>

        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary text-white p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 text-center md:text-left">
                <CardTitle className="text-3xl md:text-4xl font-black tracking-tight">
                  {siteLang === 'bn' ? 'টাইপিং টেস্ট' : 'Typing Test'}
                </CardTitle>
                <p className="opacity-80 font-medium">
                  {siteLang === 'bn' ? 'আপনার টাইপিং গতি এবং নির্ভুলতা যাচাই করুন' : 'Check your typing speed and accuracy'}
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-sm">
                <Button 
                  variant={testLang === 'en' ? 'default' : 'ghost'}
                  onClick={() => setTestLang('en')}
                  className={`rounded-xl font-bold ${testLang === 'en' ? 'bg-white text-primary hover:bg-white/90' : 'text-white hover:bg-white/10'}`}
                >
                  English
                </Button>
                <Button 
                  variant={testLang === 'bn' ? 'default' : 'ghost'}
                  onClick={() => setTestLang('bn')}
                  className={`rounded-xl font-bold ${testLang === 'bn' ? 'bg-white text-primary hover:bg-white/90' : 'text-white hover:bg-white/10'}`}
                >
                  বাংলা
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 md:p-12 space-y-8">
            {!isActive && !isFinished ? (
              <div className="space-y-8 text-center py-12">
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {[60, 180, 300].map((s) => (
                    <Button
                      key={s}
                      variant={duration === s ? 'default' : 'outline'}
                      onClick={() => { setDuration(s); setTimeLeft(s); }}
                      className={`h-16 rounded-2xl font-black text-lg ${duration === s ? 'bg-primary text-white' : 'border-slate-200 text-slate-600'}`}
                    >
                      {s / 60} {siteLang === 'bn' ? 'মিনিট' : 'Min'}
                    </Button>
                  ))}
                </div>
                <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <Keyboard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {siteLang === 'bn' ? 'শুরু করতে প্রস্তুত?' : 'Ready to start?'}
                  </h3>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    {siteLang === 'bn' 
                      ? 'নিচের বাটনে ক্লিক করুন অথবা টাইপ করা শুরু করুন।' 
                      : 'Click the button below or just start typing to begin the test.'}
                  </p>
                  <Button 
                    size="lg" 
                    onClick={startTest}
                    className="bg-accent hover:bg-accent/90 text-white px-12 h-14 rounded-2xl font-black text-lg shadow-xl shadow-accent/20"
                  >
                    {siteLang === 'bn' ? 'শুরু করুন' : 'Start Test'}
                  </Button>
                </div>
              </div>
            ) : isFinished ? (
              <div className="space-y-12 text-center py-8">
                <div className="inline-flex p-6 bg-green-50 rounded-full mb-4">
                  <Award className="h-16 w-16 text-green-500" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
                    <p className="text-slate-500 font-bold mb-2 uppercase tracking-widest text-xs">Speed</p>
                    <h4 className="text-5xl font-black text-primary">{wpm}</h4>
                    <p className="text-slate-400 font-bold">WPM</p>
                  </div>
                  <div className="p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
                    <p className="text-slate-500 font-bold mb-2 uppercase tracking-widest text-xs">Accuracy</p>
                    <h4 className="text-5xl font-black text-accent">{accuracy}%</h4>
                    <p className="text-slate-400 font-bold">Correct</p>
                  </div>
                  <div className="p-8 bg-white rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50">
                    <p className="text-slate-500 font-bold mb-2 uppercase tracking-widest text-xs">Level</p>
                    <Badge className={`text-xl px-6 py-2 rounded-full font-black ${getLevelColor(getLevel(wpm))}`}>
                      {getLevel(wpm)}
                    </Badge>
                    <p className="text-slate-400 font-bold mt-4">Rank</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-4">
                  <Button 
                    size="lg" 
                    onClick={resetTest}
                    className="bg-primary hover:bg-primary/90 text-white px-12 h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" /> {siteLang === 'bn' ? 'আবার চেষ্টা করুন' : 'Try Again'}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/it-education')}
                    className="border-slate-200 text-slate-600 px-12 h-14 rounded-2xl font-black text-lg"
                  >
                    {siteLang === 'bn' ? 'ঠিক আছে' : 'OK'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 bg-slate-100 px-6 py-3 rounded-2xl">
                    <Timer className="h-6 w-6 text-primary" />
                    <span className="text-2xl font-black text-primary">
                      {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">WPM</p>
                      <p className="text-2xl font-black text-primary">{wpm}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accuracy</p>
                      <p className="text-2xl font-black text-accent">{accuracy}%</p>
                    </div>
                  </div>
                </div>

                <div className="relative p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 min-h-[12rem] text-xl md:text-2xl leading-relaxed font-medium text-slate-400 select-none">
                  {paragraph.split('').map((char, index) => {
                    let color = 'text-slate-400';
                    if (index < userInput.length) {
                      color = userInput[index] === char ? 'text-green-600' : 'text-red-500 bg-red-50';
                    }
                    return (
                      <span key={index} className={`${color} ${index === userInput.length ? 'border-b-4 border-primary animate-pulse' : ''}`}>
                        {char}
                      </span>
                    );
                  })}
                </div>

                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full h-40 p-8 bg-white rounded-[2.5rem] border-2 border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none text-xl md:text-2xl resize-none shadow-inner font-medium"
                  placeholder={siteLang === 'bn' ? 'টাইপ করা শুরু করুন...' : 'Start typing here...'}
                  spellCheck={false}
                />

                <div className="flex justify-center">
                  <Button 
                    variant="ghost" 
                    onClick={resetTest}
                    className="text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl font-bold"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> {siteLang === 'bn' ? 'রিসেট করুন' : 'Reset'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg rounded-3xl bg-white p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <CheckCircle2 className="h-6 w-6 text-blue-500" />
              </div>
              <h4 className="font-black text-slate-900">{siteLang === 'bn' ? 'টিপস' : 'Tips'}</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-500 font-medium">
              <li>• {siteLang === 'bn' ? 'সঠিকভাবে বসার চেষ্টা করুন।' : 'Try to maintain a good posture.'}</li>
              <li>• {siteLang === 'bn' ? 'কীবোর্ডের দিকে না তাকিয়ে টাইপ করার অভ্যাস করুন।' : 'Practice typing without looking at the keyboard.'}</li>
              <li>• {siteLang === 'bn' ? 'ভুল কমানোর দিকে মনোযোগ দিন, গতি এমনিতেই বাড়বে।' : 'Focus on accuracy first, speed will follow naturally.'}</li>
            </ul>
          </Card>
          <Card className="border-none shadow-lg rounded-3xl bg-white p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-50 rounded-2xl">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <h4 className="font-black text-slate-900">{siteLang === 'bn' ? 'নির্দেশনা' : 'Instructions'}</h4>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              {siteLang === 'bn' 
                ? 'বাংলা টাইপিংয়ের জন্য আপনার কম্পিউটারে বিজয় বা অভ্র সফটওয়্যার ব্যবহার করতে পারেন। টেক্সটটি ইউনিকোড ফরম্যাটে দেওয়া হয়েছে।' 
                : 'For English typing, use standard QWERTY layout. For Bangla, ensure your system keyboard is set to Bijoy or Avro mode.'}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
