import { i18n } from "../lib/i18n/index.svelte";
import { NormalizedDeparture } from "../types/dashboard.types";

function getDepartureColorClass(dep: NormalizedDeparture): string {
    if (dep.isCancelled) {
        return 'text-red-400/80 line-through';
    }
    if (!dep.isRealtime) {
        return 'text-emerald-400 font-semibold';
    }
    if (dep.delayMinutes > 0) {
        return 'text-rose-400 font-extrabold';
    }
    return `text-emerald-400 font-extrabold ${dep.departureInMinutes <= 2 ? 'animate-pulse' : ''}`;
}

function formatDepartureTime(dep: NormalizedDeparture): string {
    const time = dep.isRealtime ? dep.realtimeTime : dep.plannedTime;
    const d = new Date(time);
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function formatRelativeTime(dep: NormalizedDeparture): { text: string; suffix: string } | null {
    if (dep.departureInMinutes <= 0) return null;
    if (dep.departureInMinutes >= 60) {
      const h = Math.floor(dep.departureInMinutes / 60);
      const m = dep.departureInMinutes % 60;
      return { text: `${h}h${m > 0 ? ` ${m}` : ''}`, suffix: m > 0 ? i18n.t('transit.min') : '' };
    }
    return { text: `${dep.departureInMinutes}`, suffix: i18n.t('transit.min') };
  }

export default { getDepartureColorClass, formatDepartureTime, formatRelativeTime };