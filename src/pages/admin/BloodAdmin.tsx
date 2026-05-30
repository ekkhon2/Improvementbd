import { useState, useEffect } from 'react';
import { db } from '@/src/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Droplets, Search, Trash2, Calendar, Phone, User, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function BloodAdmin() {
  const [donors, setDonors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingDonor, setEditingDonor] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'donors'), orderBy('fullName', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDonors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateDate = async (id: string, date: string) => {
    await updateDoc(doc(db, 'donors', id), { lastDonatedDate: date });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this donor?')) {
      await deleteDoc(doc(db, 'donors', id));
      await updateDoc(doc(db, 'stats', 'totals'), {
        donors: increment(-1)
      });
    }
  };

  const filteredDonors = donors.filter(d => 
    d.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.bloodGroup?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phonePrimary?.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-primary">Donor Management</h2>
          <p className="text-secondary font-medium">Manage blood donors, track donation history, and contact volunteers.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-red-600/20">
              <Droplets className="mr-2 h-5 w-5" /> Add New Donor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md dialog-solid">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">Add Blood Donor</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              try {
                await addDoc(collection(db, 'donors'), {
                  fullName: formData.get('fullName'),
                  bloodGroup: formData.get('bloodGroup'),
                  phonePrimary: formData.get('phone'),
                  isWhatsApp: formData.get('isWhatsApp') === 'on',
                  phoneSecondary: formData.get('phoneSecondary') || '',
                  photoURL: formData.get('photoURL') || '',
                  facebookURL: formData.get('facebookURL') || '',
                  lastDonatedDate: formData.get('lastDonatedDate') || '',
                  platform: 'blood-bank',
                  status: 'approved',
                  createdAt: serverTimestamp()
                });
                await updateDoc(doc(db, 'stats', 'totals'), {
                  donors: increment(1)
                });
                (e.target as HTMLFormElement).reset();
                alert('Donor added successfully!');
              } catch (error) {
                console.error(error);
              }
            }} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold">Full Name</Label>
                <Input name="fullName" required placeholder="Donor's full name" className="h-12 input-solid" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Blood Group</Label>
                <select name="bloodGroup" required className="w-full h-12 rounded-xl border border-slate-200 px-4 font-medium focus:ring-2 focus:ring-primary outline-none">
                  <option value="">Select Blood Group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Primary Phone</Label>
                    <div className="flex gap-2">
                      <Input name="phone" required placeholder="017XXXXXXXX" className="h-12 input-solid flex-1" />
                      <div className="flex items-center space-x-2 bg-slate-50 px-3 h-12 rounded-xl border border-slate-100">
                        <Checkbox id="isWhatsAppAdmin" name="isWhatsApp" />
                        <Label htmlFor="isWhatsAppAdmin" className="text-[10px] font-bold text-success cursor-pointer">WhatsApp</Label>
                      </div>
                    </div>
                  </div>
                <div className="space-y-2">
                  <Label className="font-bold">Secondary Phone (Optional)</Label>
                  <Input name="phoneSecondary" placeholder="018XXXXXXXX" className="h-12 input-solid" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Photo URL (Optional)</Label>
                  <Input name="photoURL" placeholder="https://..." className="h-12 input-solid" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Facebook URL (Optional)</Label>
                  <Input name="facebookURL" placeholder="https://facebook.com/..." className="h-12 input-solid" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Last Donation Date (Optional)</Label>
                <Input name="lastDonatedDate" type="date" className="h-12 input-solid" />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                Add Donor
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
        <Input 
          placeholder="Search by name, blood group (e.g. A+), or phone..." 
          className="pl-12 h-14 input-solid text-lg font-medium shadow-sm"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="card-solid">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="h-16 px-8 font-bold text-primary">Donor Info</TableHead>
              <TableHead className="h-16 font-bold text-primary">Blood Group</TableHead>
              <TableHead className="h-16 font-bold text-primary">Last Donation</TableHead>
              <TableHead className="h-16 px-8 text-right font-bold text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDonors.map((donor) => (
              <TableRow key={donor.id} className="hover:bg-slate-50/50 border-slate-50 transition-colors">
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-10 rounded-lg bg-red-50 flex items-center justify-center font-bold text-red-600 shrink-0 overflow-hidden border border-red-100">
                      {donor.photoURL ? (
                        <img src={donor.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="font-bold text-primary">{donor.fullName}</p>
                        {donor.isWhatsApp && (
                          <svg className="h-3 w-3 fill-success" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col text-sm text-secondary font-medium">
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" /> {donor.phonePrimary}
                        </div>
                        {donor.phoneSecondary && (
                          <div className="flex items-center opacity-70">
                            <Phone className="h-3 w-3 mr-1" /> {donor.phoneSecondary}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-600 hover:bg-red-700 text-white font-black text-sm h-8 px-3 rounded-lg">
                    {donor.bloodGroup}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-secondary" />
                    <Input 
                      type="date" 
                      className="w-[160px] h-10 input-solid font-medium" 
                      value={donor.lastDonatedDate || ''} 
                      onChange={(e) => handleUpdateDate(donor.id, e.target.value)}
                    />
                  </div>
                </TableCell>
                <TableCell className="px-8 text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog open={editingDonor?.id === donor.id} onOpenChange={(open) => !open && setEditingDonor(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-10 w-10 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl" 
                          onClick={() => setEditingDonor(donor)}
                        >
                          <User className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md dialog-solid">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold text-primary">Edit Donor</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          try {
                            await updateDoc(doc(db, 'donors', donor.id), {
                              fullName: formData.get('fullName'),
                              bloodGroup: formData.get('bloodGroup'),
                              phonePrimary: formData.get('phone'),
                              isWhatsApp: formData.get('isWhatsApp') === 'on',
                              phoneSecondary: formData.get('phoneSecondary') || '',
                              photoURL: formData.get('photoURL') || '',
                              facebookURL: formData.get('facebookURL') || '',
                              lastDonatedDate: formData.get('lastDonatedDate') || '',
                              address: formData.get('address') || ''
                            });
                            setEditingDonor(null);
                            alert('Donor updated successfully!');
                          } catch (error) {
                            console.error(error);
                          }
                        }} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label className="font-bold">Full Name</Label>
                            <Input name="fullName" defaultValue={donor.fullName} required className="h-12 input-solid" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Blood Group</Label>
                            <select name="bloodGroup" defaultValue={donor.bloodGroup} required className="w-full h-12 rounded-xl border border-slate-200 px-4 font-medium focus:ring-2 focus:ring-primary outline-none">
                              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="font-bold">Primary Phone</Label>
                              <Input name="phone" defaultValue={donor.phonePrimary} required className="h-12 input-solid" />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-bold">Secondary Phone</Label>
                              <Input name="phoneSecondary" defaultValue={donor.phoneSecondary} className="h-12 input-solid" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Photo URL</Label>
                            <Input name="photoURL" defaultValue={donor.photoURL} className="h-12 input-solid" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Address</Label>
                            <Input name="address" defaultValue={donor.address} className="h-12 input-solid" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id={`isWhatsAppEdit-${donor.id}`} name="isWhatsApp" defaultChecked={donor.isWhatsApp} />
                            <Label htmlFor={`isWhatsAppEdit-${donor.id}`} className="font-bold">WhatsApp Available</Label>
                          </div>
                          <Button type="submit" className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
                            Update Donor
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl" 
                      onClick={() => handleDelete(donor.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredDonors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center text-secondary font-medium italic">
                  No donors found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
