import { db } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

export async function seedBanners() {
  try {
    const bannersRef = collection(db, 'banners');
    const snapshot = await getDocs(bannersRef);
    
    if (snapshot.empty) {
      console.log('Seeding demo banners...');
      const demoBanners = [
        {
          title: 'Changing Society Through Service',
          subtitle: 'Join Improvement BD in our mission to build a better future for everyone.',
          image: 'https://picsum.photos/seed/banner1/1920/1080',
          link: '/foundation',
          order: 1,
          createdAt: serverTimestamp()
        },
        {
          title: 'Donate Blood, Save Lives',
          subtitle: 'Your small contribution can be someone\'s second chance at life.',
          image: 'https://picsum.photos/seed/banner2/1920/1080',
          link: '/blood-bank',
          order: 2,
          createdAt: serverTimestamp()
        }
      ];

      for (const banner of demoBanners) {
        await addDoc(bannersRef, banner);
      }
      console.log('Demo banners seeded successfully.');
    }
  } catch (error) {
    console.warn('Silent warning: Seeding banners failed (probably not admin or unauthenticated, normal for public visitors):', error);
  }
}

export async function seedGallery() {
  try {
    const galleryRef = collection(db, 'gallery');
    const snapshot = await getDocs(galleryRef);
    
    if (snapshot.empty) {
      console.log('Seeding demo gallery posts...');
      const platforms = ['foundation', 'blood-bank', 'food-bank', 'sporting-club', 'it-education', 'academic-care', 'library'];
      
      for (const platform of platforms) {
        for (let i = 1; i <= 4; i++) {
          await addDoc(galleryRef, {
            title: `${platform.replace('-', ' ').toUpperCase()} Event ${i}`,
            description: `This is a demo post for ${platform}. We are working hard to make a difference in our community through various activities.`,
            image: `https://picsum.photos/seed/${platform}${i}/800/600`,
            platform,
            type: i % 3 === 0 ? 'video' : 'image',
            videoUrl: i % 3 === 0 ? 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' : '',
            isFeatured: i === 1,
            createdAt: serverTimestamp()
          });
        }
      }
      console.log('Demo gallery posts seeded successfully.');
    }
  } catch (error) {
    console.warn('Silent warning: Seeding gallery failed (probably not admin or unauthenticated, normal for public visitors):', error);
  }
}

