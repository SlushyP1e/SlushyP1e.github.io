/* ==========================================================================
   FLARE.JS - SlushyPie Web App Custom Interaction Engine
   ========================================================================== */

(function() {
    // --- Global State ---
    let isMuted = localStorage.getItem('slushy-audio-muted') === 'true';
    if (localStorage.getItem('slushy-audio-muted') === null) {
        isMuted = true; // default is muted
    }
    
    let isDarkMode = localStorage.getItem('slushy-theme') === 'dark';
    let audioCtx = null;

    // Detect Touch Device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
        document.body.classList.add('touch-device');
    }

    // --- Audio Synthesis Engine (Web Audio API) ---
    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const playSound = (type, customFreq = null) => {
        if (isMuted) return;
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const now = audioCtx.currentTime;
        
        if (type === 'hover') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(700, now);
            osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05);
            gain.gain.setValueAtTime(0.012, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.06);
        } else if (type === 'click') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.03);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'success') {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.025, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.15);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.16);
            });
        } else if (type === 'sweep-up') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
            gain.gain.setValueAtTime(0.025, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.21);
        } else if (type === 'sweep-down') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(680, now);
            osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
            gain.gain.setValueAtTime(0.025, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.21);
        } else if (type === 'blip-puzzle') {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(customFreq || 440, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now);
            osc.stop(now + 0.11);
        } else if (type === 'explosion') {
            const bufferSize = audioCtx.sampleRate * 0.45;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, now);
            filter.frequency.exponentialRampToValueAtTime(40, now + 0.4);
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.43);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            noise.start(now);
            noise.stop(now + 0.45);
        }
    };
    
    // Expose sound engine globally
    window.playSlushySound = playSound;

    // --- Cozy Lo-Fi Music Synthesizer ---
    let isPlayingLofi = false;
    let nextChordTime = 0;
    let chordIndex = 0;
    let lofiTimerId = null;
    let lofiGain = null;
    let vinylNoiseSource = null;
    let activeOscillators = [];

    const chords = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 329.63], // G6
        [164.81, 196.00, 246.94, 293.66], // Em7
        [220.00, 261.63, 329.63, 392.00]  // Am7
    ];

    const startLofi = () => {
        if (isPlayingLofi) return;
        initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        isPlayingLofi = true;
        nextChordTime = audioCtx.currentTime;
        chordIndex = 0;
        
        lofiGain = audioCtx.createGain();
        lofiGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        lofiGain.connect(audioCtx.destination);
        
        startVinylCrackle();
        lofiScheduler();
    };

    const stopLofi = () => {
        if (!isPlayingLofi) return;
        isPlayingLofi = false;
        clearTimeout(lofiTimerId);
        
        // Stop vinyl noise
        stopVinylCrackle();
        
        // Cleanly stop all active synth voices
        activeOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch(e){}
        });
        activeOscillators = [];

        if (lofiGain) {
            lofiGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
            const refGain = lofiGain;
            setTimeout(() => {
                try {
                    refGain.disconnect();
                } catch(e){}
            }, 300);
            lofiGain = null;
        }
    };

    const startVinylCrackle = () => {
        if (!audioCtx || !lofiGain) return;
        
        const bufferSize = audioCtx.sampleRate * 2.5; // 2.5s loop
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            let val = (Math.random() * 2 - 1) * 0.05; // base rumble
            // Random tiny ticks
            if (Math.random() < 0.0002) {
                val += (Math.random() * 2 - 1) * 0.65;
            }
            data[i] = val;
        }
        
        vinylNoiseSource = audioCtx.createBufferSource();
        vinylNoiseSource.buffer = buffer;
        vinylNoiseSource.loop = true;
        
        const bandpass = audioCtx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(900, audioCtx.currentTime);
        bandpass.Q.setValueAtTime(0.4, audioCtx.currentTime);
        
        const vinylGain = audioCtx.createGain();
        vinylGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        
        vinylNoiseSource.connect(bandpass);
        bandpass.connect(vinylGain);
        vinylGain.connect(lofiGain);
        
        vinylNoiseSource.start();
    };

    const stopVinylCrackle = () => {
        if (vinylNoiseSource) {
            try {
                vinylNoiseSource.stop();
            } catch(e){}
            vinylNoiseSource.disconnect();
            vinylNoiseSource = null;
        }
    };

    const lofiScheduler = () => {
        if (!isPlayingLofi) return;
        
        const scheduleAhead = 0.6;
        const lookAhead = 100;
        const chordDuration = 3.158; // 4 beats at 76 BPM
        
        while (nextChordTime < audioCtx.currentTime + scheduleAhead) {
            scheduleChord(chordIndex, nextChordTime);
            nextChordTime += chordDuration;
            chordIndex = (chordIndex + 1) % chords.length;
        }
        
        lofiTimerId = setTimeout(lofiScheduler, lookAhead);
    };

    const scheduleChord = (idx, time) => {
        if (!lofiGain) return;
        const freqs = chords[idx];
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, time);
        filter.frequency.exponentialRampToValueAtTime(950, time + 2.0);
        filter.connect(lofiGain);
        
        freqs.forEach((freq, noteIdx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time + noteIdx * 0.05); // slight strum
            
            // Vibrato (pitch wobbling)
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.frequency.setValueAtTime(4.2, time); // 4.2Hz speed
            lfoGain.gain.setValueAtTime(freq * 0.007, time); // depth
            
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            // Envelope
            gain.gain.setValueAtTime(0, time + noteIdx * 0.05);
            gain.gain.linearRampToValueAtTime(0.03, time + noteIdx * 0.05 + 0.18); // slow attack
            gain.gain.exponentialRampToValueAtTime(0.006, time + 2.0); // decay
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 3.1); // release
            
            osc.connect(gain);
            gain.connect(filter);
            
            lfo.start(time + noteIdx * 0.05);
            osc.start(time + noteIdx * 0.05);
            
            lfo.stop(time + 3.15);
            osc.stop(time + 3.15);
            
            activeOscillators.push(osc);
        });
    };

    // --- Dynamic DOM Elements Injection ---
    const injectSharedDOMElements = () => {
        // 1. Scroll Progress Bar
        const progContainer = document.createElement('div');
        progContainer.className = 'scroll-progress-container';
        const progBar = document.createElement('div');
        progBar.className = 'scroll-progress-bar';
        progBar.id = 'scroll-progress-bar';
        progContainer.appendChild(progBar);
        document.body.appendChild(progContainer);

        // 2. Custom Cursor
        if (!isTouch) {
            const cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.id = 'custom-cursor';
            const ring = document.createElement('div');
            ring.className = 'custom-cursor-ring';
            ring.id = 'custom-cursor-ring';
            document.body.appendChild(cursor);
            document.body.appendChild(ring);
            
            // Link cursor movements
            document.addEventListener('mousemove', (e) => {
                cursor.style.left = e.clientX + 'px';
                cursor.style.top = e.clientY + 'px';
                
                // Slight delay for ring following
                setTimeout(() => {
                    ring.style.left = e.clientX + 'px';
                    ring.style.top = e.clientY + 'px';
                }, 40);
            });

            // Active/Hover states
            const addHoverStates = () => {
                const hoverables = document.querySelectorAll('a, button, input, select, textarea, .bento-card, .gallery-card, .clickable, [role="button"]');
                hoverables.forEach(el => {
                    if (el.dataset.cursorBound) return;
                    el.dataset.cursorBound = 'true';
                    el.addEventListener('mouseenter', () => {
                        ring.classList.add('hovering');
                        playSound('hover');
                    });
                    el.addEventListener('mouseleave', () => {
                        ring.classList.remove('hovering');
                    });
                });
            };

            addHoverStates();
            // Run periodically for dynamically loaded elements (like folders, gifs)
            setInterval(addHoverStates, 1000);
        }

        // 3. Floating Control Deck (Sound & Dark Mode)
        const hasShopBtn = document.querySelector('a[href*="shop"]');
        const deck = document.createElement('div');
        deck.className = 'floating-controls-deck';
        if (hasShopBtn) {
            deck.style.right = '5rem';
            deck.style.left = 'auto';
        } else {
            deck.style.right = '1rem';
            deck.style.left = 'auto';
        }

        // Audio toggle btn
        const audioBtn = document.createElement('button');
        audioBtn.className = 'deck-btn';
        audioBtn.id = 'audio-toggle';
        audioBtn.title = isMuted ? 'Unmute Sounds' : 'Mute Sounds';
        audioBtn.innerHTML = isMuted ? '<i data-lucide="volume-x"></i>' : '<i data-lucide="volume-2"></i>';
        
        // Theme toggle btn
        const themeBtn = document.createElement('button');
        themeBtn.className = 'deck-btn';
        themeBtn.id = 'theme-toggle';
        themeBtn.title = isDarkMode ? 'Switch to Sweet Light Mode' : 'Switch to Sour Dark Mode';
        themeBtn.innerHTML = isDarkMode ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';

        deck.appendChild(audioBtn);
        deck.appendChild(themeBtn);
        document.body.appendChild(deck);

        // Apply dark theme initially if saved
        if (isDarkMode) {
            document.body.classList.add('dark-theme');
        }

        // Bind events
        audioBtn.addEventListener('click', (e) => {
            isMuted = !isMuted;
            localStorage.setItem('slushy-audio-muted', isMuted);
            audioBtn.title = isMuted ? 'Unmute Sounds' : 'Mute Sounds';
            audioBtn.innerHTML = isMuted ? '<i data-lucide="volume-x"></i>' : '<i data-lucide="volume-2"></i>';
            if (window.lucide) window.lucide.createIcons();
            
            if (!isMuted) {
                initAudio();
                playSound('success');
            } else {
                stopLofi();
                // update cassette button state if page has it
                const playBtn = document.getElementById('cassette-play');
                if (playBtn) {
                    playBtn.classList.remove('active');
                    playBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> PLAY';
                    document.getElementById('cassette-deck-spindles')?.classList.remove('playing');
                    if (window.lucide) window.lucide.createIcons();
                }
            }
        });

        themeBtn.addEventListener('click', () => {
            isDarkMode = !isDarkMode;
            localStorage.setItem('slushy-theme', isDarkMode ? 'dark' : 'light');
            document.body.classList.toggle('dark-theme', isDarkMode);
            themeBtn.title = isDarkMode ? 'Switch to Sweet Light Mode' : 'Switch to Sour Dark Mode';
            themeBtn.innerHTML = isDarkMode ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            if (window.lucide) window.lucide.createIcons();
            
            initAudio();
            playSound(isDarkMode ? 'sweep-down' : 'sweep-up');
        });

        if (window.lucide) window.lucide.createIcons();
    };

    // --- Click Particles Burst ---
    const spawnClickParticles = (x, y) => {
        const colors = ['#ec4899', '#fde047', '#22c55e', '#a855f7']; // pink, yellow, green, purple
        const count = isTouch ? 4 : 8;
        
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'click-particle';
            
            const size = Math.floor(Math.random() * 12) + 6;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            p.style.background = color;
            p.style.left = x + 'px';
            p.style.top = y + 'px';
            
            // Randomized destination angle/distance
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80 + 30;
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist;
            
            p.style.setProperty('--dx', dx + 'px');
            p.style.setProperty('--dy', dy + 'px');
            
            document.body.appendChild(p);
            
            // Cleanup
            setTimeout(() => {
                p.remove();
            }, 600);
        }
    };

    // Hook global clicks
    document.addEventListener('click', (e) => {
        playSound('click');
        spawnClickParticles(e.clientX, e.clientY);
    });

    // --- Update Scroll progress ---
    window.addEventListener('scroll', () => {
        const prog = document.getElementById('scroll-progress-bar');
        if (prog) {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
            prog.style.width = pct + '%';
        }
    });

    // --- 3D Card Hover Effect ---
    const init3DCardTilt = () => {
        if (isTouch) return; // Disable on touch
        
        const handleTiltMove = (e) => {
            const card = e.currentTarget;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            
            // Calculate tilt angle (max 6 degrees)
            const rotateY = ((x - midX) / midX) * 6;
            const rotateX = -((y - midY) / midY) * 6;
            
            // Offset shadow opposite to tilt
            const shadowX = -((x - midX) / midX) * 4 + 6;
            const shadowY = -((y - midY) / midY) * 4 + 6;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(2px, 2px, 10px)`;
            
            const shadowColor = document.body.classList.contains('dark-theme') ? 'var(--neon-green)' : '#000';
            card.style.boxShadow = `${shadowX}px ${shadowY}px 0px 0px ${shadowColor}`;
        };

        const handleTiltLeave = (e) => {
            const card = e.currentTarget;
            card.style.transform = '';
            card.style.boxShadow = '';
        };

        const bindCards = () => {
            const cards = document.querySelectorAll('.bento-card, .gallery-card');
            cards.forEach(c => {
                if (c.dataset.tiltBound) return;
                c.dataset.tiltBound = 'true';
                c.addEventListener('mousemove', handleTiltMove);
                c.addEventListener('mouseleave', handleTiltLeave);
            });
        };

        bindCards();
        setInterval(bindCards, 1000);
    };

    // --- Interactive Puzzle: Unlock Quote (Index Page Only) ---
    const initQuoteUnlock = () => {
        const quoteBox = document.querySelector('p.group.relative.border-2.border-black.bg-slate-100');
        if (!quoteBox) return;

        let clicks = 0;
        const required = 5;
        
        quoteBox.classList.add('quote-locked');
        
        // Add progress label inside
        const progressLabel = document.createElement('strong');
        progressLabel.className = 'quote-lock-progress';
        progressLabel.textContent = '🔒 CLICK TO DECRYPT CODES';
        quoteBox.appendChild(progressLabel);

        const textSpan = quoteBox.querySelector('strong.group-hover\\:hidden');

        quoteBox.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent double clicking triggers
            if (clicks >= required) return;
            
            clicks++;
            playSound('blip-puzzle', 300 + clicks * 150); // frequency rises!
            spawnClickParticles(e.clientX, e.clientY);
            
            // Shake effect
            quoteBox.style.animation = 'none';
            quoteBox.offsetHeight; // trigger reflow
            quoteBox.style.animation = 'shake-small 0.15s ease-out';

            if (clicks < required) {
                const dots = '█'.repeat(clicks) + '░'.repeat(required - clicks);
                progressLabel.textContent = `DECRYPTING: [${dots}]`;
                if (textSpan) {
                    textSpan.textContent = `DECRYPTING... (${required - clicks} remaining)`;
                }
            } else {
                // UNLOCKED!
                playSound('explosion');
                playSound('success');
                quoteBox.classList.remove('quote-locked');
                quoteBox.style.animation = '';
                
                // Swap HTML contents
                quoteBox.innerHTML = `
                    <span class="absolute -top-3 left-4 border border-black bg-white px-2 text-xs font-bold quote-unlocked-reveal">SECRET QUOTE</span>
                    <span class="font-mono text-sm leading-relaxed text-slate-800 quote-unlocked-reveal">"You don't have to be enough, you just have to be slushy!"</span>
                `;
                
                // Spawn mega sparkles
                const rect = quoteBox.getBoundingClientRect();
                for (let i = 0; i < 15; i++) {
                    setTimeout(() => {
                        spawnClickParticles(
                            rect.left + Math.random() * rect.width,
                            rect.top + Math.random() * rect.height
                        );
                    }, i * 60);
                }
            }
        });
    };

    // --- Interactive Bubble Physics Sandbox (Index Page Only) ---
    const initBubbleSandbox = () => {
        const canvas = document.getElementById('sandbox-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.parentElement.clientWidth;
        let height = canvas.height = canvas.parentElement.clientHeight;

        window.addEventListener('resize', () => {
            if (!canvas.parentElement) return;
            width = canvas.width = canvas.parentElement.clientWidth;
            height = canvas.height = canvas.parentElement.clientHeight;
        });

        class Bubble {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.radius = Math.random() * 12 + 8;
                this.color = ['#ec4899', '#fde047', '#22c55e', '#a855f7'][Math.floor(Math.random() * 4)];
                this.dx = (Math.random() - 0.5) * 3;
                this.dy = (Math.random() - 0.5) * 3;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();

                // Highlight shine inside bubble
                ctx.beginPath();
                ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fill();
            }

            update() {
                // Bounce walls
                if (this.x + this.radius > width || this.x - this.radius < 0) {
                    this.dx = -this.dx;
                    this.x = Math.max(this.radius, Math.min(width - this.radius, this.x));
                }
                if (this.y + this.radius > height || this.y - this.radius < 0) {
                    this.dy = -this.dy;
                    this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
                }

                // Drag/Gravity from Mouse (repulsion)
                if (mouseCanvas.x !== null) {
                    const dist = Math.hypot(this.x - mouseCanvas.x, this.y - mouseCanvas.y);
                    if (dist < 32) {
                        const force = (32 - dist) / 32;
                        const angle = Math.atan2(this.x - mouseCanvas.x, this.y - mouseCanvas.y);
                        this.dx += Math.sin(angle) * force * 0.08;
                        this.dy += Math.cos(angle) * force * 0.08;
                    }
                }

                // Speed limit
                const speed = Math.hypot(this.dx, this.dy);
                if (speed > 4) {
                    this.dx = (this.dx / speed) * 4;
                    this.dy = (this.dy / speed) * 4;
                }

                this.x += this.dx;
                this.y += this.dy;

                // Friction
                this.dx *= 0.99;
                this.dy *= 0.99;
            }
        }

        const bubbles = [];
        const mouseCanvas = { x: null, y: null };

        // Spawn initial 8 bubbles
        for (let i = 0; i < 8; i++) {
            bubbles.push(new Bubble(Math.random() * (width - 40) + 20, Math.random() * (height - 40) + 20));
        }

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseCanvas.x = e.clientX - rect.left;
            mouseCanvas.y = e.clientY - rect.top;
        });

        canvas.addEventListener('mouseleave', () => {
            mouseCanvas.x = null;
            mouseCanvas.y = null;
        });

        canvas.addEventListener('click', (e) => {
            e.stopPropagation(); // block double global pop
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            let clickedBubbleIdx = -1;
            for (let i = bubbles.length - 1; i >= 0; i--) {
                const dist = Math.hypot(bubbles[i].x - clickX, bubbles[i].y - clickY);
                if (dist <= bubbles[i].radius + 5) {
                    clickedBubbleIdx = i;
                    break;
                }
            }

            if (clickedBubbleIdx !== -1) {
                // Pop it
                playSound('click');
                spawnClickParticles(e.clientX, e.clientY);
                bubbles.splice(clickedBubbleIdx, 1);
            } else {
                // Add bubble
                playSound('hover');
                bubbles.push(new Bubble(clickX, clickY));
                if (bubbles.length > 25) bubbles.shift(); // caps max
            }
        });

        const resolveCollisions = () => {
            for (let i = 0; i < bubbles.length; i++) {
                for (let j = i + 1; j < bubbles.length; j++) {
                    const b1 = bubbles[i];
                    const b2 = bubbles[j];
                    const dist = Math.hypot(b1.x - b2.x, b1.y - b2.y);
                    const overlap = (b1.radius + b2.radius) - dist;

                    if (overlap > 0) {
                        // Elastic collision math
                        const angle = Math.atan2(b2.y - b1.y, b2.x - b1.x);
                        
                        // Push away to resolve overlap
                        b1.x -= Math.cos(angle) * (overlap / 2);
                        b1.y -= Math.sin(angle) * (overlap / 2);
                        b2.x += Math.cos(angle) * (overlap / 2);
                        b2.y += Math.sin(angle) * (overlap / 2);

                        // Swap velocity components along axis
                        const normalX = Math.cos(angle);
                        const normalY = Math.sin(angle);

                        const relativeVelocityX = b1.dx - b2.dx;
                        const relativeVelocityY = b1.dy - b2.dy;

                        const speed = relativeVelocityX * normalX + relativeVelocityY * normalY;

                        if (speed > 0) {
                            b1.dx -= speed * normalX;
                            b1.dy -= speed * normalY;
                            b2.dx += speed * normalX;
                            b2.dy += speed * normalY;
                        }
                    }
                }
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            resolveCollisions();
            bubbles.forEach(b => {
                b.update();
                b.draw();
            });
            requestAnimationFrame(render);
        };

        render();
    };

    // --- Cassette Tape Playback (Index Page Only) ---
    const initCassettePlayer = () => {
        const playBtn = document.getElementById('cassette-play');
        const muteBtn = document.getElementById('cassette-mute');
        const volSlider = document.getElementById('cassette-vol');
        const spindles = document.getElementById('cassette-deck-spindles');
        
        if (!playBtn) return;

        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isMuted) {
                // If globally muted, force unmute globally so user hears lofi!
                isMuted = false;
                localStorage.setItem('slushy-audio-muted', 'false');
                const audioToggleBtn = document.getElementById('audio-toggle');
                if (audioToggleBtn) {
                    audioToggleBtn.title = 'Mute Sounds';
                    audioToggleBtn.innerHTML = '<i data-lucide="volume-2"></i>';
                    if (window.lucide) window.lucide.createIcons();
                }
            }

            if (isPlayingLofi) {
                stopLofi();
                playBtn.classList.remove('active');
                playBtn.innerHTML = '<i data-lucide="play" class="w-4 h-4"></i> PLAY';
                spindles.classList.remove('playing');
            } else {
                startLofi();
                playBtn.classList.add('active');
                playBtn.innerHTML = '<i data-lucide="square" class="w-4 h-4"></i> STOP';
                spindles.classList.add('playing');
                // volume sync
                if (lofiGain && volSlider) {
                    lofiGain.gain.setValueAtTime(parseFloat(volSlider.value) * 0.15, audioCtx.currentTime);
                }
            }
            if (window.lucide) window.lucide.createIcons();
        });

        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                const vol = parseFloat(e.target.value);
                if (lofiGain && audioCtx) {
                    lofiGain.gain.setValueAtTime(vol * 0.15, audioCtx.currentTime);
                }
            });
        }
    };

    // --- Gumroad Countdown Siren & Camera Shake (Shop Page Only) ---
    const initGumroadEnhancements = () => {
        const card = document.getElementById('gumroad-card');
        if (!card) return;

        let sirenOsc = null;
        let sirenGain = null;
        let holdStart = null;
        let animationFrameId = null;

        const startSiren = () => {
            if (isMuted) return;
            initAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            holdStart = audioCtx.currentTime;
            sirenOsc = audioCtx.createOscillator();
            sirenGain = audioCtx.createGain();

            sirenOsc.type = 'sawtooth';
            sirenOsc.frequency.setValueAtTime(140, holdStart);
            
            // Synthesize rising tone frequency
            sirenOsc.frequency.exponentialRampToValueAtTime(1100, holdStart + 3.0);
            
            sirenGain.gain.setValueAtTime(0.001, holdStart);
            sirenGain.gain.linearRampToValueAtTime(0.08, holdStart + 1.5);
            sirenGain.gain.exponentialRampToValueAtTime(0.0001, holdStart + 3.0);

            // Connect lowpass filter to make it sound warm/gritty
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, holdStart);
            filter.frequency.exponentialRampToValueAtTime(1200, holdStart + 3.0);

            sirenOsc.connect(filter);
            filter.connect(sirenGain);
            sirenGain.connect(audioCtx.destination);

            sirenOsc.start();
        };

        const stopSiren = () => {
            if (sirenOsc) {
                try {
                    sirenOsc.stop();
                    sirenOsc.disconnect();
                } catch(e){}
                sirenOsc = null;
            }
            if (sirenGain) {
                sirenGain.disconnect();
                sirenGain = null;
            }
        };

        // Shake controller
        const updateShakeAndPitch = () => {
            if (!holdStart) return;
            const elapsed = (audioCtx.currentTime - holdStart) * 1000;
            
            card.classList.remove('gumroad-shake-1', 'gumroad-shake-2', 'gumroad-shake-3');

            if (elapsed >= 3000) {
                // Exploded!
                stopSiren();
                holdStart = null;
                card.classList.remove('gumroad-shake-3');
                
                // Explode sound and flash
                playSound('explosion');
                const flash = document.createElement('div');
                flash.className = 'screen-flash flash-active';
                document.body.appendChild(flash);
                setTimeout(() => { flash.remove(); }, 600);
                return;
            }

            if (elapsed >= 2000) {
                card.classList.add('gumroad-shake-3');
            } else if (elapsed >= 1000) {
                card.classList.add('gumroad-shake-2');
            } else if (elapsed > 0) {
                card.classList.add('gumroad-shake-1');
            }

            animationFrameId = requestAnimationFrame(updateShakeAndPitch);
        };

        // Hook Card events
        card.addEventListener('mouseenter', () => {
            startSiren();
            updateShakeAndPitch();
        });

        card.addEventListener('mouseleave', () => {
            stopSiren();
            holdStart = null;
            cancelAnimationFrame(animationFrameId);
            card.classList.remove('gumroad-shake-1', 'gumroad-shake-2', 'gumroad-shake-3');
        });

        card.addEventListener('touchstart', () => {
            startSiren();
            updateShakeAndPitch();
        });

        card.addEventListener('touchend', () => {
            stopSiren();
            holdStart = null;
            cancelAnimationFrame(animationFrameId);
            card.classList.remove('gumroad-shake-1', 'gumroad-shake-2', 'gumroad-shake-3');
        });
    };

    // --- Initialize Everything ---
    const init = () => {
        injectSharedDOMElements();
        init3DCardTilt();
        initQuoteUnlock();
        initBubbleSandbox();
        initCassettePlayer();
        initGumroadEnhancements();
    };

    // Run on Dom load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
