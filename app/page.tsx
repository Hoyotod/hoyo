import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-[#FFE4E6] flex items-center justify-center p-8 dark:bg-gray-950">
      <div className="max-w-4xl w-full">
        <div className="bg-white border-4 border-black p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-900 dark:border-gray-600">
          <h1 className="text-6xl font-extrabold text-black mb-6 font-mono dark:text-white">
            HOYOACCOUNT
          </h1>
          <p className="text-xl text-black mb-8 font-mono max-w-2xl dark:text-gray-200">
            Manage your Hoyoverse game accounts in one place. Track your
            accounts, store cookie tokens securely, and never lose access to
            your progress.
          </p>
          <div className="flex flex-wrap gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="bg-[#4ECDC4] text-black border-4 border-black px-8 py-4 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600"
              >
                GO TO DASHBOARD
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="bg-[#FF6B6B] text-black border-4 border-black px-8 py-4 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#4ECDC4] text-black border-4 border-black px-8 py-4 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-mono dark:border-gray-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FFE66D] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-yellow-500 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 font-mono text-black dark:text-black">
              Multi-Account
            </h3>
            <p className="font-mono text-sm text-black dark:text-black">
              Manage multiple game accounts in one dashboard
            </p>
          </div>
          <div className="bg-[#95E1D3] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-teal-600 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 font-mono text-black dark:text-white">
              Private Storage
            </h3>
            <p className="font-mono text-sm text-black dark:text-white">
              Cookie tokens kept secret and only visible to you
            </p>
          </div>
          <div className="bg-[#DDA0DD] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-purple-600 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 font-mono text-black dark:text-white">
              Quick Access
            </h3>
            <p className="font-mono text-sm text-black dark:text-white">
              Copy account IDs and tokens instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
