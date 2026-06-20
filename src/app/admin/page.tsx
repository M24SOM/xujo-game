import { isAdmin } from "@/lib/admin-auth";
import { getOutcomes } from "@/features/game/queries";
import { PinForm } from "@/features/admin/components/PinForm";
import { OutcomesEditor } from "@/features/admin/components/OutcomesEditor";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <PinForm />;
  }

  const outcomes = await getOutcomes();
  return (
    <div className="animate-fade-in flex flex-1 flex-col">
      <OutcomesEditor initialOutcomes={outcomes} />
    </div>
  );
}
