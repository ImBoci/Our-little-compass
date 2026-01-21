import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- INLINE SERVER ACTIONS (Build Safe) ---
async function deleteFoodAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) {
    await prisma.food.delete({ where: { id } });
    revalidatePath("/manage");
  }
}

async function deleteActivityAction(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) {
    await prisma.activity.delete({ where: { id: parseInt(id) } });
    revalidatePath("/manage");
  }
}

async function addFoodAction(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string || null;
  const category = formData.get("category") as string || "Other";
  await prisma.food.create({ data: { name, description, category } });
  revalidatePath("/manage");
}

async function addActivityAction(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string || null;
  const location = formData.get("location") as string || null;
  const type = formData.get("type") as string || null;
  await prisma.activity.create({ data: { name, description, location, type } });
  revalidatePath("/manage");
}

// --- PAGE COMPONENT ---
export const dynamic = "force-dynamic";

export default async function ManagePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You must be logged in to view this page.</p>
        <a href="/" className="mt-4 text-blue-500 hover:underline">Return Home</a>
      </div>
    );
  }

  const foods = await prisma.food.findMany({ orderBy: { id: 'desc' } });
  const activities = await prisma.activity.findMany({ orderBy: { id: 'desc' } });

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Database</h1>
        <form action={async () => {
          "use server";
          redirect("/api/auth/signout");
        }}>
           <button className="bg-red-500 text-white px-4 py-2 rounded">Log Out</button>
        </form>
      </div>

      {/* --- FOOD SECTION --- */}
      <section className="mb-12 bg-white/80 backdrop-blur-sm p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Foods</h2>

        <form action={addFoodAction} className="mb-6 flex gap-2 flex-wrap">
          <input name="name" placeholder="Food Name" required className="border p-2 rounded flex-1" />
          <input name="description" placeholder="Description" className="border p-2 rounded flex-1" />
          <input name="category" placeholder="Category" defaultValue="Other" className="border p-2 rounded w-32" />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Add</button>
        </form>

        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {foods.map((food) => (
            <li key={food.id} className="flex justify-between items-center bg-white p-3 rounded border">
              <span className="text-gray-700"><strong>{food.name}</strong> - {food.description}</span>
              <form action={deleteFoodAction}>
                <input type="hidden" name="id" value={food.id} />
                <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-3">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {/* --- ACTIVITY SECTION --- */}
      <section className="bg-white/80 backdrop-blur-sm p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Activities</h2>

        <form action={addActivityAction} className="mb-6 flex gap-2 flex-wrap">
          <input name="name" placeholder="Activity Name" required className="border p-2 rounded flex-1" />
          <input name="type" placeholder="Type" className="border p-2 rounded w-32" />
          <input name="location" placeholder="Location" className="border p-2 rounded flex-1" />
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Add</button>
        </form>

        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {activities.map((act) => (
            <li key={act.id} className="flex justify-between items-center bg-white p-3 rounded border">
              <div>
                <strong className="text-gray-800">{act.name}</strong>
                {act.type && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{act.type}</span>}
                <div className="text-sm text-gray-500">{act.location}</div>
              </div>
              <form action={deleteActivityAction}>
                <input type="hidden" name="id" value={act.id.toString()} />
                <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-3">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}