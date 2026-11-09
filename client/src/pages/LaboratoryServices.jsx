import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, 
  Droplet, 
  Activity, 
  ShieldCheck, 
  Microscope, 
  Dna, 
  HeartHandshake, 
  ArrowRight 
} from 'lucide-react';

export default function LaboratoryServices() {
  const services = [
    {
      title: 'Clinical Biochemistry & Metabolic Panels',
      desc: 'Liver function, renal indices, electrolytes, high-sensitivity cardiac troponins, and automated lipid fractions.',
      icon: Activity,
      category: 'Biochemistry',
    },
    {
      title: 'Hematology, Coagulation & Hemostasis',
      desc: 'Complete blood cell counts, reticulocytes, peripheral blood smears, PT/INR, PTT, and thrombophilia screenings.',
      icon: Droplet,
      category: 'Hematology',
    },
    {
      title: 'Endocrinology, Vitamins & Immunoassays',
      desc: 'Thyroid profiles (T3, T4, TSH), Vitamin D 25-OH, Vitamin B12, fertility hormones, and autoimmune antibody panels.',
      icon: ShieldCheck,
      category: 'Endocrinology',
    },
    {
      title: 'Clinical Microbiology & Antibiotic Susceptibility',
      desc: 'Blood, urine, and sputum cultures, automated bacterial identification, minimum inhibitory concentration (MIC) testing.',
      icon: Microscope,
      category: 'Microbiology',
    },
    {
      title: 'Molecular Diagnostics & RT-PCR Testing',
      desc: 'Real-time polymerase chain reaction testing for viral loads, respiratory pathogen panels, and genetic markers.',
      icon: Dna,
      category: 'Molecular Biology',
    },
    {
      title: 'Executive Corporate & Preventive Health Checks',
      desc: 'Tailored on-site occupational health screenings, pre-employment checkups, and executive wellness packages.',
      icon: HeartHandshake,
      category: 'Corporate Health',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
          Clinical Capabilities
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Comprehensive Laboratory Services
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Covering routine health screenings to highly specialized tertiary care clinical investigations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{srv.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{srv.desc}</p>
              </div>

              <Link
                to="/tests"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 pt-2"
              >
                <span>Browse {srv.category} Tests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

