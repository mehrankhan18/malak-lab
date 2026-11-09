import React from 'react';
import { Activity, FlaskConical, Microscope, PhoneCall } from 'lucide-react';

const services = [
  {
    icon: Activity,
    title: 'HbA1c testing',
    detail: 'Performed using the GH900 Plus HPLC analyzer.',
  },
  {
    icon: FlaskConical,
    title: 'Hormone testing',
    detail: 'Performed using the CL900i CLIA analyzer.',
  },
  {
    icon: Microscope,
    title: 'Blood gas analysis',
    detail: 'Available on a Siemens analyzer.',
  },
];

export default function DoctorsSpecialists() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <header className="max-w-3xl space-y-3">
        <span className="inline-flex rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
          Laboratory capabilities
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
          Equipment and quality control
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-slate-600">
          MALAK Lab Science Hub runs tests with quality control. Contact the laboratory for current test availability and report-review information.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-3">
        {services.map(({ icon: Icon, title, detail }) => (
          <article key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
          </article>
        ))}
      </section>

      <a
        href="tel:+923285027351"
        className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-800"
      >
        <PhoneCall className="h-4 w-4" />
        Call MALAK Lab: 0328 5027351
      </a>
    </main>
  );
}
