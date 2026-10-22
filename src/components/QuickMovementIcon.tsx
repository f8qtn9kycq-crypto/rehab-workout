export type QuickMovementId = 'benchPress' | 'shoulderPress' | 'squat' | 'pullUp' | 'dip' | 'latPulldown' | 'seatedRow';

// Two black-line positions follow the supplied mobile reference; the text label stays outside the drawing.
export default function QuickMovementIcon({ id }: { id: QuickMovementId }) {
  const phases = {
    benchPress: <>
      <g stroke="#64748b"><path d="M4 46h43M10 46v12m32-12v12M63 46h40M68 46v12m31-12v12" /></g>
      <circle cx="12" cy="35" r="4"/><path d="M17 36h24l5 10M22 35l-5-9 7-9m12 18-5-9 6-9M17 26h24" />
      <path d="M18 22v8m-3-8v8m29-8v8m-3-8v8" strokeWidth="1.5" />
      <circle cx="70" cy="35" r="4"/><path d="M75 36h23l5 10M80 35V11m14 24V11M74 11h26" />
      <path d="M77 7v8m-3-8v8m29-8v8m-3-8v8" strokeWidth="1.5" />
    </>,
    shoulderPress: <>
      <circle cx="26" cy="20" r="5"/><path d="M20 27q-4 9-1 21h14q3-12-1-21M19 48l-3 11m17-11 3 11m-16-27-8 3-3-12m23 9 8 3 3-12M4 22h10m24 0h10" />
      <path d="M6 18v8m-3-8v8m43-8v8m-3-8v8" strokeWidth="1.5" />
      <circle cx="78" cy="20" r="5"/><path d="M72 27q-4 9-1 21h14q3-12-1-21M71 48l-3 11m17-11 3 11m-16-27-8-7-3-13m23 20 8-7 3-13M56 9h10m24 0h10" />
      <path d="M58 5v8m-3-8v8m43-8v8m-3-8v8" strokeWidth="1.5" />
    </>,
    squat: <>
      <circle cx="26" cy="13" r="5"/><path d="M20 20q-4 12-1 24h14q3-12-1-24M19 44l-3 15m17-15 3 15m-19-34 7 5m8-5-7 5" />
      <path d="M3 24h45m-42-4v8m39-8v8" strokeWidth="1.5" />
      <circle cx="79" cy="18" r="5"/><path d="M73 24q-5 7-7 16l17 7 9-7-3-12-7-4m-16 16-5 10 15 9m7-12 1 12h14m-27-30 7 4m10-4-7 4" />
      <path d="M57 28h45m-42-4v8m39-8v8" strokeWidth="1.5" />
      <g stroke="#64748b"><path d="M3 59h45m54 0h-45" /></g>
    </>,
    pullUp: <>
      <g stroke="#64748b"><path d="M3 8h46m6 0h46" /></g>
      <circle cx="26" cy="28" r="5"/><path d="M20 34q-3 6-1 14h14q2-8-1-14m-13 14-5 11m19-11 5 11m-18-25-10-10-1-16m23 26 10-10 1-16" />
      <circle cx="78" cy="17" r="5"/><path d="M72 23q-3 8-1 21h14q2-13-1-21m-13 21-5 15m19-15 5 15m-18-20-10-5-1-12m23 17 10-5 1-12" />
    </>,
    dip: <>
      <g stroke="#64748b"><path d="M2 37h18m-16 0v22m13-22v22M54 37h18m-16 0v22m13-22v22" /></g>
      <circle cx="27" cy="18" r="5"/><path d="M27 24l-2 21m0 0 12 1 7 13m-19-14-8 8-6 6m14-31-9 9m13-9-9 9" />
      <circle cx="79" cy="26" r="5"/><path d="M79 32l-2 18m0 0 12 1 8 8m-20-9-9 4-7 5m16-23-9 10m13-10-9 10" />
    </>,
    latPulldown: <>
      <g stroke="#64748b"><path d="M26 6v8M10 16h32M78 6v18M62 26h32M14 48h24m-21 0v11m49-11h24m-21 0v11" /></g>
      <circle cx="26" cy="30" r="5"/><path d="M26 36v13m-9 10 9-10 9 10m-5-22 11-11V16m-19 21-11-11V16" />
      <circle cx="78" cy="36" r="5"/><path d="M78 42v8m-9 9 9-9 9 9m-13-17-12-6V26m20 16 12-6V26" />
    </>,
    seatedRow: <>
      <g stroke="#64748b"><path d="M30 47h18m-12 0v12m46-12h18m-12 0v12" /><circle cx="5" cy="36" r="2"/><circle cx="57" cy="36" r="2"/></g>
      <circle cx="38" cy="22" r="5"/><path d="m38 28-3 19-14 2-11 10m11-10 8 10m6-26-12 4-13-1M7 36h3" />
      <circle cx="90" cy="22" r="5"/><path d="m90 28-2 19-14 2-11 10m11-10 8 10m14-26-10 4-8-1M59 36h19" />
    </>,
  }[id];

  return <svg viewBox="0 0 104 64" width="104" height="64" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="max-w-full shrink-0 text-ink">
    <path d="M52 7v51" stroke="#cbd5e1" strokeWidth="1" />
    {phases}
  </svg>;
}
