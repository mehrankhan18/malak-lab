import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import {
  Building2,
  Download,
  FlaskConical,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

const emptyTest = {
  name: '',
  code: '',
  department: '',
  category: '',
  description: '',
  price: '',
  discountedPrice: '',
  sampleType: '',
  requiredQuantity: '',
  preparation: '',
  fastingRequired: '',
  fastingHours: '',
  turnaroundHours: '',
  availabilityStatus: 'pending_verification',
};

const emptyDepartment = { name: '', code: '', description: '', icon: 'Activity' };
const csvColumns = [
  'name',
  'code',
  'department',
  'category',
  'price',
  'discountedPrice',
  'sampleType',
  'requiredQuantity',
  'preparation',
  'fastingRequired',
  'fastingHours',
  'turnaroundHours',
  'availabilityStatus',
  'isActive',
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = '';
    } else {
      field += character;
    }
  }
  row.push(field);
  if (row.some((value) => value.trim())) rows.push(row);

  if (rows.length < 2) throw new Error('CSV must include a header row and at least one test.');
  const headers = rows[0].map((header) => header.trim().replace(/^\uFEFF/, ''));
  return rows.slice(1).map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index]?.trim() ?? ''])
  ));
}

function csvEscape(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(tests) {
  const content = [
    csvColumns.join(','),
    ...tests.map((test) => csvColumns.map((column) => csvEscape(test[column])).join(',')),
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'laboratory-test-catalogue.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function toTestForm(test) {
  return {
    name: test.name || '',
    code: test.code || '',
    department: test.department || '',
    category: test.category || test.department || '',
    description: test.description || '',
    price: test.price ?? '',
    discountedPrice: test.discountedPrice ?? '',
    sampleType: test.sampleType || '',
    requiredQuantity: test.requiredQuantity || '',
    preparation: test.preparation || '',
    fastingRequired: test.fastingRequired === true ? 'true' : test.fastingRequired === false ? 'false' : '',
    fastingHours: test.fastingHours ?? '',
    turnaroundHours: test.turnaroundHours ?? '',
    availabilityStatus: test.availabilityStatus || 'pending_verification',
  };
}

export default function TestManagement() {
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [editingTestId, setEditingTestId] = useState(null);
  const [testForm, setTestForm] = useState(emptyTest);
  const [departmentForm, setDepartmentForm] = useState(emptyDepartment);
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);

  const fetchCatalogue = async () => {
    setLoadError('');
    try {
      const [testsResponse, departmentsResponse] = await Promise.all([
        api.get('/admin/tests'),
        api.get('/admin/departments'),
      ]);
      setTests(testsResponse.data.tests || []);
      setDepartments(departmentsResponse.data.departments || []);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load catalogue. Check the API connection and your admin access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogue();
  }, []);

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tests.filter((test) => {
      const matchesQuery = !query
        || test.name?.toLowerCase().includes(query)
        || test.code?.toLowerCase().includes(query);
      const matchesDepartment = !selectedDepartment || test.department === selectedDepartment;
      const matchesStatus = !selectedStatus
        || (selectedStatus === 'inactive' ? !test.isActive : test.availabilityStatus === selectedStatus);
      return matchesQuery && matchesDepartment && matchesStatus;
    });
  }, [tests, search, selectedDepartment, selectedStatus]);

  const openNewTest = () => {
    setEditingTestId(null);
    setTestForm({
      ...emptyTest,
      department: departments.find((department) => department.isActive)?.name || '',
      category: departments.find((department) => department.isActive)?.name || '',
    });
    setShowTestForm(true);
  };

  const openEditTest = (test) => {
    setEditingTestId(test._id);
    setTestForm(toTestForm(test));
    setShowTestForm(true);
  };

  const saveTest = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    const payload = {
      ...testForm,
      category: testForm.category || testForm.department,
      price: testForm.price === '' ? null : Number(testForm.price),
      discountedPrice: testForm.discountedPrice === '' ? null : Number(testForm.discountedPrice),
      fastingRequired: testForm.fastingRequired === '' ? null : testForm.fastingRequired === 'true',
      fastingHours: testForm.fastingHours === '' ? null : Number(testForm.fastingHours),
      turnaroundHours: testForm.turnaroundHours === '' ? null : Number(testForm.turnaroundHours),
    };

    try {
      if (editingTestId) {
        await api.put(`/admin/tests/${editingTestId}`, payload);
      } else {
        await api.post('/admin/tests', payload);
      }
      setShowTestForm(false);
      await fetchCatalogue();
      setFeedback(editingTestId ? 'Test updated.' : 'Test added.');
    } catch (error) {
      setFeedback(error.response?.data?.errors?.join(' ') || error.response?.data?.message || 'Could not save this test.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTest = async (test) => {
    try {
      await api.patch(`/admin/tests/${test._id}/status`, { isActive: !test.isActive });
      await fetchCatalogue();
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not update test status.');
    }
  };

  const deleteTest = async (test) => {
    if (!window.confirm(`Deactivate "${test.name}"? It will be hidden from the public catalogue.`)) return;
    try {
      await api.delete(`/admin/tests/${test._id}`);
      await fetchCatalogue();
      setFeedback('Test deactivated.');
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not deactivate this test.');
    }
  };

  const saveDepartment = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');
    try {
      if (editingDepartmentId) {
        await api.put(`/admin/departments/${editingDepartmentId}`, departmentForm);
      } else {
        await api.post('/admin/departments', departmentForm);
      }
      setDepartmentForm(emptyDepartment);
      setEditingDepartmentId(null);
      setShowDepartmentForm(false);
      await fetchCatalogue();
      setFeedback(editingDepartmentId ? 'Department updated.' : 'Department added.');
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not save this department.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDepartment = async (department) => {
    if (department.isActive && !window.confirm(`Deactivate "${department.name}"? Its tests will remain in the database.`)) return;
    try {
      await api.put(`/admin/departments/${department._id}`, { isActive: !department.isActive });
      await fetchCatalogue();
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not update department status.');
    }
  };

  const importCsv = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFeedback('');
    setSaving(true);
    try {
      const rows = parseCsv(await file.text());
      const response = await api.post('/admin/tests/bulk-import', { tests: rows });
      const { imported = 0, updated = 0, skipped = 0, errors = [] } = response.data;
      setFeedback(`Import complete: ${imported} added, ${updated} updated, ${skipped} skipped.${errors.length ? ` First issue: ${errors[0].message}` : ''}`);
      await fetchCatalogue();
    } catch (error) {
      setFeedback(error.response?.data?.message || error.message || 'Could not import this CSV file.');
    } finally {
      setSaving(false);
      setFileInputKey((key) => key + 1);
    }
  };

  const editDepartment = (department) => {
    setEditingDepartmentId(department._id);
    setDepartmentForm({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      icon: department.icon || 'Activity',
    });
    setShowDepartmentForm(true);
  };

  const setTestField = (field, value) => {
    setTestForm((form) => ({
      ...form,
      [field]: value,
      ...(field === 'department' && !form.category ? { category: value } : {}),
    }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Laboratory Catalogue</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage tests, verified availability, editable prices, and the 25 catalogue departments.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800">
            <Upload className="h-4 w-4" />
            Import CSV
            <input key={fileInputKey} type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} disabled={saving} />
          </label>
          <button onClick={() => downloadCsv(tests)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => { setShowDepartmentForm(true); setEditingDepartmentId(null); setDepartmentForm(emptyDepartment); }} className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/10">
            <Building2 className="h-4 w-4" /> Add Department
          </button>
          <button onClick={openNewTest} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500">
            <Plus className="h-4 w-4" /> Add Test
          </button>
        </div>
      </header>

      {feedback && (
        <div role="status" className="flex items-start justify-between gap-4 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          <span>{feedback}</span>
          <button aria-label="Dismiss message" onClick={() => setFeedback('')}><X className="h-4 w-4" /></button>
        </div>
      )}
      {loadError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{loadError}</p>}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-white">Departments <span className="text-slate-400">({departments.filter((department) => department.isActive).length} active)</span></h2>
          <span className="text-xs text-slate-500">The catalog seed adds 25 departments without clearing existing data.</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {departments.map((department) => (
            <div key={department._id} className={`flex items-center justify-between gap-2 rounded-xl border p-3 ${department.isActive ? 'border-slate-700 bg-slate-800/70' : 'border-slate-800 bg-slate-950/60 opacity-60'}`}>
              <span className="min-w-0 truncate text-xs font-semibold text-slate-200" title={department.name}>{department.name}</span>
              <div className="flex shrink-0 gap-1">
                <button aria-label={`Edit ${department.name}`} onClick={() => editDepartment(department)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white"><Pencil className="h-3.5 w-3.5" /></button>
                <button aria-label={`${department.isActive ? 'Deactivate' : 'Activate'} ${department.name}`} onClick={() => toggleDepartment(department)} className={`rounded-lg px-2 py-1 text-[10px] font-bold ${department.isActive ? 'text-emerald-300 hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-700'}`}>
                  {department.isActive ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showDepartmentForm && (
        <form onSubmit={saveDepartment} className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <h2 className="sm:col-span-2 lg:col-span-4 font-bold text-white">{editingDepartmentId ? 'Edit Department' : 'Add Department'}</h2>
          <input required minLength={2} placeholder="Department name" value={departmentForm.name} onChange={(event) => setDepartmentForm({ ...departmentForm, name: event.target.value })} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" />
          <input required minLength={2} placeholder="Unique code (e.g. HEM)" value={departmentForm.code} onChange={(event) => setDepartmentForm({ ...departmentForm, code: event.target.value.toUpperCase() })} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm uppercase text-white" />
          <input placeholder="Icon name" value={departmentForm.icon} onChange={(event) => setDepartmentForm({ ...departmentForm, icon: event.target.value })} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" />
          <input placeholder="Description (optional)" value={departmentForm.description} onChange={(event) => setDepartmentForm({ ...departmentForm, description: event.target.value })} className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" />
          <div className="flex gap-2 sm:col-span-2 lg:col-span-4">
            <button disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50">{saving ? 'Saving…' : 'Save Department'}</button>
            <button type="button" onClick={() => { setShowDepartmentForm(false); setEditingDepartmentId(null); }} className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300">Cancel</button>
          </div>
        </form>
      )}

      <section className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input aria-label="Search tests" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by test name or code…" className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none" />
          </label>
          <select aria-label="Filter by department" value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200">
            <option value="">All departments</option>
            {departments.map((department) => <option key={department._id} value={department.name}>{department.name}</option>)}
          </select>
          <select aria-label="Filter by status" value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-200">
            <option value="">All availability</option>
            <option value="pending_verification">Pending verification</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
            <option value="inactive">Inactive (hidden)</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="space-y-3 p-5" aria-label="Loading tests">
              {[...Array(5)].map((_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-slate-800" />)}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">
              <FlaskConical className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              No catalogue tests match these filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-xs">
                <thead className="bg-slate-800 text-[10px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="p-3">Test</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Sample</th>
                    <th className="p-3">Report time</th>
                    <th className="p-3">Price (PKR)</th>
                    <th className="p-3">Availability</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTests.map((test) => (
                    <tr key={test._id} className={!test.isActive ? 'opacity-50' : ''}>
                      <td className="p-3">
                        <span className="block font-mono text-[10px] text-blue-300">{test.code}</span>
                        <span className="font-semibold text-white">{test.name}</span>
                      </td>
                      <td className="p-3 text-slate-300">{test.department}</td>
                      <td className="p-3 text-slate-400">{test.sampleType || 'Not verified'}</td>
                      <td className="p-3 text-slate-400">{test.turnaroundHours ? `${test.turnaroundHours} hrs` : 'Not verified'}</td>
                      <td className="p-3 text-slate-300">{test.price === null || test.price === undefined ? 'Not set' : test.price}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${test.availabilityStatus === 'available' ? 'bg-emerald-500/10 text-emerald-300' : test.availabilityStatus === 'unavailable' ? 'bg-rose-500/10 text-rose-300' : 'bg-blue-500/10 text-blue-200'}`}>
                          {test.isActive ? (test.availabilityStatus || 'pending_verification').replace('_', ' ') : 'inactive'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          <button aria-label={`Edit ${test.name}`} onClick={() => openEditTest(test)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><Pencil className="h-4 w-4" /></button>
                          <button aria-label={`${test.isActive ? 'Disable' : 'Enable'} ${test.name}`} onClick={() => toggleTest(test)} className="rounded-lg px-2 py-1 font-bold text-blue-300 hover:bg-blue-500/10">{test.isActive ? 'Disable' : 'Enable'}</button>
                          <button aria-label={`Delete ${test.name}`} onClick={() => deleteTest(test)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-right text-xs text-slate-500">{filteredTests.length} of {tests.length} tests</p>
      </section>

      {showTestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
          <form onSubmit={saveTest} className="my-8 max-h-[92vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-3xl border border-slate-700 bg-slate-900 p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">{editingTestId ? 'Edit test' : 'Add catalogue test'}</h2>
                <p className="mt-1 text-xs text-slate-400">Leave unverified clinical details and price blank.</p>
              </div>
              <button type="button" aria-label="Close test form" onClick={() => setShowTestForm(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-300">Test name *
                <input required minLength={2} value={testForm.name} onChange={(event) => setTestField('name', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">Test code *
                <input required minLength={2} value={testForm.code} onChange={(event) => setTestField('code', event.target.value.toUpperCase())} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 font-mono text-sm uppercase text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">Department *
                <select required value={testForm.department} onChange={(event) => setTestField('department', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white">
                  <option value="">Select department</option>
                  {departments.filter((department) => department.isActive).map((department) => <option key={department._id} value={department.name}>{department.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-300">Category
                <input value={testForm.category} onChange={(event) => setTestField('category', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">Price (PKR)
                <input type="number" min="0" step="any" value={testForm.price} onChange={(event) => setTestField('price', event.target.value)} placeholder="Not set" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">Discount price (PKR)
                <input type="number" min="0" step="any" value={testForm.discountedPrice} onChange={(event) => setTestField('discountedPrice', event.target.value)} placeholder="Not set" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">Sample type
                <input value={testForm.sampleType} onChange={(event) => setTestField('sampleType', event.target.value)} placeholder="Not verified" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">Sample quantity / collection
                <input value={testForm.requiredQuantity} onChange={(event) => setTestField('requiredQuantity', event.target.value)} placeholder="Not verified" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">Report delivery time (hours)
                <input type="number" min="0" step="any" value={testForm.turnaroundHours} onChange={(event) => setTestField('turnaroundHours', event.target.value)} placeholder="Not verified" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300">Availability
                <select value={testForm.availabilityStatus} onChange={(event) => setTestField('availabilityStatus', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white">
                  <option value="pending_verification">Pending verification</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-300">Fasting requirement
                <select value={testForm.fastingRequired} onChange={(event) => setTestField('fastingRequired', event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white">
                  <option value="">Not verified</option><option value="true">Required</option><option value="false">Not required</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-300">Fasting hours
                <input type="number" min="0" step="any" value={testForm.fastingHours} onChange={(event) => setTestField('fastingHours', event.target.value)} placeholder="Not verified" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300 sm:col-span-2">Description
                <textarea rows="2" value={testForm.description} onChange={(event) => setTestField('description', event.target.value)} placeholder="Enter verified description only." className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
              <label className="text-xs font-semibold text-slate-300 sm:col-span-2">Patient preparation instructions
                <textarea rows="2" value={testForm.preparation} onChange={(event) => setTestField('preparation', event.target.value)} placeholder="Enter verified instructions only." className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white" />
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-4">
              <button type="button" onClick={() => setShowTestForm(false)} className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300">Cancel</button>
              <button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50">{saving ? 'Saving…' : 'Save Test'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
