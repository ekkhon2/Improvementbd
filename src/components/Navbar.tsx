import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Globe, 
  LayoutDashboard,
  Heart,
  Droplets,
  Utensils,
  Trophy,
  Laptop,
  GraduationCap,
  Library,
  Home as HomeIcon,
  Baby
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/src/lib/utils';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: t('nav.home'), path: '/', icon: Globe },
    { name: t('nav.foundation'), path: '/foundation', icon: Heart },
    { name: t('nav.bloodBank'), path: '/blood-bank', icon: Droplets },
    { name: t('nav.foodBank'), path: '/food-bank', icon: Utensils },
    { name: t('nav.sportingClub'), path: '/sporting-club', icon: Trophy },
    { name: t('nav.itEducation'), path: '/it-education', icon: Laptop },
    { name: t('nav.academicCare'), path: '/academic-care', icon: GraduationCap },
    { name: t('nav.library'), path: '/library', icon: Library },
    { name: t('nav.rehabilitation'), path: '/rehabilitation', icon: HomeIcon },
    { name: t('nav.kidscare'), path: '/kidscare', icon: Baby },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-tighter text-gradient">Improvement BD</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2"
          >
            <Globe className="h-4 w-4" />
            <span>{language === 'bn' ? 'EN' : 'BN'}</span>
          </Button>

          <Link 
            to="/admin"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:flex items-center gap-2"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{t('nav.admin')}</span>
          </Link>

          {/* Mobile Nav */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-4 text-lg font-medium p-2 hover:bg-muted rounded-md"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <Link 
                  to="/admin" 
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "w-full mt-4 flex items-center gap-2"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>{t('nav.admin')}</span>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
