import Link from "next/link";

export default function FooIndexPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-4">
          Streaming Examples
        </h1>
        <p className="text-gray-400 mb-8">
          Explore different approaches to streaming data with Effect RPC and
          Next.js
        </p>

        <div className="grid gap-6">
          {/* Client Component Example */}
          <Link href="/foo/client-component">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-2xl font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  Client Component
                </h2>
                <span className="text-xs text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                  Progressive
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Uses <code className="text-cyan-400 bg-slate-900/50 px-2 py-0.5 rounded">"use client"</code> with{" "}
                <code className="text-cyan-400 bg-slate-900/50 px-2 py-0.5 rounded">Stream.runForEach()</code> to
                render items progressively as they arrive from the server.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>Items appear one by one</span>
              </div>
            </div>
          </Link>

          {/* Server Component Example */}
          <Link href="/foo/server-component">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-2xl font-semibold text-white group-hover:text-green-400 transition-colors">
                  Server Component
                </h2>
                <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                  All at Once
                </span>
              </div>
              <p className="text-gray-400 mb-4">
                Traditional server component that uses{" "}
                <code className="text-green-400 bg-slate-900/50 px-2 py-0.5 rounded">Stream.runCollect()</code> to
                fetch all data on the server before rendering.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span>Full page loads after all items are ready</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About These Examples
          </h3>
          <p className="text-gray-400 text-sm">
            Both examples fetch the same data from{" "}
            <code className="text-purple-400 bg-slate-900/50 px-2 py-0.5 rounded">
              http://localhost:8000/rpc
            </code>{" "}
            using Effect RPC. The difference is in how they render the results:
            progressively (client) or all at once (server).
          </p>
        </div>
      </div>
    </div>
  );
}