export async function resetDemoCourses() {
  const coursesRef = collection(db, 'courses');
  const snapshot = await getDocs(coursesRef);
  
  // Delete existing courses
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  console.log('Existing courses deleted. Re-seeding...');
  
  // Re-seed with new data
  const demoCourses = [
    {
      title: 'Graphic Design',
      category: 'Design',
      description: `
        <p>আধুনিক বিশ্বের সাথে তাল মিলিয়ে নিজের ক্যারিয়ার গড়ুন <strong>Graphic Design</strong> এর মাধ্যমে। আমাদের এই কোর্সে আপনি শিখবেন Adobe Photoshop এবং Illustrator এর একদম <strong>Basic to Advanced</strong> লেভেল।</p>
        <p><strong>Course Highlights:</strong></p>
        <ul>
          <li>Logo Design & Branding</li>
          <li>Social Media Post Design</li>
          <li>Typography & Color Theory</li>
          <li>Freelancing Guidelines (Fiverr/Upwork)</li>
        </ul>
        <p>প্রতিটি চ্যাপ্টার শেষে থাকছে <strong>Chapter-wise MCQs & SCQs</strong>। এছাড়া নিয়মিত <strong>Weekly and Monthly Exams</strong> এর মাধ্যমে আপনার প্রগ্রেস যাচাই করা হবে। আমরা প্রদান করি স্পেশাল <strong>Basic Sheets</strong> যা আপনার লার্নিং প্রসেসকে করবে আরও সহজ।</p>
      `,
      images: ['https://i.ibb.co.com/NgmJMWzq/Improvement-IT-Education.jpg'],
      platform: 'it-education',
      duration: '3 Months',
      price: '৳ ৫,০০০',
      features: ['Adobe Photoshop & Illustrator', 'Professional Portfolio Building', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Basic Sheets & Resources'],
      createdAt: serverTimestamp()
    },
    {
      title: 'Basic Computing',
      category: 'IT Fundamentals',
      description: `
        <p>কম্পিউটার জগতের হাতেখড়ি হোক <strong>Improvement IT</strong> এর সাথে। এই কোর্সে আমরা একদম জিরো থেকে <strong>Basic Computing</strong> এর খুঁটিনাটি শেখাবো।</p>
        <p><strong>কি কি শিখবেন?</strong></p>
        <ul>
          <li>Hardware & Software Fundamentals</li>
          <li>Microsoft Office Suite (Word, Excel, PowerPoint)</li>
          <li>Internet Browsing & Cyber Security</li>
          <li>Operating System Management</li>
        </ul>
        <p>আমাদের প্রতিটি ক্লাসে থাকবে <strong>Interactive Learning</strong> এর সুযোগ। প্রতিটি বিষয়ের উপর থাকছে <strong>MCQs & SCQs</strong> এবং নিয়মিত <strong>Weekly Exams</strong>। আমরা নিশ্চিত করি প্রতিটি স্টুডেন্টের জন্য <strong>Personalized Basic Sheets</strong>।</p>
      `,
      images: ['https://i.ibb.co.com/NgmJMWzq/Improvement-IT-Education.jpg'],
      platform: 'it-education',
      duration: '2 Months',
      price: '৳ ৩,০০০',
      features: ['MS Office Mastery', 'Hardware Troubleshooting', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Basic Sheets'],
      createdAt: serverTimestamp()
    },
    {
      title: 'Basic to Advanced AI',
      category: 'Artificial Intelligence',
      description: `
        <p>ভবিষ্যতের প্রযুক্তির সাথে পরিচিত হতে জয়েন করুন আমাদের <strong>Basic to Advanced AI</strong> কোর্সে। বর্তমান যুগে <strong>Artificial Intelligence</strong> এর ব্যবহার জানা অপরিহার্য।</p>
        <p><strong>কোর্সের মূল বিষয়বস্তু:</strong></p>
        <ul>
          <li>Introduction to AI & Machine Learning</li>
          <li>Prompt Engineering (ChatGPT, Midjourney)</li>
          <li>AI Tools for Productivity</li>
          <li>Future of AI in Industry</li>
        </ul>
        <p>কোর্সটি সাজানো হয়েছে একদম <strong>Practical Projects</strong> দিয়ে। প্রতিটি মডিউল শেষে থাকছে <strong>Chapter-wise MCQs</strong>। নিয়মিত <strong>Monthly Exams</strong> এবং স্পেশাল <strong>AI Basic Sheets</strong> এর মাধ্যমে আপনি হয়ে উঠবেন একজন <strong>AI Expert</strong>।</p>
      `,
      images: ['https://i.ibb.co.com/NgmJMWzq/Improvement-IT-Education.jpg'],
      platform: 'it-education',
      duration: '4 Months',
      price: '৳ ৮,০০০',
      features: ['Prompt Engineering', 'AI Productivity Tools', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Advanced AI Sheets'],
      createdAt: serverTimestamp()
    },
    {
      title: 'Class 8 All Subjects',
      category: 'Schooling',
      classLevel: 'Class 8',
      description: `
        <p>অষ্টম শ্রেণীর শিক্ষার্থীদের জন্য আমাদের এই <strong>Comprehensive Coaching</strong> প্রোগ্রাম। আমরা প্রতিটি বিষয়কে অত্যন্ত গুরুত্বের সাথে পড়িয়ে থাকি।</p>
        <p><strong>বিষয়সমূহ:</strong></p>
        <ul>
          <li>Bengali & English (Grammar focus)</li>
          <li>Mathematics (Conceptual solving)</li>
          <li>Science (Practical approach)</li>
          <li>General Knowledge & Islamic Studies</li>
        </ul>
        <p>আমাদের রয়েছে <strong>Expert Tutors</strong> যারা প্রতিটি চ্যাপ্টার শেষে <strong>MCQs & SCQs</strong> গ্রহণ করেন। নিয়মিত <strong>Weekly and Monthly Exams</strong> এর মাধ্যমে রেজাল্ট ইমপ্রুভমেন্ট নিশ্চিত করা হয়। প্রতিটি সাবজেক্টের জন্য রয়েছে আলাদা <strong>Basic Sheets</strong>।</p>
      `,
      images: ['https://i.ibb.co.com/RpkV8nZ4/Improvement-Academic-Care.jpg'],
      platform: 'academic-care',
      duration: 'Full Session',
      price: '৳ ২,৫০০/মাস',
      features: ['All Subjects Coverage', 'Creative Question Practice', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Subject-wise Basic Sheets'],
      createdAt: serverTimestamp()
    },
    {
      title: 'HSC ICT',
      category: 'College',
      classLevel: 'Class 12',
      description: `
        <p>HSC পরীক্ষার্থীদের জন্য <strong>ICT</strong> এখন আর ভয়ের বিষয় নয়। আমাদের <strong>Multimedia Classroom</strong> এ প্রতিটি টপিক ভিজ্যুয়ালি শেখানো হয়।</p>
        <p><strong>স্পেশাল ফোকাস:</strong></p>
        <ul>
          <li>HTML & Web Design (Live Coding)</li>
          <li>Programming Chapter (C Programming in detail)</li>
          <li>Number Systems & Logic Gates</li>
          <li>Database Management Systems</li>
        </ul>
        <p>প্রতিটি চ্যাপ্টারের উপর থাকছে <strong>Chapter-wise MCQs & SCQs</strong>। নিয়মিত <strong>Weekly Exams</strong> এবং বোর্ড স্ট্যান্ডার্ড <strong>Monthly Exams</strong> এর মাধ্যমে আমরা আপনাকে প্রস্তুত করবো। আমাদের <strong>Programming Basic Sheets</strong> আপনার কোডিং স্কিলকে করবে আরও শার্প।</p>
      `,
      images: ['https://i.ibb.co.com/RpkV8nZ4/Improvement-Academic-Care.jpg'],
      platform: 'academic-care',
      duration: '6 Months',
      price: '৳ ৪,০০০',
      features: ['Multimedia Classroom', 'Detailed Programming Class', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'ICT Basic Sheets'],
      createdAt: serverTimestamp()
    },
    {
      title: 'HSC Physics',
      category: 'College',
      classLevel: 'Class 11',
      description: `
        <p>ফিজিক্স শুধু পড়ার বিষয় নয়, এটি অনুভবের বিষয়। <strong>Improvement Academic Care</strong> এ আমরা আপনাকে ফিজিক্স <strong>Feel and Understand</strong> করতে সাহায্য করবো।</p>
        <p><strong>কেন আমাদের ফিজিক্স কোর্স?</strong></p>
        <ul>
          <li>Conceptual Understanding of Laws</li>
          <li>Mathematical Problem Solving Techniques</li>
          <li>Real-life Applications of Physics</li>
          <li>Board Question Analysis</li>
        </ul>
        <p>প্রতিটি চ্যাপ্টার শেষে থাকছে <strong>Chapter-wise MCQs & SCQs</strong>। নিয়মিত <strong>Weekly and Monthly Exams</strong> এর মাধ্যমে আপনার মেধা যাচাই করা হবে। আমাদের স্পেশাল <strong>Physics Basic Sheets</strong> আপনার বেসিককে করবে আরও শক্তিশালী।</p>
      `,
      images: ['https://i.ibb.co.com/RpkV8nZ4/Improvement-Academic-Care.jpg'],
      platform: 'academic-care',
      duration: 'Full Course',
      price: '৳ ৫,০০০',
      features: ['Conceptual Learning', 'Math Solving Mastery', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Physics Basic Sheets'],
      createdAt: serverTimestamp()
    }
  ];

  for (const course of demoCourses) {
    await addDoc(coursesRef, course);
  }
  console.log('Demo courses reset successfully.');
}

export async function seedCourses() {
  try {
    const coursesRef = collection(db, 'courses');
    const snapshot = await getDocs(coursesRef);
    
    if (snapshot.empty) {
      console.log('Seeding demo courses...');
      const demoCourses = [
        {
          title: 'Graphic Design',
          category: 'Design',
          description: `
            <p>আধুনিক বিশ্বের সাথে তাল মিলিয়ে নিজের ক্যারিয়ার গড়ুন <strong>Graphic Design</strong> এর মাধ্যমে। আমাদের এই কোর্সে আপনি শিখবেন Adobe Photoshop এবং Illustrator এর একদম <strong>Basic to Advanced</strong> লেভেল।</p>
            <p><strong>Course Highlights:</strong></p>
            <ul>
              <li>Logo Design & Branding</li>
              <li>Social Media Post Design</li>
              <li>Typography & Color Theory</li>
              <li>Freelancing Guidelines (Fiverr/Upwork)</li>
            </ul>
            <p>প্রতিটি চ্যাপ্টার শেষে থাকছে <strong>Chapter-wise MCQs & SCQs</strong>। এছাড়া নিয়মিত <strong>Weekly and Monthly Exams</strong> এর মাধ্যমে আপনার প্রগ্রেস যাচাই করা হবে। আমরা প্রদান করি স্পেশাল <strong>Basic Sheets</strong> যা আপনার লার্নিং প্রসেসকে করবে আরও সহজ।</p>
          `,
          images: ['https://i.ibb.co.com/NgmJMWzq/Improvement-IT-Education.jpg'],
          platform: 'it-education',
          duration: '3 Months',
          price: '৳ ৫,০০০',
          features: ['Adobe Photoshop & Illustrator', 'Professional Portfolio Building', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Basic Sheets & Resources'],
          createdAt: serverTimestamp()
        },
        {
          title: 'Basic Computing',
          category: 'IT Fundamentals',
          description: `
            <p>কম্পিউটার জগতের হাতেখড়ি হোক <strong>Improvement IT</strong> এর সাথে। এই কোর্সে আমরা একদম জিরো থেকে <strong>Basic Computing</strong> এর খুঁটিনাটি শেখাবো।</p>
            <p><strong>কি কি শিখবেন?</strong></p>
            <ul>
              <li>Hardware & Software Fundamentals</li>
              <li>Microsoft Office Suite (Word, Excel, PowerPoint)</li>
              <li>Internet Browsing & Cyber Security</li>
              <li>Operating System Management</li>
            </ul>
            <p>আমাদের প্রতিটি ক্লাসে থাকবে <strong>Interactive Learning</strong> এর সুযোগ। প্রতিটি বিষয়ের উপর থাকছে <strong>MCQs & SCQs</strong> এবং নিয়মিত <strong>Weekly Exams</strong>। আমরা নিশ্চিত করি প্রতিটি স্টুডেন্টের জন্য <strong>Personalized Basic Sheets</strong>।</p>
          `,
          images: ['https://i.ibb.co.com/NgmJMWzq/Improvement-IT-Education.jpg'],
          platform: 'it-education',
          duration: '2 Months',
          price: '৳ ৩,০০০',
          features: ['MS Office Mastery', 'Hardware Troubleshooting', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Basic Sheets'],
          createdAt: serverTimestamp()
        },
        {
          title: 'Basic to Advanced AI',
          category: 'Artificial Intelligence',
          description: `
            <p>ভবিষ্যতের প্রযুক্তির সাথে পরিচিত হতে জয়েন করুন আমাদের <strong>Basic to Advanced AI</strong> কোর্সে। বর্তমান যুগে <strong>Artificial Intelligence</strong> এর ব্যবহার জানা অপরিহার্য।</p>
            <p><strong>কোর্সের মূল বিষয়বস্তু:</strong></p>
            <ul>
              <li>Introduction to AI & Machine Learning</li>
              <li>Prompt Engineering (ChatGPT, Midjourney)</li>
              <li>AI Tools for Productivity</li>
              <li>Future of AI in Industry</li>
            </ul>
            <p>কোর্সটি সাজানো হয়েছে একদম <strong>Practical Projects</strong> দিয়ে। প্রতিটি মডিউল শেষে থাকছে <strong>Chapter-wise MCQs</strong>। নিয়মিত <strong>Monthly Exams</strong> এবং স্পেশাল <strong>AI Basic Sheets</strong> এর মাধ্যমে আপনি হয়ে উঠবেন একজন <strong>AI Expert</strong>।</p>
          `,
          images: ['https://i.ibb.co.com/NgmJMWzq/Improvement-IT-Education.jpg'],
          platform: 'it-education',
          duration: '4 Months',
          price: '৳ ৮,০০০',
          features: ['Prompt Engineering', 'AI Productivity Tools', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Advanced AI Sheets'],
          createdAt: serverTimestamp()
        },
        {
          title: 'Class 8 All Subjects',
          category: 'Schooling',
          classLevel: 'Class 8',
          description: `
            <p>অষ্টম শ্রেণীর শিক্ষার্থীদের জন্য আমাদের এই <strong>Comprehensive Coaching</strong> প্রোগ্রাম। আমরা প্রতিটি বিষয়কে অত্যন্ত গুরুত্বের সাথে পড়িয়ে থাকি।</p>
            <p><strong>বিষয়সমূহ:</strong></p>
            <ul>
              <li>Bengali & English (Grammar focus)</li>
              <li>Mathematics (Conceptual solving)</li>
              <li>Science (Practical approach)</li>
              <li>General Knowledge & Islamic Studies</li>
            </ul>
            <p>আমাদের রয়েছে <strong>Expert Tutors</strong> যারা প্রতিটি চ্যাপ্টার শেষে <strong>MCQs & SCQs</strong> গ্রহণ করেন। নিয়মিত <strong>Weekly and Monthly Exams</strong> এর মাধ্যমে রেজাল্ট ইমপ্রুভমেন্ট নিশ্চিত করা হয়। প্রতিটি সাবজেক্টের জন্য রয়েছে আলাদা <strong>Basic Sheets</strong>।</p>
          `,
          images: ['https://i.ibb.co.com/RpkV8nZ4/Improvement-Academic-Care.jpg'],
          platform: 'academic-care',
          duration: 'Full Session',
          price: '৳ ২,৫০০/মাস',
          features: ['All Subjects Coverage', 'Creative Question Practice', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Subject-wise Basic Sheets'],
          createdAt: serverTimestamp()
        },
        {
          title: 'HSC ICT',
          category: 'College',
          classLevel: 'Class 12',
          description: `
            <p>HSC পরীক্ষার্থীদের জন্য <strong>ICT</strong> এখন আর ভয়ের বিষয় নয়। আমাদের <strong>Multimedia Classroom</strong> এ প্রতিটি টপিক ভিজ্যুয়ালি শেখানো হয়।</p>
            <p><strong>স্পেশাল ফোকাস:</strong></p>
            <ul>
              <li>HTML & Web Design (Live Coding)</li>
              <li>Programming Chapter (C Programming in detail)</li>
              <li>Number Systems & Logic Gates</li>
              <li>Database Management Systems</li>
            </ul>
            <p>প্রতিটি চ্যাপ্টারের উপর থাকছে <strong>Chapter-wise MCQs & SCQs</strong>। নিয়মিত <strong>Weekly Exams</strong> এবং বোর্ড স্ট্যান্ডার্ড <strong>Monthly Exams</strong> এর মাধ্যমে আমরা আপনাকে প্রস্তুত করবো। আমাদের <strong>Programming Basic Sheets</strong> আপনার কোডিং স্কিলকে করবে আরও শার্প।</p>
          `,
          images: ['https://i.ibb.co.com/RpkV8nZ4/Improvement-Academic-Care.jpg'],
          platform: 'academic-care',
          duration: '6 Months',
          price: '৳ ৪,০০০',
          features: ['Multimedia Classroom', 'Detailed Programming Class', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'ICT Basic Sheets'],
          createdAt: serverTimestamp()
        },
        {
          title: 'HSC Physics',
          category: 'College',
          classLevel: 'Class 11',
          description: `
            <p>ফিজিক্স শুধু পড়ার বিষয় নয়, এটি অনুভবের বিষয়। <strong>Improvement Academic Care</strong> এ আমরা আপনাকে ফিজিক্স <strong>Feel and Understand</strong> করতে সাহায্য করবো।</p>
            <p><strong>কেন আমাদের ফিজিক্স কোর্স?</strong></p>
            <ul>
              <li>Conceptual Understanding of Laws</li>
              <li>Mathematical Problem Solving Techniques</li>
              <li>Real-life Applications of Physics</li>
              <li>Board Question Analysis</li>
            </ul>
            <p>প্রতিটি চ্যাপ্টার শেষে থাকছে <strong>Chapter-wise MCQs & SCQs</strong>। নিয়মিত <strong>Weekly and Monthly Exams</strong> এর মাধ্যমে আপনার মেধা যাচাই করা হবে। আমাদের স্পেশাল <strong>Physics Basic Sheets</strong> আপনার বেসিককে করবে আরও শক্তিশালী।</p>
          `,
          images: ['https://i.ibb.co.com/RpkV8nZ4/Improvement-Academic-Care.jpg'],
          platform: 'academic-care',
          duration: 'Full Course',
          price: '৳ ৫,০০০',
          features: ['Conceptual Learning', 'Math Solving Mastery', 'Weekly/Monthly Exams', 'Chapter-wise MCQs/SCQs', 'Physics Basic Sheets'],
          createdAt: serverTimestamp()
        }
      ];

      for (const course of demoCourses) {
        await addDoc(coursesRef, course);
      }
      console.log('Demo courses seeded successfully.');
    }
  } catch (error) {
    console.warn('Silent warning: Seeding courses failed (probably not admin or unauthenticated, normal for public visitors):', error);
  }
}

export async function seedFoodMenu() {
  try {
    const menuRef = collection(db, 'food_donation_menu');
    const snapshot = await getDocs(menuRef);
    
    if (snapshot.empty) {
      console.log('Seeding food donation menu...');
      const demoItems = [
        {
          name: 'খিচুড়ি ও ডিম (Khichuri & Egg)',
          perPersonCost: 45,
          createdAt: serverTimestamp()
        },
        {
          name: 'বিরিয়ানি ও মুরগি (Biryani & Chicken)',
          perPersonCost: 85,
          createdAt: serverTimestamp()
        },
        {
          name: 'ভাত, ডাল ও মাছ (Rice, Dal & Fish)',
          perPersonCost: 65,
          createdAt: serverTimestamp()
        },
        {
          name: 'ভাত, ডাল ও আলুভর্তা (Rice, Dal & Mashed Potato)',
          perPersonCost: 35,
          createdAt: serverTimestamp()
        }
      ];

      for (const item of demoItems) {
        await addDoc(menuRef, item);
      }
      console.log('Food donation menu seeded successfully.');
    }
  } catch (error) {
    console.warn('Silent warning: Seeding food menu failed (probably not admin or unauthenticated, normal for public visitors):', error);
  }
}

export async function seedSportsCoaches() {
  try {
    const coachesRef = collection(db, 'sports_coaches');
    const snapshot = await getDocs(coachesRef);
    
    if (snapshot.empty) {
      console.log('Seeding sports coaches...');
      const demoCoaches = [
        {
          name: 'সঞ্জিদ হাসান (Sanjid Hasan)',
          fbId: 'https://fb.com',
          team: 'Improvement Cricket Academy',
          specialSkill: 'বিসিবি লেভেল ১ ক্রিকেট কোচ (BCB Level 1 Certified Cricket Coach)',
          photoURL: 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?w=400&auto=format&fit=crop&q=60',
          createdAt: serverTimestamp()
        },
        {
          name: 'নদিম ইসলাম (Nadim Islam)',
          fbId: 'https://fb.com',
          team: 'Improvement Junior Football Club',
          specialSkill: 'ফিফা ডিপ্লোমা ইন ফুটবল কোচিং (FIFA Diploma in Football Coaching)',
          photoURL: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=60',
          createdAt: serverTimestamp()
        }
      ];

      for (const coach of demoCoaches) {
        await addDoc(coachesRef, coach);
      }
      console.log('Sports coaches seeded successfully.');
    }
  } catch (error) {
    console.warn('Silent warning: Seeding sports coaches failed (probably not admin or unauthenticated, normal for public visitors):', error);
  }
}
