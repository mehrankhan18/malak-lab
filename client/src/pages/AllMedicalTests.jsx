import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Activity, Beaker, Dna, Droplets, FlaskConical, HeartPulse, Microscope, Pill, Search, ShieldCheck } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import api from '../services/api';
import TestCard from '../components/TestCard';

const departmentIcons = {
  Activity,
  Beaker,
  Dna,
  Droplets,
  FlaskConical,
  HeartPulse,
  Microscope,
  Pill,
  ShieldCheck,
};

function departmentId(name) {
  return `department-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

export default function AllMedicalTests() {
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryToken, setRetryToken] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const contentRef = useRef(null);

  const search = searchParams.get('search') || '';
  const selectedDepartment = searchParams.get('department') || '';
  const selectedCategory = searchParams.get('category') || '';
  const fastingFilter = searchParams.get('fasting') || '';
  const sort = searchParams.get('sort') || '';

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams(new URLSearchParams());

  useEffect(() => {
    let active = true;
    const loadDepartments = async () => {
      try {
        const [departmentResponse, categoryResponse] = await Promise.all([
          api.get('/departments'),
          api.get('/tests/meta/categories'),
        ]);
        if (!active) return;
        setDepartments(departmentResponse.data.departments || []);
        setCategories(categoryResponse.data.categories || []);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Could not load catalogue departments.');
      }
    };
    loadDepartments();
    return () => { active = false; };
  }, [retryToken]);

  useEffect(() => {
    let active = true;
    const loadTests = async () => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (selectedDepartment) params.set('department', selectedDepartment);
      if (selectedCategory) params.set('category', selectedCategory);
      if (fastingFilter) params.set('fasting', fastingFilter);
      if (sort) params.set('sort', sort);
      try {
        const response = await api.get(`/tests?${params.toString()}`);
        if (active) setTests(response.data.tests || []);
      } catch (requestError) {
        if (active) {
          setTests([]);
          setError(requestError.response?.data?.message || 'Could not load laboratory tests. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadTests();
    return () => { active = false; };
  }, [search, selectedDepartment, selectedCategory, fastingFilter, sort, retryToken]);

  useEffect(() => {
    if (loading || !contentRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      contentRef.current.querySelectorAll('.catalog-department-card').forEach((card) => {
        gsap.fromTo(card, { opacity: 0, y: 16 }, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, contentRef);
    return () => context.revert();
  }, [loading, tests, departments]);

  const testsByDepartment = useMemo(() => {
    const grouped = new Map();
    for (const test of tests) {
      if (!grouped.has(test.department)) grouped.set(test.department, []);
      grouped.get(test.department).push(test);
    }
    return grouped;
  }, [tests]);

  const hasTestFilters = Boolean(search.trim() || selectedDepartment || selectedCategory || fastingFilter);
  const visibleDepartments = departments.filter((department) => {
    if (selectedDepartment && department.name !== selectedDepartment) return false;
    if (hasTestFilters && !loading && !testsByDepartment.has(department.name)) return false;
    return true;
  });

  return (
    <div ref={contentRef} className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <span className="block text-xs font-bold uppercase tracking-wider text-blue-600">Diagnostic Directory</span>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Medical Laboratory Test Catalogue</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Browse tests by department or search by test name, code, or department. Prices, availability, collection details, and preparation information are shown only when confirmed by the laboratory.
        </p>
      </header>

      <section aria-label="Search and filter tests" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="relative lg:col-span-2">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search tests by name, code, or department"
              type="search"
              value={search}
              onChange={(event) => updateParam('search', event.target.value)}
              placeholder="Search test name, code, or department…"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <select aria-label="Filter by department" value={selectedDepartment} onChange={(event) => updateParam('department', event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none">
            <option value="">All departments</option>
            {departments.map((department) => <option key={department._id} value={department.name}>{department.name}</option>)}
          </select>
          <select aria-label="Filter by report sorting" value={sort} onChange={(event) => updateParam('sort', event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none">
            <option value="">Sort: Test name</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="turnaround">Fastest report time</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Filter by fasting requirement" value={fastingFilter} onChange={(event) => updateParam('fasting', event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
            <option value="">All preparation statuses</option>
            <option value="true">Fasting required</option>
            <option value="false">Fasting not required</option>
          </select>
          {categories.length > 0 && (
            <select aria-label="Filter by legacy category" value={selectedCategory} onChange={(event) => updateParam('category', event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category._id} value={category.name}>{category.name}</option>)}
            </select>
          )}
          {(search || selectedDepartment || selectedCategory || fastingFilter || sort) && (
            <button type="button" onClick={clearFilters} className="ml-auto rounded-xl px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">Clear filters</button>
          )}
        </div>
      </section>

      {!search.trim() && <section aria-label="Laboratory departments">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">{hasTestFilters ? 'Matching Departments' : 'Browse Departments'}</h2>
            <p className="text-xs text-slate-500">
              {hasTestFilters
                ? `${visibleDepartments.length} departments with matching tests`
                : `${departments.length} departments in the catalogue`}
            </p>
          </div>
          {selectedDepartment && <button onClick={() => updateParam('department', '')} className="text-xs font-bold text-blue-700 hover:underline">Show all</button>}
        </div>
        {loading && departments.length === 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => <div key={index} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {visibleDepartments.map((department) => {
              const Icon = departmentIcons[department.icon] || FlaskConical;
              const isSelected = selectedDepartment === department.name;
              return (
                <button
                  type="button"
                  key={department._id || department.code}
                  onClick={() => updateParam('department', isSelected ? '' : department.name)}
                  className={`catalog-department-card flex min-h-20 items-center gap-3 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/60 ${isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white'}`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold leading-snug text-slate-900">{department.name}</span>
                    <span className="mt-1 block text-[11px] text-slate-500">
                      {hasTestFilters
                        ? `${testsByDepartment.get(department.name)?.length ?? 0} matching tests`
                        : `${department.testCount ?? testsByDepartment.get(department.name)?.length ?? 0} tests`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>}

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <p>{error}</p>
          <button onClick={() => setRetryToken((token) => token + 1)} className="mt-2 font-bold underline">Retry</button>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-sm">
        <h2 className="font-bold text-slate-900">{tests.length} matching tests</h2>
        <span className="text-xs text-slate-500">Availability and prices are subject to laboratory confirmation.</span>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(9)].map((_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : error ? null : tests.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <FlaskConical className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h3 className="font-bold text-slate-800">No matching tests found</h3>
          <p className="mt-1 text-sm text-slate-500">Try another test name or code, or clear the selected filters.</p>
          <button onClick={clearFilters} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-10">
          {visibleDepartments.map((department) => {
            const departmentTests = testsByDepartment.get(department.name) || [];
            return (
              <section key={department._id || department.code} id={departmentId(department.name)} className="scroll-mt-24 space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{department.name}</h2>
                    {department.description && <p className="mt-1 text-xs text-slate-500">{department.description}</p>}
                  </div>
                  <span className="text-xs text-slate-500">{departmentTests.length} listed</span>
                </div>
                {departmentTests.length ? (
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {departmentTests.map((test) => <TestCard key={test._id} test={test} />)}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    {search || fastingFilter || selectedCategory ? 'No tests in this department match the selected filters.' : 'No tests are currently listed for this department.'}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
      <p className="text-xs text-slate-500">For verified preparation requirements, sample collection details, and current pricing, contact the laboratory.</p>
      <Link to="/contact" className="sr-only">Contact laboratory staff</Link>
    </div>
  );
}
