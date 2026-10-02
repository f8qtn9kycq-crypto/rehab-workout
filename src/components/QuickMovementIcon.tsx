export type QuickMovementId = 'benchPress' | 'shoulderPress' | 'squat' | 'pullUp' | 'dip' | 'latPulldown' | 'seatedRow';

// Two positions communicate the movement without implying a particular weight or machine.
export default function QuickMovementIcon({ id }: { id: QuickMovementId }) {
  const phases = {
    benchPress: <>
      <g stroke="#64748b"><path d="M4 46h43M10 46v12m32-12v12M63 46h40M68 46v12m31-12v12" /></g>
      <circle cx="12" cy="35" r="4"/><path d="M17 36h24l5 10M22 35l-5-9 7-9m12 18-5-9 6-9" />
      <circle cx="70" cy="35" r="4"/><path d="M75 36h23l5 10M80 35V11m14 24V11" />
    </>,
    shoulderPress: <>
      <circle cx="26" cy="20" r="5"/><path d="M26 26v22m-9 11 9-11 9 11m-15-27-8 3-3-12m23 9 8 3 3-12" />
      <circle cx="78" cy="20" r="5"/><path d="M78 26v22m-9 11 9-11 9 11m-15-27-8-7-3-13m23 20 8-7 3-13" />
    </>,
    squat: <>
      <circle cx="26" cy="13" r="5"/><path d="M26 19v24m-7 16 7-16 7 16m-7-32 13 5" />
      <circle cx="79" cy="18" r="5"/><path d="m78 24-7 17 14 5 9-3m-23-2-8 11 14 7m8-13-1 13h14m-22-30 12 5" />
      <g stroke="#64748b"><path d="M3 59h45m54 0h-45" /></g>
    </>,
    pullUp: <>
      <g stroke="#64748b"><path d="M3 8h46m6 0h46" /></g>
      <circle cx="26" cy="28" r="5"/><path d="m22 34-1 13m9-13 1 13m-10 0-6 12m16-12 6 12m-15-25-10-10-1-16m19 26 10-10 1-16" />
      <circle cx="78" cy="17" r="5"/><path d="m74 23-1 20m9-20 1 20m-10 0-6 16m16-16 6 16m-15-34-10-5-1-12m19 17 10-5 1-12" />
    </>,
    dip: <>
      <g stroke="#64748b"><path d="M3 31h17m12 0h17M8 31v28m36-28v28M55 31h17m12 0h17M60 31v28m36-28v28" /></g>
      <circle cx="26" cy="15" r="5"/><path d="M26 21v22m0 0-6 9 9 4m-3-13 8 9 8 4m-20-29-8 5-6-1m22-4 8 5 6-1" />
      <circle cx="78" cy="23" r="5"/><path d="M78 29v20m0 0-7 5 8 4m-1-9 9 5 8 4m-20-24-9 8-6-11m21 3 9 8 6-11" />
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

  return <svg viewBox="0 0 104 64" width="104" height="64" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="max-w-full shrink-0 text-calm-800">
    <path d="M52 7v51" stroke="#cbd5e1" strokeWidth="1" />
    {phases}
  </svg>;
}
