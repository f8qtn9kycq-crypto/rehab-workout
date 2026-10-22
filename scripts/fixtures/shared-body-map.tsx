import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '../../src/services/i18n';
import BodyMapSelector from '../../src/components/BodyMapSelector';
import type { BodyArea } from '../../src/types/rehab';

function Fixture() {
  const [first, setFirst] = useState<BodyArea | 'all'>('all');
  const [second, setSecond] = useState<BodyArea | 'all'>('all');
  return <I18nProvider><div className="page space-y-5">
    <section data-testid="first-map"><BodyMapSelector selected={first} onChange={setFirst} /></section>
    <section data-testid="second-map"><BodyMapSelector selected={second} onChange={setSecond}
      availability={{ shoulder: 0, shoulder_neck: 1, hip: 1, knee: 1, ankle: 1 }} /></section>
  </div></I18nProvider>;
}

createRoot(document.getElementById('fixture')!).render(<Fixture />);
