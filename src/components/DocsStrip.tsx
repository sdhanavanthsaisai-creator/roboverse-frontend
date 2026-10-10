'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import './DocsStrip.css';

export interface DocItem {
  src: string;
  alt: string;
  code: string;
  title: string;
}

/* SAMPLE entries — swap src/alt/code/title for the real 4–5 PDFs + covers
   when they land tomorrow. Layout keys off array order, nothing else. */
const SAMPLE_DOCS: DocItem[] = [
  {
    src: 'https://picsum.photos/seed/rat-doc1/600/600?grayscale',
    alt: 'RAT design document cover',
    code: '# 01',
    title: 'Design Document — Draft 3',
  },
  {
    src: 'https://picsum.photos/seed/rat-doc2/600/600?grayscale',
    alt: 'Maze test log cover',
    code: '# 02',
    title: 'Maze Test Log',
  },
  {
    src: 'https://picsum.photos/seed/rat-doc3/600/600?grayscale',
    alt: 'Power budget sheet cover',
    code: '# 03',
    title: 'Power Budget Sheet',
  },
  {
    src: 'https://picsum.photos/seed/rat-doc4/600/600?grayscale',
    alt: 'Chassis CAD export cover',
    code: '# 04',
    title: 'Chassis CAD Export',
  },
  {
    src: 'https://picsum.photos/seed/rat-doc5/600/600?grayscale',
    alt: 'Run 1 vs Run 2 report cover',
    code: '# 05',
    title: 'Run 1 vs Run 2 Report',
  },
];

const DocsStrip = ({ images = SAMPLE_DOCS }: { images?: DocItem[] }) => {
  const [activeImage, setActiveImage] = useState<number | null>(1);
  /* Phone only — false on laptop, so desktop sizes are byte-identical. */
  const small = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width:760px)').matches,
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="docs-strip"
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full">
        <div className="docs-row">
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="docs-cell"
              initial={{ width: '2.5rem', height: '20rem' }}
              animate={{
                width: activeImage === index ? (small ? '62vw' : '24rem') : small ? '2.75rem' : '5rem',
                height: small ? '18rem' : '24rem',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={() => setActiveImage(index)}
              onHoverStart={() => setActiveImage(index)}
            >
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="docs-shade"
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="docs-caption"
                  >
                    <p className="docs-code">{image.code}</p>
                    <p className="docs-title">{image.title}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <img src={image.src} className="docs-img" alt={image.alt} loading="lazy" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DocsStrip;
