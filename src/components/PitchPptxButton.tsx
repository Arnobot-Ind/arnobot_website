'use client';

import { useState } from 'react';

/**
 * Rail button on /pitch. The exporter and pptxgenjs (~500 kB) load only when
 * someone asks for the file, never with the page.
 */
export default function PitchPptxButton() {
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle');

  const download = async () => {
    setState('busy');
    try {
      const { downloadPitchDeck } = await import('@/lib/pitch-pptx');
      await downloadPitchDeck();
      setState('idle');
    } catch (err) {
      console.error('Pitch deck export failed', err);
      setState('failed');
    }
  };

  return (
    <button type="button" className="ppt-btn" onClick={download} disabled={state === 'busy'} aria-busy={state === 'busy'}>
      <span aria-hidden="true">↓</span>
      {state === 'busy' ? 'Preparing…' : state === 'failed' ? 'Failed — retry' : 'Download PPT'}
    </button>
  );
}
