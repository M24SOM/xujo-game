import Link from "next/link";
import { PlayerNameForm } from "@/features/setup/components/PlayerNameForm";

export default function SetupPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 animate-rise">
      <header className="space-y-1">
        <Link
          href="/"
          className="text-sm text-violet-300/50 transition-colors hover:text-violet-200"
        >
          ← Back
        </Link>
        <h1 className="text-3xl font-black tracking-tight">Who&apos;s playing?</h1>
        <p className="text-violet-200/60">Name your four players, then start.</p>
      </header>

      <PlayerNameForm />
    </div>
  );
}
