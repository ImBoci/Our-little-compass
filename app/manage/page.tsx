"use client";
import { useState, useEffect } from "react";
import { Pencil, Trash2, X, Plus, Save, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ManagePage() {
  const [activeTab, setActiveTab] = useState<'food' | 'activity'>('food');
  const [foods, setFoods] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [customTagInput, setCustomTagInput] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [fRes, aRes] = await Promise.all([fetch("/api/food"), fetch("/api/activities")]);
    const fData = await fRes.json();
    const aData = await aRes.json();
    if (Array.isArray(fData)) setFoods(fData);
    if (Array.isArray(aData)) setActivities(aData);
    setLoading(false);
  };

  // Helper: Get all unique tags from existing activities
  const getAllActivityTags = () => {
    const tags = new Set<string>();
    activities.forEach(act => {
      if (act.type) {
        act.type.split(',').forEach((t: string) => tags.add(t.trim()));
      }
    });
    return Array.from(tags).sort();
  };

  // Helper: Handle Tag Selection
  const toggleActivityTag = (tag: string) => {
    const currentString = formData.type || "";
    let currentTags = currentString ? currentString.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    
    if (currentTags.includes(tag)) {
      currentTags = currentTags.filter((t: string) => t !== tag);
    } else {
      currentTags.push(tag);
    }
    setFormData({ ...formData, type: currentTags.join(', ') });
  };

  const addCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTagInput.trim()) {
      toggleActivityTag(customTagInput.trim());
      setCustomTagInput("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = activeTab === 'food' ? '/api/food' : '/api/activities';
    const method = isEditing ? 'PUT' : 'POST';
    
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    setIsEditing(null);
    setFormData({});
    fetchData();
    router.refresh();
  };

  const handleEdit = (item: any) => {
    setIsEditing(item.id);
    setFormData(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    const endpoint = activeTab === 'food' ? `/api/food?id=${id}` : `/api/activities?id=${id}`;
    await fetch(endpoint, { method: 'DELETE' });
    fetchData();
  };

  const allTags = getAllActivityTags();
  const currentSelectedTags = formData.type ? formData.type.split(',').map((t: string) => t.trim()) : [];

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
       {/* Header & Home Link */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <Link href="/" className="text-slate-600 hover:text-rose-600 transition font-medium">← Back to Home</Link>
        <h1 className="text-3xl font-serif font-bold text-slate-800">Manage Database</h1>
        <div className="w-24"></div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/40 p-1 rounded-full mb-8 backdrop-blur-md border border-white/50 shadow-sm">
        <button 
          onClick={() => { setActiveTab('food'); setFormData({}); setIsEditing(null); }}
          className={`px-8 py-2 rounded-full transition-all font-medium ${activeTab === 'food' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}
        >
          Foods
        </button>
        <button 
          onClick={() => { setActiveTab('activity'); setFormData({}); setIsEditing(null); }}
          className={`px-8 py-2 rounded-full transition-all font-medium ${activeTab === 'activity' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/50'}`}
        >
          Activities
        </button>
      </div>

      {/* --- EDITOR FORM --- */}
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-xl mb-12">
        <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
          {isEditing ? <><Pencil size={20} /> Editing Item</> : <><Plus size={20} /> Add New {activeTab === 'food' ? 'Food' : 'Activity'}</>}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300" 
              placeholder="Name" 
              value={formData.name || ""} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              required 
            />
            
            {/* Conditional Fields based on Tab */}
            {activeTab === 'food' ? (
              <input 
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="Category (e.g. Italian, Breakfast)" 
                list="food-categories"
                value={formData.category || ""}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            ) : (
              <input 
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Location (e.g. WestEnd)" 
                value={formData.location || ""}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            )}
          </div>

          <input 
            className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
            placeholder="Description (Optional)" 
            value={formData.description || ""}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />

          {/* --- ACTIVITY TAG SELECTOR --- */}
          {activeTab === 'activity' && (
            <div className="bg-white/40 p-4 rounded-xl border border-white/50">
              <label className="block text-sm font-bold text-slate-600 mb-2">Tags (Select or Add)</label>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {currentSelectedTags.map((tag: string) => (
                  <button type="button" key={tag} onClick={() => toggleActivityTag(tag)} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-red-500 transition-colors">
                    {tag} <X size={14} />
                  </button>
                ))}
                {currentSelectedTags.length === 0 && <span className="text-slate-400 text-sm italic">No tags selected</span>}
              </div>

              {/* Available Tags */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200/50">
                {allTags.filter(t => !currentSelectedTags.includes(t)).map(tag => (
                  <button type="button" key={tag} onClick={() => toggleActivityTag(tag)} className="bg-white text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition-colors">
                    + {tag}
                  </button>
                ))}
              </div>

              {/* Add New Tag */}
              <div className="mt-4 flex gap-2">
                <input 
                  value={customTagInput}
                  onChange={e => setCustomTagInput(e.target.value)}
                  placeholder="Type new tag..."
                  className="bg-white/80 border border-slate-200 rounded-lg px-3 py-1 text-sm focus:outline-none"
                  onKeyDown={e => { if(e.key === 'Enter') addCustomTag(e); }}
                />
                <button type="button" onClick={addCustomTag} className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-sm hover:bg-slate-300">Add Tag</button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button type="submit" className={`flex-1 text-white py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 ${activeTab === 'food' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-purple-600 hover:bg-purple-700'}`}>
              <Save size={20} /> {isEditing ? 'Update Item' : 'Save to Database'}
            </button>
            {isEditing && (
              <button type="button" onClick={() => { setIsEditing(null); setFormData({}); }} className="bg-slate-200 text-slate-700 px-6 rounded-xl font-bold hover:bg-slate-300 transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Datalist for Foods */}
        {activeTab === 'food' && (
          <datalist id="food-categories">
            {Array.from(new Set(foods.map(f => f.category).filter(Boolean))).map((cat: any) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        )}
      </div>

      {/* --- DATA LIST --- */}
      <div className="w-full max-w-4xl space-y-3">
        {(activeTab === 'food' ? foods : activities).map((item) => (
          <div key={item.id} className="bg-white/40 backdrop-blur-sm border border-white/60 p-4 rounded-2xl flex justify-between items-center group hover:bg-white/60 transition-colors">
            <div>
              <div className="font-bold text-slate-800 text-lg">{item.name}</div>
              <div className="text-slate-500 text-sm">{item.description}</div>
              <div className="mt-1 flex gap-2">
                {/* Render Tags/Category */}
                {activeTab === 'food' && item.category && (
                  <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full">{item.category}</span>
                )}
                {activeTab === 'activity' && item.type && item.type.split(',').map((t: string, i: number) => (
                  <span key={i} className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">{t.trim()}</span>
                ))}
                {item.location && <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">📍 {item.location}</span>}
              </div>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(item)} className="p-2 bg-white rounded-full text-slate-500 hover:text-blue-600 shadow-sm hover:shadow-md transition-all">
                <Pencil size={18} />
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2 bg-white rounded-full text-slate-500 hover:text-red-600 shadow-sm hover:shadow-md transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
