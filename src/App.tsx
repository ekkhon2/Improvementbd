import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BloodBank from './pages/BloodBank';
import Library from './pages/Library';
import EducationPage from './pages/EducationPage';
import Foundation from './pages/Foundation';
import FoodBank from './pages/FoodBank';
import SportingClub from './pages/SportingClub';
import Rehabilitation from './pages/Rehabilitation';
import KidsCare from './pages/KidsCare';
import PoorFund from './pages/PoorFund';
import AdminLayout from './pages/Admin';
import CourseDetails from './pages/CourseDetails';
import BookDetails from './pages/BookDetails';
import GalleryPage from './pages/GalleryPage';
import Shop from './pages/Shop';
import TypingTest from './pages/TypingTest';
import ExamCenter from './pages/ExamCenter';
import { seedBanners, seedGallery, seedCourses, seedFoodMenu } from './lib/seed';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  React.useEffect(() => {
    seedBanners();
    seedGallery();
    seedCourses();
    seedFoodMenu();
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <div className="min-h-screen bg-background font-sans antialiased">
          <Navbar />
          <main>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/foundation" element={<Foundation />} />
                <Route path="/blood-bank" element={<BloodBank />} />
                <Route path="/food-bank" element={<FoodBank />} />
                <Route path="/sporting-club" element={<SportingClub />} />
                <Route path="/rehabilitation" element={<Rehabilitation />} />
                <Route path="/kidscare" element={<KidsCare />} />
                <Route path="/poor-fund" element={<PoorFund />} />
                <Route path="/it-education" element={<EducationPage platform="it-education" />} />
                <Route path="/academic-care" element={<EducationPage platform="academic-care" />} />
                <Route path="/course/:id" element={<CourseDetails />} />
                <Route path="/library" element={<Library />} />
                <Route path="/book/:id" element={<BookDetails />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/typing-test" element={<TypingTest />} />
                <Route path="/exam-center/:platform" element={<ExamCenter />} />
                <Route path="/admin/*" element={<AdminLayout />} />
              </Routes>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  </AuthProvider>
);
}
