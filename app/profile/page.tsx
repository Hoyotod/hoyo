import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { authOptions } from "@/auth";
import ProfileForm from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, webhook: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#E0F7FA] flex items-center justify-center p-8 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:bg-gray-900 dark:border-gray-600">
          <h2 className="text-3xl font-extrabold text-black mb-8 font-mono text-center dark:text-white">
            EDIT PROFILE
          </h2>
          <ProfileForm
            initialName={user.name}
            initialEmail={user.email}
            initialWebhook={user.webhook}
          />
        </div>
      </div>
    </div>
  );
}
