import { Action } from "svelte/action";
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

const dragScrollY: Action<HTMLElement> = (node) => {
    let isDown = false;
    let startY: number;
    let scrollTop: number;

    const start = (e: MouseEvent | TouchEvent) => {
        isDown = true;
        // Type guard: Check if it's a touch event or mouse event
        const pageY = 'touches' in e ? e.touches[0].pageY : (e as MouseEvent).pageY;

        startY = pageY - node.offsetTop;
        scrollTop = node.scrollTop;
        node.style.cursor = 'grabbing';
    };

    const end = () => {
        isDown = false;
        node.style.cursor = 'default';
    };

    const move = (e: MouseEvent | TouchEvent) => {
        if (!isDown) return;
        e.preventDefault();

        const pageY = 'touches' in e ? e.touches[0].pageY : (e as MouseEvent).pageY;
        const y = pageY - node.offsetTop;
        const walk = (y - startY) * 1.5; // Scroll multiplier

        node.scrollTop = scrollTop - walk;
    };

    // Cast as EventListener to satisfy TypeScript's strict DOM types
    node.addEventListener('mousedown', start as EventListener);
    node.addEventListener('touchstart', start as EventListener, { passive: false });

    node.addEventListener('mouseleave', end);
    node.addEventListener('mouseup', end);
    node.addEventListener('touchend', end);

    node.addEventListener('mousemove', move as EventListener);
    node.addEventListener('touchmove', move as EventListener, { passive: false });

    return {
        destroy() {
            node.removeEventListener('mousedown', start as EventListener);
            node.removeEventListener('touchstart', start as EventListener);
            node.removeEventListener('mouseleave', end);
            node.removeEventListener('mouseup', end);
            node.removeEventListener('touchend', end);
            node.removeEventListener('mousemove', move as EventListener);
            node.removeEventListener('touchmove', move as EventListener);
        }
    };
};

const dragScrollX: Action<HTMLElement> = (node) => {
    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const start = (e: MouseEvent | TouchEvent) => {
      isDown = true;
      // Type guard for touch vs mouse
      const pageX = 'touches' in e ? e.touches[0].pageX : (e as MouseEvent).pageX;
      
      startX = pageX - node.offsetLeft;
      scrollLeft = node.scrollLeft;
      node.style.cursor = 'grabbing';
    };

    const end = () => {
      isDown = false;
      node.style.cursor = 'default';
    };

    const move = (e: MouseEvent | TouchEvent) => {
      if (!isDown) return;
      e.preventDefault(); // Prevents highlighting and native swipe-back gestures
      
      const pageX = 'touches' in e ? e.touches[0].pageX : (e as MouseEvent).pageX;
      const x = pageX - node.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll multiplier
      
      node.scrollLeft = scrollLeft - walk;
    };

    node.addEventListener('mousedown', start as EventListener);
    node.addEventListener('touchstart', start as EventListener, { passive: false });
    
    node.addEventListener('mouseleave', end);
    node.addEventListener('mouseup', end);
    node.addEventListener('touchend', end);
    
    node.addEventListener('mousemove', move as EventListener);
    node.addEventListener('touchmove', move as EventListener, { passive: false });

    return {
      destroy() {
        node.removeEventListener('mousedown', start as EventListener);
        node.removeEventListener('touchstart', start as EventListener);
        node.removeEventListener('mouseleave', end);
        node.removeEventListener('mouseup', end);
        node.removeEventListener('touchend', end);
        node.removeEventListener('mousemove', move as EventListener);
        node.removeEventListener('touchmove', move as EventListener);
      }
    };
  };

export default { getDepartureColorClass, formatDepartureTime, formatRelativeTime, dragScrollY, dragScrollX };