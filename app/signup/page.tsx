"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "../../lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function signup() {
    setLoading(true);

    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Account created successfully!");

    router.push("/login");
  }

  return (
    <main className="relative min-h-screen flex justify-center items-center overflow-hidden bg-black px-4">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-red-700/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-red-900/30 blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative w-full max-w-[400px]">
        <div className="rounded-2xl border border-red-900/40 bg-white/[0.04] p-8 shadow-2xl shadow-black/60 backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-white/50">
              Start your journey with us today
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/70">
                Email
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 17.25V6.75zm0 0L12 13.5l9.75-6.75"
                  />
                </svg>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-red-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-red-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/70">
                Password
              </label>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-red-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-red-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={signup}
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-800 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-700/30 transition-all hover:shadow-red-600/50 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
            >
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
              )}
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-red-400 transition-colors hover:text-red-300"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}









// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { supabaseClient } from "../../lib/supabaseClient";

// export default function SignupPage() {
//   const router = useRouter();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);

//   async function signup() {
//     setLoading(true);

//     const { error } = await supabaseClient.auth.signUp({
//       email,
//       password,
//     });

//     setLoading(false);

//     if (error) {
//       alert(error.message);
//       return;
//     }

//     alert("Account created successfully!");

//     router.push("/login");
//   }

//   return (
//     <main className="min-h-screen flex justify-center items-center bg-gray-100">

//       <div className="bg-white shadow-xl rounded-xl p-8 w-[400px]">

//         <h1 className="text-3xl font-bold mb-6">
//           Create Account
//         </h1>

//         <input
//           type="email"
//           placeholder="Email"
//           className="border p-3 rounded w-full mb-4"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           className="border p-3 rounded w-full mb-6"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           onClick={signup}
//           disabled={loading}
//           className="bg-blue-600 text-white w-full py-3 rounded-lg"
//         >
//           {loading ? "Creating..." : "Create Account"}
//         </button>

//       </div>

//     </main>
//   );
// }