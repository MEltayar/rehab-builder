import { Mail, MessageCircle, Stethoscope, Users, HelpCircle } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-8 pb-10">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Help & About</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Everything you need to know about Rehab Builder.
        </p>
      </div>

      {/* ── What is Rehab Builder ─────────────────────── */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <HelpCircle size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">What is Rehab Builder?</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Rehab Builder is a professional tool designed to help rehabilitation specialists
            build and deliver high-quality exercise programs for their clients — quickly,
            cleanly, and without the hassle.
          </p>
          <p>
            Gone are the days of manually writing out programs or relying on generic templates.
            With Rehab Builder, you can organise sessions, assign exercises with precise
            parameters, and generate a fully formatted program sheet ready to hand to your
            client — all within minutes.
          </p>
          <p>
            Every program is tailored to a specific client, condition, and goal, ensuring your
            work always looks polished and personalised.
          </p>
        </div>
      </section>

      {/* ── Who is it for ────────────────────────────── */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-teal-50 dark:bg-teal-900/20">
          <Users size={18} className="text-teal-600 dark:text-teal-400 shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Who is it for?</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Rehab Builder is built for healthcare and fitness professionals who work with
            clients on structured recovery or performance programs, including:
          </p>
          <ul className="flex flex-col gap-3">
            {[
              {
                title: 'Physiotherapists',
                desc: 'Managing patient rehabilitation programs across clinics or home visits.',
              },
              {
                title: 'Sports Rehabilitation Therapists',
                desc: 'Helping athletes return to peak performance after injury.',
              },
              {
                title: 'Personal Trainers & Strength Coaches',
                desc: 'Delivering structured, progressive exercise plans to their clients.',
              },
              {
                title: 'Occupational Therapists',
                desc: 'Creating functional movement and activity-based programs.',
              },
              {
                title: 'Chiropractors & Osteopaths',
                desc: 'Supporting patients with guided home exercise routines.',
              },
            ].map(({ title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <Stethoscope size={15} className="text-teal-500 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-gray-900 dark:text-gray-100">{title}</strong>
                  {' '}— {desc}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-gray-500 dark:text-gray-400 italic">
            If your work involves prescribing movement — Rehab Builder was made for you.
          </p>
        </div>
      </section>

      {/* ── Contact & Feedback ───────────────────────── */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-violet-50 dark:bg-violet-900/20">
          <Mail size={18} className="text-violet-600 dark:text-violet-400 shrink-0" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Contact & Feedback</h2>
        </div>
        <div className="px-5 py-5 flex flex-col gap-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Rehab Builder is constantly evolving, and your experience as a practitioner is
            what shapes it.
          </p>
          <p>
            Whether you have a feature idea that would improve your workflow, spotted something
            that isn't working as expected, or simply want to share your thoughts — I'd love
            to hear from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:Mostafaeltayar98@gmail.com"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
            >
              <Mail size={18} className="text-blue-500 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wide mb-0.5">Email</p>
                <p className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Mostafaeltayar98@gmail.com
                </p>
              </div>
            </a>

            <a
              href="https://wa.me/201021751325"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group"
            >
              <MessageCircle size={18} className="text-green-500 shrink-0" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100 text-xs uppercase tracking-wide mb-0.5">WhatsApp</p>
                <p className="text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  +20 102 175 1325
                </p>
              </div>
            </a>
          </div>

          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Every message is read and genuinely appreciated. Your feedback directly influences
            what gets built next.
          </p>
        </div>
      </section>

    </div>
  );
}
