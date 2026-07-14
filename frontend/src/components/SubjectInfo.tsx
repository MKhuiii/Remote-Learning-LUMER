"use client";

import { SubjectInfo as Subject } from "@/types/questions-bank";

interface Props {
  subject: Subject;
}

export default function SubjectInfo({ subject }: Props) {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid lg:grid-cols-3">
          <img src={subject.image} className="w-full h-64 object-cover" />

          <div className="lg:col-span-2 p-8">
            <h2 className="text-2xl font-bold text-slate-900">
              {subject.title}
            </h2>

            <p className="mt-2 text-slate-500">{subject.description}</p>

            <div className="grid grid-cols-2 gap-5 mt-8">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">
                  Subject Code
                </p>

                <p className="font-bold mt-1">{subject.code}</p>
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400">
                  Instructor
                </p>

                <p className="font-bold mt-1">{subject.instructor}</p>
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400">
                  Modules
                </p>

                <p className="font-bold mt-1">{subject.totalModules}</p>
              </div>

              <div>
                <p className="text-xs uppercase font-bold text-slate-400">
                  Status
                </p>

                <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                  {subject.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
