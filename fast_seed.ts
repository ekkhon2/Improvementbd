
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import config from './firebase-applet-config.json';

const app = initializeApp(config);
const db = getFirestore(app);

const exams = [
  {
    title: 'IT Basics - Quiz 1',
    platform: 'it-education',
    startTime: '2026-04-16T10:00',
    endTime: '2026-05-01T23:59',
    duration: 30,
    password: '123',
    questions: [
      { question: 'What is HTML?', options: ['Language', 'Car', 'Food', 'None'], correctAnswer: 0 },
      { question: 'Solve $x+2=4$', options: ['$x=2$', '$x=4$', '$x=0$', '$x=1$'], correctAnswer: 0 }
    ]
  },
  {
    title: 'IT Basics - Quiz 2',
    platform: 'it-education',
    startTime: '2026-04-16T10:00',
    endTime: '2026-05-01T23:59',
    duration: 30,
    password: '123',
    questions: [
      { question: 'What is CSS?', options: ['Style', 'Code', 'Math', 'None'], correctAnswer: 0 }
    ]
  },
  {
    title: 'Academic Care - Math Quiz 1',
    platform: 'academic-care',
    startTime: '2026-04-16T10:00',
    endTime: '2026-05-01T23:59',
    duration: 30,
    password: '123',
    questions: [
      { question: 'Solve $\\int x dx$', options: ['$\\frac{x^2}{2} + C$', '$x^2$', '$x$', '1'], correctAnswer: 0 }
    ]
  },
  {
    title: 'Academic Care - Science Quiz 2',
    platform: 'academic-care',
    startTime: '2026-04-16T10:00',
    endTime: '2026-05-01T23:59',
    duration: 30,
    password: '123',
    questions: [
      { question: 'Formula of Water?', options: ['H2O', 'CO2', 'O2', 'None'], correctAnswer: 0 }
    ]
  }
];

async function run() {
  for (const e of exams) {
    await addDoc(collection(db, 'exams'), { ...e, createdAt: serverTimestamp() });
    console.log('Added:', e.title);
  }
}

run().then(() => process.exit(0)).catch(() => process.exit(1));
