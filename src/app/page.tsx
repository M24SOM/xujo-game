import { ButtonLink } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 text-center">
      <div className="animate-float text-7xl">🎲</div>

      <div className="animate-rise space-y-3">
        <h1 className="bg-gradient-to-br from-white to-violet-300 bg-clip-text text-5xl font-black tracking-tight text-transparent">
          Lucky 20
        </h1>
        <p className="mx-auto max-w-xs text-balance text-violet-200/70">
          Four players, one phone. Take turns picking a number from 1 to 20 and
          reveal your fate — reward, punishment, or out of the game.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <ButtonLink href="/setup" className="w-full">
          Start New Game
        </ButtonLink>
      </div>

      <p className="text-xs text-violet-300/40">
        Pass the phone. No internet rivals — just your friends.
      </p>
    </div>
  );
}
