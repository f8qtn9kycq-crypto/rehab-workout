import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AnatomicalBodyMap, { regionKey, type RegionSelection } from '../../src/components/AnatomicalBodyMap';
import { I18nProvider } from '../../src/services/i18n';
function Example() {
  const [selected, setSelected] = useState<RegionSelection[]>([]);
  return <AnatomicalBodyMap selected={selected} activeKey={selected[0] && regionKey(selected[0])} onSelect={r => setSelected([r])} />;
}
createRoot(document.getElementById('fixture')!).render(<I18nProvider><div data-testid="first-detailed-map"><Example /></div><div data-testid="second-detailed-map"><Example /></div></I18nProvider>);
