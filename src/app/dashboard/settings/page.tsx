"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Building2, Users, Save, Plus, Shield, ShieldOff, Lock, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "";
  const [activeTab, setActiveTab] = useState("clinic");

  // ─── Clinic Profile State ─────────────────────────────
  const [clinicSettings, setClinicSettings] = useState({
    name: "", phone: "", logo: "", address: "", tax_number: "", footer_note: ""
  });
  const [clinicLoading, setClinicLoading] = useState(true);
  const [clinicSaving, setClinicSaving] = useState(false);
  const [clinicSaved, setClinicSaved] = useState(false);

  // ─── User Management State ────────────────────────────
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", role_id: "", employee_id: "" });
  const [addUserError, setAddUserError] = useState("");

  // ─── Fetch Clinic Settings ────────────────────────────
  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setClinicSettings({
            name: data.name || "",
            phone: data.phone || "",
            logo: data.logo || "",
            address: data.address || "",
            tax_number: data.tax_number || "",
            footer_note: data.footer_note || ""
          });
        }
      })
      .catch(console.error)
      .finally(() => setClinicLoading(false));
  }, []);

  // ─── Fetch Users, Roles, Employees ────────────────────
  useEffect(() => {
    if (activeTab === "users" && userRole === "Admin") {
      setUsersLoading(true);
      Promise.all([
        fetch("/api/users").then(r => r.json()),
        fetch("/api/roles").then(r => r.json()),
        fetch("/api/employees").then(r => r.json()),
      ]).then(([usersData, rolesData, employeesData]) => {
        setUsers(Array.isArray(usersData) ? usersData : []);
        setRoles(Array.isArray(rolesData) ? rolesData : []);
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      }).catch(console.error)
        .finally(() => setUsersLoading(false));
    }
  }, [activeTab, userRole]);

  // ─── Save Clinic Settings ─────────────────────────────
  const saveClinicSettings = async () => {
    setClinicSaving(true);
    setClinicSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clinicSettings)
      });
      if (res.ok) {
        setClinicSaved(true);
        setTimeout(() => setClinicSaved(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClinicSaving(false);
    }
  };

  // ─── Add User ─────────────────────────────────────────
  const handleAddUser = async () => {
    setAddUserError("");
    if (!newUser.email || !newUser.password || !newUser.role_id) {
      setAddUserError("Email, password, and role are required.");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (!res.ok) {
        setAddUserError(data.error || "Failed to create user");
        return;
      }
      setUsers([...users, data]);
      setIsAddUserOpen(false);
      setNewUser({ email: "", password: "", role_id: "", employee_id: "" });
    } catch (e) {
      setAddUserError("Network error");
    }
  };

  // ─── Toggle User Active ───────────────────────────────
  const toggleUserActive = async (userId: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive })
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u.id === userId ? updated : u));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 -m-4 p-4 sm:-m-8 sm:p-8 overflow-y-auto w-full min-w-0">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage clinic profile and system users.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px] w-full min-w-0">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-4 pt-4 overflow-x-auto whitespace-nowrap shrink-0">
          <button
            className={`px-6 py-3 font-semibold text-sm border-b-2 rounded-t-lg flex items-center transition-colors ${activeTab === 'clinic' ? 'border-indigo-600 text-indigo-700 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
            onClick={() => setActiveTab('clinic')}
          >
            <Building2 className="w-4 h-4 mr-2" /> Clinic Profile
          </button>
          <button
            className={`px-6 py-3 font-semibold text-sm border-b-2 rounded-t-lg flex items-center transition-colors ${activeTab === 'users' ? 'border-indigo-600 text-indigo-700 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="w-4 h-4 mr-2" /> User Management
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto">

          {/* ──── TAB 1: Clinic Profile ──── */}
          {activeTab === 'clinic' && (
            <div className="max-w-2xl mx-auto">
              {clinicLoading ? (
                <div className="text-center py-20 text-gray-400 font-medium">Loading settings...</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        value={clinicSettings.name}
                        onChange={e => setClinicSettings({ ...clinicSettings, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="+92 300 1234567"
                        value={clinicSettings.phone}
                        onChange={e => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      rows={2}
                      placeholder="Street address, city, country"
                      value={clinicSettings.address}
                      onChange={e => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Logo URL</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="https://example.com/logo.png"
                        value={clinicSettings.logo}
                        onChange={e => setClinicSettings({ ...clinicSettings, logo: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tax / Registration Number</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        placeholder="NTN-1234567-8"
                        value={clinicSettings.tax_number}
                        onChange={e => setClinicSettings({ ...clinicSettings, tax_number: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thermal Receipt Footer Note</label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      rows={3}
                      placeholder="Follow us on Instagram @skinlab | No refund after 7 days"
                      value={clinicSettings.footer_note}
                      onChange={e => setClinicSettings({ ...clinicSettings, footer_note: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      onClick={saveClinicSettings}
                      disabled={clinicSaving}
                      className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-sm disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {clinicSaving ? "Saving..." : "Save Changes"}
                    </button>
                    {clinicSaved && (
                      <span className="flex items-center text-green-600 font-medium text-sm animate-fade-in">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Saved successfully!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── TAB 2: User Management ──── */}
          {activeTab === 'users' && (
            <div>
              {userRole !== "Admin" ? (
                <div className="text-center py-20">
                  <Lock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 mb-2">Access Denied</h3>
                  <p className="text-gray-500">Only administrators can manage users and roles.</p>
                </div>
              ) : usersLoading ? (
                <div className="text-center py-20 text-gray-400 font-medium">Loading users...</div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-gray-900">System Users</h2>
                    <button
                      onClick={() => setIsAddUserOpen(true)}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-sm transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add User
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full min-w-0">
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="py-4 px-6 font-semibold">Email</th>
                          <th className="py-4 px-6 font-semibold">Role</th>
                          <th className="py-4 px-6 font-semibold">Linked Employee</th>
                          <th className="py-4 px-6 font-semibold text-center">Status</th>
                          <th className="py-4 px-6 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-indigo-50/30">
                            <td className="py-4 px-6 font-medium text-gray-900">{u.email}</td>
                            <td className="py-4 px-6">
                              <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold">{u.role}</span>
                            </td>
                            <td className="py-4 px-6 text-gray-500">{u.employee?.name || "—"}</td>
                            <td className="py-4 px-6 text-center">
                              {u.is_active ? (
                                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-xs font-bold">Active</span>
                              ) : (
                                <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold">Inactive</span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => toggleUserActive(u.id, u.is_active)}
                                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${u.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                              >
                                {u.is_active ? (
                                  <span className="flex items-center"><ShieldOff className="w-3 h-3 mr-1" /> Deactivate</span>
                                ) : (
                                  <span className="flex items-center"><Shield className="w-3 h-3 mr-1" /> Activate</span>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ──── ADD USER MODAL ──── */}
      {isAddUserOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden mx-auto">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Add New User</h3>
              <button onClick={() => { setIsAddUserOpen(false); setAddUserError(""); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="user@skinlab.com"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Minimum 6 characters"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={newUser.role_id}
                  onChange={e => setNewUser({ ...newUser, role_id: e.target.value })}
                >
                  <option value="">Select a role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to Employee (Optional)</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={newUser.employee_id}
                  onChange={e => setNewUser({ ...newUser, employee_id: e.target.value })}
                >
                  <option value="">None</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              {addUserError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{addUserError}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setIsAddUserOpen(false); setAddUserError(""); }}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
