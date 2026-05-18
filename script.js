const chapters = [
  {
    index: '01',
    title: 'The Shrine: The Ghost of Honor',
    mood: 'Stillness',
    copy: 'Beneath the weathered eaves of the Hachiman Shrine, time slows to a crawl. Damp cedar, drifting petals, and the weight of an oath hold Kaito in place like a relic of an era that can no longer defend itself.',
    narrative: 'Beneath the weathered eaves of the Hachiman Shrine, Kaito stands immobile with his blade in hand. Pink petals settle on steel as he guards not a kingdom, but the last shape of honor against the void itself.',
    narrationFile: 'NARRATION.mpeg',
    accent: 'rgba(104, 247, 255, 0.16)'
  },
  {
    index: '02',
    title: 'The City: The Stare of the Masses',
    mood: 'Collective surrender',
    copy: 'At the Great Plaza, a thousand souls stand shoulder to shoulder beneath a bruising violet sky. They do not scream or flee. They stare, glassy-eyed, as if the world has already decided what comes next.',
    narrative: 'Miles to the east, the megalopolis falls into a shared silence. The crowd remains standing, a tapestry of humanity frozen not by the absence of identity, but by the weight of inevitability.',
    narrationFile: 'NARRATION.mpeg',
    accent: 'rgba(255, 79, 216, 0.14)'
  },
  {
    index: '03',
    title: 'The Docks: The Breaking of the World',
    mood: 'Impact',
    copy: 'The levees groan, then shatter. Black water surges through the skeletal docks, lifting shipping containers and abandoned trucks as the iron achievements of man are scrubbed away by a tide that has lost its patience.',
    narrative: 'The industrial coast breaks open with a roar. Cranes bow like mourning giants while the rusted fleet is turned into debris, and the old world is reclaimed by the sea one ruin at a time.',
    narrationFile: 'NARRATION.mpeg',
    accent: 'rgba(255, 204, 128, 0.14)'
  },
  {
    index: '04',
    title: 'The Convergence: The Final Frame',
    mood: 'Whiteout',
    copy: 'The shrine, the crowd, and the flood fuse into a single cinematic sweep. Kaito closes his eyes, the masses exhale, and the rising water meets the sky in one blinding frame.',
    narrative: 'As the spray reaches the mountain shrine and the flood overtakes the coast, the world resolves into a final, still image. Then the colors drain into white, and only the sound of the waves remains.',
    narrationFile: 'NARRATION.mpeg',
    accent: 'rgba(255, 255, 255, 0.14)'
  }
];

const characters = [
  {
    name: 'Kaito',
    role: 'Last sentinel',
    description: 'A relic of a forgotten era, guarding the shrine with a blade and an oath that no kingdom remains to justify.',
    details: 'Kaito is the story\'s solitary axis: a warrior who has outlived the purpose of war, yet still stands watch because the shape of duty is all that remains. His stillness is the last act of resistance.',
    image: 'kaito.png',
    palette: ['#10192f', '#68f7ff', '#ffffff']
  }
];

const galleryItems = [
  {
    title: 'Hachiman Shrine',
    description: 'Weathered eaves, damp cedar, and petals drifting across the steel of a katana.',
    palette: ['#1a2019', '#b5d6b6', '#f7b7d7']
  },
  {
    title: 'Great Plaza',
    description: 'A frozen crowd under a violet sky, reflected in the glassy stare of inevitability.',
    palette: ['#181a30', '#6a63d8', '#f5f5ff']
  },
  {
    title: 'The Docks at Whiteout',
    description: 'Crashing levees, bowed cranes, and black water lifting the industry of man like toys.',
    palette: ['#0a1018', '#1f4258', '#9cdcff']
  }
];

const state = {
  musicEnabled: false,
  narrationEnabled: true,
  currentUtterance: null,
  sfxContext: null,
  sectionState: new Map(),
  activeNarration: null,
  currentLightbox: null
};

const chapterStack = document.getElementById('chapter-stack');
const characterGrid = document.getElementById('character-grid');
const galleryGrid = document.getElementById('gallery-grid');
const loadingScreen = document.getElementById('loading-screen');
const modal = document.getElementById('story-modal');
const modalContent = document.getElementById('modal-content');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDescription = document.getElementById('lightbox-description');
const audioStatus = document.getElementById('audio-status');
const audioFallback = document.getElementById('audio-fallback');
const backgroundMusic = document.getElementById('background-music');
const narrationAudio = document.getElementById('narration-audio');
const waveform = document.getElementById('waveform');
const cursorLight = document.getElementById('cursor-light');

