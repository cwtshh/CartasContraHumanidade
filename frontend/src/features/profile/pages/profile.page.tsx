import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@heroui/react";
import { routePaths } from "@/app/router/route-paths";
import { useCurrentPlayer } from "@/shared/hooks/use-current-player";
import { usePrejudiceStats } from "../hooks/use-prejudice-stats";
import type { PrejudiceCategory } from "../types/profile.types";

const CATEGORY_LABELS: Record<PrejudiceCategory, string> = {
  RACISMO: "Racismo",
  MACHISMO: "Machismo",
  HOMOFOBIA: "Homofobia",
  GORDOFOBIA: "Gordofobia",
  CAPACITISMO: "Capacitismo",
  XENOFOBIA: "Xenofobia",
  RELIGIAO: "Religião",
  ETARISMO: "Etarismo",
  CLASSISMO: "Classismo",
  POLITICA: "Política",
};

export function ProfilePage() {
  const navigate = useNavigate();
  const player = useCurrentPlayer();
  const stats = usePrejudiceStats();

  if (!player) {
    return null;
  }

  return (
    <div className="text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <span className="mb-2 block font-mono text-xs tracking-widest text-muted uppercase">
            Perfil de {player.name}
          </span>
          <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-foreground">
            Preconceituômetro
          </h1>
          <p className="mb-8 text-sm text-muted">
            Um raio-x (nada científico) das cartas brancas que você mais joga,
            baseado no seu histórico de partidas.
          </p>
        </motion.div>

        {player.isGuest ? (
          <div className="rounded-xl border border-border bg-surface px-6 py-10 text-center">
            <p className="mb-4 font-medium text-foreground">
              Convidados não têm um perfil salvo entre partidas.
            </p>
            <p className="mb-6 text-sm text-muted">
              Crie uma conta pra desbloquear o Preconceituômetro e acompanhar
              seu histórico.
            </p>
            <Button
              type="button"
              onClick={() => navigate(routePaths.signUp)}
              className="mx-auto"
            >
              Criar conta
            </Button>
          </div>
        ) : stats.isPending ? (
          <p className="py-16 text-center font-mono text-xs text-muted uppercase">
            Carregando...
          </p>
        ) : stats.isError ? (
          <p className="py-16 text-center font-mono text-xs text-muted uppercase">
            Não foi possível carregar seu perfil.
          </p>
        ) : stats.data.totalTaggedCardsSubmitted === 0 ? (
          <div className="rounded-xl border border-border bg-surface px-6 py-10 text-center">
            <p className="font-medium text-foreground">
              Ainda não há dados suficientes.
            </p>
            <p className="mt-2 text-sm text-muted">
              Jogue algumas rodadas para revelar seus preconceitos favoritos.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart
                data={stats.data.categories.map((c) => ({
                  category: CATEGORY_LABELS[c.category],
                  percentage: c.percentage,
                  count: c.count,
                }))}
              >
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                />
                <Radar
                  dataKey="percentage"
                  stroke="var(--danger)"
                  fill="var(--danger)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
              {stats.data.categories
                .filter((c) => c.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((c) => (
                  <div
                    key={c.category}
                    className="rounded-lg bg-surface-secondary px-2 py-2 text-center"
                  >
                    <span className="block font-mono text-[10px] text-muted uppercase">
                      {CATEGORY_LABELS[c.category]}
                    </span>
                    <span className="block font-display text-lg font-bold text-foreground">
                      {c.count}
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
