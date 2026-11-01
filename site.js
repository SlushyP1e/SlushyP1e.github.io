// Shared by every page: footer year, Aussie clock, copy buttons.
// Any element with data-copy="text" copies that text when clicked;
// add data-toast="message" to change what the toast says.

document.querySelectorAll('.year').forEach((el) => { el.textContent = new Date().getFullYear(); });

// Live Aussie time
const clock = document.getElementById('local-time');
if (clock) {
  const opts = { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-AU', opts); };
  tick();
  setInterval(tick, 10000);
}

// Toast
const toast = document.createElement('div');
toast.className = 'toast';
toast.setAttribute('role', 'status');
const toastText = document.createElement('span');
toast.append(toastText);
document.body.append(toast);
let toastTimer;
const showToast = (message) => {
  toastText.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
};

// Copy buttons (delegated, so it also covers buttons added later)
document.addEventListener('click', async (e) => {
  const trigger = e.target.closest('[data-copy]');
  if (!trigger) return;
  try {
    await navigator.clipboard.writeText(trigger.dataset.copy);
    showToast(trigger.dataset.toast || 'Copied to clipboard ♡');
  } catch {
    showToast(`Couldn't copy, it's: ${trigger.dataset.copy}`);
  }
});

// Rip the taped photos off the homepage: drag far enough and one tears off and falls
if (document.body.classList.contains('rippable')) {
  const RIP_DISTANCE = 140;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stickBack = document.createElement('button');
  stickBack.type = 'button';
  stickBack.className = 'btn stick-back';
  stickBack.textContent = 'stick them back ♡';
  stickBack.hidden = true;
  document.body.append(stickBack);
  stickBack.addEventListener('click', () => {
    document.querySelectorAll('.polaroid.ripped').forEach((el) => el.classList.remove('ripped'));
    stickBack.hidden = true;
  });

  const fall = (el, dx, dy) => {
    const box = el.getBoundingClientRect();
    const clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('href');
    Object.assign(clone.style, {
      position: 'fixed', zIndex: 70, margin: 0, pointerEvents: 'none',
      width: `${el.offsetWidth}px`,
      left: `${box.left + box.width / 2 - el.offsetWidth / 2}px`,
      top: `${box.top + box.height / 2 - el.offsetHeight / 2}px`,
      translate: 'none', rotate: 'none',
    });
    const spin = dx >= 0 ? 1 : -1;
    const base = getComputedStyle(el).rotate;
    const start = base === 'none' ? 0 : parseFloat(base);
    document.body.append(clone);
    clone.animate([
      { transform: `rotate(${start}deg)` },
      { transform: `translate(${dx * 1.2}px, ${Math.min(dy, 0) - 30}px) rotate(${start + spin * 18}deg)`, offset: 0.25 },
      { transform: `translate(${dx * 2}px, ${innerHeight + box.height}px) rotate(${start + spin * 70}deg)` },
    ], { duration: 900, easing: 'cubic-bezier(.4,0,.8,.6)' }).onfinish = () => clone.remove();
  };

  document.querySelectorAll('main .polaroid').forEach((el) => {
    let startX, startY, dx, dy, dragging = false, moved = false, baseRotate = 0;

    const release = () => {
      dragging = false;
      el.classList.remove('dragging');
      el.style.removeProperty('translate');
      el.style.removeProperty('rotate');
    };

    el.addEventListener('dragstart', (e) => e.preventDefault());
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      startX = e.clientX; startY = e.clientY; dx = 0; dy = 0;
      dragging = true; moved = false;
      const base = getComputedStyle(el).rotate;
      baseRotate = base === 'none' ? 0 : parseFloat(base);
    });
    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      dx = e.clientX - startX; dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 6) return;
      if (!moved) { moved = true; el.setPointerCapture(e.pointerId); el.classList.add('dragging'); }
      el.style.setProperty('translate', `${dx}px ${dy}px`);
      el.style.setProperty('rotate', `${baseRotate + dx * 0.06}deg`, 'important');
    });
    el.addEventListener('pointerup', () => {
      if (!dragging) return;
      const ripped = moved && Math.hypot(dx, dy) > RIP_DISTANCE;
      if (ripped && !reduceMotion) fall(el, dx, dy);
      release();
      if (ripped) { el.classList.add('ripped'); stickBack.hidden = false; }
    });
    el.addEventListener('pointercancel', release);
    // A drag shouldn't also count as clicking the photo's link
    el.addEventListener('click', (e) => { if (moved) e.preventDefault(); moved = false; });
  });
}
