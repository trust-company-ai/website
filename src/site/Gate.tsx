import { useAction, useQuery } from "convex/react";
import { SITE } from "@/lib/constants";
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { getGateToken, setGateToken, setGateUser } from "@/lib/gate";
import { api } from "../../convex/_generated/api";

/** Whole-site password gate. Nothing renders until the password is entered; asked on every visit. */
export function Gate({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | undefined>(getGateToken);
  const valid = useQuery(api.gate.check, { token });
  if (valid === undefined) return null;
  if (valid) return <>{children}</>;
  return (
    <GateScreen
      onUnlocked={t => {
        setGateToken(t);
        setToken(t);
      }}
    />
  );
}

/** The front door: a white page with one password box and nothing else. */
function GateScreen({ onUnlocked }: { onUnlocked: (t: string) => void }) {
  const unlock = useAction(api.gate.unlock);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setWrong(false);
    try {
      const t = await unlock({ password, site: SITE });
      if (t) {
        setGateUser("");
        onUnlocked(t);
      } else setWrong(true);
    } catch {
      setWrong(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      data-testid="gate"
      className="flex min-h-screen items-center justify-center bg-white px-6 text-ink antialiased"
    >
      <form
        onSubmit={submit}
        data-testid="gate-enter"
        aria-label="Sign in"
        className="w-full max-w-md"
      >
        <label htmlFor="gate-password" className="sr-only">
          Password
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="gate-password"
            placeholder="Password"
            aria-label="Password"
            data-testid="gate-password"
            type="password"
            autoComplete="current-password"
            ref={inputRef}
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setWrong(false);
            }}
            aria-invalid={wrong || undefined}
            className={`h-14 w-full rounded-full border bg-white px-6 text-lg text-ink outline-none transition-[box-shadow,border-color] duration-300 placeholder:text-ink/35 focus:border-navy focus:ring-2 focus:ring-navy/25 ${
              wrong ? "border-red-400" : "border-black/15"
            }`}
          />
          <button
            type="submit"
            data-testid="gate-submit"
            disabled={busy || !password.trim()}
            className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-navy px-8 text-lg font-medium text-white transition-opacity duration-300 hover:opacity-90 disabled:opacity-40"
          >
            Enter
          </button>
        </div>
        <p
          data-testid="gate-error"
          className="mt-3 min-h-6 text-center text-sm text-red-600 sm:text-left"
        >
          {wrong ? "That password is not right." : ""}
        </p>
      </form>
    </div>
  );
}
