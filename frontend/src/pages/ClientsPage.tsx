import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { clientsApi } from '../api/clients.api';
import { Briefcase, Plus, Building2, Mail, Phone, X, AlertCircle } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const data = await clientsApi.getClients();
      setClients(data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) {
      setError('Name, company, and email are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const newClient = await clientsApi.createClient({ name, company, email, phone });
      setClients((prev) => [newClient, ...prev]);
      setIsModalOpen(false);
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <Briefcase className="w-6 h-6 text-brand-500" />
            <span>Clients Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage client accounts and enterprise partners for project assignments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
          No clients found. Click Add Client to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{client.company}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Contact: {client.name}</p>
                </div>
                <div className="p-2 rounded-lg bg-brand-950/80 border border-brand-800 text-brand-400">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              {client._count && (
                <div className="pt-2 text-[11px] font-semibold text-brand-400">
                  {client._count.projects} Active Project(s)
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-base font-bold text-white">Add New Client</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Primary Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jonathan Sterling"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. j.sterling@acme.com"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
