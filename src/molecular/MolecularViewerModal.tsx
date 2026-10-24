import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import * as THREE from 'three';
import type { BiologicalNode } from '../types/biology.types';
import { NODE_INK, HIGHLIGHT } from '../ui/theme';
import { useGameStore } from '../game/GameStore';
import { t } from '../i18n';

/** Artistic, non-structural rendering of a protein: a folded bead chain. */
const MolecularScene: React.FC<{ node: BiologicalNode }> = ({ node }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const ink = NODE_INK[node.type];

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const w = el.clientWidth;
    const h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 8);
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const light = new THREE.DirectionalLight(0xffffff, 1.3);
    light.position.set(3, 5, 6);
    scene.add(light);

    const group = new THREE.Group();
    scene.add(group);

    // Seeded pseudo-random walk so each protein gets a stable "fold"
    let seed = [...node.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

    const points: THREE.Vector3[] = [];
    const p = new THREE.Vector3();
    for (let i = 0; i < 70; i++) {
      const helix = Math.floor(i / 12) % 2 === 0;
      if (helix) {
        p.add(new THREE.Vector3(Math.cos(i * 1.7) * 0.32, 0.12, Math.sin(i * 1.7) * 0.32));
      } else {
        p.add(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.7));
      }
      p.clampLength(0, 2.2);
      points.push(p.clone());
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 300, 0.11, 8, false),
      new THREE.MeshStandardMaterial({ color: ink, roughness: 0.55 }),
    );
    group.add(tube);

    // Highlight a pocket as the "active site"
    const site = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 20, 14),
      new THREE.MeshStandardMaterial({ color: HIGHLIGHT, roughness: 0.4 }),
    );
    site.position.copy(points[Math.floor(points.length / 2)]);
    group.add(site);

    const center = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3());
    group.children.forEach(c => c.position.sub(center));

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      group.rotation.y += 0.006;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [node.id, ink]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />;
};

export const MolecularViewerModal: React.FC<{ node: BiologicalNode; onClose: () => void }> = ({ node, onClose }) => {
  const language = useGameStore(s => s.language);
  const i18n = t(language);
  const pdb = typeof node.metadata.pdb === 'string' ? node.metadata.pdb : null;
  const uniprotQuery = encodeURIComponent(node.scientificName ?? node.label);

  return (
    <motion.div
      className="overlay"
      style={{ zIndex: 120 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="card modal modal--wide"
        style={{ padding: 0, display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="graph-paper" style={{ flex: '1 1 280px', height: 300, position: 'relative' }}>
          <MolecularScene node={node} />
          <span className="faint" style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 11.5 }}>
            {i18n.molecular.artisticNote}
          </span>
        </div>
        <div style={{ flex: '1 1 280px', padding: 22, position: 'relative' }}>
          <button className="btn btn--quiet" style={{ position: 'absolute', top: 10, right: 10 }} onClick={onClose} aria-label={i18n.molecular.close}>
            <X size={16} />
          </button>
          <span className="eyebrow">{i18n.molecular.title}</span>
          <div className="inspector__title" style={{ paddingRight: 30 }}>{node.label}</div>
          {node.scientificName && (
            <>
              <div className="eyebrow" style={{ marginTop: 10 }}>{i18n.molecular.origin}</div>
              <div className="italic small muted">{node.scientificName}</div>
            </>
          )}
          <div className="eyebrow" style={{ marginTop: 10 }}>{i18n.molecular.function}</div>
          <p className="small muted">{node.description}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14 }}>
            {pdb && (
              <a className="btn btn--ghost" href={`https://www.rcsb.org/structure/${pdb}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={14} /> {i18n.molecular.pdbLink} ({pdb})
              </a>
            )}
            <a className="btn btn--quiet" href={`https://www.uniprot.org/uniprotkb?query=${uniprotQuery}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> {i18n.molecular.uniprot}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
