import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import AddAccountModal from "./AddAccountModal";
import AccountActions from "./AccountActions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [totalUsers, totalAccounts, userAccounts] = await Promise.all([
    prisma.user.count(),
    prisma.account.count(),
    prisma.account.findMany({
      where: { userId: session.user.id },
      omit: { cookieToken: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#FFF3E0] p-8 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-extrabold text-black font-mono dark:text-white">
            DASHBOARD
          </h1>
          <AddAccountModal />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#FFE66D] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-yellow-500 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 font-mono text-black dark:text-black">
              TOTAL USERS
            </h3>
            <p className="text-4xl font-extrabold font-mono text-black dark:text-black">
              {totalUsers}
            </p>
          </div>
          <div className="bg-[#95E1D3] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-teal-600 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 font-mono text-black dark:text-white">
              TOTAL ACCOUNTS
            </h3>
            <p className="text-4xl font-extrabold font-mono text-black dark:text-white">
              {totalAccounts}
            </p>
          </div>
          <div className="bg-[#DDA0DD] border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-purple-600 dark:border-gray-700">
            <h3 className="font-bold text-lg mb-2 font-mono text-black dark:text-white">
              YOUR ACCOUNTS
            </h3>
            <p className="text-4xl font-extrabold font-mono text-black dark:text-white">
              {userAccounts.length}
            </p>
          </div>
        </div>

        <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-900 dark:border-gray-600">
          <h2 className="text-2xl font-extrabold mb-6 font-mono text-black dark:text-white">
            YOUR ACCOUNTS
          </h2>
          {userAccounts.length === 0 ? (
            <p className="font-mono text-gray-600 dark:text-gray-400">
              No accounts yet. Add your first Hoyoverse account!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FFE4E6] dark:bg-gray-800">
                    <th className="border-4 border-black p-3 text-left font-mono text-black dark:text-white dark:border-gray-600">
                      #
                    </th>
                    <th className="border-4 border-black p-3 text-left font-mono text-black dark:text-white dark:border-gray-600">
                      NAME
                    </th>
                    <th className="border-4 border-black p-3 text-left font-mono text-black dark:text-white dark:border-gray-600">
                      ACCOUNT ID
                    </th>
                    <th className="border-4 border-black p-3 text-left font-mono text-black dark:text-white dark:border-gray-600">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userAccounts.map((account, index) => (
                    <tr key={account.id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <td className="border-4 border-black p-3 font-mono text-sm text-black dark:text-gray-200 dark:border-gray-600">
                        {index + 1}
                      </td>
                      <td className="border-4 border-black p-3 font-mono text-black dark:text-white dark:border-gray-600">
                        {account.name}
                      </td>
                      <td className="border-4 border-black p-3 font-mono text-sm text-black dark:text-gray-200 dark:border-gray-600">
                        {account.accountId}
                      </td>
                      <td className="border-4 border-black p-3 font-mono text-sm text-black dark:text-gray-200 dark:border-gray-600">
                        <AccountActions account={account} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
