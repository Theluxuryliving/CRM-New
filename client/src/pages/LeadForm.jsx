// 📁 File: src/pages/LeadForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const COUNTRIES = [
  'Pakistan', 'UAE', 'Saudi Arabia', 'Qatar', 'Bahrain', 'Oman', 'Kuwait', 'UK', 'USA', 'Australia', 'Europe', 'Japan', 'China', 'South Korea'
];

const LAHORE_AREAS = [
  'DHA', 'Bahria Town', 'Etihad Town', 'Pine Avenue', 'Lake City', 'Park Lane', 'Central Park', 'Gulberg',
  'Walled City', 'Gawalmandi', 'Faisal Town', 'Johar Town', 'Raiwind Road', 'Jiya Bagga', 'Canal Bank Road',
  'Model Town', 'Iqbal Town', 'Sabzazar', 'Township', 'Valencia', 'EME', 'Garden Town', 'Shadman', 'Shalimar',
  'Allama Iqbal Town', 'Askari', 'LDA Avenue', 'Wapda Town', 'Green Town', 'Samanabad', 'Others'
];

const PROPERTY_TYPES = [
  'Apartment', 'Townhouse', 'Residential Plot', 'Commercial Plot', 'Shop', 'Penthouse', 'Villa', 'Farmhouse', 'Plaza', 'Agricultural Land', 'Other'
];

const SOURCES = [
  'Facebook', 'Instagram', 'YouTube', 'X', 'Google', 'Website', 'Reference', 'Lead Data', 'Event', 'Site Visit', 'Other'
];

const PLANS = ['Offplan', 'Ready to Move', 'Tenant', 'To Let', 'To Sell'];
const PURCHASE_TIMES = ['Immediately', '3 Months', '6 Months', '1 Year'];

const AddLead = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [agents, setAgents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    country: 'Pakistan', city: '', cityOther: '',
    area: '', areaOther: '',
    plan: '', propertyType: '', propertyTypeOther: '',
    projectId: '', budget: 1000000,
    purchaseTime: '', source: '', sourceOther: '',
    assignTo: ''
  });

  useEffect(() => {
    axios.get('/api/projects', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setProjects(res.data)).catch(err => console.error(err));

    axios.get('/api/users/agents', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setAgents(res.data)).catch(err => console.error(err));
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (key === 'assignTo') {
      const input = value.toLowerCase();
      const matches = agents.filter(a =>
        a.name.toLowerCase().includes(input) ||
        a.id.toString() === input
      );
      setSuggestions(matches);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      city: form.country === 'Pakistan' ? form.city : form.cityOther,
      areaInterestedIn: form.area === 'Other' ? form.areaOther : form.area,
      planInterestedIn: form.plan,
      propertyType: form.propertyType === 'Other' ? form.propertyTypeOther : form.propertyType,
      projectId: form.projectId ? parseInt(form.projectId) : null,
      budget: parseInt(form.budget) || 0,
      planToPurchase: form.purchaseTime,
      leadSource: form.source === 'Other' ? form.sourceOther : form.source,
      assignedToId: form.assignTo || undefined
    };
    console.log('📤 Submitting lead:', payload);

    try {
      await axios.post('/api/leads', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('✅ Lead added successfully');
      navigate('/leads');
    } catch (err) {
      console.error('❌ Error adding lead:', err);
      alert('Error creating lead. Please check all fields.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">➕ Add New Lead</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <input type="text" placeholder="Name" value={form.name} onChange={e => handleChange('name', e.target.value)} required className="border p-2 rounded" />
        <input type="text" placeholder="Phone" value={form.phone} onChange={e => handleChange('phone', e.target.value)} required className="border p-2 rounded" />
        <input type="email" placeholder="Email" value={form.email} onChange={e => handleChange('email', e.target.value)} className="border p-2 rounded" />

        <select value={form.country} onChange={e => handleChange('country', e.target.value)} className="border p-2 rounded">
          {[...new Set(['Pakistan', ...COUNTRIES.sort()])].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value="Other">Other</option>
        </select>

        {form.country === 'Pakistan' ? (
          <select value={form.city} onChange={e => handleChange('city', e.target.value)} className="border p-2 rounded">
            {[...new Set(['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan', 'Rawalpindi', 'Peshawar', 'Quetta', 'Gujranwala', 'Hyderabad', 'Sialkot', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Abbottabad', 'Mardan', 'Sahiwal', 'Okara', 'Dera Ghazi Khan', 'Other'])].map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        ) : (
          <input type="text" placeholder="Enter City" value={form.cityOther} onChange={e => handleChange('cityOther', e.target.value)} className="border p-2 rounded" />
        )}

        <select value={form.area} onChange={e => handleChange('area', e.target.value)} className="border p-2 rounded">
          {LAHORE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        {form.area === 'Others' && (
          <input type="text" placeholder="Enter Area" value={form.areaOther} onChange={e => handleChange('areaOther', e.target.value)} className="border p-2 rounded" />
        )}

        <select value={form.plan} onChange={e => handleChange('plan', e.target.value)} className="border p-2 rounded">
          <option value="">Select Plan</option>
          {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={form.propertyType} onChange={e => handleChange('propertyType', e.target.value)} className="border p-2 rounded">
          {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {form.propertyType === 'Other' && (
          <input type="text" placeholder="Enter Property Type" value={form.propertyTypeOther} onChange={e => handleChange('propertyTypeOther', e.target.value)} className="border p-2 rounded" />
        )}

        <select value={form.projectId} onChange={e => handleChange('projectId', e.target.value)} className="border p-2 rounded">
          <option value="">Select Project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        <div className="col-span-1 md:col-span-2">
          <label className="block mb-1">Budget (PKR): {form.budget.toLocaleString()}</label>
          <input type="range" min="1000000" max="500000000" step="1000000" value={form.budget} onChange={e => handleChange('budget', +e.target.value)} className="w-full" />
        </div>

        <select value={form.purchaseTime} onChange={e => handleChange('purchaseTime', e.target.value)} className="border p-2 rounded">
          <option value="">Purchase Time</option>
          {PURCHASE_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={form.source} onChange={e => handleChange('source', e.target.value)} className="border p-2 rounded">
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {form.source === 'Other' && (
          <input type="text" placeholder="Enter Source" value={form.sourceOther} onChange={e => handleChange('sourceOther', e.target.value)} className="border p-2 rounded" />
        )}

        {['MANAGER', 'SR_MANAGER', 'DIRECTOR', 'CCO', 'ADMIN'].includes(role) && (
          <div className="relative">
            <input
              type="text"
              placeholder="Assign to Agent (ID or Name)"
              value={form.assignTo}
              onChange={e => handleChange('assignTo', e.target.value)}
              className="border p-2 rounded w-full"
            />
            {suggestions.length > 0 && (
              <ul className="absolute bg-white border shadow z-10 w-full max-h-40 overflow-y-auto">
                {suggestions.map(agent => (
                  <li key={agent.id} onClick={() => handleChange('assignTo', agent.id)} className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
                    {agent.name} (ID: {agent.id})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <button type="submit" className="col-span-1 md:col-span-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
          ✅ Save Lead
        </button>
      </form>
    </div>
  );
};

export default AddLead;