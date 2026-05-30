import { useParams } from 'react-router-dom';
import MembersAdmin from './MembersAdmin';
import BloodAdmin from './BloodAdmin';
import LibraryAdmin from './LibraryAdmin';
import CoursesAdmin from './CoursesAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Droplets, BookOpen, GraduationCap, LayoutDashboard } from 'lucide-react';

export default function PlatformAdmin() {
  const { platformId } = useParams();

  const getPlatformName = (id: string | undefined) => {
    if (!id) return 'Platform';
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const renderPlatformSpecificContent = () => {
    switch (platformId) {
      case 'blood-bank':
        return <BloodAdmin />;
      case 'library':
        return <LibraryAdmin />;
      case 'it-education':
      case 'academic-care':
        return <CoursesAdmin />;
      default:
        return (
          <div className="bg-white p-12 rounded-[2rem] text-center border border-slate-100 shadow-sm">
            <LayoutDashboard className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary">Platform Dashboard</h3>
            <p className="text-secondary font-medium">General management for {getPlatformName(platformId)}.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-primary">{getPlatformName(platformId)} Admin</h2>
          <p className="text-secondary font-medium">Manage specific data and members for this platform.</p>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-8">
        <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 w-full md:w-auto overflow-x-auto">
          <TabsTrigger value="members" className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-11">
            <Users className="h-4 w-4 mr-2" /> Members
          </TabsTrigger>
          {(platformId === 'blood-bank' || platformId === 'library' || platformId === 'it-education' || platformId === 'academic-care') && (
            <TabsTrigger value="management" className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm h-11">
              {platformId === 'blood-bank' && <><Droplets className="h-4 w-4 mr-2" /> Donors</>}
              {platformId === 'library' && <><BookOpen className="h-4 w-4 mr-2" /> Books</>}
              {(platformId === 'it-education' || platformId === 'academic-care') && <><GraduationCap className="h-4 w-4 mr-2" /> Courses</>}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members" className="mt-0">
          <MembersAdmin />
        </TabsContent>

        <TabsContent value="management" className="mt-0">
          {renderPlatformSpecificContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
