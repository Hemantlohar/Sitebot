"use client";

import { ReactNode } from "react";
import { Globe } from "lucide-react";

interface BrowserPreviewProps {
  children: ReactNode;
  website?: string;
}

export default function BrowserPreview({
  children,
  website = "https://example.com",
}: BrowserPreviewProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,.12)]">

      {/* Browser Header */}

      <div className="flex items-center gap-4 border-b bg-slate-100 px-6 py-4">

        <div className="flex gap-2">

          <div className="h-3 w-3 rounded-full bg-red-400" />

          <div className="h-3 w-3 rounded-full bg-yellow-400" />

          <div className="h-3 w-3 rounded-full bg-green-400" />

        </div>

        <div className="mx-auto flex w-[60%] items-center justify-center gap-2 rounded-xl border bg-white px-4 py-2 shadow-sm">

          <Globe size={16} className="text-slate-500" />

          <span className="truncate text-sm text-slate-500">

            {website}

          </span>

        </div>

      </div>

      {/* Fake Website */}

      <div className="relative min-h-[82vh] bg-gradient-to-br from-slate-100 via-white to-slate-200">

        <div className="mx-auto max-w-7xl p-10">

          {/* Navbar */}

          <div className="mb-8 flex items-center justify-between rounded-2xl bg-white p-6 shadow">

            <div className="h-6 w-36 rounded bg-slate-200" />

            <div className="flex gap-4">

              <div className="h-4 w-20 rounded bg-slate-200" />

              <div className="h-4 w-20 rounded bg-slate-200" />

              <div className="h-4 w-20 rounded bg-slate-200" />

            </div>

          </div>

          {/* Hero */}

          <div className="grid grid-cols-12 gap-8">

            <div className="col-span-7">

              <div className="mb-5 h-10 w-96 rounded bg-slate-300" />

              <div className="mb-4 h-6 w-full rounded bg-slate-200" />

              <div className="mb-4 h-6 w-[90%] rounded bg-slate-200" />

              <div className="mb-8 h-6 w-[75%] rounded bg-slate-200" />

              <div className="h-12 w-44 rounded-xl bg-blue-600" />

            </div>

            <div className="col-span-5">

              <div className="h-[320px] rounded-3xl bg-white shadow" />

            </div>

          </div>

          {/* Cards */}

          <div className="mt-12 grid grid-cols-3 gap-6">

            {[1,2,3].map((card)=>(
              <div
                key={card}
                className="rounded-3xl bg-white p-6 shadow"
              >
                <div className="mb-5 h-10 w-10 rounded-xl bg-blue-100" />

                <div className="mb-4 h-5 w-36 rounded bg-slate-300" />

                <div className="mb-2 h-4 rounded bg-slate-200" />

                <div className="mb-2 h-4 rounded bg-slate-200" />

                <div className="h-4 w-[80%] rounded bg-slate-200" />
              </div>
            ))}

          </div>

        </div>

        {/* Floating Widget */}

        <div className="absolute bottom-8 right-8">

          {children}

        </div>

      </div>

    </div>
  );
}