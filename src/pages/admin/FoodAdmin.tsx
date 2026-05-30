import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Plus, Edit2, ShoppingBasket, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuItem {
  id: string;
  name: string;
  perPersonCost: number;
}

export default function FoodAdmin() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    perPersonCost: 0
  });

  useEffect(() => {
    const q = collection(db, 'food_donation_menu');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      // Client-side sort fallback
      list.sort((a, b) => {
        const timeA = (a as any).createdAt?.seconds || 0;
        const timeB = (b as any).createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setMenuItems(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'food_donation_menu');
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'food_donation_menu', editingItem.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'food_donation_menu'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, editingItem ? OperationType.UPDATE : OperationType.CREATE, 'food_donation_menu');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', perPersonCost: 0 });
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({ name: item.name, perPersonCost: item.perPersonCost });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await deleteDoc(doc(db, 'food_donation_menu', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'food_donation_menu');
      }
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-2">Food Bank Settings</h4>
          <h1 className="text-4xl font-black text-primary tracking-tight">Donation Menu</h1>
          <p className="text-secondary font-medium mt-1">Manage meal options and per-person costs for special meal donations.</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 font-black gap-2 transition-all hover:scale-105 active:scale-95">
              <Plus className="h-5 w-5" /> Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-0 border-none bg-white rounded-3xl overflow-hidden shadow-2xl">
            <form onSubmit={handleSubmit}>
              <div className="p-8">
                <DialogHeader className="mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingBasket className="h-6 w-6 text-primary" />
                  </div>
                  <DialogTitle className="text-2xl font-black text-primary">
                    {editingItem ? 'Edit Menu Item' : 'New Donation Option'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-secondary tracking-widest uppercase">Meal Name</Label>
                    <Input 
                      required
                      placeholder="e.g., Rice, Chicken & Egg"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="h-12 border-slate-200 rounded-xl focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-secondary tracking-widest uppercase">Cost Per Person (৳)</Label>
                    <Input 
                      required
                      type="number"
                      placeholder="e.g., 60"
                      value={formData.perPersonCost}
                      onChange={(e) => setFormData({...formData, perPersonCost: parseFloat(e.target.value) || 0})}
                      className="h-12 border-slate-200 rounded-xl focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="bg-slate-50 p-6 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold text-slate-500">
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-primary/20">
                  {editingItem ? 'Update Item' : 'Create Option'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {menuItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden group">
                <CardContent className="p-0">
                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <ShoppingBasket className="h-7 w-7 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-danger hover:bg-danger/10"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-black text-primary line-clamp-2 min-h-[3.5rem]">{item.name}</h3>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs font-bold text-secondary uppercase tracking-widest text-primary/60">Per Person Cost</p>
                        <p className="text-2xl font-black text-primary">৳{item.perPersonCost}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {menuItems.length === 0 && (
          <div className="col-span-full py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <ShoppingBasket className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No donation menu items found. Start by adding one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
