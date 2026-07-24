'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { playSoundFX } from '@/lib/audio';
import { Shield, Flame, Heart, Swords, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  onMonsterDefeated: (exp: number, gold: number, crystal: number) => void;
  castSpellTrigger: { type: 'fire' | 'ice' | 'thunder' | 'wind' | 'light' | 'shadow'; id: number } | null;
}

export const ThreeBattleArena: React.FC<Props> = ({ onMonsterDefeated, castSpellTrigger }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Player & Monster state
  const [playerHp, setPlayerHp] = useState(200);
  const maxPlayerHp = 200;

  const [monsterHp, setMonsterHp] = useState(300);
  const [maxMonsterHp, setMaxMonsterHp] = useState(300);
  const [monsterName, setMonsterName] = useState('Obsidian Golem');
  const [monsterType, setMonsterType] = useState<'golem' | 'dragon' | 'boss'>('golem');
  const [wave, setWave] = useState(1);

  const [isShieldActive, setIsShieldActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastPlayerDamage, setLastPlayerDamage] = useState<number | null>(null);
  const [lastMonsterDamage, setLastMonsterDamage] = useState<number | null>(null);
  const [screenRedFlash, setScreenRedFlash] = useState(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const monsterGroupRef = useRef<THREE.Group | null>(null);
  const shieldMeshRef = useRef<THREE.Mesh | null>(null);

  // Projectiles
  const playerProjectilesRef = useRef<{ mesh: THREE.Mesh | THREE.Group; type: string; targetZ: number; speed: number; damage: number }[]>([]);
  const enemyProjectilesRef = useRef<{ mesh: THREE.Mesh; speed: number; damage: number }[]>([]);
  const particlesRef = useRef<{ mesh: THREE.Points; velocities: THREE.Vector3[]; life: number }[]>([]);

  // Enemy Attack Timer Ref
  const attackTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0a0614, 0.03);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0x7e22ce, 1.3);
    scene.add(ambientLight);

    const mainLight = new THREE.SpotLight(0xfbbf24, 3);
    mainLight.position.set(0, 14, 6);
    mainLight.angle = Math.PI / 4;
    scene.add(mainLight);

    // 3. Ground Arena
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x110a24, roughness: 0.4, metalness: 0.6 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    scene.add(floor);

    // Glowing Magic Ring
    const ringGeo = new THREE.RingGeometry(3.5, 4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(0, -0.98, -2);
    scene.add(ring);

    // Player Shield Barrier Mesh (Hidden initially)
    const shieldGeo = new THREE.CylinderGeometry(4, 4, 0.2, 32, 1, true);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.rotation.x = Math.PI / 2;
    shieldMesh.position.set(0, 2, 7);
    shieldMesh.visible = false;
    scene.add(shieldMesh);
    shieldMeshRef.current = shieldMesh;

    // 4. Create 3D Monster
    const monsterGroup = createMonsterMesh('golem');
    monsterGroup.position.set(0, 0, -2);
    scene.add(monsterGroup);
    monsterGroupRef.current = monsterGroup;

    // 5. Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Idle Monster Floating Animation
      if (monsterGroupRef.current) {
        monsterGroupRef.current.position.y = Math.sin(time * 2.5) * 0.25;
        monsterGroupRef.current.rotation.y = Math.sin(time * 1.2) * 0.2;
      }

      // Rotate Shield Barrier if active
      if (shieldMeshRef.current && shieldMeshRef.current.visible) {
        shieldMeshRef.current.rotation.z += 0.02;
      }

      // Animate Player Projectiles (Traveling toward Monster at z = -2)
      for (let i = playerProjectilesRef.current.length - 1; i >= 0; i--) {
        const p = playerProjectilesRef.current[i];
        p.mesh.position.z -= p.speed * delta * 25;
        p.mesh.rotation.x += 0.1;
        p.mesh.rotation.y += 0.1;

        if (p.mesh.position.z <= p.targetZ) {
          createExplosion(scene, p.mesh.position, p.type);
          scene.remove(p.mesh);
          playerProjectilesRef.current.splice(i, 1);

          // Apply damage to Monster
          setMonsterHp((prevHp) => {
            const nextHp = Math.max(0, prevHp - p.damage);
            setLastMonsterDamage(p.damage);
            setTimeout(() => setLastMonsterDamage(null), 1000);

            if (monsterGroupRef.current) {
              monsterGroupRef.current.position.z = -2.8;
              setTimeout(() => {
                if (monsterGroupRef.current) monsterGroupRef.current.position.z = -2;
              }, 120);
            }

            if (nextHp === 0) {
              playSoundFX('fanfare');
              onMonsterDefeated(150 * wave, 250 * wave, 8);

              // Spawn Next Wave
              setTimeout(() => {
                setWave((w) => {
                  const nextWave = w + 1;
                  let mType: 'golem' | 'dragon' | 'boss' = 'golem';
                  let mName = 'Obsidian Golem';
                  let mHp = 300 + nextWave * 120;

                  if (nextWave % 3 === 0) {
                    mType = 'boss';
                    mName = '🔥 Infernal Archon BOSS';
                    mHp = 700;
                  } else if (nextWave % 2 === 0) {
                    mType = 'dragon';
                    mName = '❄️ Frost Void Wyvern';
                    mHp = 450;
                  }

                  if (sceneRef.current && monsterGroupRef.current) {
                    sceneRef.current.remove(monsterGroupRef.current);
                    const newGroup = createMonsterMesh(mType);
                    newGroup.position.set(0, 0, -2);
                    sceneRef.current.add(newGroup);
                    monsterGroupRef.current = newGroup;
                  }

                  setMonsterType(mType);
                  setMonsterName(mName);
                  setMaxMonsterHp(mHp);
                  setMonsterHp(mHp);
                  return nextWave;
                });
              }, 1200);
            }
            return nextHp;
          });
        }
      }

      // Animate Enemy Projectiles (Traveling toward Player Camera at z = 10)
      for (let i = enemyProjectilesRef.current.length - 1; i >= 0; i--) {
        const ep = enemyProjectilesRef.current[i];
        ep.mesh.position.z += ep.speed * delta * 20;

        if (ep.mesh.position.z >= 7) {
          scene.remove(ep.mesh);
          enemyProjectilesRef.current.splice(i, 1);

          // Check if Player Shield is Active
          if (shieldMeshRef.current && shieldMeshRef.current.visible) {
            playSoundFX('spell', 'light');
            createExplosion(scene, new THREE.Vector3(0, 2, 7), 'light');
          } else {
            // Player Takes Hit!
            playSoundFX('wrong');
            setScreenRedFlash(true);
            setTimeout(() => setScreenRedFlash(false), 350);

            setPlayerHp((prevHp) => {
              const nextHp = Math.max(0, prevHp - ep.damage);
              setLastPlayerDamage(ep.damage);
              setTimeout(() => setLastPlayerDamage(null), 1000);

              if (nextHp === 0) {
                setIsGameOver(true);
              }
              return nextHp;
            });
          }
        }
      }

      // Animate Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const part = particlesRef.current[i];
        part.life -= delta;
        const positions = part.mesh.geometry.attributes.position.array as Float32Array;

        for (let j = 0; j < part.velocities.length; j++) {
          positions[j * 3] += part.velocities[j].x * delta;
          positions[j * 3 + 1] += part.velocities[j].y * delta;
          positions[j * 3 + 2] += part.velocities[j].z * delta;
        }
        part.mesh.geometry.attributes.position.needsUpdate = true;

        if (part.life <= 0) {
          scene.remove(part.mesh);
          particlesRef.current.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Enemy Attack Interval Loop (Enemy Attacks Every 3.8 Seconds)
    attackTimerRef.current = setInterval(() => {
      if (sceneRef.current && !isGameOver) {
        launchEnemyAttack(sceneRef.current, monsterType);
      }
    }, 3800);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (attackTimerRef.current) clearInterval(attackTimerRef.current);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Launch Enemy Attack Projectile
  const launchEnemyAttack = (scene: THREE.Scene, type: 'golem' | 'dragon' | 'boss') => {
    let colorHex = 0xef4444;
    let damage = 25;
    let size = 0.8;

    if (type === 'dragon') {
      colorHex = 0x06b6d4;
      damage = 35;
      size = 0.9;
    } else if (type === 'boss') {
      colorHex = 0xa855f7;
      damage = 50;
      size = 1.2;
    }

    const proj = new THREE.Mesh(
      new THREE.SphereGeometry(size, 16, 16),
      new THREE.MeshBasicMaterial({ color: colorHex })
    );
    proj.position.set((Math.random() - 0.5) * 3, 2, -2);
    scene.add(proj);

    enemyProjectilesRef.current.push({
      mesh: proj,
      speed: 0.5,
      damage,
    });
  };

  // Listen to Spell Cast Trigger from Player
  useEffect(() => {
    if (!castSpellTrigger || !sceneRef.current || isGameOver) return;

    const { type } = castSpellTrigger;
    const scene = sceneRef.current;

    if (type === 'light') {
      // Activate Holy Shield Barrier for 3.5 seconds
      if (shieldMeshRef.current) {
        shieldMeshRef.current.visible = true;
        setIsShieldActive(true);
        setTimeout(() => {
          if (shieldMeshRef.current) shieldMeshRef.current.visible = false;
          setIsShieldActive(false);
        }, 3500);
      }
      return;
    }

    let projMesh: THREE.Mesh;
    let damage = 90;

    if (type === 'fire') {
      projMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), new THREE.MeshBasicMaterial({ color: 0xf97316 }));
      damage = 120;
    } else if (type === 'ice') {
      projMesh = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.8, 8), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      damage = 100;
    } else if (type === 'thunder') {
      projMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.4, 3, 6), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      damage = 150;
    } else {
      projMesh = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.2, 8, 24), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
      damage = 95;
    }

    projMesh.position.set(0, 2, 7);
    scene.add(projMesh);

    playerProjectilesRef.current.push({
      mesh: projMesh,
      type,
      targetZ: -1.5,
      speed: 0.65,
      damage,
    });
  }, [castSpellTrigger, isGameOver]);

  const createMonsterMesh = (type: 'golem' | 'dragon' | 'boss') => {
    const group = new THREE.Group();

    if (type === 'boss') {
      // Giant Infernal Demon Boss
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.3 });
      const body = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 1), bodyMat);
      body.position.y = 2.2;
      group.add(body);

      const headMat = new THREE.MeshStandardMaterial({ color: 0x450a0a, roughness: 0.4 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), headMat);
      head.position.y = 4.4;
      group.add(head);

      // Horns
      const hornGeo = new THREE.ConeGeometry(0.4, 1.8, 8);
      const hornMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const hornLeft = new THREE.Mesh(hornGeo, hornMat);
      hornLeft.position.set(-0.8, 5.4, 0);
      hornLeft.rotation.z = -0.4;
      const hornRight = new THREE.Mesh(hornGeo, hornMat);
      hornRight.position.set(0.8, 5.4, 0);
      hornRight.rotation.z = 0.4;
      group.add(hornLeft);
      group.add(hornRight);
    } else if (type === 'dragon') {
      // Wyvern Dragon
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, roughness: 0.4 });
      const body = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.5, 8), bodyMat);
      body.rotation.x = Math.PI / 3;
      body.position.y = 2;
      group.add(body);

      // Wings
      const wingGeo = new THREE.PlaneGeometry(3.5, 1.5);
      const wingMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide });
      const wingLeft = new THREE.Mesh(wingGeo, wingMat);
      wingLeft.position.set(-2, 2.5, 0);
      const wingRight = new THREE.Mesh(wingGeo, wingMat);
      wingRight.position.set(2, 2.5, 0);
      group.add(wingLeft);
      group.add(wingRight);
    } else {
      // Obsidian Golem
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.6 });
      const body = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8, 1), bodyMat);
      body.position.y = 1.8;
      group.add(body);

      const headMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), headMat);
      head.position.y = 3.6;
      group.add(head);
    }

    return group;
  };

  const createExplosion = (scene: THREE.Scene, pos: THREE.Vector3, type: string) => {
    const count = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    const colorHex = type === 'fire' ? 0xf97316 : type === 'ice' ? 0x06b6d4 : type === 'thunder' ? 0xfacc15 : 0x38bdf8;

    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      velocities.push(
        new THREE.Vector3((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: colorHex, size: 0.35 });
    const pSystem = new THREE.Points(geometry, material);

    scene.add(pSystem);
    particlesRef.current.push({ mesh: pSystem, velocities, life: 0.6 });
  };

  const handleRespawn = () => {
    playSoundFX('fanfare');
    setPlayerHp(200);
    setIsGameOver(false);
  };

  return (
    <div
      className={`relative w-full h-[450px] sm:h-[520px] rounded-3xl overflow-hidden glass-panel border-2 transition-all duration-300 ${
        screenRedFlash
          ? 'border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.9)]'
          : 'border-purple-500/40 shadow-[0_0_50px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Red Flash Vignette overlay on Hit */}
      {screenRedFlash && <div className="absolute inset-0 bg-red-600/30 pointer-events-none z-30 animate-ping" />}

      {/* Player HP & Shield Bar (Bottom HUD) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-4 glass-panel p-3.5 rounded-2xl border border-purple-500/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-950/80 border border-red-500/50 text-rose-400">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-rose-200">
              <span>Player HP</span>
              <span>
                {playerHp} / {maxPlayerHp}
              </span>
            </div>
            <div className="w-36 sm:w-48 h-2.5 rounded-full bg-slate-950 overflow-hidden border border-rose-500/30">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-emerald-400 transition-all duration-300"
                style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Shield Status Indicator */}
        <div className="flex items-center gap-2">
          {isShieldActive ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse">
              <Shield className="w-4 h-4 fill-slate-950" /> โล่เวทป้องกันอยู่!
            </span>
          ) : (
            <span className="text-xs text-purple-300">💡 วาดรูปดาว ✨ เพื่อกางโล่ป้องกัน</span>
          )}
        </div>
      </div>

      {/* 3D Monster HUD Overlay (Top HUD) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-4 rounded-2xl glass-panel-gold border border-amber-400/50 text-center space-y-2 shadow-lg z-20">
        <div className="flex items-center justify-between text-xs font-bold text-amber-300">
          <span>Wave {wave}</span>
          <span className="text-sm font-extrabold text-amber-200">{monsterName}</span>
          <span>
            HP: {monsterHp}/{maxMonsterHp}
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-amber-400/40">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${(monsterHp / maxMonsterHp) * 100}%` }}
          />
        </div>
      </div>

      {/* Damage Hit Text Float */}
      {lastMonsterDamage !== null && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-extrabold text-amber-300 glow-text-gold animate-bounce z-20">
          -{lastMonsterDamage} HIT!
        </div>
      )}
      {lastPlayerDamage !== null && (
        <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-3xl font-extrabold text-rose-400 animate-bounce z-20">
          💥 TAKEN -{lastPlayerDamage} HP!
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-40 flex flex-col items-center justify-center text-center p-6 space-y-4">
          <AlertTriangle className="w-16 h-16 text-rose-500 animate-bounce" />
          <h3 className="text-3xl sm:text-4xl font-extrabold text-rose-400 glow-text-purple">
            คุณถูกมอนสเตอร์โจมตีพ่ายแพ้!
          </h3>
          <p className="text-sm text-purple-200">
            พละกำลังหมดลง! กดปุ่มด้านล่างเพื่อฟื้นฟู HP 100% แล้วกลับเข้าสู่สนามต่อสู้
          </p>
          <button
            onClick={handleRespawn}
            className="px-8 py-3.5 rounded-2xl glass-button text-white font-bold text-base flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(239,68,68,0.6)] border border-rose-400"
          >
            <RefreshCw className="w-5 h-5 text-amber-300" />
            <span>ฟื้นคืนชีพ (Respawn HP 100%)</span>
          </button>
        </div>
      )}
    </div>
  );
};
