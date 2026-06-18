import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="text-6xl">🤷</div>
      <div>
        <h1 className="text-2xl font-black">Game not found</h1>
        <p className="mt-1 text-violet-200/60">
          This game doesn&apos;t exist or has expired.
        </p>
      </div>
      <ButtonLink href="/">Start a new game</ButtonLink>
    </div>
  );
}