function svgDataUri(title, subtitle, colors) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="55%" stop-color="${colors[1]}" />
          <stop offset="100%" stop-color="${colors[2]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="28%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)" />
      <circle cx="400" cy="270" r="300" fill="url(#glow)" />
      <path d="M0 720 C120 640, 220 720, 330 650 C450 575, 560 700, 800 600 L800 1000 L0 1000 Z" fill="rgba(0,0,0,0.28)" />
      <path d="M90 760 C180 660, 255 820, 358 680 C454 560, 540 760, 650 630 C710 560, 750 620, 800 570 L800 1000 L0 1000 L0 860 Z" fill="rgba(255,255,255,0.12)" />
      <rect x="96" y="112" width="608" height="776" rx="38" fill="rgba(6,8,18,0.34)" stroke="rgba(255,255,255,0.16)" />
      <text x="120" y="860" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="44" font-weight="700">${escapeXml(title)}</text>
      <text x="120" y="910" fill="#d6e6ff" font-family="Inter, Arial, sans-serif" font-size="24">${escapeXml(subtitle)}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function renderChapters() {
  // Combine all narratives into one unified script
  const fullScript = chapters.map((chapter, i) => 
    `<div class="script-chapter" data-index="${i}">
      <span class="eyebrow">Chapter ${chapter.index}</span>
      <h4>${chapter.title}</h4>
      <p>${chapter.narrative}</p>
    </div>`
  ).join('');

  chapterStack.innerHTML = `
    <article class="chapter glass-panel reveal" data-narration="${chapters.map(c => c.narrative).join(' ')}" data-index="0">
      <div class="chapter-full-script">
        <div class="script-header">
          <span class="eyebrow">The Final Frame — Complete Narrative</span>
          <h2>The Story</h2>
        </div>
        <div class="script-content">
          ${fullScript}
        </div>
      </div>
    </article>
  `;
}

