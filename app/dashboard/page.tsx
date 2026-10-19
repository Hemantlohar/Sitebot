"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Globe,
  Bot,
  Package,
  Layers,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
} from "lucide-react";

interface Website {
  id: string;
  website_url: string;
  industry: string;
  business_type: string;
  bot_name: string;
  created_at: string;
  products?: string[];
}

export default function Dashboard() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/websites");
      const data = await res.json();

      if (data.success) {
        setWebsites(data.websites);
      }

      setLoading(false);
    }

    load();
  }, []);

  const filtered = websites.filter((site) =>
    site.website_url.toLowerCase().includes(search.toLowerCase())
  );

  async function deleteBot(id: string) {
    const ok = confirm("Delete this bot?");

    if (!ok) return;

    const res = await fetch(`/api/websites/${id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (data.success) {
      setWebsites((prev) => prev.filter((w) => w.id !== id));
    } else {
      alert(data.error);
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0B10] text-[#F4F5F7] px-6 py-10 md:px-10 lg:px-14 relative overflow-hidden font-[var(--font-body)]">
      {/* ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #7C6CFF 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 right-[-160px] h-[420px] w-[420px] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #22D3C8 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-[#9C93FF] bg-[#7C6CFF]/10 border border-[#7C6CFF]/20 rounded-full px-3 py-1 mb-4">
              <Sparkles size={12} />
              Bot control center
            </div>
            <h1 className="text-4xl md:text-[2.75rem] font-semibold tracking-tight font-[var(--font-display)]">
              Dashboard
            </h1>
            <p className="text-[#8B90A0] mt-2 text-[15px]">
              Manage your AI bots across every website.
            </p>
          </div>

          <Link
            href="/create"
            className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 font-medium text-[#0A0B10] transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,108,255,0.35)] hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #7C6CFF 0%, #22D3C8 100%)",
            }}
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90 duration-300" />
            New Bot
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <StatCard
            label="Bots"
            value={websites.length}
            icon={<Bot size={18} />}
            accent="#7C6CFF"
          />
          <StatCard
            label="Products"
            value={websites.reduce((a, b) => a + (b.products?.length || 0), 0)}
            icon={<Package size={18} />}
            accent="#22D3C8"
          />
          <StatCard
            label="Industries"
            value={new Set(websites.map((w) => w.industry)).size}
            icon={<Layers size={18} />}
            accent="#34D399"
          />
        </div>

        {/* Search */}
        <div className="relative mb-10 max-w-md">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666B7A]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search websites..."
            className="pl-11 w-full py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm placeholder:text-[#666B7A] focus:outline-none focus:ring-2 focus:ring-[#7C6CFF]/40 focus:border-[#7C6CFF]/40 transition-all"
          />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 h-[240px] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-5 bg-[#7C6CFF]/10 border border-[#7C6CFF]/20">
              <Bot size={26} className="text-[#9C93FF]" />
            </div>
            <h3 className="text-lg font-semibold mb-1.5 font-[var(--font-display)]">
              {search ? "No bots match your search" : "No bots yet"}
            </h3>
            <p className="text-[#8B90A0] text-sm max-w-sm mb-6">
              {search
                ? `Nothing found for "${search}". Try a different term.`
                : "Create your first bot to get started."}
            </p>
            {!search && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[#0A0B10]"
                style={{
                  background:
                    "linear-gradient(135deg, #7C6CFF 0%, #22D3C8 100%)",
                }}
              >
                <Plus size={16} />
                New Bot
              </Link>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((site) => (
              <div
                key={site.id}
                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-6 transition-all duration-300 hover:border-[#7C6CFF]/30 hover:bg-white/[0.045] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(124,108,255,0.12)]"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-[#22D3C8]/10 border border-[#22D3C8]/20 flex items-center justify-center">
                        <Globe size={15} className="text-[#5EEAD4]" />
                      </div>
                      <h2 className="font-semibold text-[15px] break-all leading-tight">
                        {site.website_url}
                      </h2>
                    </div>

                    <div className="mt-3.5 flex items-center gap-2">
                      <div className="relative flex items-center justify-center h-8 w-8 shrink-0 rounded-lg bg-[#7C6CFF]/10 border border-[#7C6CFF]/20">
                        <Bot size={15} className="text-[#9C93FF]" />
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#34D399]">
                          <span className="absolute inset-0 rounded-full bg-[#34D399] animate-ping opacity-75" />
                        </span>
                      </div>
                      <span className="font-medium text-sm truncate">
                        {site.bot_name}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 bg-[#34D399]/10 text-[#34D399] text-xs font-medium px-2.5 py-1 rounded-full border border-[#34D399]/20">
                    Active
                  </span>
                </div>

                {/* Info */}
                <div className="mt-6 space-y-2 text-sm text-[#B4B8C4]">
                  <p>
                    <span className="text-[#666B7A]">Industry </span>
                    <span className="text-[#F4F5F7]">{site.industry}</span>
                  </p>
                  <p>
                    <span className="text-[#666B7A]">Business </span>
                    <span className="text-[#F4F5F7]">{site.business_type}</span>
                  </p>
                  <p>
                    <span className="text-[#666B7A]">Products </span>
                    <span className="text-[#F4F5F7]">
                      {site.products?.length || 0}
                    </span>
                  </p>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-5 border-t border-white/[0.06] flex justify-between items-center">
                  <span className="text-[#666B7A] text-xs">
                    {new Date(site.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/${site.id}`}
                      className="inline-flex items-center gap-1.5 bg-white text-[#0A0B10] px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-[#E8E9EC] transition-colors"
                    >
                      Details
                      <ArrowUpRight size={13} />
                    </Link>
                    <Link
  href={`/playground/${site.id}`}
  className="inline-flex items-center gap-1.5 bg-[#7C6CFF]/10 text-[#9C93FF] border border-[#7C6CFF]/20 px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-[#7C6CFF]/20 transition-colors"
>
  <MessageSquare size={14} />
  Playground
</Link>

                    <button
                      onClick={() => deleteBot(site.id)}
                      aria-label="Delete bot"
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap");
        :root {
          --font-display: "Space Grotesk", sans-serif;
          --font-body: "Inter", sans-serif;
        }
      `}</style>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-[#8B90A0] text-sm">{label}</p>
        <h2 className="text-3xl font-semibold mt-1 font-[var(--font-display)]">
          {value}
        </h2>
      </div>
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center"
        style={{
          backgroundColor: `${accent}1A`,
          border: `1px solid ${accent}33`,
          color: accent,
        }}
      >
        {icon}
      </div>
    </div>
  );
}











// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Plus, Search, Trash2, Globe, Bot } from "lucide-react";

// interface Website {
//   id: string;
//   website_url: string;
//   industry: string;
//   business_type: string;
//   bot_name: string;
//   created_at: string;
//   products?: string[];
// }

// export default function Dashboard() {
// const [websites, setWebsites] = useState<Website[]>([]);
// const [search, setSearch] = useState("");
// const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     async function load() {
//       const res = await fetch("/api/websites");
//       const data = await res.json();

//       if (data.success) {
//     setWebsites(data.websites);
// }

// setLoading(false);
//     }

//     load();
//   }, []);

//   const filtered = websites.filter((site) =>
//   site.website_url
//     .toLowerCase()
//     .includes(search.toLowerCase())
// );
// async function deleteBot(id: string) {
//   const ok = confirm("Delete this bot?");

//   if (!ok) return;

//   const res = await fetch(`/api/websites/${id}`, {
//     method: "DELETE",
//   });

//   const data = await res.json();

//   if (data.success) {
//     setWebsites((prev) =>
//       prev.filter((w) => w.id !== id)
//     );
//   } else {
//     alert(data.error);
//   }
// }

//   return (
    
//    <main className="min-h-screen bg-gray-100 p-10">

// <div className="flex justify-between items-center mb-8">

// <div>
// <h1 className="text-4xl font-bold">
// Dashboard
// </h1>

// <p className="text-gray-600 mt-2">
// Manage your AI bots
// </p>
// </div>

// <Link
// href="/create"
// className="bg-black text-white px-5 py-3 rounded-lg flex items-center gap-2"
// >
// <Plus size={18}/>
// New Bot
// </Link>

// </div>
// <div className="grid grid-cols-3 gap-5 mb-8">

// <div className="bg-white rounded-xl shadow p-5">
// <p className="text-gray-500">
// Bots
// </p>

// <h2 className="text-3xl font-bold">
// {websites.length}
// </h2>
// </div>

// <div className="bg-white rounded-xl shadow p-5">
// <p className="text-gray-500">
// Products
// </p>

// <h2 className="text-3xl font-bold">
// {websites.reduce(
// (a, b) => a + (b.products?.length || 0),
// 0
// )}
// </h2>
// </div>

// <div className="bg-white rounded-xl shadow p-5">
// <p className="text-gray-500">
// Industries
// </p>

// <h2 className="text-3xl font-bold">
// {
// new Set(websites.map(w=>w.industry)).size
// }
// </h2>
// </div>

// </div>
// <div className="relative mb-8">

// <Search
// size={18}
// className="absolute left-4 top-3.5 text-gray-500"
// />

// <input
// value={search}
// onChange={(e)=>setSearch(e.target.value)}
// placeholder="Search websites..."
// className="pl-10 w-full p-3 rounded-lg border bg-white"
// />

// </div>

//       <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

//   {filtered.map((site) => (

//     <div
//       key={site.id}
//       className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border"
//     >

//       {/* Header */}

//       <div className="flex justify-between items-start">

//         <div>

//           <div className="flex items-center gap-2">

//             <Globe
//               size={18}
//               className="text-blue-600"
//             />

//             <h2 className="font-bold text-lg break-all">
//               {site.website_url}
//             </h2>

//           </div>

//           <div className="mt-3 flex items-center gap-2">

//             <Bot
//               size={18}
//               className="text-green-600"
//             />

//             <span className="font-medium">
//               {site.bot_name}
//             </span>

//           </div>

//         </div>

//         <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
//           Active
//         </span>

//       </div>

//       {/* Info */}

//       <div className="mt-6 space-y-2 text-sm">

//         <p>

//           <span className="font-semibold">
//             Industry:
//           </span>{" "}
//           {site.industry}

//         </p>

//         <p>

//           <span className="font-semibold">
//             Business:
//           </span>{" "}
//           {site.business_type}

//         </p>

//         <p>

//           <span className="font-semibold">
//             Products:
//           </span>{" "}
//           {site.products?.length || 0}

//         </p>

//       </div>

//       {/* Footer */}

//       <div className="mt-6 flex justify-between items-center">

//         <span className="text-gray-500 text-sm">

//           {new Date(site.created_at).toLocaleDateString()}

//         </span>

//         <div className="flex gap-2">

//           <Link
//             href={`/dashboard/${site.id}`}
//             className="bg-black text-white px-4 py-2 rounded-lg text-sm"
//           >
//             Details
//           </Link>

//           <button
//             onClick={() => deleteBot(site.id)}
//             className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
//           >
//             <Trash2 size={18}/>
//           </button>

//         </div>

//       </div>

//     </div>

//   ))}

// </div>

//     </main>
    
//   );
  
// }