import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import TestCard from '../components/TestCard';
import PackageCard from '../components/PackageCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  FlaskConical, 
  HeartHandshake, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  PhoneCall, 
  Sparkles,
  CalendarCheck,
  Star,
  Users,
  Award,
  ChevronRight,
  FileCheck2,
  Droplet
} from 'lucide-react';

export default function Home() {
  const [popularTests, setPopularTests] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // GSAP animation refs
  const heroRef = useRef(null);
  const heroVisualRef = useRef(null);
  const heroImageRef = useRef(null);
  const statsRef = useRef(null);
  const testsRef = useRef(null);
  const packagesRef = useRef(null);
  const departmentsRef = useRef(null);
  const reviewsRef = useRef(null);
  const blogsRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const animations = gsap.context(() => {
      gsap.from(hero, {
        duration: 1.2,
        y: 50,
        ease: 'power4.out',
      });

      if (heroVisualRef.current) {
        gsap.to(heroVisualRef.current, {
          y: -36,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      }

      const animateOnScroll = (target, y, stagger) => {
        if (!target) return;
        gsap.from(target, {
          scrollTrigger: {
            trigger: target,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          duration: 0.8,
          opacity: 0,
          y,
          stagger,
          ease: 'power3.out',
        });
      };

      animateOnScroll(statsRef.current, 30, 0.15);
      animateOnScroll(testsRef.current, 40, 0.1);
      animateOnScroll(packagesRef.current, 40, 0.1);
      animateOnScroll(departmentsRef.current, 40, 0.1);
      animateOnScroll(reviewsRef.current, 40, 0.15);
      animateOnScroll(blogsRef.current, 40, 0.15);
    }, hero);

    const heroImage = heroImageRef.current;
    let handlePointerMove;
    let handlePointerLeave;

    if (heroImage) {
      const moveX = gsap.quickTo(heroImage, 'x', { duration: 0.6, ease: 'power3.out' });
      const moveY = gsap.quickTo(heroImage, 'y', { duration: 0.6, ease: 'power3.out' });

      handlePointerMove = (event) => {
        if (event.pointerType === 'touch') return;
        const bounds = hero.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        moveX(x * 16);
        moveY(y * 16);
      };
      handlePointerLeave = () => {
        moveX(0);
        moveY(0);
      };

      hero.addEventListener('pointermove', handlePointerMove, { passive: true });
      hero.addEventListener('pointerleave', handlePointerLeave);
    }

    return () => {
      if (handlePointerMove) hero.removeEventListener('pointermove', handlePointerMove);
      if (handlePointerLeave) hero.removeEventListener('pointerleave', handlePointerLeave);
      animations.revert();
    };
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [testsRes, pkgsRes, branchRes, revRes, blogRes] = await Promise.all([
          api.get('/tests?popular=true'),
          api.get('/packages?featured=true'),
          api.get('/branches'),
          api.get('/content/reviews'),
          api.get('/content/blogs'),
        ]);

        setPopularTests(testsRes.data.tests || []);
        setPackages(pkgsRes.data.packages || []);
        setBranches(branchRes.data.branches || []);
        setReviews(revRes.data.reviews || []);
        setBlogs(blogRes.data.blogs || []);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tests?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-dark-gradient">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-500/10 via-blue-900/10 to-transparent blur-3xl -z-10 pointer-events-none corner-accent-blue animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 blur-3xl rounded-full -z-10 corner-accent-white" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center lg:text-left max-w-3xl mx-auto lg:mx-0 space-y-6">
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-800 border border-blue-500/30 text-blue-400 text-xs font-bold shadow-lg shadow-blue-500/20 animate-pulse-blue">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>LABORATORY TESTING · TIMERGARA, LOWER DIR</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.15]">
              MALAK Lab Science Hub{' '}
              <span className="text-gradient-blue">
                Clarity in Every Result
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-dark-300 leading-relaxed font-normal">
              Laboratory testing backed by modern analyzers and quality-control practices, right opposite DHQ Hospital on Main GT Road.
            </p>

            {/* Search Bar with Autocomplete/Submit */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto lg:mx-0 mt-8">
              <div className="relative flex items-center p-2 rounded-2xl bg-dark-900 border-2 border-dark-700 focus-within:border-blue-500 shadow-xl shadow-black/30 transition-all">
                <Search className="w-5 h-5 text-dark-400 ml-3" />
                <input
                  type="text"
                  placeholder="Search tests (e.g., CBC, thyroid, HbA1c)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm sm:text-base text-white focus:outline-none bg-transparent placeholder:text-dark-400"
                />
                <button
                  type="submit"
                  className="glass-button px-6 py-3 text-white font-bold rounded-xl text-sm shrink-0"
                >
                  Find Test
                </button>
              </div>

              {/* Quick tags */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3 text-xs text-dark-400">
                <span className="font-semibold text-dark-300">Popular Searches:</span>
                <Link to="/tests?search=CBC" className="glass-button glass-button-subtle px-2.5 py-1 rounded-lg text-white">
                  Complete Blood Count
                </Link>
                <Link to="/tests?search=Lipid" className="glass-button glass-button-subtle px-2.5 py-1 rounded-lg text-white">
                  Lipid Profile
                </Link>
                <Link to="/tests?search=Thyroid" className="glass-button glass-button-subtle px-2.5 py-1 rounded-lg text-white">
                  Thyroid (T3, T4, TSH)
                </Link>
                <Link to="/tests?search=HbA1c" className="glass-button glass-button-subtle px-2.5 py-1 rounded-lg text-white">
                  HbA1c
                </Link>
              </div>
            </form>
          </div>

          <div ref={heroVisualRef} className="relative max-w-xl mx-auto lg:max-w-none">
            <div className="absolute -inset-3 rounded-[2rem] bg-blue-500/20 blur-2xl" />
            <img
              ref={heroImageRef}
              src="/malak-lab-hero.jpg"
              alt="Laboratory scientist examining a sample under a microscope"
              className="relative w-full h-72 sm:h-96 lg:h-[500px] object-cover rounded-3xl border border-white/10 shadow-2xl"
            />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 rounded-2xl border border-white/15 bg-black/70 backdrop-blur-md p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold">Reliable laboratory testing</p>
                  <p className="text-white/70 text-sm">Quality-focused care in Timergara</p>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* Key Stat Cards Grid */}
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-16 max-w-5xl mx-auto">
            <div className="dark-card p-6 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-white block group-hover:text-blue-400 transition-colors">HPLC</span>
                <span className="text-xs text-dark-400 font-medium">HbA1c · GH900 Plus</span>
              </div>
            </div>

            <div className="dark-card p-6 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-white block group-hover:text-blue-400 transition-colors">CLIA</span>
                <span className="text-xs text-dark-400 font-medium">Hormones · CL900i</span>
              </div>
            </div>

            <div className="dark-card p-6 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-white block group-hover:text-blue-400 transition-colors">ABG</span>
                <span className="text-xs text-dark-400 font-medium">Siemens analyzer</span>
              </div>
            </div>

            <div className="dark-card p-6 flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-white block group-hover:text-blue-400 transition-colors">QC</span>
                <span className="text-xs text-dark-400 font-medium">Quality control on tests</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. POPULAR LABORATORY TESTS SECTION */}
      <section ref={testsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
              <Droplet className="w-4 h-4" />
              Clinical Chemistry & Pathology
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Most Booked Medical Laboratory Tests
            </h2>
            <p className="text-sm text-dark-400 mt-1 max-w-xl">
              Routine diagnostic assessments analyzed on automated laser analyzers with multi-level internal quality controls.
            </p>
          </div>

          <Link
            to="/tests"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 group"
          >
            <span>Browse Medical Tests</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularTests.slice(0, 8).map((test) => (
            <TestCard key={test._id} test={test} />
          ))}
        </div>
      </section>

      {/* 3. FEATURED HEALTH PACKAGES SECTION */}
      <section ref={packagesRef} className="bg-dark-950 py-16 border-y border-dark-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Preventive Healthcare Checkups
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Comprehensive Health Checkup Packages
            </h2>
            <p className="text-sm text-dark-400">
              Review available packages and contact MALAK Lab to confirm current prices and availability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg._id} pkg={pkg} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/packages"
              className="glass-button glass-button-subtle gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm"
            >
              <span>Explore All Health Packages</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOME SAMPLE COLLECTION CALLOUT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold">
              <Truck className="w-4 h-4" />
              Located in Timergara, Lower Dir
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Local laboratory care, close to home
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Find MALAK Lab Science Hub opposite DHQ Hospital on Main GT Road in Timergara. Call us to ask about available tests and collection options.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>HbA1c testing by HPLC</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Hormone testing by CLIA</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>ABG analysis available</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Tests run with quality control</span>
              </li>
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="glass-button gap-2 px-6 py-3.5 rounded-2xl text-white font-black text-sm"
              >
                <span>Contact the Lab</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+923285027351"
                className="glass-button glass-button-subtle gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-sm"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <span>Call 0328 5027351</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 8-STEP HOW IT WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            Your next steps
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            How MALAK Lab Works
          </h2>
          <p className="text-sm text-dark-400">
            Find your test, contact the laboratory, and follow the instructions provided by our team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="dark-card p-6 flex flex-col items-center group relative">
            <span className="w-8 h-8 rounded-full bg-blue-500 text-black font-extrabold text-sm flex items-center justify-center mb-4 group-hover:bg-blue-400 transition-colors">
              1
            </span>
            <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Select Test or Package</h4>
            <p className="text-xs text-dark-400 mt-2 leading-relaxed text-center">
              Search by test name, organ department, or select an executive preventive health checkup package.
            </p>
          </div>

          <div className="dark-card p-6 flex flex-col items-center group relative">
            <span className="w-8 h-8 rounded-full bg-blue-500 text-black font-extrabold text-sm flex items-center justify-center mb-4 group-hover:bg-blue-400 transition-colors">
              2
            </span>
            <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Choose Collection Type</h4>
            <p className="text-xs text-dark-400 mt-2 leading-relaxed text-center">
              Visit MALAK Lab opposite DHQ Hospital on Main GT Road, Timergara.
            </p>
          </div>

          <div className="dark-card p-6 flex flex-col items-center group relative">
            <span className="w-8 h-8 rounded-full bg-blue-500 text-black font-extrabold text-sm flex items-center justify-center mb-4 group-hover:bg-blue-400 transition-colors">
              3
            </span>
            <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Quality-Controlled Testing</h4>
            <p className="text-xs text-dark-400 mt-2 leading-relaxed text-center">
              Tests are run with quality control using the laboratory analyzers listed above.
            </p>
          </div>

          <div className="dark-card p-6 flex flex-col items-center group relative">
            <span className="w-8 h-8 rounded-full bg-blue-500 text-black font-extrabold text-sm flex items-center justify-center mb-4 group-hover:bg-blue-400 transition-colors">
              4
            </span>
            <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Get in Touch</h4>
            <p className="text-xs text-dark-400 mt-2 leading-relaxed text-center">
              Contact the lab team for test availability, preparation instructions, and report questions.
            </p>
          </div>
        </div>
      </section>

      {/* 6. LABORATORY DEPARTMENTS */}
      <section ref={departmentsRef} className="bg-dark-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Reference Lab Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              MALAK Lab testing capabilities
            </h2>
            <p className="text-sm text-dark-400">
              Our current testing capabilities include HPLC HbA1c, CLIA hormone testing, and ABG analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="dark-card p-6 group hover:border-blue-500/40 transition-all">
              <FlaskConical className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">HbA1c by HPLC</h4>
              <p className="text-xs text-dark-400 mt-2">
                Tested using the GH900 Plus analyzer.
              </p>
            </div>

            <div className="dark-card p-6 group hover:border-blue-500/40 transition-all">
              <Droplet className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Hormone Testing</h4>
              <p className="text-xs text-dark-400 mt-2">
                CLIA testing using the CL900i analyzer.
              </p>
            </div>

            <div className="dark-card p-6 group hover:border-blue-500/40 transition-all">
              <ShieldCheck className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">ABG Analysis</h4>
              <p className="text-xs text-dark-400 mt-2">
                Blood gas analysis using a Siemens analyzer.
              </p>
            </div>

            <div className="dark-card p-6 group hover:border-blue-500/40 transition-all">
              <FileCheck2 className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">Quality Control</h4>
              <p className="text-xs text-dark-400 mt-2">
                Tests are run with quality control.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER TESTIMONIALS */}
      {reviews.length > 0 && (
        <section ref={reviewsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Verified Patient Reviews
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Patient Reviews
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((r, idx) => (
              <div key={idx} className="dark-card p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-1 text-blue-400 mb-3">
                    {[...Array(r.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-blue-400" />
                    ))}
                  </div>
                  <p className="text-xs text-dark-300 italic leading-relaxed group-hover:text-dark-200 transition-colors">
                    "{r.comment}"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-dark-700 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-white">{r.patientName}</h5>
                    <span className="text-dark-400 text-[11px]">{r.testName}</span>
                  </div>
                  <span className="text-blue-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Patient
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. LATEST HEALTH ARTICLES / BLOG */}
      {blogs.length > 0 && (
        <section ref={blogsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 block mb-1">
                Medical Insights
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Latest Health Articles & Lab Guidance
              </h2>
            </div>
            <Link to="/blog" className="text-xs font-bold text-blue-400 hover:underline">
              Read All Articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.slice(0, 3).map((blog) => (
              <div key={blog._id} className="dark-card rounded-3xl overflow-hidden flex flex-col justify-between group">
                <div className="p-6">
                  <div className="flex items-center justify-between text-xs text-dark-400 mb-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                      {blog.category}
                    </span>
                    <span className="text-dark-300">{blog.readTime}</span>
                  </div>
                  <Link to={`/blog`} className="group-hover:text-blue-400 transition-colors">
                    <h4 className="text-base font-bold text-white leading-snug group-hover:text-blue-400">
                      {blog.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-dark-400 mt-2 line-clamp-2 leading-relaxed group-hover:text-dark-300 transition-colors">
                    {blog.excerpt}
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-between text-xs">
                  <span className="text-dark-400 font-medium">{blog.author?.name}</span>
                  <Link to={`/blog`} className="text-blue-400 font-bold hover:underline group-hover:text-blue-300 transition-colors">
                    Read More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. EMERGENCY & INQUIRY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 sm:p-12 shadow-2xl shadow-blue-600/30 flex flex-col md:flex-row items-center justify-between gap-6 group">
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black">
              Need Assistance with Test Selection or Fasting Guidelines?
            </h3>
            <p className="text-sm text-blue-100 max-w-xl">
              Our clinical pathologists and patient care specialists are available 24 hours a day to assist with doctor prescription uploads, fasting instructions, and branch queries.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="glass-button glass-button-subtle px-6 py-3 rounded-2xl text-white font-black text-sm"
            >
              Contact Support
            </Link>
            <a
              href="tel:+923285027351"
              className="glass-button glass-button-subtle px-6 py-3 rounded-2xl text-white font-bold text-sm"
            >
              Call 0328 5027351
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