function renderCharacters() {
  characterGrid.innerHTML = characters.map((character, index) => {
    const art = character.image ? character.image : svgDataUri(character.name, character.role, character.palette);
    const altText = character.image ? `${character.name} portrait` : `${character.name} portrait illustration`;
    return `
      <article class="character-card glass-panel reveal">
        <img class="character-art" src="${art}" alt="${altText}" />
        <div class="character-body">
          <span class="character-role">${character.role}</span>
          <h3>${character.name}</h3>
          <p class="character-copy">${character.description}</p>
          <button class="secondary-button character-open" type="button" data-character="${index}">Open dossier</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderGallery() {
  galleryGrid.innerHTML = galleryItems.map((item, index) => {
    const art = svgDataUri(item.title, item.description, item.palette);
    return `
      <article class="gallery-card glass-panel reveal">
        <img class="gallery-art" src="${art}" alt="${item.title} artwork" data-gallery="${index}" />
        <div class="gallery-body">
          <span class="gallery-role">Scene ${String(index + 1).padStart(2, '0')}</span>
          <h3>${item.title}</h3>
          <p class="gallery-copy">${item.description}</p>
        </div>
      </article>
    `;
  }).join('');
}

function setupRevealAnimations() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.reveal').forEach((element, index) => {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 1,
      delay: index * 0.03,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%'
      }
    });
  });

  gsap.utils.toArray('.chapter').forEach((chapter, index) => {
    gsap.fromTo(chapter,
      { x: index % 2 === 0 ? -40 : 40, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: chapter,
          start: 'top 75%'
        }
      }
    );
  });

  gsap.from('.hero-title', { y: 22, opacity: 0, duration: 1.1, ease: 'power3.out' });
  gsap.from('.hero-subtitle', { y: 18, opacity: 0, duration: 1, delay: 0.2, ease: 'power3.out' });
}

function setupParticleField() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  const particles = [];
  let width = 0;
  let height = 0;

  function resize() {
    width = canvas.width = window.innerWidth * window.devicePixelRatio;
    height = canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }

  function createParticles() {
    particles.length = 0;
    const count = Math.min(110, Math.max(48, Math.floor(window.innerWidth / 14)));
    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        speed: Math.random() * 0.35 + 0.08,
        opacity: Math.random() * 0.6 + 0.2,
        drift: Math.random() * 0.8 - 0.4
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      particle.y -= particle.speed * window.devicePixelRatio;
      particle.x += particle.drift * 0.2;

      if (particle.y < -20) particle.y = height + 20;
      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;

      ctx.beginPath();
      ctx.fillStyle = `rgba(130, 240, 255, ${particle.opacity})`;
      ctx.arc(particle.x, particle.y, particle.radius * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}

function setupMouseLight() {
  const target = cursorLight;
  window.addEventListener('pointermove', (event) => {
    target.style.left = `${event.clientX}px`;
    target.style.top = `${event.clientY}px`;
  });
}

function setMusicEnabled(enabled) {
  state.musicEnabled = enabled;
  document.getElementById('music-toggle').setAttribute('aria-pressed', String(enabled));
  document.getElementById('audio-mute').textContent = enabled ? 'Mute' : 'Unmute';
  document.getElementById('music-toggle').textContent = enabled ? 'Music On' : 'Music Off';
  document.getElementById('music-pulse').textContent = enabled ? 'Let it breathe' : 'Listen in the dark';
  audioStatus.textContent = enabled ? 'Black Tide Memorial' : 'Quiet before the whiteout';
  waveform.classList.toggle('is-playing', enabled);

  if (!backgroundMusic) return;

  if (enabled) {
    backgroundMusic.volume = 0;
    const playResult = backgroundMusic.play();
    if (playResult && typeof playResult.catch === 'function') {
      playResult.catch(() => {
        if (audioFallback) {
          audioFallback.textContent = 'Music file not found yet. Place Black Tide Memorial.mp3.mpeg beside this HTML file.';
        }
        state.musicEnabled = false;
        document.getElementById('music-toggle').setAttribute('aria-pressed', 'false');
        document.getElementById('audio-mute').textContent = 'Mute';
        document.getElementById('music-toggle').textContent = 'Music Off';
        document.getElementById('music-pulse').textContent = 'Listen in the dark';
        audioStatus.textContent = 'Quiet before the whiteout';
        waveform.classList.remove('is-playing');
      });
    }
    fadeAudio(backgroundMusic, 0.92, 450);
  } else {
    fadeAudio(backgroundMusic, 0, 350);
    window.setTimeout(() => backgroundMusic.pause(), 380);
  }
}

function toggleMusic(forceState) {
  setMusicEnabled(typeof forceState === 'boolean' ? forceState : !state.musicEnabled);
}

function fadeAudio(audioElement, targetVolume, durationMs) {
  if (!audioElement) return;
  const startVolume = audioElement.volume;
  const delta = targetVolume - startVolume;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min(1, (now - startTime) / durationMs);
    audioElement.volume = startVolume + delta * progress;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }

  window.requestAnimationFrame(step);
}

function playSfx(type = 'click') {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!state.sfxContext) {
    state.sfxContext = new AudioContextClass();
  }
  const context = state.sfxContext;
  if (context.state === 'suspended') {
    context.resume();
  }

  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  filter.type = 'bandpass';
  filter.frequency.value = type === 'hover' ? 1200 : 760;
  osc.type = type === 'hover' ? 'sine' : 'triangle';
  osc.frequency.value = type === 'hover' ? 740 : 220;

  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(type === 'hover' ? 0.035 : 0.08, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (type === 'hover' ? 0.16 : 0.28));

  osc.connect(filter).connect(gain).connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + (type === 'hover' ? 0.18 : 0.3));
}

function stopNarration() {
  if (state.currentUtterance) {
    window.speechSynthesis.cancel();
    state.currentUtterance = null;
  }
  if (narrationAudio) {
    narrationAudio.pause();
    narrationAudio.currentTime = 0;
  }
  state.activeNarration = null;
  waveform.classList.remove('narrating');
}

function speakNarration(text, chapterIndex) {
  if (!state.narrationEnabled) return;

  // If narration is already playing, don't restart it
  if (narrationAudio && !narrationAudio.paused) {
    waveform.classList.add('narrating');
    return;
  }

  let narrationFile = null;
  if (chapterIndex !== undefined && chapters[chapterIndex] && chapters[chapterIndex].narrationFile) {
    narrationFile = chapters[chapterIndex].narrationFile;
  }

  if (narrationFile && narrationAudio) {
    const source = narrationAudio.querySelector('source');
    if (source) {
      // Only set source and load if not already configured
      if (!source.src || source.src === '') {
        source.src = narrationFile;
        narrationAudio.load();
      }
      
      narrationAudio.volume = 0.85;
      narrationAudio.play().then(() => {
        waveform.classList.add('narrating');
        narrationAudio.onended = () => stopNarration();
      }).catch(() => {
        fallbackToTTS(text);
      });
    }
  } else {
    fallbackToTTS(text);
  }
}

function fallbackToTTS(text) {
  stopNarration();
  
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.96;
  utterance.pitch = 0.94;
  utterance.volume = 0.85;
  utterance.onstart = () => waveform.classList.add('narrating');
  utterance.onend = () => stopNarration();
  utterance.onerror = () => stopNarration();

  state.currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

function openModal(characterIndex) {
  const character = characters[characterIndex];
  if (!character) return;

  const art = character.image ? character.image : svgDataUri(character.name, character.role, character.palette);
  modalContent.innerHTML = `
    <div class="modal-grid">
      <img class="modal-portrait" src="${art}" alt="${character.name} portrait illustration" />
      <div class="modal-body">
        <span class="eyebrow">Character dossier</span>
        <h3 id="modal-title">${character.name}</h3>
        <p class="character-role">${character.role}</p>
        <p>${character.details}</p>
      </div>
    </div>
  `;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
}

function openLightbox(index) {
  const item = galleryItems[index];
  if (!item) return;
  lightboxImage.src = svgDataUri(item.title, item.description, item.palette);
  lightboxTitle.textContent = item.title;
  lightboxDescription.textContent = item.description;
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  state.currentLightbox = index;
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  state.currentLightbox = null;
}

function setupNarrationObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const text = entry.target.dataset.narration;
      if (!text || state.activeNarration === text) return;
      state.activeNarration = text;
      
      speakNarration(text, 0);
    });
  }, { threshold: 0.4 });

  const chapter = document.querySelector('.chapter');
  if (chapter) observer.observe(chapter);
}

function setupParallax() {
  const heroVisual = document.querySelector('.hero-visual');
  window.addEventListener('scroll', () => {
    const offset = window.scrollY * 0.08;
    if (heroVisual) {
      heroVisual.style.transform = `translateY(${offset * -0.12}px)`;
    }
  }, { passive: true });
}

function fadeInLoadingScreen() {
  window.setTimeout(() => {
    if (!window.gsap) {
      loadingScreen.style.display = 'none';
      return;
    }
    gsap.to(loadingScreen, {
      opacity: 0,
      duration: 1.1,
      ease: 'power2.out',
      onComplete: () => {
        loadingScreen.style.display = 'none';
      }
    });
  }, 1500);
}

function scrollToStory() {
  document.getElementById('storyline').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupEvents() {
  document.getElementById('start-story').addEventListener('click', () => {
    playSfx('click');
    toggleMusic(true);
    scrollToStory();
  });

  document.getElementById('music-pulse').addEventListener('click', () => {
    playSfx('click');
    toggleMusic();
  });

  document.getElementById('music-toggle').addEventListener('click', () => {
    playSfx('click');
    toggleMusic();
  });

  document.getElementById('audio-mute').addEventListener('click', () => {
    playSfx('click');
    toggleMusic();
  });

  document.getElementById('narration-toggle').addEventListener('click', (event) => {
    state.narrationEnabled = !state.narrationEnabled;
    event.currentTarget.setAttribute('aria-pressed', String(state.narrationEnabled));
    event.currentTarget.textContent = state.narrationEnabled ? 'Narration On' : 'Narration Off';
    if (!state.narrationEnabled) stopNarration();
    playSfx('hover');
  });

  document.getElementById('replay-story').addEventListener('click', () => {
    playSfx('click');
    stopNarration();
    scrollToStory();
  });

  document.getElementById('end-replay').addEventListener('click', () => {
    playSfx('click');
    stopNarration();
    scrollToStory();
  });

  document.getElementById('mobile-story-toggle').addEventListener('click', () => {
    playSfx('click');
    toggleMusic(true);
    scrollToStory();
  });

  document.body.addEventListener('click', (event) => {
    const characterButton = event.target.closest('.character-open');
    const galleryImage = event.target.closest('[data-gallery]');
    const closeTarget = event.target.closest('[data-close-modal], [data-close-lightbox]');

    if (characterButton) {
      playSfx('click');
      openModal(Number(characterButton.dataset.character));
    }

    if (galleryImage) {
      playSfx('hover');
      openLightbox(Number(galleryImage.dataset.gallery));
    }

    if (closeTarget) {
      playSfx('click');
      closeModal();
      closeLightbox();
      stopNarration();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
      closeLightbox();
      stopNarration();
    }
  });

  document.querySelectorAll('button, .gallery-art, .character-open').forEach((element) => {
    element.addEventListener('mouseenter', () => playSfx('hover'));
  });
}

function boot() {
  renderChapters();
  renderCharacters();
  // renderGallery();
  setupRevealAnimations();
  setupParticleField();
  setupMouseLight();
  setupNarrationObserver();
  setupParallax();
  setupEvents();
  fadeInLoadingScreen();

  if (backgroundMusic) {
    backgroundMusic.volume = 0;
    backgroundMusic.addEventListener('error', () => {
      if (audioFallback) {
        audioFallback.textContent = 'Music file not found yet. Place Black Tide Memorial.mp3.mpeg beside this HTML file.';
      }
    });
  }

  if (window.gsap) {
    gsap.from('.topbar', { y: -20, opacity: 0, duration: 0.8, ease: 'power2.out' });
    gsap.from('.floating-audio-panel', { y: 24, opacity: 0, duration: 0.8, delay: 0.5, ease: 'power2.out' });
  }
}

window.addEventListener('load', boot);