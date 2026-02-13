function renderGamesWindow(){
  const win = document.getElementById('win_games');
  if(!win) return;
  if(state.games.view === 'dope-skate'){
    // Dope Skate now runs as a standalone app window.
    state.games.view = 'list';
  }
  if(!win.dataset.ctxGuard){
    win.addEventListener('contextmenu', (e)=>{
      e.preventDefault();
      e.stopPropagation();
    });
    win.dataset.ctxGuard = '1';
  }
  const content = win.querySelector('.content');
  if(!content) return;
  content.innerHTML = CONTENT.games();
  content.dataset.fitKey = `games:${state.games.view}`;
  content.dataset.gamesView = state.games.view;
  delete content.dataset.fitMinW;
  delete content.dataset.fitMinH;
  applyI18nTo(win);
  const mobileGameView = isMobileGameMode() && state.games.view === 'snake';
  if(state.games.view === 'snake'){
    enterMobileFullscreen(state.games.view, win);
  } else {
    win.classList.remove('mobile-game');
  }

  if(state.games.view === 'list'){
    const firstId = getFirstGameId();
    if(!state.games.selectedId) state.games.selectedId = firstId;
    const items = Array.from(win.querySelectorAll('[data-game-id]'));
    if(state.games.selectedId && !items.some(item => item.dataset.gameId === state.games.selectedId)){
      state.games.selectedId = firstId;
    }
    const listEl = win.querySelector('#gamesList');
    if(listEl){
      const layout = state.games.layout === 'list' ? 'games-list' : 'games-grid';
      listEl.className = layout + (state.games.layout === 'grid' && state.games.bigIcons ? ' games-big' : '');
    }

    items.forEach(item => {
      const id = item.dataset.gameId;
      item.classList.toggle('selected', state.games.selectedId === id);
      item.addEventListener('click', (e)=>{
        if(e.detail > 1) return;
        state.games.selectedId = id;
        items.forEach(btn => btn.classList.toggle('selected', btn === item));
      });
      item.addEventListener('dblclick', (e)=>{
        e.stopPropagation();
        openGameFromHub(id);
      });
      item.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          openGameFromHub(id);
        }
      });
      makeGameItemDraggable(item, id);
    });
    if(!mobileGameView) smartFitWindow(win, 'tabChange');
    return;
  }

  if(state.games.view === 'leaderboard'){
    if(!mobileGameView) smartFitWindow(win, 'tabChange');
    return;
  }

  if(state.games.view === 'snake'){
    content.dataset.fitMinW = state.isMobile ? '280' : '500';
    content.dataset.fitMinH = state.isMobile ? '280' : '620';
    initSnakeInWindow(win);
    mountMobileGameDock('snake', win);
    if(!mobileGameView){
      const wstate = state.windows.get('games');
      const prevUserSized = wstate ? wstate.userSized : false;
      if(wstate) wstate.userSized = false;
      smartFitWindow(win, 'tabChange').finally(()=>{
        if(wstate) wstate.userSized = prevUserSized;
      });
    }
    return;
  }
  if(!mobileGameView){
    smartFitWindow(win, 'tabChange');
  }
}

function initGamesWindow(){
  renderGamesWindow();
}

function renderDopeSkateWindow(){
  const win = document.getElementById('win_dope-skate');
  if(!win) return;
  if(!win.dataset.ctxGuard){
    win.addEventListener('contextmenu', (e)=>{
      e.preventDefault();
      e.stopPropagation();
    });
    win.dataset.ctxGuard = '1';
  }
  const content = win.querySelector('.content');
  if(!content) return;
  content.innerHTML = CONTENT['dope-skate'] ? CONTENT['dope-skate']() : '';
  content.dataset.fitKey = 'dope-skate:standalone';
  content.dataset.fitMinW = state.isMobile ? '280' : '1360';
  content.dataset.fitMinH = state.isMobile ? '280' : '820';
  content.dataset.gamesView = 'dope-skate';
  applyI18nTo(win);
  const mobileGameView = isMobileGameMode();
  if(mobileGameView){
    enterMobileFullscreen('dope-skate', win);
    requestAnimationFrame(()=> enterMobileFullscreen('dope-skate', win));
  } else {
    win.classList.remove('mobile-game');
  }
  DopeSkateGame.mount(win);
  mountMobileGameDock('dope-skate', win);
  if(mobileGameView){
    // Guard against delayed window-fit writes overriding full-screen on first open.
    setTimeout(()=> enterMobileFullscreen('dope-skate', win), 120);
  } else {
    smartFitWindow(win, 'maximize');
  }
}

function initDopeSkateWindow(){
  renderDopeSkateWindow();
}

function getFirstGameId(){
  const items = state.folders.games || [];
  return items[0] || null;
}

const MOBILE_GAME_DEBUG = new URLSearchParams(window.location.search).get('mobile') === '1';
const MOBILE_GAME_MQ = window.matchMedia('(max-width: 520px)');
const MOBILE_GAME_COARSE = window.matchMedia('(pointer: coarse)');
const MOBILE_TOUCH_PRIORITY_WINDOW_MS = 320;
const mobileOverlayResetters = new Set();
let mobileOverlayCleanupBound = false;
const mobileTouchPointers = new Set();
let mobileTouchPriorityUntil = 0;

function isMobileGameMode(){
  return MOBILE_GAME_DEBUG || MOBILE_GAME_MQ.matches || MOBILE_GAME_COARSE.matches;
}

function markMobileTouchPointerDown(pointerId, pointerType){
  if(!Number.isFinite(pointerId)) return;
  if(pointerType !== 'touch' && pointerType !== 'pen') return;
  mobileTouchPointers.add(pointerId);
  mobileTouchPriorityUntil = performance.now() + MOBILE_TOUCH_PRIORITY_WINDOW_MS;
}

function markMobileTouchPointerUp(pointerId){
  if(!Number.isFinite(pointerId)) return;
  if(mobileTouchPointers.delete(pointerId)){
    mobileTouchPriorityUntil = performance.now() + MOBILE_TOUCH_PRIORITY_WINDOW_MS;
  }
}

function isMobileTouchPriorityActive(){
  return mobileTouchPointers.size > 0 || performance.now() < mobileTouchPriorityUntil;
}

function registerMobileOverlayResetter(fn){
  if(typeof fn !== 'function') return;
  mobileOverlayResetters.add(fn);
  if(mobileOverlayCleanupBound) return;
  mobileOverlayCleanupBound = true;
  const flush = ()=>{
    mobileOverlayResetters.forEach(resetFn => {
      try{ resetFn(); } catch {}
    });
    mobileTouchPointers.clear();
    mobileTouchPriorityUntil = 0;
  };
  window.addEventListener('blur', flush);
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState !== 'visible') flush();
  });
}

function enterMobileFullscreen(gameId, winEl){
  if(!winEl) return;
  const mobile = isMobileGameMode();
  winEl.classList.toggle('mobile-game', mobile);
  if(!mobile) return;

  const area = $('#desktopArea').getBoundingClientRect();
  const margin = 0;
  const newW = Math.max(240, Math.floor(area.width - margin * 2));
  const newH = Math.max(200, Math.floor(area.height - margin * 2));
  winEl.style.left = `${margin}px`;
  winEl.style.top = `${margin}px`;
  winEl.style.width = `${newW}px`;
  winEl.style.height = `${newH}px`;

  const winId = winEl.id ? winEl.id.replace(/^win_/, '') : 'games';
  const w = state.windows.get(winId);
  if(w){
    w.left = margin;
    w.top = margin;
    w.width = newW;
    w.height = newH;
  }
}

let mobileFullscreenArmed = false;
function armMobileFullscreen(targetEl){
  if(mobileFullscreenArmed || !targetEl) return;
  mobileFullscreenArmed = true;
  const handler = ()=>{
    if(document.fullscreenElement){
      mobileFullscreenArmed = false;
      return;
    }
    if(targetEl.requestFullscreen){
      targetEl.requestFullscreen().catch(()=>{});
    }
    mobileFullscreenArmed = false;
  };
  targetEl.addEventListener('pointerdown', handler, { once:true });
}

const PS1_SVG_ICONS = {
  arrow: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 6 18.4 14.5H5.6Z" fill="currentColor"/></svg>`,
  triangle: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4 20 19H4Z" fill="none" stroke="#2fb35a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`,
  circle: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="7.9" fill="none" stroke="#d93f5f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`,
  cross: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" fill="none" stroke="#2b78ff" stroke-width="2.35" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`,
  square: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="6.2" y="6.2" width="11.6" height="11.6" rx="1.5" fill="none" stroke="#7c4fd2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`,
};

function mountMobileGameDock(gameId, winEl){
  if(!winEl) return;
  const mobile = isMobileGameMode();
  const container = winEl.querySelector('.content');
  if(!container) return;
  let dock = container.querySelector(`.ps1-dock[data-game="${gameId}"]`);
  if(!mobile){
    if(dock) dock.remove();
    return;
  }
  if(!dock){
    dock = document.createElement('div');
    dock.className = 'ps1-dock';
    dock.dataset.game = gameId;
    dock.dataset.mode = state.mobileControlsMode;
    dock.innerHTML = `
      <div class="ps1-dock-body">
        <div class="ps1-brand">BLISS</div>
        <div class="ps1-dpad" data-mobile-dpad>
          <div class="ps1-dpad-cross" aria-hidden="true"></div>
          <button class="ps1-dpad-corner ne ps1-pressable" type="button" data-mobile-action="ne" data-i18n-aria="aria.mobile.controls.upRight" aria-label="${t('aria.mobile.controls.upRight')}"><span class="ps1-icon ps1-icon-arrow">${PS1_SVG_ICONS.arrow}</span></button>
          <button class="ps1-dpad-corner se ps1-pressable" type="button" data-mobile-action="se" data-i18n-aria="aria.mobile.controls.downRight" aria-label="${t('aria.mobile.controls.downRight')}"><span class="ps1-icon ps1-icon-arrow">${PS1_SVG_ICONS.arrow}</span></button>
          <button class="ps1-dpad-corner sw ps1-pressable" type="button" data-mobile-action="sw" data-i18n-aria="aria.mobile.controls.downLeft" aria-label="${t('aria.mobile.controls.downLeft')}"><span class="ps1-icon ps1-icon-arrow">${PS1_SVG_ICONS.arrow}</span></button>
          <button class="ps1-dpad-corner nw ps1-pressable" type="button" data-mobile-action="nw" data-i18n-aria="aria.mobile.controls.upLeft" aria-label="${t('aria.mobile.controls.upLeft')}"><span class="ps1-icon ps1-icon-arrow">${PS1_SVG_ICONS.arrow}</span></button>
          <button class="ps1-dpad-btn up ps1-pressable" type="button" data-mobile-action="up" data-i18n-aria="aria.mobile.controls.up" aria-label="${t('aria.mobile.controls.up')}"><span class="ps1-icon ps1-icon-arrow">${PS1_SVG_ICONS.arrow}</span></button>
          <button class="ps1-dpad-btn down ps1-pressable" type="button" data-mobile-action="down" data-i18n-aria="aria.mobile.controls.down" aria-label="${t('aria.mobile.controls.down')}"><span class="ps1-icon ps1-icon-arrow">${PS1_SVG_ICONS.arrow}</span></button>
          <button class="ps1-dpad-btn left ps1-pressable" type="button" data-mobile-action="left" data-i18n-aria="aria.mobile.controls.left" aria-label="${t('aria.mobile.controls.left')}"><span class="ps1-icon ps1-icon-arrow">${PS1_SVG_ICONS.arrow}</span></button>
          <button class="ps1-dpad-btn right ps1-pressable" type="button" data-mobile-action="right" data-i18n-aria="aria.mobile.controls.right" aria-label="${t('aria.mobile.controls.right')}"><span class="ps1-icon ps1-icon-arrow">${PS1_SVG_ICONS.arrow}</span></button>
        </div>
        <div class="ps1-stick" data-mobile-stick="left" data-i18n-aria="aria.mobile.controls.joystick" aria-label="${t('aria.mobile.controls.joystick')}">
          <div class="ps1-stick-knob"></div>
        </div>
        <div class="ps1-face">
          <button class="ps1-face-btn triangle ps1-pressable" type="button" data-mobile-action="trick2" data-i18n-aria="skate.action.trick2" aria-label="${t('skate.action.trick2')}"><span class="ps1-icon ps1-icon-shape">${PS1_SVG_ICONS.triangle}</span></button>
          <button class="ps1-face-btn circle ps1-pressable" type="button" data-mobile-action="trick3" data-i18n-aria="skate.action.trick3" aria-label="${t('skate.action.trick3')}"><span class="ps1-icon ps1-icon-shape">${PS1_SVG_ICONS.circle}</span></button>
          <button class="ps1-face-btn cross ps1-pressable" type="button" data-mobile-action="jump" data-i18n-aria="skate.action.jump" aria-label="${t('skate.action.jump')}"><span class="ps1-icon ps1-icon-shape">${PS1_SVG_ICONS.cross}</span></button>
          <button class="ps1-face-btn square ps1-pressable" type="button" data-mobile-action="trick1" data-i18n-aria="skate.action.trick1" aria-label="${t('skate.action.trick1')}"><span class="ps1-icon ps1-icon-shape">${PS1_SVG_ICONS.square}</span></button>
        </div>
        <div class="ps1-analog">
          <button class="ps1-analog-btn ps1-pressable" type="button" data-mobile-action="analog" data-i18n="mobile.controls.analog" data-i18n-aria="aria.mobile.controls.analog" aria-label="${t('aria.mobile.controls.analog')}" aria-pressed="${state.mobileControlsMode === 'analog' ? 'true' : 'false'}">${t('mobile.controls.analog')}</button>
          <span class="ps1-analog-led-rect"></span>
        </div>
        <div class="ps1-center">
          <button class="ps1-center-btn select ps1-pressable" type="button" data-mobile-action="select" data-i18n="mobile.controls.select" data-i18n-aria="aria.mobile.controls.select" aria-label="${t('aria.mobile.controls.select')}">${t('mobile.controls.select')}</button>
          <button class="ps1-center-btn start ps1-pressable" type="button" data-mobile-action="start" data-i18n="mobile.controls.start" data-i18n-aria="aria.mobile.controls.start" aria-label="${t('aria.mobile.controls.start')}">${t('mobile.controls.start')}</button>
        </div>
      </div>
    `;
    container.appendChild(dock);
  }
  applyI18nTo(dock);
  const analogBtn = dock.querySelector('.ps1-analog-btn');
  if(analogBtn) analogBtn.setAttribute('aria-pressed', state.mobileControlsMode === 'analog' ? 'true' : 'false');
  armMobileFullscreen(container);
  if(dock.dataset.bound !== '1'){
    bindMobileOverlay(gameId, dock);
    dock.dataset.bound = '1';
  }
}

function bindMobileOverlay(gameId, overlay){
  const pointerActions = new Map();
  const pointerOwners = new Map();
  let resetStickInput = ()=>{};

  function countAction(action){
    let total = 0;
    pointerActions.forEach(active => {
      if(active === action) total += 1;
    });
    return total;
  }

  function syncDopeSkateMobileHoldState(){
    if(gameId !== 'dope-skate') return;
    const leftHeld = state.mobileControlsMode === 'dpad' && countAction('left') > 0;
    const rightHeld = state.mobileControlsMode === 'dpad' && countAction('right') > 0;
    const jumpHeld = countAction('jump') > 0;
    dopeSkate.inputs.left = leftHeld;
    dopeSkate.inputs.right = rightHeld;
    dopeSkate.jumpHeld = jumpHeld;
  }

  function setButtonPressedVisual(btn){
    if(btn) btn.classList.add('is-pressed');
  }

  function clearButtonPressedVisual(btn, releasedPointerId = null){
    if(!btn) return;
    const stillPressed = Array.from(pointerOwners.entries()).some(([pid, owner])=>{
      if(releasedPointerId !== null && pid === releasedPointerId) return false;
      return owner === btn;
    });
    if(!stillPressed) btn.classList.remove('is-pressed');
  }

  function clearPointerState(pointerId, { releaseCapture = true } = {}){
    if(!Number.isFinite(pointerId)) return;
    const owner = pointerOwners.get(pointerId) || null;
    pointerOwners.delete(pointerId);
    pointerActions.delete(pointerId);
    clearButtonPressedVisual(owner, pointerId);
    markMobileTouchPointerUp(pointerId);
    if(owner && releaseCapture){
      try{ owner.releasePointerCapture(pointerId); } catch {}
    }
    syncDopeSkateMobileHoldState();
  }

  function resetMobileInputs(){
    const entries = Array.from(pointerOwners.entries());
    entries.forEach(([pointerId, owner])=>{
      if(owner){
        owner.classList.remove('is-pressed');
        try{ owner.releasePointerCapture(pointerId); } catch {}
      }
      markMobileTouchPointerUp(pointerId);
    });
    pointerOwners.clear();
    pointerActions.clear();
    resetStickInput();
    if(gameId === 'dope-skate'){
      dopeSkate.inputs.left = false;
      dopeSkate.inputs.right = false;
      dopeSkate.jumpHeld = false;
    }
  }

  registerMobileOverlayResetter(resetMobileInputs);

  function setMobileControlsMode(mode){
    const next = (mode === 'analog') ? 'analog' : 'dpad';
    state.mobileControlsMode = next;
    saveMobileControlsMode(next);
    $$('.ps1-dock').forEach(dock => {
      dock.dataset.mode = next;
      const analogBtn = dock.querySelector('.ps1-analog-btn');
      if(analogBtn) analogBtn.setAttribute('aria-pressed', next === 'analog' ? 'true' : 'false');
    });
    resetMobileInputs();
  }

  overlay.dataset.mode = state.mobileControlsMode;
  overlay.querySelectorAll('button[data-mobile-action]').forEach(btn => {
    btn.addEventListener('pointerdown', (e)=>{
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      const pointerId = e.pointerId;
      pointerActions.set(pointerId, btn.dataset.mobileAction || '');
      pointerOwners.set(pointerId, btn);
      setButtonPressedVisual(btn);
      markMobileTouchPointerDown(pointerId, e.pointerType);
      try{ btn.setPointerCapture(pointerId); } catch {}
      syncDopeSkateMobileHoldState();
    });
    btn.addEventListener('pointerup', (e)=>{
      clearPointerState(e.pointerId);
    });
    btn.addEventListener('pointercancel', (e)=>{
      clearPointerState(e.pointerId);
    });
    btn.addEventListener('lostpointercapture', (e)=>{
      clearPointerState(e.pointerId, { releaseCapture:false });
    });
  });

  const stick = overlay.querySelector('[data-mobile-stick="left"]');
  if(stick){
    const knob = stick.querySelector('.ps1-stick-knob');
    const radius = 36;
    let pointerId = null;
    let center = { x: 0, y: 0 };
    let lastDir = '';

    const updateStick = (dx, dy)=>{
      if(state.mobileControlsMode !== 'analog') return;
      const dist = Math.min(radius, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      const cx = Math.cos(angle) * dist;
      const cy = Math.sin(angle) * dist;
      if(knob) knob.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
      const normX = cx / radius;
      const normY = cy / radius;
      if(gameId === 'dope-skate' && isDopeSkateActive()){
        dopeSkate.inputs.left = normX < -0.35;
        dopeSkate.inputs.right = normX > 0.35;
      }
      if(gameId === 'snake' && isSnakeActive()){
        if(Math.abs(normX) > Math.abs(normY)){
          if(normX > 0.45 && lastDir !== 'r'){ snakeHandleDirection(1, 0); lastDir = 'r'; }
          if(normX < -0.45 && lastDir !== 'l'){ snakeHandleDirection(-1, 0); lastDir = 'l'; }
        } else {
          if(normY > 0.45 && lastDir !== 'd'){ snakeHandleDirection(0, 1); lastDir = 'd'; }
          if(normY < -0.45 && lastDir !== 'u'){ snakeHandleDirection(0, -1); lastDir = 'u'; }
        }
      }
    };

    const resetStick = ()=>{
      if(knob) knob.style.transform = 'translate(-50%, -50%)';
      if(gameId === 'dope-skate'){
        dopeSkate.inputs.left = false;
        dopeSkate.inputs.right = false;
      }
    };
    resetStickInput = resetStick;

    stick.addEventListener('pointerdown', (e)=>{
      if(e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      pointerId = e.pointerId;
      pointerActions.set(pointerId, 'analog-stick');
      pointerOwners.set(pointerId, stick);
      markMobileTouchPointerDown(pointerId, e.pointerType);
      const rect = stick.getBoundingClientRect();
      center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      stick.setPointerCapture(pointerId);
      updateStick(e.clientX - center.x, e.clientY - center.y);
    });

    stick.addEventListener('pointermove', (e)=>{
      if(pointerId === null || e.pointerId !== pointerId) return;
      e.preventDefault();
      e.stopPropagation();
      updateStick(e.clientX - center.x, e.clientY - center.y);
    });

    const endPointer = (e)=>{
      if(pointerId === null || e.pointerId !== pointerId) return;
      const releasedId = pointerId;
      pointerId = null;
      e.stopPropagation();
      resetStick();
      clearPointerState(releasedId, { releaseCapture:false });
      try{ stick.releasePointerCapture(e.pointerId); } catch {}
    };
    stick.addEventListener('pointerup', endPointer);
    stick.addEventListener('pointercancel', endPointer);
    stick.addEventListener('lostpointercapture', (e)=>{
      if(pointerId !== null && e.pointerId === pointerId){
        const releasedId = pointerId;
        pointerId = null;
        resetStick();
        clearPointerState(releasedId, { releaseCapture:false });
      }
    });
  }

  const dpad = overlay.querySelector('[data-mobile-dpad]');
  if(dpad){
    dpad.querySelectorAll('[data-mobile-action]').forEach(btn => {
      btn.addEventListener('pointerdown', (e)=>{
        if(state.mobileControlsMode !== 'dpad') return;
        e.preventDefault();
        e.stopPropagation();
        const action = btn.dataset.mobileAction;
        if(gameId === 'snake' && isSnakeActive()){
          if(action === 'up') snakeHandleDirection(0, -1);
          if(action === 'down') snakeHandleDirection(0, 1);
          if(action === 'left') snakeHandleDirection(-1, 0);
          if(action === 'right') snakeHandleDirection(1, 0);
        }
        if(gameId === 'dope-skate' && isDopeSkateActive()){
          if(dopeSkateMenuIsOpen()){
            if(action === 'up') dopeSkateMenuNavigate(0, -1);
            if(action === 'down') dopeSkateMenuNavigate(0, 1);
            if(action === 'left') dopeSkateMenuNavigate(-1, 0);
            if(action === 'right') dopeSkateMenuNavigate(1, 0);
            return;
          }
        }
      });
    });
  }

  overlay.querySelectorAll('[data-mobile-action]').forEach(btn => {
    btn.addEventListener('pointerdown', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      if(btn.dataset.mobileAction === 'analog'){
        setMobileControlsMode(state.mobileControlsMode === 'analog' ? 'dpad' : 'analog');
        return;
      }
      if(gameId === 'dope-skate' && isDopeSkateActive()){
        const action = btn.dataset.mobileAction;
        const menuOpen = dopeSkateMenuIsOpen();
        if(menuOpen){
          if(action === 'jump') dopeSkateMenuActivate();
          if(action === 'trick3') dopeSkateMenuBack();
          if(action === 'trick2') dopeSkateHideMenu();
          if(action === 'start') dopeSkateHideMenu();
          if(action === 'select') dopeSkateMenuBack();
          return;
        }
        if(action === 'jump') dopeSkateRegisterJump();
        if(action === 'trick1') dopeSkateRegisterTrick('trick1');
        if(action === 'trick2') dopeSkateRegisterTrick('trick2');
        if(action === 'trick3') dopeSkateRegisterTrick('trick3');
        if(action === 'start') dopeSkateShowMenu('play');
        if(action === 'select') dopeSkateShowMenu('play');
      }
      if(gameId === 'snake' && isSnakeActive()){
        const action = btn.dataset.mobileAction;
        if(action === 'ne' || action === 'nw' || action === 'se' || action === 'sw'){
          const dir = snake.dir || { x: 1, y: 0 };
          if(action === 'ne'){
            if(dir.x !== 0) snakeHandleDirection(0, -1);
            else snakeHandleDirection(1, 0);
          }
          if(action === 'nw'){
            if(dir.x !== 0) snakeHandleDirection(0, -1);
            else snakeHandleDirection(-1, 0);
          }
          if(action === 'se'){
            if(dir.x !== 0) snakeHandleDirection(0, 1);
            else snakeHandleDirection(1, 0);
          }
          if(action === 'sw'){
            if(dir.x !== 0) snakeHandleDirection(0, 1);
            else snakeHandleDirection(-1, 0);
          }
          return;
        }
        if(action === 'start'){
          if(!snake.started || snake.gameOver) snakeStartGame();
          else snakeTogglePause();
        }
        if(action === 'select') snakeStartGame();
        if(action === 'jump'){
          if(!snake.started || snake.gameOver) snakeStartGame();
        }
      }
    });
  });
}

function openGameFromHub(id){
  if(id === 'snake'){
    state.games.view = 'snake';
    state.games.selectedId = 'snake';
    renderGamesWindow();
    return;
  }
  if(id === 'dope-skate'){
    state.games.selectedId = 'dope-skate';
    state.games.view = 'list';
    if(state.windows.has('games')){
      renderGamesWindow();
    }
    openApp('dope-skate');
    return;
  }
  if(getAppById(id)){
    openApp(id);
  }
}

function backToGamesHub(){
  state.games.view = 'list';
  state.games.selectedId = getFirstGameId();
  snakeStop();
  if(state.windows.has('dope-skate')){
    closeApp('dope-skate');
  } else {
    DopeSkateGame.unmount();
  }
  if(!state.windows.has('games')){
    openApp('games');
  }
  renderGamesWindow();
  focusWindow('games');
}

const SNAKE_BASE_TICK_MS = 130;
const SNAKE_LEVEL_SCORE_STEP = 50;
const SNAKE_LEVEL_SPEED_DELTA = 7;
const SNAKE_MIN_SPEED_MS = 58;
const SNAKE_BONUS_SCORE = 30;
const SNAKE_BONUS_FOOD_EVERY = 4;
const SNAKE_BONUS_LIFETIME_TICKS = 28;
const SNAKE_MAX_TURN_QUEUE = 3;

const GAMES_LEADER_KEY = 'bliss98_games_leaderboard';

let snake = {
  grid: 20,
  body: [],
  dir: { x: 1, y: 0 },
  nextDir: { x: 1, y: 0 },
  turnQueue: [],
  food: { x: 0, y: 0 },
  bonusFood: null,
  foodsEaten: 0,
  tickCount: 0,
  advanceAccumulator: 0,
  eatPulses: [],
  running: false,
  paused: false,
  score: 0,
  gameOver: false,
  started: false,
  timer: null,
  cell: 16,
  baseSize: 320,
  renderScaleX: 1,
  renderScaleY: 1,
  renderDpr: 1,
  renderTargetW: 0,
  renderTargetH: 0,
  resizeObserver: null,
  resizeRaf: null,
  resizeHandler: null,
  ctx: null,
  els: null,
  swipeStart: null,
};

function loadSnakeHighScore(){
  try{
    const raw = localStorage.getItem(SNAKE_HIGH_KEY);
    const parsed = parseInt(raw || '0', 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveSnakeHighScore(score){
  try{ localStorage.setItem(SNAKE_HIGH_KEY, String(score)); } catch {}
}

function loadGamesLeaderboardData(){
  try{
    const raw = localStorage.getItem(GAMES_LEADER_KEY);
    if(raw) return JSON.parse(raw);
  } catch {}
  return { snake: { best: 0, lastPlayed: null }, dopeSkate: { best: 0, lastPlayed: null } };
}

function saveGamesLeaderboardData(data){
  try{ localStorage.setItem(GAMES_LEADER_KEY, JSON.stringify(data)); } catch {}
}

function recordGameScore(gameId, best, lastPlayed = null){
  const data = loadGamesLeaderboardData();
  const entry = data[gameId] || { best: 0, lastPlayed: null };
  if(best > entry.best){
    entry.best = best;
  }
  if(lastPlayed) entry.lastPlayed = lastPlayed;
  data[gameId] = entry;
  saveGamesLeaderboardData(data);
}

function getGamesLeaderboard(){
  const data = loadGamesLeaderboardData();
  // TODO: plug in backend leaderboard source.
  const items = [
    { id:'dopeSkate', label: t('games.dopeSkate'), best: data.dopeSkate ? data.dopeSkate.best : 0 },
    { id:'snake', label: t('games.snake'), best: data.snake ? data.snake.best : 0 },
  ];
  const total = items.reduce((sum, item)=>sum + (item.best || 0), 0);
  return { items, total };
}

function isSnakeActive(){
  return state.activeWindowId === 'games' && state.games.view === 'snake';
}

function snakeGetLevel(score = snake.score){
  return 1 + Math.floor(Math.max(0, score) / SNAKE_LEVEL_SCORE_STEP);
}

function snakeGetTickMs(){
  const base = SNAKE_BASE_TICK_MS;
  const levelDelta = Math.max(0, snakeGetLevel() - 1);
  return Math.max(SNAKE_MIN_SPEED_MS, base - levelDelta * SNAKE_LEVEL_SPEED_DELTA);
}

function snakeGetBonusTicksLeft(){
  if(!snake.bonusFood) return 0;
  return Math.max(0, snake.bonusFood.expiresAtTick - snake.tickCount);
}

function snakeGetBonusTimeLeftSec(){
  return snakeGetBonusTicksLeft() * (snakeGetTickMs() / 1000);
}

function snakeGetRandomEmptyCell(extraBlocked = []){
  const blocked = new Set();
  snake.body.forEach(seg => blocked.add(`${seg.x},${seg.y}`));
  extraBlocked.forEach(seg => {
    if(seg && Number.isFinite(seg.x) && Number.isFinite(seg.y)){
      blocked.add(`${seg.x},${seg.y}`);
    }
  });
  const free = [];
  for(let y = 0; y < snake.grid; y += 1){
    for(let x = 0; x < snake.grid; x += 1){
      if(!blocked.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if(!free.length) return null;
  return free[Math.floor(Math.random() * free.length)];
}

function snakeInstallTestingHooks(){
  window.render_game_to_text = snakeRenderGameToText;
  window.advanceTime = (ms)=>{
    snakeAdvanceTime(ms);
  };
}

function snakeRenderGameToText(){
  const mode = snake.gameOver ? 'game_over' : (snake.paused ? 'paused' : (snake.running ? 'running' : 'idle'));
  const payload = {
    game: 'snake',
    mode,
    coordinateSystem: 'Grid coordinates. Origin at top-left (0,0); x increases right, y increases down.',
    grid: { width: snake.grid, height: snake.grid },
    stepMs: snakeGetTickMs(),
    score: snake.score,
    highScore: state.snake.highScore || 0,
    level: snakeGetLevel(),
    snake: {
      direction: { x: snake.dir.x, y: snake.dir.y },
      nextDirection: { x: snake.nextDir.x, y: snake.nextDir.y },
      length: snake.body.length,
      body: snake.body.map(seg => ({ x: seg.x, y: seg.y })),
    },
    food: snake.food ? { x: snake.food.x, y: snake.food.y } : null,
    bonusFood: snake.bonusFood ? {
      x: snake.bonusFood.x,
      y: snake.bonusFood.y,
      ticksLeft: snakeGetBonusTicksLeft(),
      timeLeftSec: Number(snakeGetBonusTimeLeftSec().toFixed(2)),
    } : null,
  };
  return JSON.stringify(payload);
}

function snakeAdvanceTime(ms){
  if(!isSnakeActive()) return;
  if(!Number.isFinite(ms) || ms <= 0) return;
  const wasTicking = !!snake.timer;
  if(wasTicking) snakeStopLoop();
  snake.advanceAccumulator += ms;
  let guard = 0;
  while(snake.running && !snake.paused && !snake.gameOver && guard < 300){
    const step = snakeGetTickMs();
    if(snake.advanceAccumulator < step) break;
    snake.advanceAccumulator -= step;
    snakeTick();
    guard += 1;
  }
  if(wasTicking && snake.running && !snake.paused && !snake.gameOver){
    snakeStartLoop();
  }
}

function snakeResizeCanvas(){
  if(!snake.els || !snake.els.canvas || !snake.ctx) return;
  const board = snake.els.board;
  if(!board) return;
  const style = getComputedStyle(board);
  const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
  const padY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
  const innerW = Math.max(1, board.clientWidth - padX);
  const innerH = Math.max(1, board.clientHeight - padY);
  const side = Math.max(1, Math.floor(Math.min(innerW, innerH)));
  const targetW = side;
  const targetH = side;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if(targetW === snake.renderTargetW && targetH === snake.renderTargetH && snake.renderDpr === dpr) return;
  snake.renderScaleX = targetW / snake.baseSize;
  snake.renderScaleY = targetH / snake.baseSize;
  snake.renderDpr = dpr;
  snake.renderTargetW = targetW;
  snake.renderTargetH = targetH;
  if(snake.els.canvas.style.width !== `${targetW}px`) snake.els.canvas.style.width = `${targetW}px`;
  if(snake.els.canvas.style.height !== `${targetH}px`) snake.els.canvas.style.height = `${targetH}px`;
  snake.els.canvas.width = Math.max(1, Math.floor(targetW * dpr));
  snake.els.canvas.height = Math.max(1, Math.floor(targetH * dpr));
  snake.ctx.imageSmoothingEnabled = false;
}

function initSnakeInWindow(winEl){
  const board = winEl.querySelector('#snakeBoard');
  const canvas = winEl.querySelector('#snakeCanvas');
  if(!board || !canvas) return;

  snake.els = {
    board,
    canvas,
    actionBtn: winEl.querySelector('[data-snake-action="primary"]'),
    playAgainBtn: winEl.querySelector('[data-snake-action="playAgain"]'),
    score: winEl.querySelector('[data-snake-score]'),
    high: winEl.querySelector('[data-snake-high]'),
    overlay: winEl.querySelector('#snakeOverlay'),
    overlayTitle: winEl.querySelector('[data-snake-overlay-title]'),
    overlayMeta: winEl.querySelector('[data-snake-overlay-meta]'),
    overlayBtn: winEl.querySelector('[data-snake-overlay-btn]'),
    overScore: winEl.querySelector('[data-snake-over-score]'),
    length: winEl.querySelector('[data-snake-length]'),
    level: winEl.querySelector('[data-snake-level]'),
    bonus: winEl.querySelector('[data-snake-bonus]'),
    backBtn: winEl.querySelector('[data-games-action="back"]'),
  };

  snake.ctx = canvas.getContext('2d');
  snake.ctx.imageSmoothingEnabled = false;
  snake.renderTargetW = 0;
  snake.renderTargetH = 0;
  snake.renderScaleX = 1;
  snake.renderScaleY = 1;

  if(typeof state.snake.highScore !== 'number' || Number.isNaN(state.snake.highScore)){
    state.snake.highScore = loadSnakeHighScore();
  }

  const fixedSize = 320;
  snake.baseSize = fixedSize;
  canvas.width = fixedSize;
  canvas.height = fixedSize;
  canvas.style.width = fixedSize + 'px';
  canvas.style.height = fixedSize + 'px';
  snake.cell = Math.max(8, Math.floor(fixedSize / snake.grid));
  snakeDraw();
  snakeInstallTestingHooks();

  if(snake.els.backBtn){
    snake.els.backBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      backToGamesHub();
    });
  }
  if(snake.els.actionBtn){
    snake.els.actionBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      snakeHandlePrimaryAction();
    });
  }
  if(snake.els.playAgainBtn){
    snake.els.playAgainBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      if(snake.gameOver || !snake.started){
        snakeStartGame();
        return;
      }
      if(snake.paused){
        snakeTogglePause();
      }
    });
  }
  if(snake.resizeObserver){
    snake.resizeObserver.disconnect();
    snake.resizeObserver = null;
  }
  if(window.ResizeObserver){
    snake.resizeObserver = new ResizeObserver(()=>{
      if(snake.resizeRaf) return;
      snake.resizeRaf = requestAnimationFrame(()=>{
        snake.resizeRaf = null;
        snakeResizeCanvas();
      });
    });
    snake.resizeObserver.observe(board);
  }
  snakeResizeCanvas();
  if(!snake.resizeHandler){
    snake.resizeHandler = ()=>{
      if(snake.resizeRaf) return;
      snake.resizeRaf = requestAnimationFrame(()=>{
        snake.resizeRaf = null;
        snakeResizeCanvas();
      });
    };
    window.addEventListener('resize', snake.resizeHandler);
    window.addEventListener('orientationchange', snake.resizeHandler);
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', snake.resizeHandler);
    }
  }

  board.addEventListener('touchstart', snakeHandleTouchStart, { passive: false });
  board.addEventListener('touchmove', snakeHandleTouchMove, { passive: false });
  board.addEventListener('touchend', snakeHandleTouchEnd, { passive: false });
  board.addEventListener('pointerdown', (e)=>{
    if(e.pointerType === 'mouse' || e.pointerType === 'pen'){
      snakeHandleTap(e.clientX, e.clientY);
    }
  });

  snakePrepareBoard();
  updateSnakeUI();
}

function snakeSeedBody(){
  const mid = Math.floor(snake.grid / 2);
  snake.body = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

function snakeResetRoundState(){
  snake.dir = { x: 1, y: 0 };
  snake.nextDir = { x: 1, y: 0 };
  snake.turnQueue = [];
  snake.score = 0;
  snake.eatPulses = [];
  snake.foodsEaten = 0;
  snake.tickCount = 0;
  snake.bonusFood = null;
  snake.advanceAccumulator = 0;
}

function snakePrepareBoard(){
  snakeStopLoop();
  snake.running = false;
  snake.paused = false;
  snake.gameOver = false;
  snake.started = false;
  snakeResetRoundState();
  snakeSeedBody();
  snakePlaceFood();
  snakeDraw();
  updateSnakeUI();
}

function snakeStartGame(){
  snakeResetRoundState();
  snakeSeedBody();
  snake.running = true;
  snake.paused = false;
  snake.gameOver = false;
  snake.started = true;
  recordGameScore('snake', state.snake.highScore || 0, new Date().toISOString());
  snakePlaceFood();
  snakeStartLoop();
  updateSnakeUI();
  snakeDraw();
}

function snakeStartLoop(){
  snakeStopLoop();
  if(!snake.running || snake.paused || snake.gameOver) return;
  const loop = ()=>{
    snake.timer = null;
    snakeTick();
    if(!snake.running || snake.paused || snake.gameOver) return;
    snake.timer = setTimeout(loop, snakeGetTickMs());
  };
  snake.timer = setTimeout(loop, snakeGetTickMs());
}

function snakeStopLoop(){
  if(snake.timer){
    clearTimeout(snake.timer);
    snake.timer = null;
  }
}

function snakeTogglePause(){
  if(!snake.running || snake.gameOver) return;
  snake.paused = !snake.paused;
  if(snake.paused){
    snakeStopLoop();
  } else {
    snakeStartLoop();
  }
  updateSnakeUI();
}

function snakeHandlePrimaryAction(){
  if(!snake.started || snake.gameOver){
    snakeStartGame();
    return;
  }
  snakeTogglePause();
}

function snakeStop(){
  snakeStopLoop();
  snake.running = false;
  snake.paused = false;
  snake.gameOver = false;
  snake.started = false;
  snake.turnQueue = [];
  snake.bonusFood = null;
  snake.advanceAccumulator = 0;
  if(snake.resizeObserver){
    snake.resizeObserver.disconnect();
    snake.resizeObserver = null;
  }
  if(snake.resizeHandler){
    window.removeEventListener('resize', snake.resizeHandler);
    window.removeEventListener('orientationchange', snake.resizeHandler);
    if(window.visualViewport){
      window.visualViewport.removeEventListener('resize', snake.resizeHandler);
    }
    snake.resizeHandler = null;
  }
  snake.els = null;
  snake.ctx = null;
}

function snakeApplyQueuedDirection(){
  while(snake.turnQueue.length){
    const queued = snake.turnQueue.shift();
    if(queued.x === -snake.dir.x && queued.y === -snake.dir.y) continue;
    snake.nextDir = queued;
    return;
  }
}

function snakeMaybeSpawnBonusFood(){
  if(snake.bonusFood) return;
  if(snake.foodsEaten <= 0 || snake.foodsEaten % SNAKE_BONUS_FOOD_EVERY !== 0) return;
  const cell = snakeGetRandomEmptyCell([snake.food]);
  if(!cell) return;
  snake.bonusFood = {
    x: cell.x,
    y: cell.y,
    expiresAtTick: snake.tickCount + SNAKE_BONUS_LIFETIME_TICKS,
  };
}

function snakeMaybeExpireBonusFood(){
  if(!snake.bonusFood) return;
  if(snake.tickCount >= snake.bonusFood.expiresAtTick){
    snake.bonusFood = null;
  }
}

function snakeTick(){
  if(!snake.running || snake.paused || snake.gameOver) return;
  snakeApplyQueuedDirection();
  snake.dir = { ...snake.nextDir };
  snake.tickCount += 1;
  snakeMaybeExpireBonusFood();
  const head = snake.body[0];
  const next = {
    x: (head.x + snake.dir.x + snake.grid) % snake.grid,
    y: (head.y + snake.dir.y + snake.grid) % snake.grid,
  };
  const willEatFood = next.x === snake.food.x && next.y === snake.food.y;
  const willEatBonus = !!snake.bonusFood && next.x === snake.bonusFood.x && next.y === snake.bonusFood.y;
  const willGrow = willEatFood || willEatBonus;
  const bodyToCheck = willGrow ? snake.body : snake.body.slice(0, -1);
  if(bodyToCheck.some(seg => seg.x === next.x && seg.y === next.y)){
    snakeGameOver();
    return;
  }

  snake.body.unshift(next);
  const ateFood = willEatFood;
  const ateBonus = willEatBonus;
  if(ateFood){
    snake.score += 10;
    snake.foodsEaten += 1;
    snakePlaceFood();
    snakeMaybeSpawnBonusFood();
    snake.eatPulses.push({ t: 0, bonus: false });
  }
  if(ateBonus){
    snake.score += SNAKE_BONUS_SCORE;
    snake.bonusFood = null;
    snake.eatPulses.push({ t: 0, bonus: true });
  }
  if(!ateFood && !ateBonus){
    snake.body.pop();
  }
  if(snake.eatPulses.length){
    snake.eatPulses.forEach(p => { p.t += 1; });
    snake.eatPulses = snake.eatPulses.filter(p => p.t < snake.body.length - 1);
  }
  snakeDraw();
  updateSnakeUI();
}

function snakePlaceFood(){
  const cell = snakeGetRandomEmptyCell(snake.bonusFood ? [snake.bonusFood] : []);
  if(cell) snake.food = cell;
}

function snakeGameOver(){
  snake.running = false;
  snake.paused = false;
  snake.gameOver = true;
  snakeStopLoop();
  if(snake.score > state.snake.highScore){
    state.snake.highScore = snake.score;
    saveSnakeHighScore(state.snake.highScore);
  }
  recordGameScore('snake', state.snake.highScore, new Date().toISOString());
  snakeDraw();
  updateSnakeUI();
}

function snakeDraw(){
  if(!snake.ctx || !snake.els) return;
  const ctx = snake.ctx;
  const cell = snake.cell;
  const base = snake.baseSize || 320;
  const dpr = snake.renderDpr || 1;
  const scaleX = snake.renderScaleX || 1;
  const scaleY = snake.renderScaleY || 1;

  ctx.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0);
  ctx.clearRect(0, 0, base, base);
  const tileLight = '#8ea77a';
  const tileDark = '#7a9168';
  ctx.fillStyle = tileLight;
  ctx.fillRect(0, 0, base, base);
  for(let y = 0; y < snake.grid; y += 1){
    for(let x = 0; x < snake.grid; x += 1){
      if((x + y) % 2 === 0){
        ctx.fillStyle = tileDark;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }

  const pad = 0;
  snake.body.forEach((seg, idx)=>{
    const x = seg.x * cell + pad;
    const y = seg.y * cell + pad;
    const w = cell - pad * 2;
    const h = cell - pad * 2;
    const radius = Math.max(2, Math.floor(w * 0.2));
    ctx.fillStyle = idx === 0 ? '#2f6f2f' : '#3f8a3f';
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#245a24';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  const head = snake.body[0];
  if(head){
    const hx = head.x * cell + cell / 2;
    const hy = head.y * cell + cell / 2;
    const dir = snake.dir;
    const noseLen = Math.max(4, cell * 0.28);
    ctx.fillStyle = '#2a5f2a';
    ctx.beginPath();
    ctx.moveTo(hx + dir.x * noseLen, hy + dir.y * noseLen);
    ctx.lineTo(hx + dir.y * (noseLen * 0.6), hy - dir.x * (noseLen * 0.6));
    ctx.lineTo(hx - dir.y * (noseLen * 0.6), hy + dir.x * (noseLen * 0.6));
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#0e2910';
    const eyeOffset = Math.max(2, cell * 0.15);
    ctx.beginPath();
    ctx.arc(hx + dir.y * eyeOffset, hy - dir.x * eyeOffset, 1.5, 0, Math.PI * 2);
    ctx.arc(hx - dir.y * eyeOffset, hy + dir.x * eyeOffset, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d14b4b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx + dir.x * (noseLen + 2), hy + dir.y * (noseLen + 2));
    ctx.lineTo(hx + dir.x * (noseLen + 8), hy + dir.y * (noseLen + 8));
    ctx.stroke();
  }

  if(snake.eatPulses.length){
    snake.eatPulses.forEach(pulse => {
      const idx = Math.floor(pulse.t);
      const nextIdx = Math.min(idx + 1, snake.body.length - 1);
      const segA = snake.body[idx];
      const segB = snake.body[nextIdx];
      if(!segA || !segB) return;
      const frac = pulse.t - idx;
      const px = (segA.x + (segB.x - segA.x) * frac) * cell + cell / 2;
      const py = (segA.y + (segB.y - segA.y) * frac) * cell + cell / 2;
      ctx.fillStyle = pulse.bonus ? '#f2c84e' : '#2a5f2a';
      ctx.beginPath();
      ctx.arc(px, py, Math.max(2, cell * 0.16), 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const appleX = snake.food.x * cell + cell / 2;
  const appleY = snake.food.y * cell + cell / 2;
  const appleR = Math.max(4, cell * 0.28);
  ctx.fillStyle = '#c51f2f';
  ctx.beginPath();
  ctx.arc(appleX, appleY, appleR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b3a1a';
  ctx.fillRect(appleX - 1, appleY - appleR - 4, 2, 6);
  ctx.fillStyle = '#2f7d2f';
  ctx.beginPath();
  ctx.ellipse(appleX + 4, appleY - appleR - 2, 4, 2, -0.6, 0, Math.PI * 2);
  ctx.fill();

  if(snake.bonusFood){
    const bonusX = snake.bonusFood.x * cell + cell / 2;
    const bonusY = snake.bonusFood.y * cell + cell / 2;
    const outer = Math.max(4, cell * 0.34);
    const inner = outer * 0.5;
    const pulse = 0.75 + 0.25 * Math.sin(snake.tickCount * 0.5);
    ctx.save();
    ctx.translate(bonusX, bonusY);
    ctx.rotate(snake.tickCount * 0.08);
    ctx.beginPath();
    for(let i = 0; i < 10; i += 1){
      const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 10;
      const radius = i % 2 === 0 ? outer : inner;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if(i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(245, 211, 94, ${pulse.toFixed(3)})`;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#8d5f0b';
    ctx.stroke();
    ctx.restore();
  }
}


function snakeHandleDirection(dx, dy){
  if(!isSnakeActive()) return;
  const next = { x: dx, y: dy };
  const lastQueued = snake.turnQueue.length ? snake.turnQueue[snake.turnQueue.length - 1] : snake.nextDir;
  if(next.x === lastQueued.x && next.y === lastQueued.y) return;
  if(next.x === -lastQueued.x && next.y === -lastQueued.y) return;
  snake.turnQueue.push(next);
  if(snake.turnQueue.length > SNAKE_MAX_TURN_QUEUE){
    snake.turnQueue.shift();
  }
  if(!snake.running){
    snake.nextDir = next;
    snake.dir = next;
    snakeDraw();
  }
}

function snakeHandleKey(e){
  if(!isSnakeActive()) return false;
  const tag = e.target && e.target.tagName;
  if(tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return false;

  const key = e.key.toLowerCase();
  let handled = true;
  if(key === 'arrowup' || key === 'w') snakeHandleDirection(0, -1);
  else if(key === 'arrowdown' || key === 's') snakeHandleDirection(0, 1);
  else if(key === 'arrowleft' || key === 'a') snakeHandleDirection(-1, 0);
  else if(key === 'arrowright' || key === 'd') snakeHandleDirection(1, 0);
  else if(key === ' ' || key === 'spacebar' || key === 'p') snakeTogglePause();
  else if(key === 'enter'){
    if(!snake.started || snake.gameOver){
      snakeStartGame();
    } else if(snake.paused){
      snakeTogglePause();
    } else {
      handled = false;
    }
  }
  else handled = false;

  if(handled){
    e.preventDefault();
  }
  return handled;
}

function snakeHandleTouchStart(e){
  if(state.windows.has('games') && state.activeWindowId !== 'games'){
    focusWindow('games');
  }
  if(!isSnakeActive()) return;
  e.preventDefault();
  const touch = e.changedTouches[0];
  snake.swipeStart = { x: touch.clientX, y: touch.clientY, t: Date.now() };
}

function snakeHandleTouchMove(e){
  if(!isSnakeActive()) return;
  e.preventDefault();
}

function snakeHandleTouchEnd(e){
  if(!isSnakeActive() || !snake.swipeStart) return;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - snake.swipeStart.x;
  const dy = touch.clientY - snake.swipeStart.y;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if(Math.max(absX, absY) < 18){
    snakeHandleTap(touch.clientX, touch.clientY);
    snake.swipeStart = null;
    return;
  }
  if(absX > absY){
    snakeHandleDirection(dx > 0 ? 1 : -1, 0);
  } else {
    snakeHandleDirection(0, dy > 0 ? 1 : -1);
  }
  snake.swipeStart = null;
}

function snakeHandleTap(clientX, clientY){
  if(!isSnakeActive() || !snake.els || !snake.els.canvas) return;
  const rect = snake.els.canvas.getBoundingClientRect();
  const scaleX = rect.width / (snake.baseSize || rect.width);
  const scaleY = rect.height / (snake.baseSize || rect.height);
  const x = (clientX - rect.left) / scaleX;
  const y = (clientY - rect.top) / scaleY;
  const head = snake.body[0];
  if(!head) return;
  const headX = (head.x + 0.5) * snake.cell;
  const headY = (head.y + 0.5) * snake.cell;
  const dx = x - headX;
  const dy = y - headY;
  if(Math.abs(dx) > Math.abs(dy)){
    snakeHandleDirection(dx > 0 ? 1 : -1, 0);
  } else {
    snakeHandleDirection(0, dy > 0 ? 1 : -1);
  }
}

function updateSnakeUI(){
  if(!snake.els) return;
  if(snake.els.score) snake.els.score.textContent = String(snake.score);
  if(snake.els.high) snake.els.high.textContent = String(state.snake.highScore || 0);
  if(snake.els.overScore) snake.els.overScore.textContent = String(snake.score);
  if(snake.els.length) snake.els.length.textContent = String(snake.body.length || 0);
  if(snake.els.level) snake.els.level.textContent = String(snakeGetLevel());
  if(snake.els.bonus){
    snake.els.bonus.textContent = snake.bonusFood ? `${snakeGetBonusTimeLeftSec().toFixed(1)}s` : t('snake.bonus.none');
  }
  if(snake.els.overlay){
    const showOverlay = snake.gameOver || snake.paused;
    snake.els.overlay.classList.toggle('hidden', !showOverlay);
  }
  if(snake.els.overlayTitle){
    if(snake.gameOver) snake.els.overlayTitle.textContent = t('snake.gameOver');
    else if(snake.paused) snake.els.overlayTitle.textContent = t('snake.paused');
    else snake.els.overlayTitle.textContent = t('snake.gameOver');
  }
  if(snake.els.overlayBtn){
    if(snake.gameOver) snake.els.overlayBtn.textContent = t('snake.playAgain');
    else if(snake.paused) snake.els.overlayBtn.textContent = t('snake.resume');
    else snake.els.overlayBtn.textContent = t('snake.playAgain');
  }
  if(snake.els.overlayMeta){
    snake.els.overlayMeta.classList.toggle('hidden', !snake.gameOver && !snake.paused);
  }
  if(snake.els.actionBtn){
    snake.els.actionBtn.classList.toggle('pressed', snake.paused);
    if(!snake.started || snake.gameOver){
      snake.els.actionBtn.textContent = t('snake.start');
    } else if(snake.paused){
      snake.els.actionBtn.textContent = t('snake.resume');
    } else {
      snake.els.actionBtn.textContent = t('snake.pause');
    }
  }
}

const DOPE_SKATE_ASSETS = {
  sky: './assets/skate/sky/sky.svg',
  city: './assets/skate/background/city.svg',
  ground: './assets/skate/ground/ground.svg',
  skaterBodyCore: './assets/skate/skater/body_core.svg?v=1',
  skaterBodyCoreStep: './assets/skate/skater/body_core_step.svg?v=1',
  skaterBodyStreet: './assets/skate/skater/body_street.svg?v=1',
  skaterBodyStreetStep: './assets/skate/skater/body_street_step.svg?v=1',
  skaterBodySkeleton: './assets/skate/skater/body_skeleton.svg?v=1',
  skaterBodySkeletonStep: './assets/skate/skater/body_skeleton_step.svg?v=1',
  // Backward-compatible fallback keys.
  skaterBody: './assets/skate/skater/body_core.svg?v=1',
  skaterBodyStep: './assets/skate/skater/body_core_step.svg?v=1',
  deck: './assets/skate/board/board.svg',
  hat: './assets/skate/hat/hat.svg',
  vodka: './assets/skate/obstacles/vodka.svg',
  trash: './assets/skate/obstacles/trash.svg',
  cone: './assets/skate/obstacles/cone.svg',
  rail: './assets/skate/obstacles/rail.svg',
  cd: './assets/skate/collectibles/cd.svg',
  bliss: './assets/skate/collectibles/bliss-letter.svg',
};

const DOPE_SKATE_SPRITES = {
  skater: {
    frameW: 64,
    frameH: 96,
    animations: {
      idle: { file: 'skater_idle', frames: 2, fps: 6, loop: true },
      push: { file: 'skater_push', frames: 4, fps: 10, loop: true },
      ollie: { file: 'skater_ollie', frames: 3, fps: 12, loop: false },
      land: { file: 'skater_land', frames: 2, fps: 12, loop: false },
      air: { file: 'skater_idle', frames: 2, fps: 6, loop: true },
      grind: { file: 'skater_grind_5050', frames: 3, fps: 10, loop: true },
      bail: { file: 'skater_bail', frames: 3, fps: 8, loop: false },
    },
  },
  board: {
    frameW: 96,
    frameH: 24,
    animations: {
      grip: { file: 'board_grip', frames: 1, fps: 0, loop: true },
    },
  },
  wheels: {
    frameW: 16,
    frameH: 16,
    animations: {
      default: { file: 'wheel_default', frames: 1, fps: 0, loop: true },
    },
  },
};

const DOPE_SKATE_SPRITE_VERSION = '3';
const DOPE_SKATE_SPRITE_VARIANTS = {
  skater: new Set([]),
  board: new Set([]),
  wheels: new Set([]),
};

const DOPE_SKATE_DATA_KEY = 'bliss98_dope_skate_data';

const DOPE_SKATE_TRICKS = [
  { id:'ollie', name:'Ollie', points: 120 },
  { id:'kickflip', name:'Kickflip', points: 220 },
  { id:'shuvit', name:'Shuv-it', points: 180 },
  { id:'hardflip', name:'Hardflip', points: 260 },
  { id:'heelflip', name:'Heelflip', points: 220 },
  { id:'varial', name:'Varial Kickflip', points: 280 },
  { id:'laserflip', name:'Laserflip', points: 340 },
  { id:'inward', name:'Inward Heelflip', points: 320 },
  { id:'lateflip', name:'Late Flip', points: 300 },
];

const DOPE_SKATE_GRINDS = [
  { id:'50-50', name:'50-50', pointsPerSec: 140 },
  { id:'boardslide', name:'Boardslide', pointsPerSec: 160 },
  { id:'noseslide', name:'Noseslide', pointsPerSec: 160 },
];

// Difficulty knobs: speed affects base/max speed, spawn affects obstacle gaps, score affects base/combo points.
const DOPE_SKATE_DIFFICULTY = {
  easy: { speed: 0.85, spawn: 1.35, score: 0.7 },
  medium: { speed: 1.0, spawn: 1.0, score: 1.0 },
  hard: { speed: 1.2, spawn: 0.8, score: 1.35 },
};

const DOPE_SKATE_CURVE = {
  easy: { rampSeconds: 96, speedGain: 104, maxGain: 156, spawnTighten: 0.2, reactionBase: 1.58, reactionMin: 1.22 },
  medium: { rampSeconds: 84, speedGain: 122, maxGain: 176, spawnTighten: 0.28, reactionBase: 1.42, reactionMin: 1.06 },
  hard: { rampSeconds: 72, speedGain: 142, maxGain: 196, spawnTighten: 0.35, reactionBase: 1.28, reactionMin: 0.94 },
};

const DOPE_SKATE_COMBAT = {
  comboWindowSec: 1.1,
  perfectLandingMaxAgeSec: 0.92,
  perfectLandingMaxImpact: 460,
  sketchyLandingMinImpact: 620,
};

const DOPE_SKATE_MISSION_TIERS = [
  { key: 'easy', minRunTime: 0 },
  { key: 'medium', minRunTime: 45 },
  { key: 'hard', minRunTime: 100 },
];

const DOPE_SKATE_MISSION_TEMPLATES = [
  {
    id: 'grind-chain',
    type: 'grindCount',
    tiers: {
      easy: { label: 'Hit 3 grinds', target: 3, rewardCd: 2, rewardScore: 260 },
      medium: { label: 'Hit 5 grinds', target: 5, rewardCd: 3, rewardScore: 360 },
      hard: { label: 'Hit 7 grinds', target: 7, rewardCd: 4, rewardScore: 460 },
    },
  },
  {
    id: 'combo-builder',
    type: 'comboMultiplier',
    tiers: {
      easy: { label: 'Land a 5x combo', target: 5, rewardCd: 3, rewardScore: 340 },
      medium: { label: 'Land a 7x combo', target: 7, rewardCd: 4, rewardScore: 470 },
      hard: { label: 'Land a 9x combo', target: 9, rewardCd: 5, rewardScore: 620 },
    },
  },
  {
    id: 'cd-crate',
    type: 'cdCollect',
    tiers: {
      easy: { label: 'Collect 4 CDs', target: 4, rewardCd: 2, rewardScore: 230 },
      medium: { label: 'Collect 6 CDs', target: 6, rewardCd: 3, rewardScore: 330 },
      hard: { label: 'Collect 8 CDs', target: 8, rewardCd: 4, rewardScore: 430 },
    },
  },
  {
    id: 'clean-landing',
    type: 'cleanLanding',
    tiers: {
      easy: { label: 'Land 2 clean combos', target: 2, rewardCd: 2, rewardScore: 300 },
      medium: { label: 'Land 3 clean combos', target: 3, rewardCd: 3, rewardScore: 410 },
      hard: { label: 'Land 4 clean combos', target: 4, rewardCd: 4, rewardScore: 540 },
    },
  },
];

const DOPE_SKATE_SPAWN_PATTERNS = [
  {
    id: 'warmup-cone',
    minSpeed: 0,
    maxSpeed: 999,
    length: 360,
    events: [
      { offset: 0, type: 'obstacle', obstacleKey: 'cone', lane: 0 },
      { offset: 180, type: 'cd', lane: 'mid' },
    ],
  },
  {
    id: 'double-lane',
    minSpeed: 210,
    maxSpeed: 999,
    length: 470,
    events: [
      { offset: 0, type: 'obstacle', obstacleKey: 'trash', lane: -6 },
      { offset: 240, type: 'obstacle', obstacleKey: 'cone', lane: 0 },
      { offset: 330, type: 'cd', lane: 'high' },
    ],
  },
  {
    id: 'rail-flow',
    minSpeed: 240,
    maxSpeed: 999,
    length: 540,
    events: [
      { offset: 0, type: 'obstacle', obstacleKey: 'cone', lane: 0 },
      { offset: 230, type: 'rail', kind: 'short' },
      { offset: 360, type: 'cd', lane: 'mid' },
    ],
  },
  {
    id: 'vodka-pressure',
    minSpeed: 260,
    maxSpeed: 999,
    length: 560,
    events: [
      { offset: 0, type: 'obstacle', obstacleKey: 'vodka', lane: 0 },
      { offset: 300, type: 'obstacle', obstacleKey: 'trash', lane: -6 },
      { offset: 420, type: 'cd', lane: 'low' },
    ],
  },
  {
    id: 'rail-bliss',
    minSpeed: 280,
    maxSpeed: 999,
    length: 620,
    events: [
      { offset: 0, type: 'obstacle', obstacleKey: 'cone', lane: 0 },
      { offset: 250, type: 'rail', kind: 'long' },
      { offset: 420, type: 'bliss', lane: 'high' },
    ],
  },
  {
    id: 'double-rail-tech',
    minSpeed: 260,
    maxSpeed: 999,
    length: 760,
    events: [
      { offset: 120, type: 'rail', kind: 'double' },
      { offset: 290, type: 'cd', lane: 'mid' },
      { offset: 430, type: 'rail', kind: 'short' },
    ],
  },
  {
    id: 'recovery-line',
    minSpeed: 0,
    maxSpeed: 999,
    length: 420,
    events: [
      { offset: 120, type: 'cd', lane: 'mid' },
      { offset: 260, type: 'obstacle', obstacleKey: 'cone', lane: 0 },
    ],
  },
];

const DOPE_SKATE_SHOP = {
  ground: [
    { id:'classic', name:'Classic Asphalt', cost: 0, asset:'ground' },
    { id:'night', name:'Night Asphalt', cost: 120, asset:'ground' },
  ],
  background: [
    { id:'city', name:'City Lights', cost: 0, asset:'city' },
    { id:'industrial', name:'Industrial Blocks', cost: 180, asset:'city' },
  ],
  sky: [
    { id:'sky', name:'Clean Sky', cost: 0, asset:'sky' },
    { id:'sunset', name:'Sunset Haze', cost: 140, asset:'sky' },
  ],
  skater: [
    { id:'core', name:'Core Skater', cost: 0, bodyAsset:'skaterBodyCore', stepAsset:'skaterBodyCoreStep' },
    { id:'street', name:'Street Fit', cost: 220, bodyAsset:'skaterBodyStreet', stepAsset:'skaterBodyStreetStep' },
    { id:'skeleton', name:'Skeleton Bones', cost: 6666, bodyAsset:'skaterBodySkeleton', stepAsset:'skaterBodySkeletonStep' },
  ],
  hat: [
    { id:'none', name:'No Cap', cost: 0, asset:null },
    { id:'red', name:'Red Cap', cost: 0, asset:'hat' },
    { id:'black', name:'Black Cap', cost: 90, asset:'hat' },
  ],
  board: [
    { id:'classic', name:'Classic Deck', cost: 0, asset:'board' },
    { id:'chrome', name:'Chrome Deck', cost: 200, asset:'board' },
  ],
  wheels: [
    { id:'black', name:'Black Wheels', cost: 0, asset:'wheels' },
    { id:'blue', name:'Blue Wheels', cost: 110, asset:'wheels' },
  ],
};

let dopeSkate = {
  canvas: null,
  ctx: null,
  els: null,
  width: 640,
  height: 360,
  groundHeight: 64,
  player: null,
  obstacles: [],
  rails: [],
  collectibles: [],
  particles: [],
  spawn: {
    nextPatternDist: 220,
    queue: [],
    lastPatternId: null,
    nextLetterDist: 880,
  },
  lastObstacleDist: 0,
  lastRailDist: 0,
  lastObstacleLane: 0,
  speed: 240,
  baseSpeed: 240,
  maxSpeed: 420,
  baseMaxSpeed: 420,
  accel: 8,
  gravity: 1500,
  jumpVel: -420,
  jumpHoldMax: 0.22,
  jumpHoldForce: 1700,
  time: 0,
  distance: 0,
  scoreBase: 0,
  comboBank: 0,
  scoreTotal: 0,
  cds: 0,
  blissCounts: { B: 0, L: 0, I: 0, S: 0 },
  combo: {
    points: 0,
    tricks: [],
    unique: new Set(),
    multiplier: 1,
    active: false,
    lastLandingQuality: '',
  },
  comboWindow: DOPE_SKATE_COMBAT.comboWindowSec,
  running: false,
  paused: false,
  gameOver: false,
  started: false,
  raf: null,
  lastTime: 0,
  assets: null,
  assetsReady: false,
  assetsLoading: false,
  sprites: null,
  spritesReady: false,
  spritesLoading: null,
  spriteKey: '',
  spriteDirty: false,
  previewSprites: null,
  previewSpriteKey: '',
  previewSpritesLoading: null,
  offsets: { sky: 0, city: 0, ground: 0 },
  inputs: { left: false, right: false },
  jumpHeld: false,
  jumpBufferUntil: 0,
  lastGroundedAt: 0,
  lastTrickAt: 0,
  lastTrickId: null,
  cameraShake: 0,
  gamepad: {
    jump: false,
    trick1: false,
    trick2: false,
    trick3: false,
    up: false,
    down: false,
    left: false,
    right: false,
    confirm: false,
    back: false,
    close: false,
    start: false,
  },
  data: null,
  audio: {
    ctx: null,
    enabled: false,
    unlocked: false,
  },
  shopCategory: 'skater',
  equippedAssets: null,
  equippedDirty: true,
  preview: null,
  difficulty: 'medium',
  spawnMultiplier: 1,
  baseSpawnMultiplier: 1,
  scoreMultiplier: 1,
  baseScoreMultiplier: 1,
  runTime: 0,
  reactionWindowSec: 1.35,
  runPace: 0,
  mission: null,
  missionCompleted: 0,
  missionStreak: 0,
  landingFeedback: { state: '', text: '', timer: 0 },
  renderScaleX: 1,
  renderScaleY: 1,
  menuPanel: 'play',
  menuFocusEl: null,
  lastSkaterSheet: null,
  lastSkaterFrame: 0,
  anim: { state: 'idle', t: 0, frame: 0 },
  renderDpr: 1,
  renderTargetW: 0,
  renderTargetH: 0,
  resizeObserver: null,
  resizeRaf: null,
  resizeHandler: null,
  lastComboHtml: '',
  lastBlissKey: '',
  startQueued: false,
};

function loadDopeSkateHighScore(){
  try{
    const raw = localStorage.getItem(DOPE_SKATE_HIGH_KEY);
    const parsed = parseInt(raw || '0', 10);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveDopeSkateHighScore(score){
  try{ localStorage.setItem(DOPE_SKATE_HIGH_KEY, String(score)); } catch {}
}

function getDopeSkateDefaultData(){
  return {
    wallet: 0,
    owned: {
      ground: ['classic'],
      background: ['city'],
      sky: ['sky'],
      skater: ['core'],
      hat: ['red', 'none'],
      board: ['classic'],
      wheels: ['black'],
    },
    equipped: {
      ground: 'classic',
      background: 'city',
      sky: 'sky',
      skater: 'core',
      hat: 'red',
      board: 'classic',
      wheels: 'black',
    },
    settings: {
      difficulty: 'medium',
      sfx: true,
      hitboxes: false,
    },
  };
}

function loadDopeSkateData(){
  try{
    const raw = localStorage.getItem(DOPE_SKATE_DATA_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && parsed.owned && parsed.equipped) return normalizeDopeSkateData(parsed);
    }
  } catch {}
  return getDopeSkateDefaultData();
}

function saveDopeSkateData(data){
  try{
    localStorage.setItem(DOPE_SKATE_DATA_KEY, JSON.stringify(data));
  } catch {}
}

function normalizeDopeSkateData(data){
  const defaults = getDopeSkateDefaultData();
  const out = data && typeof data === 'object' ? data : {};
  out.wallet = typeof out.wallet === 'number' && Number.isFinite(out.wallet) ? out.wallet : defaults.wallet;
  out.owned = out.owned && typeof out.owned === 'object' ? out.owned : {};
  out.equipped = out.equipped && typeof out.equipped === 'object' ? out.equipped : {};
  out.settings = out.settings && typeof out.settings === 'object' ? out.settings : {};
  out.settings.difficulty = ['easy', 'medium', 'hard'].includes(out.settings.difficulty) ? out.settings.difficulty : defaults.settings.difficulty;
  out.settings.sfx = typeof out.settings.sfx === 'boolean' ? out.settings.sfx : defaults.settings.sfx;
  out.settings.hitboxes = typeof out.settings.hitboxes === 'boolean' ? out.settings.hitboxes : defaults.settings.hitboxes;

  Object.keys(defaults.owned).forEach(cat => {
    if(!Array.isArray(out.owned[cat]) || out.owned[cat].length === 0){
      out.owned[cat] = [...defaults.owned[cat]];
    }
    if(!out.equipped[cat]){
      out.equipped[cat] = defaults.equipped[cat];
    }
    if(!out.owned[cat].includes(out.equipped[cat])){
      out.owned[cat].push(out.equipped[cat]);
    }
  });
  return out;
}

function getDopeSkatePreviewState(){
  if(!state.dopeSkate.preview){
    state.dopeSkate.preview = { active: false, loadout: {}, selectedCategory: null, selectedItemId: null };
  }
  return state.dopeSkate.preview;
}

function dopeSkateClearPreview(){
  const preview = getDopeSkatePreviewState();
  preview.active = false;
  preview.loadout = {};
  preview.selectedCategory = null;
  preview.selectedItemId = null;
}

function dopeSkateSetPreview(category, itemId){
  const preview = getDopeSkatePreviewState();
  preview.active = true;
  preview.selectedCategory = category;
  preview.selectedItemId = itemId;
  preview.loadout = { ...preview.loadout, [category]: itemId };
}

function dopeSkateGetDifficultySettings(){
  const data = dopeSkate.data || getDopeSkateDefaultData();
  const difficulty = data.settings && data.settings.difficulty ? data.settings.difficulty : 'medium';
  return DOPE_SKATE_DIFFICULTY[difficulty] || DOPE_SKATE_DIFFICULTY.medium;
}

function dopeSkateApplySettings(){
  const settings = dopeSkateGetDifficultySettings();
  const difficulty = dopeSkate.data && dopeSkate.data.settings ? dopeSkate.data.settings.difficulty : 'medium';
  dopeSkate.difficulty = difficulty;
  dopeSkate.baseSpawnMultiplier = settings.spawn;
  dopeSkate.baseScoreMultiplier = settings.score;
  dopeSkate.spawnMultiplier = settings.spawn;
  dopeSkate.scoreMultiplier = settings.score;
}

function dopeSkateGetCurveProfile(){
  return DOPE_SKATE_CURVE[dopeSkate.difficulty] || DOPE_SKATE_CURVE.medium;
}

function dopeSkateGetReactionWindowSeconds(){
  const profile = dopeSkateGetCurveProfile();
  const eased = 1 - Math.pow(1 - dopeSkate.runPace, 2);
  return clamp(profile.reactionBase - (profile.reactionBase - profile.reactionMin) * eased, profile.reactionMin, profile.reactionBase);
}

function dopeSkateGetSpawnLeadOffset(base = 24, jitter = 0){
  const reaction = Math.max(0.85, dopeSkate.reactionWindowSec || dopeSkateGetReactionWindowSeconds());
  const randomJitter = jitter > 0 ? (Math.random() * jitter) : 0;
  return Math.round(Math.max(56, dopeSkate.speed * reaction + base + randomJitter));
}

function dopeSkateUpdateDifficultyCurve(dt){
  dopeSkate.runTime += dt;
  const profile = dopeSkateGetCurveProfile();
  const raw = clamp(dopeSkate.runTime / profile.rampSeconds, 0, 1);
  const eased = 1 - Math.pow(1 - raw, 2);
  dopeSkate.runPace = eased;
  dopeSkate.reactionWindowSec = dopeSkateGetReactionWindowSeconds();
  dopeSkate.spawnMultiplier = clamp(dopeSkate.baseSpawnMultiplier * (1 - profile.spawnTighten * eased), 0.72, 1.7);
  dopeSkate.scoreMultiplier = dopeSkate.baseScoreMultiplier * (1 + 0.2 * eased);

  const targetCruise = dopeSkate.baseSpeed + profile.speedGain * eased;
  const targetMax = dopeSkate.baseMaxSpeed + profile.maxGain * eased;
  dopeSkate.maxSpeed = targetMax;
  const accelBoost = dopeSkate.accel * (1 + 0.28 * eased);
  if(dopeSkate.speed < targetCruise){
    dopeSkate.speed = Math.min(targetCruise, dopeSkate.speed + accelBoost * dt * 1.2);
  } else {
    dopeSkate.speed = Math.min(dopeSkate.maxSpeed, dopeSkate.speed + accelBoost * dt);
  }
}

function dopeSkateGetMissionTierKey(runTime = dopeSkate.runTime){
  let tier = 'easy';
  DOPE_SKATE_MISSION_TIERS.forEach(step => {
    if(runTime >= step.minRunTime) tier = step.key;
  });
  return tier;
}

function dopeSkateGetMissionStreakMultiplier(streak = dopeSkate.missionStreak){
  const safeStreak = Math.max(0, streak || 0);
  return 1 + Math.min(0.72, safeStreak * 0.12);
}

function dopeSkateChooseMission(excludeTemplateId = ''){
  const tier = dopeSkateGetMissionTierKey();
  const pool = DOPE_SKATE_MISSION_TEMPLATES.filter(m => m.tiers && m.tiers[tier]);
  const filtered = pool.filter(m => m.id !== excludeTemplateId);
  const source = filtered.length ? filtered : pool;
  if(!source.length) return null;
  const pick = source[Math.floor(Math.random() * source.length)];
  const cfg = pick.tiers[tier];
  const rewardMult = dopeSkateGetMissionStreakMultiplier();
  const rewardCd = Math.max(1, Math.round((cfg.rewardCd || 1) * rewardMult));
  const rewardScore = Math.max(80, Math.round((cfg.rewardScore || 120) * rewardMult));
  return {
    id: `${pick.id}-${tier}`,
    templateId: pick.id,
    tier,
    label: cfg.label,
    type: pick.type,
    target: cfg.target,
    rewardCd,
    rewardScore,
    rewardMult,
    progress: 0,
    completed: false,
  };
}

function dopeSkateAssignMission(excludeTemplateId = ''){
  dopeSkate.mission = dopeSkateChooseMission(excludeTemplateId);
}

function dopeSkateSetLandingFeedback(stateLabel, text, duration = 0.9){
  dopeSkate.landingFeedback.state = stateLabel || '';
  dopeSkate.landingFeedback.text = text || '';
  dopeSkate.landingFeedback.timer = Math.max(0, duration || 0);
}

function dopeSkateUpdateLandingFeedback(dt){
  if(!dopeSkate.landingFeedback) return;
  if(dopeSkate.landingFeedback.timer > 0){
    dopeSkate.landingFeedback.timer = Math.max(0, dopeSkate.landingFeedback.timer - dt);
    if(dopeSkate.landingFeedback.timer === 0){
      dopeSkate.landingFeedback.state = '';
      dopeSkate.landingFeedback.text = '';
    }
  }
}

function dopeSkateMissionProgress(type, amount = 1, value = 0){
  const m = dopeSkate.mission;
  if(!m || m.completed) return;
  if(type === 'grindCount' && m.type === 'grindCount'){
    m.progress += amount;
  }
  if(type === 'cdCollect' && m.type === 'cdCollect'){
    m.progress += amount;
  }
  if(type === 'cleanLanding' && m.type === 'cleanLanding'){
    m.progress += amount;
  }
  if(type === 'comboMultiplier' && m.type === 'comboMultiplier'){
    m.progress = Math.max(m.progress, value);
  }

  if(m.progress >= m.target){
    m.completed = true;
    const rewardCd = m.rewardCd || 0;
    const rewardScore = m.rewardScore || 0;
    dopeSkate.cds += rewardCd;
    dopeSkate.comboBank += rewardScore;
    dopeSkate.scoreTotal = dopeSkate.scoreBase + dopeSkate.comboBank;
    dopeSkate.missionCompleted += 1;
    dopeSkate.missionStreak += 1;
    dopeSkateSpawnTrickText(`Mission +${rewardCd} CD`);
    dopeSkateSpawnTrickText(`+${rewardScore} pts`);
    dopeSkateSpawnTrickText(`Streak x${dopeSkate.missionStreak}`);
    dopeSkateSetLandingFeedback('mission', `Mission clear +${rewardCd} CD (x${dopeSkate.missionStreak})`, 1.25);
    dopeSkateAddCameraShake(1.3);
    dopeSkateAssignMission(m.templateId || m.id);
  }
}

function dopeSkateIsSfxEnabled(){
  if(!dopeSkate.data || !dopeSkate.data.settings) return true;
  return !!dopeSkate.data.settings.sfx;
}

function dopeSkateGetSpriteVariantSuffix(category, equippedId, fallbackId){
  if(!equippedId || equippedId === fallbackId) return '';
  const variants = DOPE_SKATE_SPRITE_VARIANTS[category];
  if(!variants || !variants.has(equippedId)) return '';
  return `_${equippedId}`;
}

function getSkaterSpritePath(animName, equipped){
  const skaterId = equipped && equipped.skater ? equipped.skater : 'core';
  const variant = dopeSkateGetSpriteVariantSuffix('skater', skaterId, 'core');
  return `./assets/games/dope-skate/skater/${DOPE_SKATE_SPRITES.skater.animations[animName].file}${variant}.png?v=${DOPE_SKATE_SPRITE_VERSION}`;
}

function getBoardSpritePath(equipped){
  const boardId = equipped && equipped.board ? equipped.board : 'classic';
  const variant = dopeSkateGetSpriteVariantSuffix('board', boardId, 'classic');
  return `./assets/games/dope-skate/board/${DOPE_SKATE_SPRITES.board.animations.grip.file}${variant}.png?v=${DOPE_SKATE_SPRITE_VERSION}`;
}

function getWheelSpritePath(equipped){
  const wheelId = equipped && equipped.wheels ? equipped.wheels : 'black';
  const variant = dopeSkateGetSpriteVariantSuffix('wheels', wheelId, 'black');
  return `./assets/games/dope-skate/wheels/${DOPE_SKATE_SPRITES.wheels.animations.default.file}${variant}.png?v=${DOPE_SKATE_SPRITE_VERSION}`;
}

function loadSpriteSheet(path, frameW, frameH, frames, fps, loop){
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ img, frameW, frameH, frames, fps, loop, ok:true });
    img.onerror = () => {
      const fallback = path.replace(/\.png$/i, '_00.png');
      if(fallback === path){
        resolve(null);
        return;
      }
      const img2 = new Image();
      img2.onload = () => resolve({ img: img2, frameW, frameH, frames: 1, fps: 0, loop: true, ok:true });
      img2.onerror = () => resolve(null);
      img2.src = fallback;
    };
    img.src = path;
  });
}

function dopeSkateLoadSprites(equipped){
  const eq = equipped || (dopeSkate.data ? dopeSkate.data.equipped : {});
  const spriteKey = JSON.stringify({
    skater: eq && eq.skater ? eq.skater : 'core',
    board: eq && eq.board ? eq.board : 'classic',
    wheels: eq && eq.wheels ? eq.wheels : 'black',
    v: DOPE_SKATE_SPRITE_VERSION,
  });
  if(dopeSkate.spriteKey === spriteKey && dopeSkate.sprites && !dopeSkate.spriteDirty){
    return Promise.resolve(dopeSkate.sprites);
  }
  dopeSkate.spriteDirty = false;
  dopeSkate.spriteKey = spriteKey;
  dopeSkate.spritesReady = false;
  const skaterAnims = DOPE_SKATE_SPRITES.skater.animations;
  const boardAnim = DOPE_SKATE_SPRITES.board.animations.grip;
  const wheelAnim = DOPE_SKATE_SPRITES.wheels.animations.default;

  const skaterLoads = Object.keys(skaterAnims).map(key => {
    const cfg = skaterAnims[key];
    return loadSpriteSheet(getSkaterSpritePath(key, eq), DOPE_SKATE_SPRITES.skater.frameW, DOPE_SKATE_SPRITES.skater.frameH, cfg.frames, cfg.fps, cfg.loop)
      .then(sheet => ({ key, sheet }));
  });
  const boardLoad = loadSpriteSheet(getBoardSpritePath(eq), DOPE_SKATE_SPRITES.board.frameW, DOPE_SKATE_SPRITES.board.frameH, boardAnim.frames, boardAnim.fps, boardAnim.loop)
    .then(sheet => ({ sheet }));
  const wheelLoad = loadSpriteSheet(getWheelSpritePath(eq), DOPE_SKATE_SPRITES.wheels.frameW, DOPE_SKATE_SPRITES.wheels.frameH, wheelAnim.frames, wheelAnim.fps, wheelAnim.loop)
    .then(sheet => ({ sheet }));

  dopeSkate.spritesLoading = Promise.all([Promise.all(skaterLoads), boardLoad, wheelLoad]).then(([skaters, boardRes, wheelRes]) => {
    const skaterSheets = {};
    skaters.forEach(item => { skaterSheets[item.key] = item.sheet; });
    dopeSkate.sprites = {
      skater: skaterSheets,
      board: boardRes ? boardRes.sheet : null,
      wheels: wheelRes ? wheelRes.sheet : null,
    };
    dopeSkate.spritesReady = true;
    return dopeSkate.sprites;
  });
  return dopeSkate.spritesLoading;
}

function dopeSkateLoadPreviewSprites(loadout){
  const eq = loadout || {};
  const spriteKey = JSON.stringify({
    skater: eq && eq.skater ? eq.skater : 'core',
    board: eq && eq.board ? eq.board : 'classic',
    wheels: eq && eq.wheels ? eq.wheels : 'black',
    v: DOPE_SKATE_SPRITE_VERSION,
  });
  if(dopeSkate.previewSpriteKey === spriteKey && dopeSkate.previewSprites){
    return Promise.resolve(dopeSkate.previewSprites);
  }
  dopeSkate.previewSpriteKey = spriteKey;
  const idleCfg = DOPE_SKATE_SPRITES.skater.animations.idle;
  const boardCfg = DOPE_SKATE_SPRITES.board.animations.grip;
  const wheelCfg = DOPE_SKATE_SPRITES.wheels.animations.default;
  dopeSkate.previewSpritesLoading = Promise.all([
    loadSpriteSheet(getSkaterSpritePath('idle', eq), DOPE_SKATE_SPRITES.skater.frameW, DOPE_SKATE_SPRITES.skater.frameH, idleCfg.frames, idleCfg.fps, idleCfg.loop),
    loadSpriteSheet(getBoardSpritePath(eq), DOPE_SKATE_SPRITES.board.frameW, DOPE_SKATE_SPRITES.board.frameH, boardCfg.frames, boardCfg.fps, boardCfg.loop),
    loadSpriteSheet(getWheelSpritePath(eq), DOPE_SKATE_SPRITES.wheels.frameW, DOPE_SKATE_SPRITES.wheels.frameH, wheelCfg.frames, wheelCfg.fps, wheelCfg.loop),
  ]).then(([skater, board, wheels]) => {
    dopeSkate.previewSprites = { skater, board, wheels };
    return dopeSkate.previewSprites;
  });
  return dopeSkate.previewSpritesLoading;
}

function isDopeSkateActive(){
  if(state.activeWindowId === 'dope-skate') return true;
  // Legacy fallback for old embedded mode.
  return state.activeWindowId === 'games' && state.games.view === 'dope-skate';
}

function loadDopeSkateAssets(){
  const entries = Object.entries(DOPE_SKATE_ASSETS);
  const promises = entries.map(([key, src]) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve([key, img]);
    img.onerror = () => resolve([key, null]);
    img.src = src;
  }));
  return Promise.all(promises).then(results => {
    const out = {};
    results.forEach(([key, img]) => { out[key] = img; });
    return out;
  });
}

function dopeSkateLoadAssets(){
  if(dopeSkate.assetsReady) return Promise.resolve(dopeSkate.assets);
  if(dopeSkate.assetsLoading) return dopeSkate.assetsLoading;
  dopeSkate.assetsLoading = loadDopeSkateAssets().then(assets => {
    dopeSkate.assets = assets;
    dopeSkate.assetsReady = true;
    dopeSkate.assetsLoading = null;
    dopeSkate.equippedDirty = true;
    dopeSkateLoadSprites(dopeSkate.data ? dopeSkate.data.equipped : null);
    dopeSkateDraw();
    dopeSkateRenderShop();
    if(dopeSkate.startQueued){
      dopeSkateLoadSprites(dopeSkate.data ? dopeSkate.data.equipped : null).then(()=>{
        if(dopeSkate.startQueued){
          dopeSkate.startQueued = false;
          dopeSkateStartRun();
        }
      });
    }
    return assets;
  });
  return dopeSkate.assetsLoading;
}

function fitSkateCanvas(){
  if(!dopeSkate.canvas || !dopeSkate.ctx || !dopeSkate.els) return;
  const wrap = dopeSkate.els.canvasWrap || dopeSkate.canvas.parentElement;
  if(!wrap) return;
  // Measure container only; never drive layout from canvas to avoid resize feedback loops.
  const rect = wrap.getBoundingClientRect();
  const scale = Math.min(rect.width / dopeSkate.width, rect.height / dopeSkate.height);
  let targetW = Math.max(1, Math.floor(dopeSkate.width * scale));
  let targetH = Math.max(1, Math.floor(dopeSkate.height * scale));
  if(!Number.isFinite(targetW) || !Number.isFinite(targetH)) return;
  if(targetW === 0 || targetH === 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  if(targetW === dopeSkate.renderTargetW && targetH === dopeSkate.renderTargetH && dpr === dopeSkate.renderDpr) return;

  dopeSkate.renderTargetW = targetW;
  dopeSkate.renderTargetH = targetH;
  dopeSkate.renderDpr = dpr;
  dopeSkate.renderScaleX = targetW / dopeSkate.width;
  dopeSkate.renderScaleY = targetH / dopeSkate.height;

  if(dopeSkate.canvas.style.width !== `${targetW}px`) dopeSkate.canvas.style.width = `${targetW}px`;
  if(dopeSkate.canvas.style.height !== `${targetH}px`) dopeSkate.canvas.style.height = `${targetH}px`;

  const internalW = Math.max(1, Math.floor(targetW * dpr));
  const internalH = Math.max(1, Math.floor(targetH * dpr));
  if(dopeSkate.canvas.width !== internalW) dopeSkate.canvas.width = internalW;
  if(dopeSkate.canvas.height !== internalH) dopeSkate.canvas.height = internalH;
  dopeSkate.ctx.imageSmoothingEnabled = false;
}

function dopeSkateIsInteractiveTarget(target){
  if(!target || !target.closest) return false;
  return Boolean(target.closest('[data-skate-action], [data-skate-tab], [data-skate-shop-tab], [data-games-action="back"], .skate-btn, button, a, input, select, textarea'));
}

function initDopeSkateInWindow(winEl){
  const root = winEl || document.getElementById('win_dope-skate') || document.getElementById('win_games');
  if(!root) return false;
  const canvas = root.querySelector('#skateCanvas');
  const screen = root.querySelector('#skateScreen');
  if(!canvas || !screen) return false;

  dopeSkate.canvas = canvas;
  dopeSkate.ctx = canvas.getContext('2d');
  dopeSkate.ctx.imageSmoothingEnabled = false;
  dopeSkate.renderTargetW = 0;
  dopeSkate.renderTargetH = 0;
  dopeSkate.renderScaleX = 1;
  dopeSkate.renderScaleY = 1;
  const mobile = isMobileGameMode();
  if(mobile){
    // Mobile uses Start/select controls, so the top-right menu button is redundant
    // and can overlap OS window controls.
    const topbarActions = root.querySelector('.skate-topbar-actions');
    if(topbarActions) topbarActions.remove();
  }
  dopeSkate.width = 640;
  dopeSkate.height = mobile ? 640 : 360;
  canvas.width = dopeSkate.width;
  canvas.height = dopeSkate.height;
  dopeSkate.groundHeight = 64;

  dopeSkate.els = {
    screen,
    menuOverlay: root.querySelector('#skateMenuOverlay'),
    overOverlay: root.querySelector('#skateOverOverlay'),
    canvasWrap: root.querySelector('.skate-canvas-wrap'),
    hud: root.querySelector('#skateHud'),
    score: root.querySelector('[data-skate-score]'),
    best: root.querySelector('[data-skate-best]'),
    cds: root.querySelector('[data-skate-cds]'),
    combo: root.querySelector('[data-skate-combo]'),
    comboList: root.querySelector('[data-skate-combo-list]'),
    comboMeter: root.querySelector('[data-skate-combo-meter]'),
    landingIndicator: root.querySelector('[data-skate-landing-indicator]'),
    missionBox: root.querySelector('[data-skate-mission-box]'),
    missionTitle: root.querySelector('[data-skate-mission-title]'),
    missionCount: root.querySelector('[data-skate-mission-count]'),
    missionMeter: root.querySelector('[data-skate-mission-meter]'),
    missionTier: root.querySelector('[data-skate-mission-tier]'),
    missionStreak: root.querySelector('[data-skate-mission-streak]'),
    missionReward: root.querySelector('[data-skate-mission-reward]'),
    overScore: root.querySelector('[data-skate-over-score]'),
    overBase: root.querySelector('[data-skate-over-base]'),
    overCombo: root.querySelector('[data-skate-over-combo]'),
    overBliss: root.querySelector('[data-skate-over-bliss]'),
    overCds: root.querySelector('[data-skate-over-cds]'),
    overBest: root.querySelector('[data-skate-over-best]'),
    localBest: root.querySelector('[data-skate-local-best]'),
    globalBest: root.querySelector('[data-skate-global-best]'),
    wallet: root.querySelector('[data-skate-wallet]'),
    shopList: root.querySelector('[data-skate-shop-list]'),
    previewStage: root.querySelector('[data-skate-preview-stage]'),
    previewStatus: root.querySelector('[data-skate-preview-status]'),
    previewReset: root.querySelector('[data-skate-preview-reset]'),
    equippedList: root.querySelector('[data-skate-equipped-list]'),
    balance: root.querySelector('#skateBalance'),
    balanceIndicator: root.querySelector('[data-skate-balance-indicator]'),
    bliss: root.querySelector('[data-skate-bliss]'),
    difficultySelect: root.querySelector('[data-skate-setting="difficulty"]'),
    sfxToggle: root.querySelector('[data-skate-setting="sfx"]'),
    hitboxToggle: root.querySelector('[data-skate-setting="hitboxes"]'),
    shopTabs: Array.from(root.querySelectorAll('[data-skate-shop-tab]')),
    backBtn: root.querySelector('[data-games-action="back"]') || root.querySelector('[data-skate-action="back"]'),
    tabs: Array.from(root.querySelectorAll('[data-skate-tab]')),
    actionButtons: Array.from(root.querySelectorAll('[data-skate-action]')),
    resumeButtons: Array.from(root.querySelectorAll('[data-skate-action="resume"]')),
  };

  if(typeof state.dopeSkate.highScore !== 'number' || Number.isNaN(state.dopeSkate.highScore)){
    state.dopeSkate.highScore = loadDopeSkateHighScore();
  }
  if(!dopeSkate.data){
    dopeSkate.data = loadDopeSkateData();
    saveDopeSkateData(dopeSkate.data);
  }
  dopeSkate.equippedDirty = true;
  dopeSkate.spriteDirty = true;
  dopeSkate.preview = getDopeSkatePreviewState();
  dopeSkateApplySettings();
  dopeSkateLoadSprites(dopeSkate.data ? dopeSkate.data.equipped : null);

  if(dopeSkate.els.backBtn){
    dopeSkate.els.backBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      backToGamesHub();
    });
  }

  dopeSkate.els.tabs.forEach(btn => {
    btn.addEventListener('click', ()=>{
      dopeSkateSetPanel(btn.dataset.skateTab || 'play');
    });
  });
  dopeSkate.els.shopTabs.forEach(btn => {
    btn.addEventListener('click', ()=>{
      dopeSkateSetShopCategory(btn.dataset.skateShopTab || 'skater');
    });
  });

  dopeSkate.els.actionButtons.forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const action = btn.dataset.skateAction;
      if(action === 'start'){
        dopeSkateStartRun();
      } else if(action === 'retry'){
        dopeSkateStartRun();
      } else if(action === 'menu'){
        dopeSkateShowMenu('play');
      } else if(action === 'resume'){
        dopeSkateHideMenu();
      } else if(action === 'revert-preview'){
        dopeSkateClearPreview();
        dopeSkateRenderShop();
      } else if(action === 'jump'){
        dopeSkateRegisterJump();
      } else if(action === 'trick1'){
        dopeSkateRegisterTrick('trick1');
      } else if(action === 'trick2'){
        dopeSkateRegisterTrick('trick2');
      } else if(action === 'trick3'){
        dopeSkateRegisterTrick('trick3');
      }
    });
  });

  if(dopeSkate.els.difficultySelect){
    dopeSkate.els.difficultySelect.addEventListener('change', ()=>{
      if(!dopeSkate.data) return;
      dopeSkate.data.settings = dopeSkate.data.settings || {};
      dopeSkate.data.settings.difficulty = dopeSkate.els.difficultySelect.value;
      saveDopeSkateData(dopeSkate.data);
      dopeSkateApplySettings();
    });
  }
  if(dopeSkate.els.sfxToggle){
    dopeSkate.els.sfxToggle.addEventListener('click', ()=>{
      if(!dopeSkate.data) return;
      dopeSkate.data.settings = dopeSkate.data.settings || {};
      dopeSkate.data.settings.sfx = !dopeSkate.data.settings.sfx;
      dopeSkate.els.sfxToggle.dataset.enabled = dopeSkate.data.settings.sfx ? '1' : '0';
      dopeSkate.els.sfxToggle.textContent = dopeSkate.data.settings.sfx ? t('skate.settings.sfxOn') : t('skate.settings.sfxOff');
      saveDopeSkateData(dopeSkate.data);
    });
  }
  if(dopeSkate.els.hitboxToggle){
    dopeSkate.els.hitboxToggle.addEventListener('click', ()=>{
      if(!dopeSkate.data) return;
      dopeSkate.data.settings = dopeSkate.data.settings || {};
      dopeSkate.data.settings.hitboxes = !dopeSkate.data.settings.hitboxes;
      dopeSkate.els.hitboxToggle.dataset.enabled = dopeSkate.data.settings.hitboxes ? '1' : '0';
      dopeSkate.els.hitboxToggle.textContent = dopeSkate.data.settings.hitboxes ? t('skate.settings.hitboxesOn') : t('skate.settings.hitboxesOff');
      saveDopeSkateData(dopeSkate.data);
    });
  }

  screen.addEventListener('touchstart', (e)=>{ if(!dopeSkateIsInteractiveTarget(e.target)) e.preventDefault(); }, { passive:false });
  screen.addEventListener('touchmove', (e)=>{ if(!dopeSkateIsInteractiveTarget(e.target)) e.preventDefault(); }, { passive:false });
  canvas.addEventListener('touchstart', (e)=>{ if(!dopeSkateIsInteractiveTarget(e.target)) e.preventDefault(); }, { passive:false });
  canvas.addEventListener('touchmove', (e)=>{ if(!dopeSkateIsInteractiveTarget(e.target)) e.preventDefault(); }, { passive:false });
  screen.addEventListener('pointerdown', (e)=>{
    if(e.pointerType === 'mouse') return;
    markMobileTouchPointerDown(e.pointerId, e.pointerType);
    if(dopeSkateIsInteractiveTarget(e.target)) return;
    if(!dopeSkate.running || dopeSkate.gameOver) return;
    dopeSkate.jumpHeld = true;
    dopeSkateRegisterJump();
    e.preventDefault();
  }, { passive:false });
  const clearJumpHold = (e)=>{
    if(e.pointerType === 'mouse') return;
    markMobileTouchPointerUp(e.pointerId);
    dopeSkate.jumpHeld = false;
  };
  screen.addEventListener('pointerup', clearJumpHold, { passive:true });
  screen.addEventListener('pointercancel', clearJumpHold, { passive:true });

  if(!dopeSkate.assets){
    dopeSkateLoadAssets();
  } else {
    dopeSkate.assetsReady = true;
  }

  if(dopeSkate.resizeObserver){
    dopeSkate.resizeObserver.disconnect();
    dopeSkate.resizeObserver = null;
  }
  if(window.ResizeObserver){
    dopeSkate.resizeObserver = new ResizeObserver(()=>{
      if(dopeSkate.resizeRaf) return;
      dopeSkate.resizeRaf = requestAnimationFrame(()=>{
        dopeSkate.resizeRaf = null;
        fitSkateCanvas();
      });
    });
    if(dopeSkate.els.canvasWrap) dopeSkate.resizeObserver.observe(dopeSkate.els.canvasWrap);
  }
  fitSkateCanvas();
  if(!dopeSkate.resizeHandler){
    dopeSkate.resizeHandler = ()=>{
      if(dopeSkate.resizeRaf) return;
      dopeSkate.resizeRaf = requestAnimationFrame(()=>{
        dopeSkate.resizeRaf = null;
        fitSkateCanvas();
      });
    };
    window.addEventListener('resize', dopeSkate.resizeHandler);
    window.addEventListener('orientationchange', dopeSkate.resizeHandler);
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', dopeSkate.resizeHandler);
    }
  }

  dopeSkateResetWorld();
  dopeSkateShowMenu('play');
  updateDopeSkateUI();
  dopeSkateSetShopCategory(dopeSkate.shopCategory);
  dopeSkateRenderShop();
  dopeSkateStartLoop();
  return true;
}

function dopeSkateResetWorld(){
  const groundY = dopeSkate.height - dopeSkate.groundHeight;
  dopeSkateApplySettings();
  const diff = dopeSkateGetDifficultySettings();
  dopeSkate.player = {
    x: 130,
    y: groundY - 58,
    w: 40,
    h: 58,
    vy: 0,
    jumpHoldTime: 0,
    onGround: true,
    justLanded: false,
    mode: 'ground',
    wheelAngle: 0,
    boardAngle: 0,
    boardSpin: 0,
    boardScaleY: 1,
    bodyLean: 0,
    bodyBob: 0,
    torsoPitch: 0,
    armSwing: 0,
    kneeBend: 0,
    landingBend: 0,
    trailTimer: 0,
    squash: 0,
    trickAnim: null,
  };
  dopeSkate.anim = { state: 'idle', t: 0, frame: 0 };
  dopeSkate.obstacles = [];
  dopeSkate.rails = [];
  dopeSkate.collectibles = [];
  dopeSkate.particles = [];
  dopeSkate.spawn = {
    nextPatternDist: 220,
    queue: [],
    lastPatternId: null,
    nextLetterDist: 880,
  };
  dopeSkate.lastObstacleDist = 0;
  dopeSkate.lastRailDist = 0;
  dopeSkate.lastObstacleLane = 0;
  // Difficulty tuning: speed/spawn/score multipliers live in DOPE_SKATE_DIFFICULTY.
  dopeSkate.baseSpeed = 240 * diff.speed;
  dopeSkate.baseMaxSpeed = 420 * diff.speed;
  dopeSkate.speed = dopeSkate.baseSpeed;
  dopeSkate.maxSpeed = dopeSkate.baseMaxSpeed;
  dopeSkate.scoreBase = 0;
  dopeSkate.comboBank = 0;
  dopeSkate.scoreTotal = 0;
  dopeSkate.blissBonus = 0;
  dopeSkate.distance = 0;
  dopeSkate.cds = 0;
  dopeSkate.blissCounts = { B: 0, L: 0, I: 0, S: 0 };
  dopeSkate.combo = {
    points: 0,
    tricks: [],
    unique: new Set(),
    multiplier: 1,
    active: false,
    lastLandingQuality: '',
  };
  dopeSkate.gameOver = false;
  dopeSkate.running = false;
  dopeSkate.paused = false;
  dopeSkate.started = false;
  dopeSkate.offsets = { sky: 0, city: 0, ground: 0 };
  dopeSkate.jumpBufferUntil = 0;
  dopeSkate.lastGroundedAt = 0;
  dopeSkate.lastTrickAt = 0;
  dopeSkate.lastTrickId = null;
  dopeSkate.cameraShake = 0;
  dopeSkate.lastComboHtml = '';
  dopeSkate.lastBlissKey = '';
  dopeSkate.time = 0;
  dopeSkate.runTime = 0;
  dopeSkate.runPace = 0;
  dopeSkate.reactionWindowSec = dopeSkateGetReactionWindowSeconds();
  dopeSkate.missionCompleted = 0;
  dopeSkate.missionStreak = 0;
  dopeSkateAssignMission();
  dopeSkate.landingFeedback = { state: '', text: '', timer: 0 };
}

function dopeSkateStartRun(){
  if(!dopeSkate.assetsReady){
    dopeSkate.startQueued = true;
    dopeSkateLoadAssets();
    return;
  }
  if(!dopeSkate.spritesReady){
    dopeSkate.startQueued = true;
    dopeSkateLoadSprites(dopeSkate.data ? dopeSkate.data.equipped : null).then(()=>{
      if(dopeSkate.startQueued){
        dopeSkate.startQueued = false;
        dopeSkateStartRun();
      }
    });
    return;
  }
  dopeSkateClearPreview();
  dopeSkateResetWorld();
  dopeSkate.running = true;
  dopeSkate.paused = false;
  dopeSkate.started = true;
  dopeSkateUnlockAudio();
  recordGameScore('dopeSkate', state.dopeSkate.highScore || 0, new Date().toISOString());
  if(dopeSkate.els && dopeSkate.els.menuOverlay){
    dopeSkate.els.menuOverlay.classList.add('hidden');
  }
  if(dopeSkate.els && dopeSkate.els.overOverlay){
    dopeSkate.els.overOverlay.classList.add('hidden');
  }
  updateDopeSkateUI();
}

function dopeSkateShowMenu(panel){
  dopeSkate.paused = dopeSkate.started && !dopeSkate.gameOver;
  dopeSkate.running = dopeSkate.started && !dopeSkate.gameOver;
  if(dopeSkate.els && dopeSkate.els.menuOverlay){
    dopeSkate.els.menuOverlay.classList.remove('hidden');
  }
  if(dopeSkate.els && dopeSkate.els.overOverlay){
    dopeSkate.els.overOverlay.classList.add('hidden');
  }
  updateDopeSkateUI();
  dopeSkateSetPanel(panel);
  dopeSkateMenuEnsureFocus();
}

function dopeSkateHideMenu(){
  if(!dopeSkate.started || dopeSkate.gameOver) return;
  dopeSkateClearPreview();
  dopeSkate.paused = false;
  dopeSkate.running = true;
  if(dopeSkate.els && dopeSkate.els.menuOverlay){
    dopeSkate.els.menuOverlay.classList.add('hidden');
  }
  updateDopeSkateUI();
  if(dopeSkate.menuFocusEl){
    dopeSkate.menuFocusEl.classList.remove('skate-focus');
    dopeSkate.menuFocusEl = null;
  }
}

function dopeSkateSetPanel(panel){
  if(!dopeSkate.els) return;
  const changed = dopeSkate.menuPanel !== panel;
  dopeSkate.menuPanel = panel;
  dopeSkate.els.tabs.forEach(btn => {
    const active = btn.dataset.skateTab === panel;
    btn.classList.toggle('active', active);
  });
  const panels = Array.from(dopeSkate.els.menuOverlay.querySelectorAll('[data-skate-panel]'));
  panels.forEach(p => p.classList.toggle('active', p.dataset.skatePanel === panel));
  dopeSkateMenuEnsureFocus();
  if(panel === 'shop'){
    dopeSkateRenderShop();
  } else {
    dopeSkateClearPreview();
  }
  if(changed){
    playSfx('tabChange');
  }
}

function dopeSkateMenuIsOpen(){
  return !!(dopeSkate.els && dopeSkate.els.menuOverlay && !dopeSkate.els.menuOverlay.classList.contains('hidden'));
}

function dopeSkateMenuGetItems(){
  if(!dopeSkate.els || !dopeSkate.els.menuOverlay) return [];
  return Array.from(dopeSkate.els.menuOverlay.querySelectorAll('button, [role="button"], select, input, a'))
    .filter(el => !el.disabled && el.offsetParent !== null);
}

function dopeSkateMenuSetFocus(el){
  if(!el) return;
  if(dopeSkate.menuFocusEl && dopeSkate.menuFocusEl !== el){
    dopeSkate.menuFocusEl.classList.remove('skate-focus');
  }
  dopeSkate.menuFocusEl = el;
  el.classList.add('skate-focus');
  if(el.focus) el.focus({ preventScroll: true });
}

function dopeSkateMenuEnsureFocus(){
  if(!dopeSkateMenuIsOpen()) return;
  const items = dopeSkateMenuGetItems();
  if(!items.length) return;
  if(!dopeSkate.menuFocusEl || !items.includes(dopeSkate.menuFocusEl)){
    dopeSkateMenuSetFocus(items[0]);
  }
}

function dopeSkateMenuNavigate(dx, dy){
  if(!dopeSkateMenuIsOpen()) return;
  const items = dopeSkateMenuGetItems();
  if(!items.length) return;
  dopeSkateMenuEnsureFocus();
  const current = dopeSkate.menuFocusEl || items[0];
  const curRect = current.getBoundingClientRect();
  const curX = curRect.left + curRect.width / 2;
  const curY = curRect.top + curRect.height / 2;
  let best = null;
  let bestScore = Infinity;
  items.forEach(el => {
    if(el === current) return;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const vx = x - curX;
    const vy = y - curY;
    if(dx !== 0 && Math.sign(vx) !== dx) return;
    if(dy !== 0 && Math.sign(vy) !== dy) return;
    const primary = dx !== 0 ? Math.abs(vx) : Math.abs(vy);
    const secondary = dx !== 0 ? Math.abs(vy) : Math.abs(vx);
    const score = primary * 1000 + secondary;
    if(score < bestScore){
      bestScore = score;
      best = el;
    }
  });
  if(best) dopeSkateMenuSetFocus(best);
}

function dopeSkateMenuActivate(){
  if(!dopeSkateMenuIsOpen()) return;
  if(dopeSkate.menuFocusEl && dopeSkate.menuFocusEl.click){
    dopeSkate.menuFocusEl.click();
  }
}

function dopeSkateMenuBack(){
  if(!dopeSkateMenuIsOpen()) return;
  if(dopeSkate.menuPanel && dopeSkate.menuPanel !== 'play'){
    dopeSkateSetPanel('play');
  } else {
    dopeSkateHideMenu();
  }
}

function dopeSkateSetShopCategory(category){
  const changed = dopeSkate.shopCategory !== category;
  dopeSkate.shopCategory = category;
  if(dopeSkate.els && dopeSkate.els.shopTabs){
    dopeSkate.els.shopTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.skateShopTab === category);
    });
  }
  dopeSkateRenderShop();
  if(changed){
    playSfx('tabChange');
  }
}

function dopeSkateRegisterJump(){
  if(!dopeSkate.running || dopeSkate.paused || dopeSkate.gameOver) return;
  dopeSkate.jumpBufferUntil = dopeSkate.time + 0.12;
  dopeSkateUnlockAudio();
  dopeSkatePlaySound('jump');
}

function dopeSkateTryJump(){
  const player = dopeSkate.player;
  const coyoteOk = (dopeSkate.time - dopeSkate.lastGroundedAt) <= 0.12;
  if(dopeSkate.jumpBufferUntil > dopeSkate.time && player.mode === 'grind'){
    dopeSkate.jumpBufferUntil = 0;
    player.mode = 'air';
    player.grind = null;
    player.vy = dopeSkate.jumpVel * 0.85;
    player.jumpHoldTime = 0;
    dopeSkateAddTrickById('ollie');
    return;
  }
  if(dopeSkate.jumpBufferUntil > dopeSkate.time && (player.onGround || coyoteOk)){
    dopeSkate.jumpBufferUntil = 0;
    player.vy = dopeSkate.jumpVel;
    player.onGround = false;
    player.mode = 'air';
    player.squash = 0.25;
    player.jumpHoldTime = 0;
    dopeSkateAddTrickById('ollie');
  }
}

function dopeSkateRegisterTrick(slot){
  if(!dopeSkate.running || dopeSkate.paused || dopeSkate.gameOver) return;
  dopeSkateUnlockAudio();
  dopeSkateHandleTrick(slot);
}

function dopeSkateStartLoop(){
  dopeSkateStopLoop();
  dopeSkate.lastTime = 0;
  dopeSkate.raf = requestAnimationFrame(dopeSkateLoop);
}

function dopeSkateStopLoop(){
  if(dopeSkate.raf){
    cancelAnimationFrame(dopeSkate.raf);
    dopeSkate.raf = null;
  }
}

function dopeSkateStop(){
  dopeSkateStopLoop();
  dopeSkate.running = false;
  dopeSkate.paused = false;
  dopeSkate.gameOver = false;
  dopeSkate.started = false;
  if(dopeSkate.resizeObserver){
    dopeSkate.resizeObserver.disconnect();
    dopeSkate.resizeObserver = null;
  }
  if(dopeSkate.resizeHandler){
    window.removeEventListener('resize', dopeSkate.resizeHandler);
    window.removeEventListener('orientationchange', dopeSkate.resizeHandler);
    if(window.visualViewport){
      window.visualViewport.removeEventListener('resize', dopeSkate.resizeHandler);
    }
    dopeSkate.resizeHandler = null;
  }
  dopeSkate.els = null;
  dopeSkate.canvas = null;
  dopeSkate.ctx = null;
}

const DopeSkateGame = {
  mount: initDopeSkateInWindow,
  unmount: dopeSkateStop,
};

function dopeSkateLoop(ts){
  if(!dopeSkate.ctx) return;
  const dt = dopeSkate.lastTime ? Math.min(0.05, (ts - dopeSkate.lastTime) / 1000) : 0;
  dopeSkate.lastTime = ts;
  if(dopeSkate.running && !dopeSkate.paused && !dopeSkate.gameOver){
    dopeSkateUpdate(dt);
  }
  dopeSkateDraw();
  dopeSkate.raf = requestAnimationFrame(dopeSkateLoop);
}

function dopeSkateUpdate(dt){
  const groundY = dopeSkate.height - dopeSkate.groundHeight;
  const player = dopeSkate.player;
  dopeSkate.time += dt;
  const wasOnGround = player.onGround;
  let landingImpactVy = null;

  if(player.mode === 'grind'){
    dopeSkateUpdateGrind(dt);
  } else {
    player.vy += dopeSkate.gravity * dt;
    if(dopeSkate.jumpHeld && player.vy < 0 && player.jumpHoldTime < dopeSkate.jumpHoldMax){
      player.vy -= dopeSkate.jumpHoldForce * dt;
      player.jumpHoldTime += dt;
    }
    player.y += player.vy * dt;
  }
  if(player.y >= groundY - player.h){
    landingImpactVy = player.vy;
    player.y = groundY - player.h;
    if(!player.onGround && player.mode !== 'grind'){
      dopeSkatePlaySound('land');
    }
    player.vy = 0;
    player.onGround = true;
    player.mode = 'ground';
    player.jumpHoldTime = 0;
    dopeSkate.lastGroundedAt = dopeSkate.time;
    if(!wasOnGround){
      player.squash = 0.35;
    }
  } else if(player.mode !== 'grind'){
    player.onGround = false;
  }

  player.justLanded = (!wasOnGround && player.onGround);

  if(player.justLanded){
    dopeSkateResolveCombo(dopeSkateEvaluateLanding(landingImpactVy));
    const impact = Math.abs(landingImpactVy || 0);
    const footY = player.y + player.h;
    dopeSkateSpawnLandingDust(player.x + player.w / 2, footY + 2, impact);
    player.landingBend = Math.max(player.landingBend || 0, Math.min(1, 0.2 + impact / 520));
    dopeSkateAddCameraShake(Math.min(2.4, 0.35 + impact / 310));
  }

  dopeSkateTryJump();
  if(dopeSkate.combo.active && player.mode === 'air' && (dopeSkate.time - dopeSkate.lastTrickAt) > dopeSkate.comboWindow){
    dopeSkateApplyComboPenalty();
  }

  dopeSkateUpdateDifficultyCurve(dt);
  dopeSkate.distance += dopeSkate.speed * dt;
  dopeSkate.scoreBase = Math.max(dopeSkate.scoreBase, Math.floor((dopeSkate.distance / 7) * dopeSkate.scoreMultiplier));
  dopeSkate.scoreTotal = dopeSkate.scoreBase + dopeSkate.comboBank;

  dopeSkateHandleSpawns();

  dopeSkate.obstacles.forEach(ob => { ob.x -= dopeSkate.speed * dt; });
  dopeSkate.obstacles = dopeSkate.obstacles.filter(ob => ob.x + ob.w > -80);
  dopeSkate.rails.forEach(rail => { rail.x -= dopeSkate.speed * dt; });
  dopeSkate.rails = dopeSkate.rails.filter(rail => rail.x + rail.w > -120);
  dopeSkate.collectibles.forEach(item => { item.x -= dopeSkate.speed * dt; });
  dopeSkate.collectibles = dopeSkate.collectibles.filter(item => item.x + item.w > -80);

  dopeSkateCheckCollisions();
  dopeSkateUpdateParticles(dt);
  dopeSkateUpdateAnimations(dt);
  dopeSkateUpdateLandingFeedback(dt);
  dopeSkate.cameraShake = Math.max(0, dopeSkate.cameraShake - dt * 20);

  dopeSkateUpdateOffsets(dt);
  dopeSkateCheckGamepad();
  updateDopeSkateUI();
}

function dopeSkateUpdateOffsets(dt){
  const assets = dopeSkate.assets || {};
  const skyW = assets.sky ? assets.sky.width : dopeSkate.width;
  const cityW = assets.city ? assets.city.width : dopeSkate.width;
  const groundW = assets.ground ? assets.ground.width : dopeSkate.width;
  dopeSkate.offsets.sky = (dopeSkate.offsets.sky + dopeSkate.speed * dt * 0.15) % skyW;
  dopeSkate.offsets.city = (dopeSkate.offsets.city + dopeSkate.speed * dt * 0.35) % cityW;
  dopeSkate.offsets.ground = (dopeSkate.offsets.ground + dopeSkate.speed * dt * 1.0) % groundW;
}

function dopeSkateHandleSpawns(){
  while(dopeSkate.distance >= dopeSkate.spawn.nextPatternDist){
    dopeSkateScheduleSpawnPattern(dopeSkatePickSpawnPattern());
  }

  if(dopeSkate.distance >= dopeSkate.spawn.nextLetterDist){
    const aheadDist = dopeSkate.distance + dopeSkate.speed * dopeSkate.reactionWindowSec * 0.95;
    dopeSkateEnqueueSpawn(aheadDist, 'bliss', { lane: 'high' });
    dopeSkate.spawn.nextLetterDist += Math.max(420, (740 + Math.random() * 560) * dopeSkate.spawnMultiplier);
  }

  dopeSkateProcessSpawnQueue();
}

function dopeSkatePickSpawnPattern(){
  const speed = dopeSkate.speed;
  const pool = DOPE_SKATE_SPAWN_PATTERNS.filter(pattern => speed >= pattern.minSpeed && speed <= pattern.maxSpeed);
  const candidates = pool.filter(pattern => pattern.id !== dopeSkate.spawn.lastPatternId);
  const source = candidates.length ? candidates : pool;
  if(!source.length) return DOPE_SKATE_SPAWN_PATTERNS[0];
  return source[Math.floor(Math.random() * source.length)];
}

function dopeSkateScheduleSpawnPattern(pattern){
  if(!pattern) return;
  const safetyLead = Math.max(130, dopeSkate.speed * dopeSkate.reactionWindowSec * 0.64);
  const base = Math.max(dopeSkate.distance + safetyLead, dopeSkate.spawn.nextPatternDist);
  pattern.events.forEach(event => {
    const offset = Math.max(0, event.offset || 0) * dopeSkate.spawnMultiplier;
    dopeSkateEnqueueSpawn(base + offset, event.type, event);
  });
  const fairGap = Math.max(260, dopeSkate.speed * dopeSkate.reactionWindowSec * 0.92);
  const patternLength = Math.max(fairGap, pattern.length * dopeSkate.spawnMultiplier);
  dopeSkate.spawn.nextPatternDist = base + patternLength;
  dopeSkate.spawn.lastPatternId = pattern.id;
}

function dopeSkateEnqueueSpawn(atDist, type, payload){
  if(!Number.isFinite(atDist) || !type) return;
  dopeSkate.spawn.queue.push({ at: atDist, type, payload: payload || {} });
  dopeSkate.spawn.queue.sort((a, b)=>a.at - b.at);
}

function dopeSkateProcessSpawnQueue(){
  if(!dopeSkate.spawn.queue || !dopeSkate.spawn.queue.length) return;
  while(dopeSkate.spawn.queue.length && dopeSkate.spawn.queue[0].at <= dopeSkate.distance + 1){
    const event = dopeSkate.spawn.queue.shift();
    if(event.type === 'obstacle'){
      dopeSkateSpawnObstacle(event.payload);
      continue;
    }
    if(event.type === 'rail'){
      dopeSkateSpawnRail(event.payload);
      continue;
    }
    if(event.type === 'cd' || event.type === 'bliss'){
      dopeSkateSpawnCollectible(event.type, event.payload);
    }
  }
}

function dopeSkateSpawnObstacle(options = {}){
  const groundY = dopeSkate.height - dopeSkate.groundHeight;
  const types = [
    { key: 'vodka', w: 24, h: 50 },
    { key: 'trash', w: 36, h: 34 },
    { key: 'cone', w: 28, h: 40 },
  ];
  const pick = options.obstacleKey
    ? (types.find(item => item.key === options.obstacleKey) || types[0])
    : types[Math.floor(Math.random() * types.length)];
  const lanes = [0, -6];
  const lane = Number.isFinite(options.lane) ? options.lane : lanes[Math.floor(Math.random() * lanes.length)];
  const spawnOffset = Number.isFinite(options.spawnOffset) ? options.spawnOffset : dopeSkateGetSpawnLeadOffset(32, 18);
  dopeSkate.lastObstacleLane = lane;
  dopeSkate.obstacles.push({
    type: pick.key,
    w: pick.w,
    h: pick.h,
    x: dopeSkate.width + spawnOffset,
    y: groundY - pick.h + lane,
  });
  dopeSkate.lastObstacleDist = dopeSkate.distance;
}

function dopeSkateSpawnRail(options = {}){
  const groundY = dopeSkate.height - dopeSkate.groundHeight;
  const spawnOffset = Number.isFinite(options.spawnOffset) ? options.spawnOffset : dopeSkateGetSpawnLeadOffset(74, 28);
  const presets = {
    short: { minW: 186, maxW: 238, h: 20, topOffset: 6, topH: 6, lowerTopOffset: null, popBoost: 108 },
    standard: { minW: 220, maxW: 300, h: 22, topOffset: 7, topH: 7, lowerTopOffset: null, popBoost: 116 },
    long: { minW: 292, maxW: 372, h: 24, topOffset: 7, topH: 7, lowerTopOffset: null, popBoost: 126 },
    double: { minW: 246, maxW: 326, h: 26, topOffset: 6, topH: 6, lowerTopOffset: 14, popBoost: 120 },
  };
  const pickPreset = ()=>{
    if(options.kind && presets[options.kind]) return { kind: options.kind, ...presets[options.kind] };
    const weighted = ['standard', 'standard', 'long', 'short', 'double'];
    const kind = weighted[Math.floor(Math.random() * weighted.length)];
    return { kind, ...presets[kind] };
  };
  const preset = pickPreset();
  const w = Number.isFinite(options.w)
    ? options.w
    : Math.round(preset.minW + Math.random() * (preset.maxW - preset.minW));
  const h = Number.isFinite(options.h) ? options.h : preset.h;
  const yOffset = Number.isFinite(options.yOffset) ? options.yOffset : -h;
  const topOffset = Number.isFinite(options.topOffset) ? options.topOffset : preset.topOffset;
  const topH = Number.isFinite(options.topH) ? options.topH : preset.topH;
  const lowerTopOffset = Number.isFinite(options.lowerTopOffset) ? options.lowerTopOffset : preset.lowerTopOffset;
  const popBoost = Number.isFinite(options.popBoost) ? options.popBoost : preset.popBoost;
  dopeSkate.rails.push({
    kind: preset.kind,
    w,
    h,
    x: dopeSkate.width + spawnOffset,
    y: groundY + yOffset,
    topOffset,
    topH,
    lowerTopOffset,
    popBoost,
  });
  dopeSkate.lastRailDist = dopeSkate.distance;
}

function dopeSkateGetCollectibleLaneY(lane, groundY){
  const laneMap = {
    high: groundY - 120,
    mid: groundY - 90,
    low: groundY - 60,
  };
  if(Number.isFinite(lane)){
    return lane < 0 ? groundY + lane : lane;
  }
  return laneMap[lane] || laneMap.mid;
}

function dopeSkateSpawnCollectible(type, options = {}){
  const groundY = dopeSkate.height - dopeSkate.groundHeight;
  const spawnOffset = Number.isFinite(options.spawnOffset) ? options.spawnOffset : dopeSkateGetSpawnLeadOffset(54, 24);
  const laneY = dopeSkateGetCollectibleLaneY(options.lane, groundY);
  if(type === 'cd'){
    dopeSkate.collectibles.push({
      type: 'cd',
      w: 22,
      h: 22,
      x: dopeSkate.width + spawnOffset,
      y: laneY,
    });
    return;
  }
  const letter = options.letter || dopeSkatePickBlissLetter();
  if(!letter) return;
  const blissY = Math.max(40, dopeSkateGetCollectibleLaneY(options.lane || 'high', groundY) - 20);
  dopeSkate.collectibles.push({
    type: 'bliss',
    letter,
    w: 24,
    h: 24,
    x: dopeSkate.width + spawnOffset,
    y: blissY,
  });
}

function dopeSkateGameOver(){
  dopeSkate.running = false;
  dopeSkate.paused = false;
  dopeSkate.gameOver = true;
  dopeSkateFinalizeScore();
  updateDopeSkateUI();
  if(dopeSkate.els && dopeSkate.els.overOverlay){
    dopeSkate.els.overOverlay.classList.remove('hidden');
  }
}

function dopeSkateDraw(){
  if(!dopeSkate.ctx) return;
  const ctx = dopeSkate.ctx;
  const w = dopeSkate.width;
  const h = dopeSkate.height;
  const groundY = h - dopeSkate.groundHeight;
  const dpr = dopeSkate.renderDpr || 1;
  const scaleX = dopeSkate.renderScaleX || 1;
  const scaleY = dopeSkate.renderScaleY || 1;

  ctx.setTransform(dpr * scaleX, 0, 0, dpr * scaleY, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  if(dopeSkate.cameraShake > 0){
    const shake = dopeSkate.cameraShake;
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }
  const equipped = dopeSkateGetEquippedAssets();
  dopeSkateDrawLayer(equipped.sky, dopeSkate.offsets.sky, 0, h);
  dopeSkateDrawLayer(equipped.background, dopeSkate.offsets.city, 40, h - 80);
  dopeSkateDrawLayer(equipped.ground, dopeSkate.offsets.ground, groundY, dopeSkate.groundHeight);

  if(!dopeSkate.assetsReady){
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(0, groundY, w, dopeSkate.groundHeight);
  }

  dopeSkate.obstacles.forEach(ob => {
    const img = dopeSkate.assets ? dopeSkate.assets[ob.type] : null;
    if(img){
      ctx.drawImage(img, ob.x, ob.y, ob.w, ob.h);
    } else {
      ctx.fillStyle = '#b54f2a';
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    }
  });

  dopeSkate.rails.forEach(rail => dopeSkateDrawRail(rail));

  dopeSkate.collectibles.forEach(item => {
    if(item.type === 'cd'){
      const img = dopeSkate.assets ? dopeSkate.assets.cd : null;
      if(img){
        ctx.drawImage(img, item.x, item.y, item.w, item.h);
      } else {
        ctx.fillStyle = '#cfd8e3';
        ctx.fillRect(item.x, item.y, item.w, item.h);
      }
      return;
    }
    const img = dopeSkate.assets ? dopeSkate.assets.bliss : null;
    if(img){
      ctx.drawImage(img, item.x, item.y, item.w, item.h);
      ctx.fillStyle = '#5b3a00';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.letter, item.x + item.w / 2, item.y + item.h / 2 + 2);
    } else {
      ctx.fillStyle = '#ffe36e';
      ctx.fillRect(item.x, item.y, item.w, item.h);
      ctx.fillStyle = '#5b3a00';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.letter, item.x + item.w / 2, item.y + item.h / 2 + 2);
    }
  });

  dopeSkateDrawParticles();
  dopeSkateDrawSkater();
  dopeSkateDrawHitboxes();
  ctx.restore();
}

function dopeSkateDrawHitboxes(){
  if(!dopeSkate.data || !dopeSkate.data.settings || !dopeSkate.data.settings.hitboxes) return;
  const ctx = dopeSkate.ctx;
  if(!ctx) return;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 80, 80, 0.9)';
  const playerBox = dopeSkateGetPlayerHitbox();
  ctx.strokeRect(playerBox.x, playerBox.y, playerBox.w, playerBox.h);

  ctx.strokeStyle = 'rgba(255, 200, 80, 0.9)';
  dopeSkate.obstacles.forEach(ob => {
    ctx.strokeRect(ob.x, ob.y, ob.w, ob.h);
  });

  ctx.strokeStyle = 'rgba(80, 200, 255, 0.9)';
  dopeSkate.rails.forEach(rail => {
    ctx.strokeRect(rail.x, rail.y, rail.w, rail.h);
  });

  ctx.strokeStyle = 'rgba(120, 255, 120, 0.9)';
  dopeSkate.collectibles.forEach(item => {
    ctx.strokeRect(item.x, item.y, item.w, item.h);
  });
  ctx.restore();
}

function dopeSkateDrawLayer(img, offset, y, height){
  const ctx = dopeSkate.ctx;
  const w = dopeSkate.width;
  if(!img){
    ctx.fillStyle = '#6aa6d9';
    ctx.fillRect(0, y, w, height);
    return;
  }
  const tileW = img.width;
  let x = -offset;
  while(x < w){
    ctx.drawImage(img, x, y, tileW, height);
    x += tileW;
  }
}

function dopeSkateDrawWheel(ctx, radius, spin, palette){
  ctx.save();
  ctx.fillStyle = palette.tire;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.inner;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.core;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(2, radius * 0.25), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = palette.spoke;
  ctx.lineWidth = Math.max(1, radius * 0.16);
  for(let i = 0; i < 4; i += 1){
    const angle = spin + (Math.PI * 0.5 * i);
    const x = Math.cos(angle) * radius * 0.48;
    const y = Math.sin(angle) * radius * 0.48;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  ctx.restore();
}

function dopeSkateDrawSkater(){
  const ctx = dopeSkate.ctx;
  const p = dopeSkate.player;
  if(!p) return;
  const equipped = dopeSkate.data ? dopeSkate.data.equipped : {};
  const assets = dopeSkateGetEquippedAssets();
  const sprites = dopeSkate.sprites || {};
  const animState = (dopeSkate.anim && dopeSkate.anim.state) ? dopeSkate.anim.state : 'idle';
  const animFrame = (dopeSkate.anim && Number.isFinite(dopeSkate.anim.frame)) ? dopeSkate.anim.frame : 0;

  const skaterFrameW = DOPE_SKATE_SPRITES.skater.frameW;
  const skaterFrameH = DOPE_SKATE_SPRITES.skater.frameH;
  const skaterScale = 1.22;
  const skaterDrawW = Math.round(skaterFrameW * skaterScale);
  const skaterDrawH = Math.round(skaterFrameH * skaterScale);

  const boardDrawW = 86;
  const boardDrawH = 12;
  const wheelRadius = 6;

  const footY = p.y + p.h;
  const groundY = dopeSkate.height - dopeSkate.groundHeight;
  const jumpHeight = Math.max(0, groundY - footY);
  const riderLift = 8;
  const skaterPivotX = Math.round(skaterDrawW / 2);
  const skaterPivotY = skaterDrawH;
  const skaterX = Math.round(p.x + p.w / 2 - skaterPivotX);
  const skaterY = Math.round(footY - skaterPivotY - riderLift);

  const boardX = Math.round(p.x + p.w / 2 - boardDrawW / 2);
  const boardY = Math.round(footY - 14);
  const boardCx = boardX + boardDrawW / 2;
  const boardCy = boardY + boardDrawH / 2;
  const boardAngle = p.boardSpin + p.boardAngle;
  const boardScaleY = Math.max(0.22, p.boardScaleY || 1);
  const wheelPalette = equipped && equipped.wheels === 'blue'
    ? { tire: '#102033', inner: '#2f8cff', core: '#dbe5ff', spoke: '#89b8ff' }
    : { tire: '#15171b', inner: '#4f555f', core: '#d0d8e5', spoke: '#a8b0bd' };
  const boardOverlay = equipped && equipped.board === 'chrome' ? 'rgba(182, 197, 218, 0.4)' : 'rgba(0,0,0,0)';

  const drawSheetFrame = (sheet, frame, x, y, w, h)=>{
    if(!sheet || !sheet.img) return false;
    const f = frame % (sheet.frames || 1);
    const sx = f * sheet.frameW;
    ctx.drawImage(sheet.img, sx, 0, sheet.frameW, sheet.frameH, x, y, w, h);
    dopeSkate.lastSkaterSheet = sheet;
    dopeSkate.lastSkaterFrame = f;
    return true;
  };

  // Grounded contact shadow for readability.
  ctx.save();
  const shadowScale = Math.max(0.35, Math.min(1, 1 - jumpHeight / 115));
  const shadowRx = 34 * shadowScale;
  const shadowRy = 3.4 + (shadowScale * 1.7);
  const shadowAlpha = 0.08 + (shadowScale * 0.17);
  const shadowY = groundY + 8;
  ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(boardCx, shadowY, shadowRx, shadowRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Board + wheels
  ctx.save();
  ctx.translate(boardCx, boardCy);
  ctx.rotate(boardAngle);
  ctx.scale(1, boardScaleY);
  if(assets.deck){
    ctx.drawImage(assets.deck, -boardDrawW / 2, -boardDrawH / 2, boardDrawW, boardDrawH);
    if(boardOverlay !== 'rgba(0,0,0,0)'){
      ctx.fillStyle = boardOverlay;
      ctx.fillRect(-boardDrawW / 2, -boardDrawH / 2, boardDrawW, boardDrawH);
    }
  } else if(!drawSheetFrame(sprites.board, 0, -boardDrawW / 2, -boardDrawH / 2, boardDrawW, boardDrawH)){
    ctx.fillStyle = '#b87928';
    ctx.fillRect(-boardDrawW / 2, -boardDrawH / 2, boardDrawW, boardDrawH);
    ctx.fillStyle = '#8a5b1b';
    ctx.fillRect(-boardDrawW / 2 + 6, -2, boardDrawW - 12, 4);
  }
  const wheelInset = boardDrawW * 0.17;
  const wheelOffsetY = boardDrawH / 2 + wheelRadius - 2;
  const wheelPositions = [
    { x: -boardDrawW / 2 + wheelInset },
    { x: boardDrawW / 2 - wheelInset },
  ];

  ctx.fillStyle = '#b7bcc6';
  ctx.fillRect(-boardDrawW / 2 + 14, boardDrawH / 2 - 1, 9, 3);
  ctx.fillRect(boardDrawW / 2 - 23, boardDrawH / 2 - 1, 9, 3);

  wheelPositions.forEach(pos => {
    ctx.save();
    ctx.translate(pos.x, wheelOffsetY);
    dopeSkateDrawWheel(ctx, wheelRadius, p.wheelAngle, wheelPalette);
    ctx.restore();
  });
  ctx.restore();

  // Skater
  const kneeBend = Math.max(0, Math.min(1, p.kneeBend || 0));
  const armSwing = Math.max(-0.8, Math.min(0.8, p.armSwing || 0));
  const torsoPitch = Math.max(-0.36, Math.min(0.36, p.torsoPitch || 0));
  let usedBodyAsset = false;
  ctx.save();
  ctx.translate(skaterX + skaterPivotX, skaterY + skaterPivotY + (p.bodyBob || 0) + kneeBend * 7);
  ctx.rotate((p.bodyLean || 0) + torsoPitch * 0.35);
  const squash = (1 - p.squash * 0.3) * (1 - kneeBend * 0.18);
  ctx.scale(1 + p.squash * 0.2 + kneeBend * 0.08, squash);
  let bodyAsset = assets.skaterBody || null;
  if(
    bodyAsset &&
    assets.skaterBodyStep &&
    p.onGround &&
    dopeSkate.running &&
    animState === 'push'
  ){
    const cadence = Math.floor(dopeSkate.time * 9) % 2;
    if(cadence === 1) bodyAsset = assets.skaterBodyStep;
  }
  if(bodyAsset){
    ctx.drawImage(bodyAsset, -skaterPivotX, -skaterPivotY, skaterDrawW, skaterDrawH);
    usedBodyAsset = true;
  }
  const skaterSheet = sprites.skater && (sprites.skater[animState] || sprites.skater.idle);
  const fallbackSheet = dopeSkate.lastSkaterSheet || skaterSheet;
  if(!bodyAsset){
    if(!drawSheetFrame(skaterSheet, animFrame, -skaterPivotX, -skaterPivotY, skaterDrawW, skaterDrawH)){
      if(fallbackSheet){
        drawSheetFrame(fallbackSheet, dopeSkate.lastSkaterFrame || 0, -skaterPivotX, -skaterPivotY, skaterDrawW, skaterDrawH);
      } else {
        ctx.fillStyle = '#2f6b9a';
        ctx.fillRect(-skaterPivotX + 12, -skaterPivotY + 26, 40, 52);
        ctx.fillStyle = '#f2c7a5';
        ctx.fillRect(-skaterPivotX + 24, -skaterPivotY + 10, 16, 16);
      }
    }
  }
  if(assets.hat){
    const headX = 0;
    const headY = -skaterPivotY + 16;
    ctx.save();
    ctx.translate(headX, headY);
    ctx.drawImage(assets.hat, -14, -12, 32, 18);
    ctx.restore();
  }
  if(!usedBodyAsset){
    dopeSkateDrawSkaterArmOverlay(ctx, armSwing, kneeBend);
  }
  ctx.restore();
}

function dopeSkateDrawSkaterArmOverlay(ctx, swing, kneeBend){
  const shoulderY = -70 + kneeBend * 3;
  const elbowY = -48 + kneeBend * 2;
  const handY = -30 + kneeBend * 2;
  const leftShoulderX = -22;
  const rightShoulderX = 22;
  const leftElbowX = -26 + swing * 8;
  const rightElbowX = 26 - swing * 8;
  const leftHandX = -23 + swing * 12;
  const rightHandX = 23 - swing * 12;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#1f2733';
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  ctx.moveTo(leftShoulderX, shoulderY);
  ctx.lineTo(leftElbowX, elbowY);
  ctx.lineTo(leftHandX, handY);
  ctx.moveTo(rightShoulderX, shoulderY);
  ctx.lineTo(rightElbowX, elbowY);
  ctx.lineTo(rightHandX, handY);
  ctx.stroke();

  ctx.fillStyle = '#e5b89a';
  ctx.beginPath();
  ctx.arc(leftHandX, handY, 1.9, 0, Math.PI * 2);
  ctx.arc(rightHandX, handY, 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function dopeSkateCheckGamepad(){
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  if(!pads) return;
  const touchPriority = isMobileTouchPriorityActive();
  for(const pad of pads){
    if(!pad) continue;
    const menuOpen = dopeSkateMenuIsOpen();
    const jumpPressed = pad.buttons && pad.buttons[0] && pad.buttons[0].pressed;
    const trick1Pressed = pad.buttons && pad.buttons[2] && pad.buttons[2].pressed;
    const trick2Pressed = pad.buttons && pad.buttons[3] && pad.buttons[3].pressed;
    const trick3Pressed = pad.buttons && pad.buttons[1] && pad.buttons[1].pressed;
    const upPressed = pad.buttons && pad.buttons[12] && pad.buttons[12].pressed;
    const downPressed = pad.buttons && pad.buttons[13] && pad.buttons[13].pressed;
    const leftPressed = pad.buttons && pad.buttons[14] && pad.buttons[14].pressed;
    const rightPressed = pad.buttons && pad.buttons[15] && pad.buttons[15].pressed;
    const startPressed = pad.buttons && pad.buttons[9] && pad.buttons[9].pressed;
    const backPressed = pad.buttons && pad.buttons[8] && pad.buttons[8].pressed;
    const closePressed = !!(
      (pad.buttons && pad.buttons[4] && pad.buttons[4].pressed) ||
      (pad.buttons && pad.buttons[5] && pad.buttons[5].pressed)
    );

    if(menuOpen && !touchPriority){
      if(upPressed && !dopeSkate.gamepad.up) dopeSkateMenuNavigate(0, -1);
      if(downPressed && !dopeSkate.gamepad.down) dopeSkateMenuNavigate(0, 1);
      if(leftPressed && !dopeSkate.gamepad.left) dopeSkateMenuNavigate(-1, 0);
      if(rightPressed && !dopeSkate.gamepad.right) dopeSkateMenuNavigate(1, 0);
      if(jumpPressed && !dopeSkate.gamepad.confirm) dopeSkateMenuActivate();
      if(backPressed && !dopeSkate.gamepad.back) dopeSkateMenuBack();
      if(closePressed && !dopeSkate.gamepad.close) dopeSkateHideMenu();
    } else if(!menuOpen && !touchPriority){
      if(jumpPressed && !dopeSkate.gamepad.jump){
        dopeSkateRegisterJump();
      }
      if(trick1Pressed && !dopeSkate.gamepad.trick1){
        dopeSkateRegisterTrick('trick1');
      }
      if(trick2Pressed && !dopeSkate.gamepad.trick2){
        dopeSkateRegisterTrick('trick2');
      }
      if(trick3Pressed && !dopeSkate.gamepad.trick3){
        dopeSkateRegisterTrick('trick3');
      }
    }
    if(!touchPriority && startPressed && !dopeSkate.gamepad.start){
      if(dopeSkateMenuIsOpen()) dopeSkateHideMenu();
      else dopeSkateShowMenu('play');
    }
    dopeSkate.gamepad.jump = jumpPressed;
    if(!touchPriority) dopeSkate.jumpHeld = jumpPressed;
    dopeSkate.gamepad.trick1 = trick1Pressed;
    dopeSkate.gamepad.trick2 = trick2Pressed;
    dopeSkate.gamepad.trick3 = trick3Pressed;
    dopeSkate.gamepad.up = upPressed;
    dopeSkate.gamepad.down = downPressed;
    dopeSkate.gamepad.left = leftPressed;
    dopeSkate.gamepad.right = rightPressed;
    dopeSkate.gamepad.confirm = jumpPressed;
    dopeSkate.gamepad.back = backPressed;
    dopeSkate.gamepad.close = closePressed;
    dopeSkate.gamepad.start = startPressed;

    if(!touchPriority && !menuOpen && pad.axes && pad.axes.length){
      dopeSkate.inputs.left = pad.axes[0] < -0.4;
      dopeSkate.inputs.right = pad.axes[0] > 0.4;
    }
  }
}

function updateDopeSkateUI(){
  if(!dopeSkate.els) return;
  if(dopeSkate.els.hud){
    const showHud = dopeSkate.running && !dopeSkate.paused && !dopeSkate.gameOver;
    dopeSkate.els.hud.classList.toggle('hidden', !showHud);
  }
  if(dopeSkate.els.score) dopeSkate.els.score.textContent = String(dopeSkate.scoreTotal);
  if(dopeSkate.els.combo) dopeSkate.els.combo.textContent = `${dopeSkate.combo.multiplier}x`;
  if(dopeSkate.els.cds) dopeSkate.els.cds.textContent = String(dopeSkate.cds);
  if(dopeSkate.els.best) dopeSkate.els.best.textContent = String(state.dopeSkate.highScore || 0);
  if(dopeSkate.els.localBest) dopeSkate.els.localBest.textContent = String(state.dopeSkate.highScore || 0);
  if(dopeSkate.els.overScore) dopeSkate.els.overScore.textContent = String(dopeSkate.scoreTotal);
  if(dopeSkate.els.overBase) dopeSkate.els.overBase.textContent = String(dopeSkate.scoreBase || 0);
  if(dopeSkate.els.overCombo) dopeSkate.els.overCombo.textContent = String(dopeSkate.comboBank || 0);
  if(dopeSkate.els.overBliss) dopeSkate.els.overBliss.textContent = String(dopeSkate.blissBonus || 0);
  if(dopeSkate.els.overCds) dopeSkate.els.overCds.textContent = String(dopeSkate.cds);
  if(dopeSkate.els.overBest) dopeSkate.els.overBest.textContent = String(state.dopeSkate.highScore || 0);
  if(dopeSkate.els.wallet && dopeSkate.data) dopeSkate.els.wallet.textContent = `CD ${dopeSkate.data.wallet || 0}`;
  if(dopeSkate.els.globalBest) dopeSkate.els.globalBest.textContent = '—';
  if(dopeSkate.els.difficultySelect && dopeSkate.data && dopeSkate.data.settings){
    dopeSkate.els.difficultySelect.value = dopeSkate.data.settings.difficulty || 'medium';
  }
  if(dopeSkate.els.sfxToggle && dopeSkate.data && dopeSkate.data.settings){
    const enabled = !!dopeSkate.data.settings.sfx;
    dopeSkate.els.sfxToggle.dataset.enabled = enabled ? '1' : '0';
    dopeSkate.els.sfxToggle.textContent = enabled ? t('skate.settings.sfxOn') : t('skate.settings.sfxOff');
  }
  if(dopeSkate.els.hitboxToggle && dopeSkate.data && dopeSkate.data.settings){
    const enabled = !!dopeSkate.data.settings.hitboxes;
    dopeSkate.els.hitboxToggle.dataset.enabled = enabled ? '1' : '0';
    dopeSkate.els.hitboxToggle.textContent = enabled ? t('skate.settings.hitboxesOn') : t('skate.settings.hitboxesOff');
  }
  if(dopeSkate.els.resumeButtons){
    const showResume = dopeSkate.started && !dopeSkate.gameOver;
    dopeSkate.els.resumeButtons.forEach(btn => btn.classList.toggle('hidden', !showResume));
  }
  if(dopeSkate.els.comboMeter){
    const elapsed = Math.max(0, dopeSkate.time - dopeSkate.lastTrickAt);
    const ratio = dopeSkate.combo.active ? Math.max(0, 1 - elapsed / dopeSkate.comboWindow) : 0;
    dopeSkate.els.comboMeter.style.width = `${Math.floor(ratio * 100)}%`;
  }
  if(dopeSkate.els.landingIndicator){
    const fb = dopeSkate.landingFeedback || { state: '', text: '', timer: 0 };
    const hasFeedback = fb.timer > 0 && fb.text;
    dopeSkate.els.landingIndicator.dataset.state = hasFeedback ? fb.state : 'idle';
    dopeSkate.els.landingIndicator.textContent = hasFeedback ? fb.text : 'Landing: --';
  }
  if(dopeSkate.mission){
    const m = dopeSkate.mission;
    const progress = Math.min(m.target, Math.max(0, m.progress || 0));
    const tierLabel = (m.tier || 'easy').toUpperCase();
    if(dopeSkate.els.missionTitle){
      dopeSkate.els.missionTitle.textContent = m.label;
    }
    if(dopeSkate.els.missionCount){
      dopeSkate.els.missionCount.textContent = `${progress}/${m.target}`;
    }
    if(dopeSkate.els.missionTier){
      dopeSkate.els.missionTier.textContent = tierLabel;
    }
    if(dopeSkate.els.missionStreak){
      dopeSkate.els.missionStreak.textContent = `Streak x${dopeSkate.missionStreak || 0}`;
    }
    if(dopeSkate.els.missionReward){
      dopeSkate.els.missionReward.textContent = `Reward +${m.rewardCd} CD | +${m.rewardScore} pts`;
    }
    if(dopeSkate.els.missionBox){
      dopeSkate.els.missionBox.dataset.tier = m.tier || 'easy';
    }
    if(dopeSkate.els.missionMeter){
      const ratio = m.target > 0 ? (progress / m.target) : 0;
      dopeSkate.els.missionMeter.style.width = `${Math.floor(ratio * 100)}%`;
    }
  } else {
    if(dopeSkate.els.missionTitle) dopeSkate.els.missionTitle.textContent = '—';
    if(dopeSkate.els.missionCount) dopeSkate.els.missionCount.textContent = '0/0';
    if(dopeSkate.els.missionTier) dopeSkate.els.missionTier.textContent = '—';
    if(dopeSkate.els.missionStreak) dopeSkate.els.missionStreak.textContent = 'Streak x0';
    if(dopeSkate.els.missionReward) dopeSkate.els.missionReward.textContent = 'Reward —';
    if(dopeSkate.els.missionBox) dopeSkate.els.missionBox.dataset.tier = 'easy';
    if(dopeSkate.els.missionMeter) dopeSkate.els.missionMeter.style.width = '0%';
  }
  dopeSkateRenderComboList();
  dopeSkateRenderBlissHUD();
  dopeSkateUpdateBalanceUI();
}

function dopeSkateHandleKey(e){
  if(!isDopeSkateActive()) return false;
  const tag = e.target && e.target.tagName;
  if(tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return false;

  const key = e.key.toLowerCase();
  let handled = true;
  if(key === 'escape'){
    dopeSkateShowMenu('play');
  } else if(key === 'arrowleft' || key === 'a'){
    dopeSkate.inputs.left = true;
  } else if(key === 'arrowright' || key === 'd'){
    dopeSkate.inputs.right = true;
  } else if(key === 'arrowup' || key === 'w' || key === ' ' || key === 'spacebar'){
    dopeSkate.jumpHeld = true;
    dopeSkateRegisterJump();
  } else if(key === 'z'){
    dopeSkateRegisterTrick('trick1');
  } else if(key === 'x'){
    dopeSkateRegisterTrick('trick2');
  } else if(key === 'c'){
    dopeSkateRegisterTrick('trick3');
  } else if(key === 'h'){
    if(dopeSkate.data){
      dopeSkate.data.settings = dopeSkate.data.settings || {};
      dopeSkate.data.settings.hitboxes = !dopeSkate.data.settings.hitboxes;
      if(dopeSkate.els && dopeSkate.els.hitboxToggle){
        dopeSkate.els.hitboxToggle.dataset.enabled = dopeSkate.data.settings.hitboxes ? '1' : '0';
        dopeSkate.els.hitboxToggle.textContent = dopeSkate.data.settings.hitboxes ? t('skate.settings.hitboxesOn') : t('skate.settings.hitboxesOff');
      }
      saveDopeSkateData(dopeSkate.data);
    }
  } else if(key === 'r' && dopeSkate.gameOver){
    dopeSkateStartRun();
  } else if(key === 'enter' && !dopeSkate.running && !dopeSkate.gameOver){
    dopeSkateStartRun();
  } else {
    handled = false;
  }

  if(handled){
    e.preventDefault();
  }
  return handled;
}

function dopeSkateHandleKeyUp(e){
  if(!isDopeSkateActive()) return false;
  const key = e.key.toLowerCase();
  if(key === 'arrowleft' || key === 'a'){
    dopeSkate.inputs.left = false;
    e.preventDefault();
    return true;
  }
  if(key === 'arrowright' || key === 'd'){
    dopeSkate.inputs.right = false;
    e.preventDefault();
    return true;
  }
  if(key === 'arrowup' || key === 'w' || key === ' ' || key === 'spacebar'){
    dopeSkate.jumpHeld = false;
    e.preventDefault();
    return true;
  }
  return false;
}

function dopeSkateHandleTrick(slot){
  const player = dopeSkate.player;
  if(!player || (player.mode !== 'air' && player.mode !== 'grind')) return;
  const trick = dopeSkatePickTrick(slot);
  if(!trick) return;
  if(dopeSkate.time - dopeSkate.lastTrickAt < 0.14 && dopeSkate.lastTrickId !== 'ollie') return;
  dopeSkate.lastTrickAt = dopeSkate.time;
  dopeSkate.lastTrickId = trick.id;
  dopeSkate.combo.active = true;
  dopeSkate.combo.points += trick.points;
  dopeSkate.combo.tricks.push(trick.name);
  dopeSkate.combo.unique.add(trick.id);
  dopeSkate.combo.multiplier = Math.max(dopeSkate.combo.multiplier, dopeSkate.combo.unique.size);
  dopeSkateStartTrickAnim(trick.id);
  dopeSkateSpawnTrickText(trick.name);
  dopeSkate.cameraShake = Math.max(dopeSkate.cameraShake, 4);
  dopeSkatePlaySound('trick');
}

function dopeSkateStartTrickAnim(trickId){
  const player = dopeSkate.player;
  if(!player) return;
  const durationMap = {
    ollie: 0.3,
    kickflip: 0.45,
    heelflip: 0.45,
    shuvit: 0.4,
    hardflip: 0.5,
    varial: 0.5,
    laserflip: 0.55,
    inward: 0.52,
    lateflip: 0.5,
  };
  player.trickAnim = {
    id: trickId,
    t: 0,
    duration: durationMap[trickId] || 0.4,
  };
}

function dopeSkateUpdateAnimations(dt){
  const player = dopeSkate.player;
  if(!player) return;
  player.wheelAngle += dopeSkate.speed * dt * 0.08;
  player.squash = Math.max(0, player.squash - dt * 2.8);
  player.landingBend = Math.max(0, (player.landingBend || 0) - dt * 2.5);
  player.bodyLean = 0;
  player.bodyBob = 0;
  player.torsoPitch = 0;
  player.armSwing = 0;
  player.kneeBend = Math.max(0, Math.min(1, player.landingBend || 0));
  player.boardSpin = 0;
  player.boardAngle = 0;
  player.boardScaleY = 1;
  const lateralLean = dopeSkate.inputs.left ? -0.12 : (dopeSkate.inputs.right ? 0.12 : 0);
  player.bodyLean += lateralLean;
  player.armSwing += lateralLean * 1.6;
  if(player.onGround && dopeSkate.running){
    player.bodyBob = 0;
    const sway = Math.sin(dopeSkate.time * 7.2) * 0.015;
    player.bodyLean += sway;
    player.armSwing += Math.sin(dopeSkate.time * 11.5) * 0.12;
  }
  if(!player.onGround){
    player.boardAngle += Math.max(-0.22, Math.min(0.22, player.vy / 920));
    player.bodyLean += Math.max(-0.16, Math.min(0.16, player.vy / 1600));
    player.armSwing += Math.max(-0.25, Math.min(0.25, player.vy / 900));
    if(player.vy > 80){
      player.kneeBend = Math.max(player.kneeBend, Math.min(0.35, (player.vy - 80) / 500));
    }
  }
  if(player.mode === 'grind' && player.grind){
    player.bodyLean += (player.grind.balance - 0.5) * 0.36;
    player.boardAngle += (player.grind.balance - 0.5) * 0.2;
    player.armSwing += (player.grind.balance - 0.5) * 1.15;
    player.kneeBend = Math.max(player.kneeBend, 0.2);
  }
  if(player.trickAnim){
    player.trickAnim.t += dt;
    const progress = Math.min(1, player.trickAnim.t / Math.max(0.01, player.trickAnim.duration || 0.4));
    const trickVisual = {
      ollie: { spinTurns: 0.1, flip: false, pitch: 0.22 },
      kickflip: { spinTurns: 0.2, flip: true, pitch: 0.18 },
      heelflip: { spinTurns: -0.2, flip: true, pitch: 0.18 },
      shuvit: { spinTurns: 1.0, flip: false, pitch: 0.14 },
      varial: { spinTurns: 1.2, flip: true, pitch: 0.2 },
      hardflip: { spinTurns: 1.35, flip: true, pitch: 0.28 },
      laserflip: { spinTurns: -1.5, flip: true, pitch: 0.3 },
      inward: { spinTurns: -1.2, flip: true, pitch: 0.26 },
      lateflip: { spinTurns: 0.7, flip: true, pitch: 0.16 },
    };
    const cfg = trickVisual[player.trickAnim.id] || { spinTurns: 0.3, flip: false, pitch: 0.14 };
    const arc = Math.sin(progress * Math.PI);
    player.boardSpin += cfg.spinTurns * progress * Math.PI * 2;
    player.boardAngle += arc * cfg.pitch;
    player.bodyBob -= arc * 6.8;
    player.bodyLean += cfg.spinTurns * 0.08;
    player.torsoPitch += arc * cfg.pitch * 0.9;
    player.armSwing += Math.sin(progress * Math.PI * 2) * 0.3;
    player.kneeBend = Math.max(player.kneeBend, arc * 0.16);
    if(cfg.flip){
      player.boardScaleY = Math.max(0.2, Math.abs(Math.cos(progress * Math.PI * 2)));
      player.bodyLean += Math.sin(progress * Math.PI * 2) * 0.08;
    }
    if(progress >= 1) player.trickAnim = null;
  }
  player.torsoPitch += player.boardAngle * 0.7;
  player.bodyLean += player.torsoPitch * 0.2;
  player.armSwing += player.torsoPitch * 0.9;

  if(player.onGround && dopeSkate.running && player.mode !== 'grind'){
    player.trailTimer = Math.max(0, (player.trailTimer || 0) - dt);
    if(player.trailTimer <= 0){
      const footY = player.y + player.h;
      dopeSkateSpawnWheelTrail(player.x + 10, footY - 6);
      dopeSkateSpawnWheelTrail(player.x + player.w - 10, footY - 6);
      player.trailTimer = 0.045;
    }
  } else {
    player.trailTimer = 0;
  }

  // Sprite animation state machine (visual only)
  let desired = 'idle';
  if(dopeSkate.gameOver){
    desired = 'bail';
  } else if(player.mode === 'grind'){
    desired = 'grind';
  } else if(!player.onGround){
    desired = player.vy < 0 ? 'ollie' : 'air';
  } else if(player.justLanded){
    desired = 'land';
  } else if(dopeSkate.running){
    desired = 'push';
  }

  const anim = dopeSkate.anim || { state: 'idle', t: 0, frame: 0 };
  if(anim.state !== desired){
    anim.state = desired;
    anim.t = 0;
    anim.frame = 0;
  } else {
    anim.t += dt;
  }

  const cfg = DOPE_SKATE_SPRITES.skater.animations[anim.state] || DOPE_SKATE_SPRITES.skater.animations.idle;
  const frames = Math.max(1, cfg.frames || 1);
  const fps = Math.max(1, cfg.fps || 1);
  const rawFrame = Math.floor(anim.t * fps);

  if(cfg.loop){
    anim.frame = rawFrame % frames;
  } else {
    anim.frame = Math.min(frames - 1, rawFrame);
    if(rawFrame >= frames){
      if(anim.state === 'ollie' && !player.onGround) anim.state = 'air';
      else if(anim.state === 'land') anim.state = dopeSkate.running ? 'push' : 'idle';
      anim.t = 0;
      anim.frame = 0;
    }
  }
  dopeSkate.anim = anim;
  player.justLanded = false;
}

function dopeSkateSpawnTrickText(text){
  if(dopeSkate.particles.length > 120) return;
  const player = dopeSkate.player;
  const x = player ? player.x + 30 : 160;
  const y = player ? player.y - 8 : 140;
  dopeSkate.particles.push({
    type: 'text',
    text,
    x,
    y,
    vx: -10 + Math.random() * 20,
    vy: -40 - Math.random() * 30,
    life: 0.8,
  });
}

function dopeSkatePickTrick(slot){
  const player = dopeSkate.player;
  const left = dopeSkate.inputs.left;
  const right = dopeSkate.inputs.right;
  const sideways = left || right;
  const descending = !!(player && player.vy > 120);
  const chainHot = dopeSkate.combo.multiplier >= 3;
  const byId = (id)=>DOPE_SKATE_TRICKS.find(t => t.id === id);

  if(slot === 'trick1'){
    if(chainHot && !sideways) return byId('laserflip');
    if(descending && sideways) return byId('inward');
    if(sideways) return byId('heelflip');
    return byId('kickflip');
  }
  if(slot === 'trick2'){
    if(descending && !sideways) return byId('lateflip');
    if(sideways) return byId('varial');
    return byId('shuvit');
  }
  if(slot === 'trick3'){
    if(player && player.mode === 'grind' && chainHot) return byId('lateflip');
    if(descending && sideways) return byId('inward');
    return byId('hardflip');
  }
  return null;
}

function dopeSkateEvaluateLanding(impactVy){
  if(!dopeSkate.combo.active || dopeSkate.combo.points <= 0){
    return { label: '', multiplier: 1 };
  }
  const impact = Math.abs(impactVy || 0);
  const trickAge = Math.max(0, dopeSkate.time - dopeSkate.lastTrickAt);
  if(
    trickAge <= DOPE_SKATE_COMBAT.perfectLandingMaxAgeSec &&
    impact <= DOPE_SKATE_COMBAT.perfectLandingMaxImpact
  ){
    return { label: 'perfect', multiplier: 1.25 };
  }
  if(impact >= DOPE_SKATE_COMBAT.sketchyLandingMinImpact){
    return { label: 'sketchy', multiplier: 0.72 };
  }
  return { label: 'clean', multiplier: 1 };
}

function dopeSkateApplyComboPenalty(){
  if(dopeSkate.combo.points <= 0) return;
  const carryPoints = Math.floor(dopeSkate.combo.points * 0.35);
  const reducedMultiplier = Math.max(1, dopeSkate.combo.multiplier - 1);
  const salvage = Math.floor((dopeSkate.combo.points - carryPoints) * reducedMultiplier * dopeSkate.scoreMultiplier * 0.7);
  dopeSkate.comboBank += salvage;
  dopeSkate.combo.points = carryPoints;
  dopeSkate.combo.tricks = dopeSkate.combo.tricks.slice(-1);
  dopeSkate.combo.unique.clear();
  if(dopeSkate.lastTrickId){
    dopeSkate.combo.unique.add(dopeSkate.lastTrickId);
  }
  dopeSkate.combo.multiplier = reducedMultiplier;
  dopeSkate.combo.active = dopeSkate.combo.points > 0;
  dopeSkate.lastTrickAt = dopeSkate.time;
  dopeSkate.combo.lastLandingQuality = 'drop';
  dopeSkateSpawnTrickText('Combo Drop');
  dopeSkateSetLandingFeedback('drop', 'Combo dropped', 0.72);
  dopeSkate.cameraShake = Math.max(dopeSkate.cameraShake, 2);
}

function dopeSkateResolveCombo(landing = null){
  if(dopeSkate.combo.points <= 0) return;
  const achievedMultiplier = dopeSkate.combo.multiplier;
  const landingMultiplier = landing && Number.isFinite(landing.multiplier) ? landing.multiplier : 1;
  const bonus = Math.floor(dopeSkate.combo.points * dopeSkate.combo.multiplier * landingMultiplier * dopeSkate.scoreMultiplier);
  dopeSkate.comboBank += bonus;
  dopeSkate.combo.lastLandingQuality = landing && landing.label ? landing.label : '';
  if(dopeSkate.combo.lastLandingQuality === 'perfect'){
    dopeSkateSpawnTrickText('Perfect Landing');
    dopeSkateSetLandingFeedback('perfect', 'Perfect landing', 0.9);
    dopeSkateMissionProgress('cleanLanding', 1);
    dopeSkate.cameraShake = Math.max(dopeSkate.cameraShake, 3);
    dopeSkatePlaySound('collect');
  } else if(dopeSkate.combo.lastLandingQuality === 'sketchy'){
    dopeSkateSpawnTrickText('Sketchy Landing');
    dopeSkateSetLandingFeedback('sketchy', 'Sketchy landing', 0.95);
  } else {
    dopeSkateSetLandingFeedback('ok', 'OK landing', 0.82);
    dopeSkateMissionProgress('cleanLanding', 1);
  }
  dopeSkateMissionProgress('comboMultiplier', 1, achievedMultiplier);
  dopeSkate.combo.points = 0;
  dopeSkate.combo.tricks = [];
  dopeSkate.combo.unique.clear();
  dopeSkate.combo.multiplier = 1;
  dopeSkate.combo.active = false;
}

function dopeSkateAddTrickById(id){
  const trick = DOPE_SKATE_TRICKS.find(t => t.id === id);
  if(!trick) return;
  dopeSkate.combo.active = true;
  dopeSkate.combo.points += trick.points;
  dopeSkate.combo.tricks.push(trick.name);
  dopeSkate.combo.unique.add(trick.id);
  dopeSkate.combo.multiplier = Math.max(dopeSkate.combo.multiplier, dopeSkate.combo.unique.size);
  dopeSkate.lastTrickAt = dopeSkate.time;
  dopeSkate.lastTrickId = trick.id;
  dopeSkateStartTrickAnim(trick.id);
  dopeSkateSpawnTrickText(trick.name);
}

function dopeSkateAddCustomTrick(id, name, points){
  dopeSkate.combo.active = true;
  dopeSkate.combo.points += points;
  dopeSkate.combo.tricks.push(name);
  dopeSkate.combo.unique.add(id);
  dopeSkate.combo.multiplier = Math.max(dopeSkate.combo.multiplier, dopeSkate.combo.unique.size);
  dopeSkate.lastTrickAt = dopeSkate.time;
  dopeSkate.lastTrickId = id;
  dopeSkateSpawnTrickText(name);
  dopeSkate.cameraShake = Math.max(dopeSkate.cameraShake, 3);
}

function dopeSkatePickBlissLetter(){
  const remaining = [];
  const counts = dopeSkate.blissCounts;
  if(counts.B < 1) remaining.push('B');
  if(counts.L < 1) remaining.push('L');
  if(counts.I < 1) remaining.push('I');
  if(counts.S < 2) remaining.push('S');
  if(remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function dopeSkateHasBlissComplete(){
  const counts = dopeSkate.blissCounts;
  return counts.B >= 1 && counts.L >= 1 && counts.I >= 1 && counts.S >= 2;
}

function dopeSkateCheckCollisions(){
  const playerBox = dopeSkateGetPlayerHitbox('obstacle');
  for(const ob of dopeSkate.obstacles){
    if(dopeSkateRectHit(playerBox, ob)){
      dopeSkatePlaySound('crash');
      dopeSkateGameOver();
      return;
    }
  }

  for(const rail of dopeSkate.rails){
    if(dopeSkate.player.mode !== 'grind' && dopeSkate.player.vy > 80){
      const railTopBox = dopeSkateGetRailTopBox(rail, 0);
      const lowerRailTopBox = rail.lowerTopOffset != null ? dopeSkateGetRailTopBox(rail, 1) : null;
      const p = dopeSkate.player;
      const footBox = {
        x: p.x + 8,
        y: p.y + p.h - 12,
        w: Math.max(16, p.w - 16),
        h: 12,
      };
      const hitPrimary = dopeSkateRectHit(footBox, railTopBox);
      const hitLower = lowerRailTopBox ? dopeSkateRectHit(footBox, lowerRailTopBox) : false;
      if(hitPrimary || hitLower){
        dopeSkateStartGrind(rail, hitLower ? lowerRailTopBox : railTopBox);
        break;
      }
    }
  }

  const pickupBox = dopeSkateGetPlayerHitbox('collect');
  for(const item of dopeSkate.collectibles){
    if(dopeSkateRectHit(pickupBox, item)){
      dopeSkateCollect(item);
      item.collected = true;
    }
  }
  dopeSkate.collectibles = dopeSkate.collectibles.filter(item => !item.collected);
}

function dopeSkateStartGrind(rail, contactBox = null){
  const player = dopeSkate.player;
  if(!player) return;
  const surface = contactBox || dopeSkateGetRailTopBox(rail, 0);
  player.mode = 'grind';
  player.onGround = false;
  player.vy = 0;
  player.grind = {
    rail,
    surfaceY: surface.y + surface.h,
    balance: 0.5,
    drift: Math.random() > 0.5 ? 1 : -1,
    trick: dopeSkatePickGrindTrick(),
  };
  player.grind.rate = player.grind.trick.rate;
  dopeSkateAddCustomTrick(player.grind.trick.id, player.grind.trick.name, player.grind.trick.points);
  dopeSkateMissionProgress('grindCount', 1);
  dopeSkateSpawnSpark(player.x + 16, surface.y + 1, { count: 7, spreadX: 18, spreadY: 8, speed: 145 });
  dopeSkateAddCameraShake(2.2);
  dopeSkatePlaySound('grind');
}

function dopeSkatePickGrindTrick(){
  if(dopeSkate.inputs.left) return { id: 'noseslide', name: 'Noseslide', points: 180, rate: 160 };
  if(dopeSkate.inputs.right) return { id: 'boardslide', name: 'Boardslide', points: 180, rate: 160 };
  return { id: '50-50', name: '50-50', points: 160, rate: 140 };
}

function dopeSkateUpdateGrind(dt){
  const player = dopeSkate.player;
  if(!player || !player.grind) return;
  const rail = player.grind.rail;
  const surfaceY = Number.isFinite(player.grind.surfaceY)
    ? player.grind.surfaceY
    : (dopeSkateGetRailTopBox(rail, 0).y + dopeSkateGetRailTopBox(rail, 0).h);
  player.y = surfaceY - player.h + 4;
  player.x = 130;

  const balanceSpeed = 0.55;
  if(dopeSkate.inputs.left) player.grind.balance -= balanceSpeed * dt;
  if(dopeSkate.inputs.right) player.grind.balance += balanceSpeed * dt;
  player.grind.balance += player.grind.drift * 0.18 * dt;
  if(Math.random() < 0.02) player.grind.drift *= -1;

  dopeSkate.combo.active = true;
  dopeSkate.combo.points += Math.floor(player.grind.rate * dt);
  if(Math.random() < 0.86){
    dopeSkateSpawnSpark(rail.x + 32, surfaceY - 2, { count: 2, spreadX: 10, spreadY: 5, speed: 92 });
  }

  if(player.grind.balance < 0 || player.grind.balance > 1){
    dopeSkatePlaySound('crash');
    dopeSkateGameOver();
    return;
  }

  if(rail.x + rail.w < player.x + 12){
    player.mode = 'air';
    player.grind = null;
    player.vy = -(rail.popBoost || 118);
    player.boardAngle -= 0.12;
    player.landingBend = Math.max(player.landingBend || 0, 0.22);
    dopeSkateAddCameraShake(1.15);
  }
}

function dopeSkateCollect(item){
  if(item.type === 'cd'){
    dopeSkate.cds += 1;
    dopeSkateMissionProgress('cdCollect', 1);
    dopeSkateSpawnCollectFx(item.x + item.w / 2, item.y + item.h / 2);
    dopeSkatePlaySound('collect');
    return;
  }
  if(item.type === 'bliss'){
    const counts = dopeSkate.blissCounts;
    if(item.letter === 'S' && counts.S < 2){
      counts.S += 1;
    } else if(item.letter !== 'S' && counts[item.letter] < 1){
      counts[item.letter] += 1;
    }
    dopeSkateSpawnCollectFx(item.x + item.w / 2, item.y + item.h / 2);
    dopeSkatePlaySound('collect');
  }
}

function dopeSkateGetPlayerHitbox(type = 'obstacle'){
  const p = dopeSkate.player;
  const footY = p.y + p.h;
  const width = Math.max(24, Math.round(p.w * 0.86));
  const height = Math.max(100, Math.round(p.h + 68));
  const base = {
    x: p.x + Math.round((p.w - width) * 0.5),
    y: Math.round(footY - height),
    w: width,
    h: height,
  };
  if(type === 'collect'){
    return {
      x: base.x - 4,
      y: base.y - 4,
      w: base.w + 8,
      h: base.h + 8,
    };
  }
  return {
    x: base.x,
    y: base.y,
    w: base.w,
    h: base.h,
  };
}

function dopeSkateGetRailTopBox(rail, row = 0){
  const topOffset = (row === 1 && rail && rail.lowerTopOffset != null)
    ? rail.lowerTopOffset
    : (Number.isFinite(rail && rail.topOffset) ? rail.topOffset : Math.max(4, Math.round((rail && rail.h ? rail.h : 20) * 0.34)));
  const topH = Number.isFinite(rail && rail.topH) ? rail.topH : Math.max(4, Math.round((rail && rail.h ? rail.h : 20) * 0.3));
  return {
    x: rail.x + 4,
    y: rail.y + topOffset,
    w: Math.max(16, rail.w - 8),
    h: topH,
  };
}

function dopeSkateDrawRail(rail){
  const ctx = dopeSkate.ctx;
  if(!ctx || !rail) return;
  const top = dopeSkateGetRailTopBox(rail, 0);
  const lower = rail.lowerTopOffset != null ? dopeSkateGetRailTopBox(rail, 1) : null;
  const supportTop = lower ? (lower.y + lower.h) : (top.y + top.h);
  const supportBottom = rail.y + rail.h;
  const supportH = Math.max(6, supportBottom - supportTop);

  const drawBar = (bar, alpha = 1)=>{
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#d8e6f7';
    ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
    ctx.fillStyle = '#8ea5be';
    ctx.fillRect(bar.x, bar.y + Math.max(1, Math.floor(bar.h * 0.55)), bar.w, Math.max(1, Math.ceil(bar.h * 0.45)));
    ctx.strokeStyle = 'rgba(237,245,255,0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bar.x + 0.5, bar.y + 0.5);
    ctx.lineTo(bar.x + bar.w - 0.5, bar.y + 0.5);
    ctx.stroke();
    ctx.restore();
  };

  drawBar(top, 1);
  if(lower){
    drawBar(lower, 0.95);
  }

  const supportCount = Math.max(2, Math.round(rail.w / 92));
  for(let i = 0; i < supportCount; i += 1){
    const t = supportCount === 1 ? 0.5 : (i / (supportCount - 1));
    const x = Math.round(rail.x + 12 + (rail.w - 24) * t);
    ctx.fillStyle = '#8a8f97';
    ctx.fillRect(x - 2, supportTop, 4, supportH);
    ctx.fillStyle = '#6b7078';
    ctx.fillRect(x - 2, supportTop + supportH - 2, 4, 2);
  }

  ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
  ctx.fillRect(rail.x + 4, supportBottom, Math.max(12, rail.w - 8), 2);
}

function dopeSkateAddCameraShake(amount){
  if(!Number.isFinite(amount) || amount <= 0) return;
  dopeSkate.cameraShake = Math.max(dopeSkate.cameraShake, amount);
}

function dopeSkateRectHit(a, b){
  return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
}

function dopeSkateRenderComboList(){
  if(!dopeSkate.els || !dopeSkate.els.comboList) return;
  const list = dopeSkate.combo.tricks.slice(-4);
  if(list.length === 0){
    if(dopeSkate.lastComboHtml !== ''){
      dopeSkate.els.comboList.innerHTML = '';
      dopeSkate.lastComboHtml = '';
    }
    return;
  }
  const html = list.map(name => `<span class="skate-combo-item">${name}</span>`).join('');
  if(html !== dopeSkate.lastComboHtml){
    dopeSkate.els.comboList.innerHTML = html;
    dopeSkate.lastComboHtml = html;
  }
}

function dopeSkateRenderBlissHUD(){
  if(!dopeSkate.els || !dopeSkate.els.bliss) return;
  const counts = dopeSkate.blissCounts;
  const key = `${counts.B}${counts.L}${counts.I}${counts.S}`;
  if(key === dopeSkate.lastBlissKey) return;
  const letters = [
    { letter:'B', active: counts.B > 0 },
    { letter:'L', active: counts.L > 0 },
    { letter:'I', active: counts.I > 0 },
    { letter:'S', active: counts.S > 0 },
    { letter:'S', active: counts.S > 1 },
  ];
  dopeSkate.els.bliss.innerHTML = letters.map(item => (
    `<span class="skate-bliss-letter${item.active ? ' active' : ''}">${item.letter}</span>`
  )).join('');
  dopeSkate.lastBlissKey = key;
}

function dopeSkateUpdateBalanceUI(){
  if(!dopeSkate.els || !dopeSkate.els.balance) return;
  const isGrind = dopeSkate.player && dopeSkate.player.mode === 'grind' && dopeSkate.player.grind;
  dopeSkate.els.balance.classList.toggle('hidden', !isGrind);
  if(isGrind && dopeSkate.els.balanceIndicator){
    const pos = Math.max(0, Math.min(1, dopeSkate.player.grind.balance));
    dopeSkate.els.balanceIndicator.style.left = `calc(${pos * 100}% - 2px)`;
  }
}

function dopeSkateSpawnSpark(x, y){
  let opts = {};
  if(typeof arguments[2] === 'object' && arguments[2]){
    opts = arguments[2];
  }
  const count = Number.isFinite(opts.count) ? Math.max(1, Math.floor(opts.count)) : 3;
  const spreadX = Number.isFinite(opts.spreadX) ? opts.spreadX : 12;
  const spreadY = Number.isFinite(opts.spreadY) ? opts.spreadY : 6;
  const speed = Number.isFinite(opts.speed) ? opts.speed : 105;
  if(dopeSkate.particles.length > 180) return;
  for(let i = 0; i < count; i += 1){
    const life = 0.16 + Math.random() * 0.26;
    dopeSkate.particles.push({
      type: 'spark',
      x: x + (Math.random() - 0.5) * spreadX,
      y: y + (Math.random() - 0.5) * spreadY,
      vx: -speed * 0.4 + Math.random() * speed,
      vy: -speed * (0.45 + Math.random() * 0.35),
      life,
      size: 1 + Math.random() * 1.8,
    });
  }
}

function dopeSkateSpawnLandingDust(x, y, impact = 220){
  if(dopeSkate.particles.length > 220) return;
  const count = Math.max(5, Math.min(12, Math.round(impact / 80)));
  const spread = 8 + Math.min(22, impact / 40);
  for(let i = 0; i < count; i += 1){
    const side = (i % 2 === 0) ? -1 : 1;
    const speed = 40 + Math.random() * (80 + impact * 0.1);
    dopeSkate.particles.push({
      type: 'dust',
      x: x + (Math.random() - 0.5) * spread,
      y: y + Math.random() * 2,
      vx: side * speed * (0.45 + Math.random() * 0.45),
      vy: -18 - Math.random() * 26,
      life: 0.28 + Math.random() * 0.24,
      size: 2 + Math.random() * 3.5,
      alpha: 0.35 + Math.random() * 0.3,
    });
  }
}

function dopeSkateSpawnWheelTrail(x, y){
  if(dopeSkate.particles.length > 240) return;
  dopeSkate.particles.push({
    type: 'trail',
    x,
    y,
    vx: -24 - Math.random() * 42,
    vy: -4 + Math.random() * 8,
    life: 0.12 + Math.random() * 0.14,
    size: 1.4 + Math.random() * 1.8,
    alpha: 0.18 + Math.random() * 0.16,
  });
}

function dopeSkateSpawnCollectFx(x, y){
  if(dopeSkate.particles.length > 120) return;
  for(let i = 0; i < 6; i += 1){
    dopeSkate.particles.push({
      x,
      y,
      vx: -60 + Math.random() * 120,
      vy: -120 + Math.random() * 80,
      life: 0.35 + Math.random() * 0.2,
    });
  }
}

function dopeSkateUpdateParticles(dt){
  dopeSkate.particles.forEach(p => {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if(p.type === 'spark'){
      p.vx *= Math.max(0, 1 - dt * 1.9);
      p.vy += 260 * dt;
      p.size = Math.max(0.6, p.size - dt * 2.6);
      return;
    }
    if(p.type === 'dust'){
      p.vx *= Math.max(0, 1 - dt * 3.2);
      p.vy += 110 * dt;
      p.size = Math.max(0.8, p.size - dt * 1.2);
      return;
    }
    if(p.type === 'trail'){
      p.vx *= Math.max(0, 1 - dt * 6);
      p.vy += 36 * dt;
      p.size = Math.max(0.6, p.size - dt * 3.8);
      return;
    }
    p.vy += 220 * dt;
  });
  dopeSkate.particles = dopeSkate.particles.filter(p => p.life > 0);
}

function dopeSkateDrawParticles(){
  const ctx = dopeSkate.ctx;
  const textParticles = [];
  dopeSkate.particles.forEach(p => {
    if(p.type === 'text'){
      textParticles.push(p);
      return;
    }
    if(p.type === 'spark'){
      const alpha = Math.max(0, Math.min(1, p.life / 0.35));
      ctx.fillStyle = `rgba(255, 214, 126, ${alpha.toFixed(3)})`;
      ctx.fillRect(p.x, p.y, p.size || 1.5, p.size || 1.5);
      return;
    }
    if(p.type === 'dust'){
      const alpha = Math.max(0, Math.min(1, (p.alpha || 0.35) * (p.life / 0.5)));
      const size = p.size || 2;
      ctx.fillStyle = `rgba(96, 104, 112, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, size * 0.8, size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    if(p.type === 'trail'){
      const alpha = Math.max(0, Math.min(1, (p.alpha || 0.2) * (p.life / 0.24)));
      const size = p.size || 1.8;
      ctx.fillStyle = `rgba(34, 38, 44, ${alpha.toFixed(3)})`;
      ctx.fillRect(p.x, p.y, size, Math.max(1, size * 0.68));
      return;
    }
    ctx.fillStyle = '#ffd27d';
    ctx.fillRect(p.x, p.y, 2, 2);
  });
  textParticles.forEach(p => {
    ctx.fillStyle = '#f8fffd';
    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
    ctx.fillText(p.text, p.x, p.y);
    ctx.globalAlpha = 1;
  });
}

function dopeSkateFinalizeScore(){
  const base = dopeSkate.scoreBase + dopeSkate.comboBank;
  const blissComplete = dopeSkateHasBlissComplete();
  dopeSkate.blissBonus = blissComplete ? base : 0;
  dopeSkate.scoreTotal = base + dopeSkate.blissBonus;
  if(dopeSkate.scoreTotal > state.dopeSkate.highScore){
    state.dopeSkate.highScore = dopeSkate.scoreTotal;
    saveDopeSkateHighScore(state.dopeSkate.highScore);
  }
  recordGameScore('dopeSkate', state.dopeSkate.highScore, new Date().toISOString());
  if(dopeSkate.data){
    dopeSkate.data.wallet = (dopeSkate.data.wallet || 0) + dopeSkate.cds;
    saveDopeSkateData(dopeSkate.data);
  }
}

function dopeSkateGetEquippedAssets(){
  if(dopeSkate.equippedAssets && !dopeSkate.equippedDirty){
    return dopeSkate.equippedAssets;
  }
  const assets = dopeSkate.assets || {};
  const eq = (dopeSkate.data && dopeSkate.data.equipped) ? dopeSkate.data.equipped : {};
  const skaterItem = DOPE_SKATE_SHOP.skater.find(item => item.id === eq.skater) || DOPE_SKATE_SHOP.skater[0];
  const skaterBody = assets[skaterItem && skaterItem.bodyAsset ? skaterItem.bodyAsset : 'skaterBodyCore'] || assets.skaterBody || null;
  const skaterBodyStep = assets[skaterItem && skaterItem.stepAsset ? skaterItem.stepAsset : 'skaterBodyCoreStep'] || skaterBody || assets.skaterBodyStep || null;
  const equipped = {
    sky: assets[DOPE_SKATE_SHOP.sky.find(item => item.id === eq.sky)?.asset || 'sky'],
    background: assets[DOPE_SKATE_SHOP.background.find(item => item.id === eq.background)?.asset || 'city'],
    ground: assets[DOPE_SKATE_SHOP.ground.find(item => item.id === eq.ground)?.asset || 'ground'],
    skaterBody,
    skaterBodyStep,
    deck: assets.deck || null,
    hat: eq.hat === 'none' ? null : assets[DOPE_SKATE_SHOP.hat.find(item => item.id === eq.hat)?.asset || 'hat'],
  };
  if(!dopeSkate.assetsReady){
    return equipped;
  }
  dopeSkate.equippedAssets = equipped;
  dopeSkate.equippedDirty = false;
  return dopeSkate.equippedAssets;
}

function dopeSkateGetAssetsForLoadout(loadout){
  const assets = dopeSkate.assets || {};
  const getAsset = (cat, fallbackKey) => {
    const id = loadout && loadout[cat];
    if(id === 'none') return null;
    const item = (DOPE_SKATE_SHOP[cat] || []).find(entry => entry.id === id);
    return assets[item ? item.asset : fallbackKey];
  };
  const skaterId = loadout && loadout.skater ? loadout.skater : 'core';
  const skaterItem = DOPE_SKATE_SHOP.skater.find(entry => entry.id === skaterId) || DOPE_SKATE_SHOP.skater[0];
  const skaterBody = assets[skaterItem && skaterItem.bodyAsset ? skaterItem.bodyAsset : 'skaterBodyCore'] || assets.skaterBody || null;
  const skaterBodyStep = assets[skaterItem && skaterItem.stepAsset ? skaterItem.stepAsset : 'skaterBodyCoreStep'] || skaterBody || assets.skaterBodyStep || null;
  return {
    sky: getAsset('sky', 'sky'),
    background: getAsset('background', 'city'),
    ground: getAsset('ground', 'ground'),
    skaterBody,
    skaterBodyStep,
    deck: assets.deck || null,
    skater: getSkaterSpritePath('idle', loadout || {}),
    hat: getAsset('hat', 'hat'),
    board: getBoardSpritePath(loadout || {}),
    wheels: getWheelSpritePath(loadout || {}),
  };
}

function dopeSkateRenderShop(){
  if(!dopeSkate.els || !dopeSkate.els.shopList || !dopeSkate.data) return;
  const wallet = dopeSkate.data.wallet || 0;
  dopeSkate.els.wallet.textContent = `CD ${wallet}`;
  const equipped = dopeSkate.data.equipped || {};
  const preview = getDopeSkatePreviewState();
  const previewLoadout = preview.active ? { ...equipped, ...preview.loadout } : equipped;

  const currentCat = DOPE_SKATE_SHOP[dopeSkate.shopCategory] ? dopeSkate.shopCategory : 'skater';
  dopeSkate.shopCategory = currentCat;
  if(dopeSkate.els.shopTabs){
    dopeSkate.els.shopTabs.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.skateShopTab === currentCat);
    });
  }

  const labelMap = {
    ground: t('skate.shop.ground'),
    background: t('skate.shop.background'),
    sky: t('skate.shop.sky'),
    skater: t('skate.shop.skater'),
    hat: t('skate.shop.hat'),
    board: t('skate.shop.board'),
    wheels: t('skate.shop.wheels'),
  };
  
  // Build HTML string first
  const html = (DOPE_SKATE_SHOP[currentCat] || []).map(item => {
    const cat = currentCat;
    const label = labelMap[cat] || cat;
    const owned = (dopeSkate.data.owned[cat] || []).includes(item.id);
    const isEquipped = equipped[cat] === item.id;
    const isPreview = preview.active && preview.selectedCategory === cat && preview.selectedItemId === item.id;
    const actionLabel = owned ? (isEquipped ? t('skate.shop.equipped') : t('skate.shop.equip')) : `${t('skate.shop.buy')} CD ${item.cost}`;
    return `
      <div class="skate-shop-item ${isEquipped ? 'active' : ''} ${isPreview ? 'preview' : ''}" data-skate-item="${item.id}" data-skate-cat="${cat}">
        <strong>${label}: ${item.name}</strong>
        <span class="tiny">${isPreview ? t('skate.shop.previewing') : (owned ? t('skate.shop.owned') : `CD ${item.cost}`)}</span>
        <button class="skate-btn ghost" type="button" data-skate-shop-action>${actionLabel}</button>
      </div>
    `;
  }).join('');
  
  dopeSkate.els.shopList.innerHTML = html;

  // Batch event listeners after DOM is set
  const shopItems = dopeSkate.els.shopList.querySelectorAll('[data-skate-item]');
  
  shopItems.forEach(card => {
    const btn = card.querySelector('[data-skate-shop-action]');
    if(btn){
      btn.addEventListener('click', (e)=>{
        dopeSkateHandleShopAction(card.dataset.skateCat, card.dataset.skateItem, card);
        e.stopPropagation();
      });
    }
    card.addEventListener('click', ()=>{
      dopeSkateSetPreview(card.dataset.skateCat, card.dataset.skateItem);
      dopeSkateRenderShop();
    });
  });

  dopeSkateRenderPreview(previewLoadout);
  if(dopeSkate.els.previewStatus){
    dopeSkate.els.previewStatus.textContent = preview.active ? t('skate.shop.previewActive') : t('skate.shop.previewNone');
  }
  if(dopeSkate.els.previewReset){
    dopeSkate.els.previewReset.classList.toggle('hidden', !preview.active);
  }
  dopeSkateMenuEnsureFocus();
}

function dopeSkateHandleShopAction(cat, itemId, cardEl){
  if(!dopeSkate.data) return;
  const item = (DOPE_SKATE_SHOP[cat] || []).find(entry => entry.id === itemId);
  if(!item) return;
  const owned = dopeSkate.data.owned[cat] || [];
  const isEquipped = dopeSkate.data.equipped[cat] === itemId;
  if(!owned.includes(itemId)){
    if((dopeSkate.data.wallet || 0) < item.cost){
      if(cardEl){
        cardEl.classList.add('locked');
        cardEl.addEventListener('animationend', ()=>{ cardEl.classList.remove('locked'); }, { once:true });
      }
      dopeSkatePlaySound('crash');
      return;
    }
    dopeSkate.data.wallet -= item.cost;
    owned.push(itemId);
    dopeSkate.data.owned[cat] = owned;
    dopeSkatePlaySound('collect');
  } else if(!isEquipped){
    dopeSkatePlaySound('trick');
    dopeSkate.data.equipped[cat] = itemId;
    dopeSkate.equippedDirty = true;
    if(cat === 'skater' || cat === 'board' || cat === 'wheels'){
      dopeSkate.spriteDirty = true;
      dopeSkateLoadSprites(dopeSkate.data.equipped);
    }
  }
  saveDopeSkateData(dopeSkate.data);
  if(cardEl){
    cardEl.classList.add('flash');
    cardEl.addEventListener('animationend', ()=>{ cardEl.classList.remove('flash'); }, { once:true });
  }
  dopeSkateRenderShop();
}

function dopeSkateRenderPreview(loadout){
  if(!dopeSkate.els || !dopeSkate.els.previewStage) return;
  const effectiveLoadout = loadout || (dopeSkate.data ? dopeSkate.data.equipped : {});
  const assets = dopeSkateGetAssetsForLoadout(effectiveLoadout);
  const stage = dopeSkate.els.previewStage;
  if(!dopeSkate.els.previewCanvas){
    stage.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.className = 'skate-preview-canvas';
    stage.appendChild(canvas);
    dopeSkate.els.previewCanvas = canvas;
  }
  const canvas = dopeSkate.els.previewCanvas;

  const previewKey = JSON.stringify({
    skater: effectiveLoadout && effectiveLoadout.skater ? effectiveLoadout.skater : 'core',
    board: effectiveLoadout && effectiveLoadout.board ? effectiveLoadout.board : 'classic',
    wheels: effectiveLoadout && effectiveLoadout.wheels ? effectiveLoadout.wheels : 'black',
    v: DOPE_SKATE_SPRITE_VERSION,
  });
  dopeSkate.previewRenderToken = (dopeSkate.previewRenderToken || 0) + 1;
  const renderToken = dopeSkate.previewRenderToken;
  if(dopeSkate.previewSpriteKey !== previewKey){
    dopeSkateLoadPreviewSprites(effectiveLoadout).then(() => {
      if(dopeSkate.previewRenderToken === renderToken){
        dopeSkateRenderPreview(effectiveLoadout);
      }
    });
  }

  const rect = stage.getBoundingClientRect();
  const viewW = Math.max(1, Math.floor(rect.width || 260));
  const viewH = Math.max(1, Math.floor(rect.height || 180));
  canvas.width = viewW;
  canvas.height = viewH;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const baseW = 320;
  const baseH = 180;
  const scale = Math.max(0.01, Math.min(viewW / baseW, viewH / baseH));
  const offsetX = Math.floor((viewW - baseW * scale) * 0.5);
  const offsetY = Math.floor((viewH - baseH * scale) * 0.5);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, viewW, viewH);
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

  if(assets.sky){
    ctx.drawImage(assets.sky, 0, 0, baseW, baseH);
  } else {
    ctx.fillStyle = '#1a2733';
    ctx.fillRect(0, 0, baseW, baseH);
  }
  if(assets.background){
    ctx.globalAlpha = 0.85;
    ctx.drawImage(assets.background, 0, 20, baseW, baseH - 40);
    ctx.globalAlpha = 1;
  }
  const groundY = baseH - 28;
  if(assets.ground){
    ctx.drawImage(assets.ground, 0, groundY, baseW, 28);
  } else {
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(0, groundY, baseW, 28);
  }

  const boardDrawW = Math.round(DOPE_SKATE_SPRITES.board.frameW * 0.7);
  const boardDrawH = Math.round(DOPE_SKATE_SPRITES.board.frameH * 0.7);
  const wheelRadius = 6;
  const footY = groundY + 2;
  const boardX = Math.round(baseW / 2 - boardDrawW / 2);
  const boardY = Math.round(footY - 10);
  const wheelInset = boardDrawW * 0.22;
  const wheelOffsetY = boardY + boardDrawH + wheelRadius - 1;
  const boardId = effectiveLoadout && effectiveLoadout.board ? effectiveLoadout.board : 'classic';
  const wheelsId = effectiveLoadout && effectiveLoadout.wheels ? effectiveLoadout.wheels : 'black';
  const boardOverlay = boardId === 'chrome' ? 'rgba(182, 197, 218, 0.4)' : '';
  const wheelPalette = wheelsId === 'blue'
    ? { tire: '#102033', inner: '#2f8cff', core: '#dbe5ff', spoke: '#89b8ff' }
    : { tire: '#15171b', inner: '#4f555f', core: '#d0d8e5', spoke: '#a8b0bd' };

  const drawSheetFrame = (sheet, frame, x, y, w, h)=>{
    if(!sheet || !sheet.img) return false;
    const f = frame % (sheet.frames || 1);
    const sx = f * sheet.frameW;
    ctx.drawImage(sheet.img, sx, 0, sheet.frameW, sheet.frameH, x, y, w, h);
    return true;
  };

  const previewSprites = (dopeSkate.previewSprites && dopeSkate.previewSpriteKey === previewKey) ? dopeSkate.previewSprites : null;
  if(!drawSheetFrame(previewSprites && previewSprites.board, 0, boardX, boardY, boardDrawW, boardDrawH)){
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(boardX, boardY, boardDrawW, boardDrawH);
  }
  if(boardOverlay){
    ctx.fillStyle = boardOverlay;
    ctx.fillRect(boardX, boardY, boardDrawW, boardDrawH);
  }
  const wheelPositions = [
    boardX + wheelInset,
    boardX + boardDrawW - wheelInset,
  ];
  wheelPositions.forEach(wx => {
    ctx.save();
    ctx.translate(Math.round(wx), wheelOffsetY);
    dopeSkateDrawWheel(ctx, wheelRadius, 0, wheelPalette);
    ctx.restore();
  });

  const skaterFrameW = DOPE_SKATE_SPRITES.skater.frameW;
  const skaterFrameH = DOPE_SKATE_SPRITES.skater.frameH;
  const skaterX = Math.round(baseW / 2 - skaterFrameW / 2);
  const skaterY = Math.round(footY - skaterFrameH + 6);
  const skaterSheet = previewSprites && (previewSprites.skater || null);
  if(assets.skaterBody){
    ctx.drawImage(assets.skaterBody, skaterX, skaterY, skaterFrameW, skaterFrameH);
  } else if(!drawSheetFrame(skaterSheet, 0, skaterX, skaterY, skaterFrameW, skaterFrameH)){
    ctx.fillStyle = '#3c4a5a';
    ctx.fillRect(skaterX + 18, skaterY + 30, 28, 52);
  }
  if(assets.hat){
    ctx.drawImage(assets.hat, skaterX + 18, skaterY + 2, 28, 16);
  }
  if(dopeSkate.els.equippedList && dopeSkate.data){
    const shownLoadout = { ...dopeSkate.data.equipped, ...(effectiveLoadout || {}) };
    const order = ['ground', 'background', 'sky', 'skater', 'hat', 'board', 'wheels'];
    dopeSkate.els.equippedList.textContent = order.map(cat => {
      const id = shownLoadout[cat];
      const item = (DOPE_SKATE_SHOP[cat] || []).find(entry => entry.id === id);
      const label = cat.charAt(0).toUpperCase() + cat.slice(1);
      return `${label}: ${item ? item.name : (id || '-')}`;
    }).join(' • ');
  }
}

function dopeSkateUnlockAudio(){
  if(dopeSkate.audio.unlocked) return;
  try{
    if(!dopeSkate.audio.ctx){
      dopeSkate.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    dopeSkate.audio.ctx.resume();
    dopeSkate.audio.unlocked = true;
  } catch {}
}

function dopeSkatePlaySound(name){
  if(!dopeSkateIsSfxEnabled()) return;
  if(!dopeSkate.audio.unlocked || !dopeSkate.audio.ctx) return;
  const ctx = dopeSkate.audio.ctx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const vol = dopeSkateGetVolume();
  gain.gain.value = 0.0001;
  osc.type = 'square';
  const tones = {
    jump: 440,
    land: 220,
    trick: 520,
    grind: 180,
    collect: 660,
    crash: 120,
  };
  osc.frequency.value = tones[name] || 300;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.exponentialRampToValueAtTime(vol * 0.25, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
  osc.start(now);
  osc.stop(now + 0.16);
}

function dopeSkateGetVolume(){
  if(typeof mp === 'object' && mp && typeof mp.vol === 'number'){
    return clamp(mp.vol, 0, 1);
  }
  const volEl = document.getElementById('mpVol');
  const val = volEl ? parseFloat(volEl.value) : 0.6;
  return Number.isFinite(val) ? Math.max(0, Math.min(1, val)) : 0.6;
}

function loadClothesCache(){
  try{
    const raw = localStorage.getItem(CLOTHES_CACHE_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    if(!parsed || !Array.isArray(parsed.items)) return null;
    if(!parsed.ts || (Date.now() - parsed.ts) > CLOTHES_CACHE_TTL) return null;
    return parsed.items;
  } catch {
    return null;
  }
}

function saveClothesCache(items){
  try{
    localStorage.setItem(CLOTHES_CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
  } catch {}
}

function decodeInstagramUrl(url){
  if(!url) return '';
  return url
    .replace(/\\u0026/g, '&')
    .replace(/\\u003d/g, '=')
    .replace(/\\\//g, '/');
}

function parseInstagramHtml(html){
  if(!html) return [];
  const items = [];
  const re = /"shortcode":"(.*?)".*?"display_url":"(.*?)"/g;
  let match;
  while((match = re.exec(html)) && items.length < 12){
    const shortcode = match[1];
    const display = decodeInstagramUrl(match[2]);
    if(!shortcode || !display) continue;
    const snippet = html.slice(match.index, match.index + 1600);
    const likesMatch = snippet.match(/"edge_media_preview_like":\{"count":(\d+)/);
    const likes = likesMatch ? Number(likesMatch[1]) : null;
    items.push({
      img: display,
      url: `https://www.instagram.com/p/${shortcode}/`,
      likes: Number.isFinite(likes) ? likes : null,
    });
  }
  return items;
}

function parseJsonFromJinaText(raw){
  if(!raw) return null;
  const candidates = [];
  const markdownIdx = raw.indexOf('Markdown Content:');
  if(markdownIdx !== -1){
    candidates.push(raw.slice(markdownIdx + 'Markdown Content:'.length).trim());
  }
  const dataIdx = raw.indexOf('{"data"');
  if(dataIdx !== -1){
    candidates.push(raw.slice(dataIdx).trim());
  }
  const jsonIdx = raw.indexOf('{');
  if(jsonIdx !== -1){
    candidates.push(raw.slice(jsonIdx).trim());
  }
  for(const chunk of candidates){
    if(!chunk) continue;
    try{
      return JSON.parse(chunk);
    } catch {
      const end = chunk.lastIndexOf('}');
      if(end > 0){
        try{
          return JSON.parse(chunk.slice(0, end + 1));
        } catch {}
      }
    }
  }
  return null;
}

function parseInstagramGraphqlResponse(payload){
  const connection = payload && payload.data && payload.data.xdt_api__v1__feed__user_timeline_graphql_connection;
  const edges = connection && Array.isArray(connection.edges) ? connection.edges : [];
  const items = [];
  for(const edge of edges){
    const node = edge && edge.node ? edge.node : null;
    if(!node) continue;
    const code = node.code;
    const postUrl = code ? `https://www.instagram.com/p/${code}/` : '';
    const candidates = node.image_versions2 && Array.isArray(node.image_versions2.candidates)
      ? node.image_versions2.candidates
      : [];
    const best = candidates.slice().sort((a, b) => (Number(b && b.width) || 0) - (Number(a && a.width) || 0))[0] || null;
    const imageUrl = (best && best.url) || '';
    if(!postUrl && !imageUrl) continue;
    const likes = Number(node.like_count);
    items.push({
      url: postUrl || CLOTHES_PROFILE_URL,
      img: imageUrl || './assets/icons/Clothes.png',
      likes: Number.isFinite(likes) ? likes : null,
    });
    if(items.length >= 12) break;
  }
  return items;
}

function isClothesFallbackCache(items){
  if(!Array.isArray(items) || !items.length) return true;
  return items.every(item => {
    const img = String(item && item.img ? item.img : '');
    return !img || img.includes('/assets/icons/Clothes.png') || /(^|\/)Clothes\.png($|\?)/i.test(img);
  });
}

function fetchClothesFromInstagram(){
  const variables = encodeURIComponent(JSON.stringify({
    username: CLOTHES_PROFILE_USERNAME,
    first: 12,
    data: {}
  }));
  const url = `https://r.jina.ai/http://www.instagram.com/graphql/query/?query_id=${CLOTHES_PROFILE_QUERY_ID}&variables=${variables}`;
  return fetch(url, { cache: 'no-store' })
    .then(res => res.ok ? res.text() : Promise.reject(new Error('bad')))
    .then(raw => {
      const payload = parseJsonFromJinaText(raw);
      const items = parseInstagramGraphqlResponse(payload);
      if(items.length) return items;
      return parseInstagramHtml(raw);
    })
    .catch(() => []);
}

function getSortedClothesItems(items){
  const source = Array.isArray(items) ? items : [];
  if(state.clothes.sort !== 'popular') return source.slice();
  return source.slice().sort((a, b) => {
    const likesA = Number.isFinite(Number(a && a.likes)) ? Number(a.likes) : -1;
    const likesB = Number.isFinite(Number(b && b.likes)) ? Number(b.likes) : -1;
    if(likesA !== likesB) return likesB - likesA;
    const urlA = String((a && a.url) || '');
    const urlB = String((b && b.url) || '');
    return urlA.localeCompare(urlB);
  });
}

function renderClothesItems(winEl, items){
  const grid = winEl.querySelector('#clothesGrid');
  if(!grid) return;
  const profile = CLOTHES_PROFILE_URL;
  const alt = t('clothes.thumbAlt');
  grid.innerHTML = items.map(item => {
    const href = escapeHTML(item.url || profile);
    const img = escapeHTML(item.img || './assets/icons/Clothes.png');
    const altText = escapeHTML(alt);
    return `
      <a class="clothes-item" href="${href}" data-clothes-url="${href}" target="_blank" rel="noopener noreferrer" aria-label="${altText}">
        <img class="clothes-thumb" src="${img}" alt="${altText}" loading="lazy" />
      </a>
    `;
  }).join('');
}

function applyClothesState(winEl){
  const win = winEl || document.getElementById('win_clothes');
  if(!win) return;
  const grid = win.querySelector('#clothesGrid');
  if(!grid) return;
  grid.classList.toggle('preview-off', !state.clothes.preview);
  renderClothesItems(win, getSortedClothesItems(state.clothes.items));
}

function updateClothesStatus(winEl, key){
  const status = winEl.querySelector('#clothesStatus');
  if(!status) return;
  if(!key){
    status.textContent = '';
    status.classList.add('hidden');
  } else {
    status.textContent = t(key);
    status.classList.remove('hidden');
  }
}

function initClothesWindow(winEl){
  const win = winEl || document.getElementById('win_clothes');
  if(!win) return;
  if(state.clothes.items && state.clothes.items.length){
    applyClothesState(win);
    updateClothesStatus(win, null);
    if(!isClothesFallbackCache(state.clothes.items)) return;
  }
  const cached = loadClothesCache();
  if(cached && cached.length){
    state.clothes.items = cached.slice();
    applyClothesState(win);
    updateClothesStatus(win, null);
    if(!isClothesFallbackCache(cached)) return;
  }
  updateClothesStatus(win, 'clothes.loading');
  fetchClothesFromInstagram().then(items => {
    if(items && items.length) saveClothesCache(items);
    const fallback = (items && items.length) ? items : CLOTHES_FALLBACK;
    if(fallback && fallback.length){
      state.clothes.items = fallback.slice();
      applyClothesState(win);
      updateClothesStatus(win, null);
    } else {
      state.clothes.items = [];
      renderClothesItems(win, []);
      updateClothesStatus(win, 'clothes.unavailable');
    }
  });
}

      function initSettingsTabs(winEl){
  const win = winEl || document.getElementById('win_settings');
  if(!win) return;
  const tabs = Array.from(win.querySelectorAll('.settings-tab'));
  const panels = Array.from(win.querySelectorAll('.settings-panel'));
  if(!tabs.length || !panels.length) return;
  const panelMap = new Map(panels.map(p => [p.dataset.tab, p]));
  let fitRunToken = 0;

  function ensureSettingsNoHorizontalOverflow(tabId, token, pass = 0){
    if(state.isMobile) return;
    if(token !== fitRunToken) return;
    const content = win.querySelector('.content');
    if(!content) return;
    const overflowX = Math.max(0, Math.ceil(content.scrollWidth - content.clientWidth));
    if(overflowX <= 1 || pass >= 3) return;
    const baseMinW = parseInt(content.dataset.fitMinW || '0', 10) || 0;
    const nextMinW = baseMinW + overflowX + 12;
    content.dataset.fitMinW = String(nextMinW);
    smartFitWindow(win, 'tabChange').then(()=>{
      ensureSettingsNoHorizontalOverflow(tabId, token, pass + 1);
    });
  }

  const activate = (tabId, opts = {})=>{
    if(!panelMap.has(tabId)) return;
    const previousTab = state.settings.tab;
    const token = ++fitRunToken;
    state.settings.tab = tabId;
    tabs.forEach(tab => {
      const active = tab.dataset.tab === tabId;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.classList.toggle('active', panel.dataset.tab === tabId);
    });
    updateWallpaperButtons(win);
    updateAnimationButtons(win);
    updateAppOpenAnimButtons(win);
    updateScanlinesButtons(win);
    updateRetroGlowButtons(win);
    updateDarkModeButtons(win);
    updateBlissOSDarkButtons(win);
    updateBlissOSAquaButtons(win);
    updateBlissosAccentButtons(win);
    updateClockButtons(win);
    updateOldCrtButtons(win);
    updateSoundUI(win);
    const content = win.querySelector('.content');
      if(content){
        content.dataset.fitKey = `settings:${tabId}`;
        const isBlissOsDesktop = !state.isMobile && state.settings.theme === 'blissos';
        if(tabId === 'appearance'){
          content.dataset.fitMinW = isBlissOsDesktop ? '620' : '560';
        } else if(isBlissOsDesktop){
          content.dataset.fitMinW = '600';
        } else {
          delete content.dataset.fitMinW;
        }
      }
    smartFitWindow(win, 'tabChange').then(()=>{
      ensureSettingsNoHorizontalOverflow(tabId, token);
    });
    if(!opts.silent && previousTab !== tabId){
      playSfx('tabChange');
    }
  };

  const current = (state.settings.tab && panelMap.has(state.settings.tab))
    ? state.settings.tab
    : tabs[0].dataset.tab;
  activate(current, { silent: true });

  const bindWallpaperSlider = ()=>{
    const sliders = Array.from(win.querySelectorAll('[data-wallpaper-slider]'));
    sliders.forEach(slider => {
      if(slider.dataset.wallpaperNavBound === '1') return;
      slider.dataset.wallpaperNavBound = '1';
      const strip = slider.querySelector('[data-wallpaper-strip]');
      if(!strip) return;
      const slideBy = (dir)=>{
        const firstCard = strip.querySelector('.wallpaper-card');
        let distance = Math.max(120, Math.floor(strip.clientWidth * 0.75));
        if(firstCard){
          const stripStyles = window.getComputedStyle(strip);
          const gapRaw = parseFloat(stripStyles.columnGap || stripStyles.gap || '0');
          const gap = Number.isFinite(gapRaw) ? gapRaw : 0;
          const cardW = Math.max(0, Math.round(firstCard.getBoundingClientRect().width + gap));
          if(cardW > 0) distance = cardW * 2;
        }
        const max = Math.max(0, strip.scrollWidth - strip.clientWidth);
        const start = strip.scrollLeft;
        const target = clamp(start + ((dir < 0 ? -1 : 1) * distance), 0, max);
        if(Math.abs(target - start) < 1) return;
        const animate = state.animations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(!animate){
          strip.scrollLeft = target;
          return;
        }
        const t0 = performance.now();
        const duration = 220;
        const step = (now)=>{
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          strip.scrollLeft = Math.round(start + (target - start) * eased);
          if(p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      slider.querySelectorAll('[data-wallpaper-nav]').forEach(btn => {
        const getDir = ()=> Number(btn.dataset.wallpaperNav || '1');
        btn.addEventListener('click', (e)=>{
          e.preventDefault();
          e.stopPropagation();
          slideBy(getDir());
        });
        btn.addEventListener('pointerup', (e)=>{
          if(e.pointerType !== 'touch') return;
          e.preventDefault();
          e.stopPropagation();
          suppressNextSyntheticClick();
          slideBy(getDir());
        });
      });
    });
  };
  bindWallpaperSlider();

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', ()=>{
      activate(tab.dataset.tab);
    });
    tab.addEventListener('pointerup', (e)=>{
      if(e.pointerType === 'touch'){
        e.preventDefault();
        e.stopPropagation();
        suppressNextSyntheticClick();
        activate(tab.dataset.tab);
      }
    });
    tab.addEventListener('keydown', (e)=>{
      const key = e.key;
      if(key === 'Enter' || key === ' '){
        e.preventDefault();
        activate(tab.dataset.tab);
        return;
      }
      if(key === 'ArrowRight' || key === 'ArrowLeft' || key === 'Home' || key === 'End'){
        e.preventDefault();
        let nextIdx = idx;
        if(key === 'ArrowRight') nextIdx = (idx + 1) % tabs.length;
        if(key === 'ArrowLeft') nextIdx = (idx - 1 + tabs.length) % tabs.length;
        if(key === 'Home') nextIdx = 0;
        if(key === 'End') nextIdx = tabs.length - 1;
        tabs[nextIdx].focus();
      }
    });
  });

  // Event listeners for BlissOS accent color buttons
  $$('[data-set-blissos-accent]', win).forEach(btn => {
    btn.addEventListener('click', ()=>{
      const accent = btn.dataset.setBlissosAccent;
      setBlissosAccent(accent);
      // Update pressed state for accent buttons
      $$('[data-set-blissos-accent]', win).forEach(ab => {
        ab.classList.toggle('pressed', ab.dataset.setBlissosAccent === state.settings.blissosAccent);
      });
    });
  });
  // Initial pressed state for accent buttons
  $$('[data-set-blissos-accent]', win).forEach(ab => {
    ab.classList.toggle('pressed', ab.dataset.setBlissosAccent === state.settings.blissosAccent);
  });
}

function openSettingsAndTab(tabId, scrollId){
  state.settings.tab = tabId || 'general';
  openApp('settings');
  setTimeout(()=>{
    const winEl = document.getElementById('win_settings');
    if(winEl) initSettingsTabs(winEl);
    if(winEl && scrollId){
      const target = winEl.querySelector(`#${scrollId}`);
      if(target && target.scrollIntoView){
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  }, 0);
}

function selectPoetryItem(id){
  state.poetry.selectedId = id;
  const win = document.getElementById('win_poetry');
  if(!win) return;
  win.querySelectorAll('[data-poem-id]').forEach(item => {
    item.classList.toggle('selected', item.dataset.poemId === id);
  });
}

function arrangeIcons(parentId = null, containerEl = null){
  if(parentId){
    const folder = getFsItem(parentId);
    if(!folder || folder.type !== 'folder') return;
    const targetContainer = resolveFolderContainer(parentId, containerEl);
    const iconPosCache = loadIconPositions();
    let iconPosDirty = false;

    const orderedIds = APPS.filter(app => app.showOnDesktop !== false).map(app => app.id)
      .concat(VIRTUAL_ICONS.map(v => v.id));
    const orderIndex = new Map(orderedIds.map((id, idx) => [id, idx]));
    const children = getRenderableFsChildren(parentId).sort((a, b) => {
      const ia = orderIndex.has(a.id) ? orderIndex.get(a.id) : 1e6;
      const ib = orderIndex.has(b.id) ? orderIndex.get(b.id) : 1e6;
      if(ia !== ib) return ia - ib;
      return getFsItemLabel(a).localeCompare(getFsItemLabel(b));
    });
    const metrics = getFolderGridMetrics(targetContainer, children);
    const occupied = new Map();

    children.forEach((item, idx) => {
      const base = legacyDefaultIconPos(idx);
      const placed = placeOnFreeCell(base.x, base.y, occupied, metrics);
      if(isAppLikeItem(item) && iconPosCache[item.id]){
        delete iconPosCache[item.id];
        iconPosDirty = true;
      }
      upsertFsItem({ id: item.id, parentId, x: placed.x, y: placed.y }, { save: false, syncIconPos: true, iconPosCache });
      if(isAppLikeItem(item)) iconPosDirty = true;
    });

    if(iconPosDirty) saveIconPositions(iconPosCache);
    saveDesktopFs();
    renderIcons();
    refreshOpenFolderWindows();
    return;
  }
  const metrics = getGridMetrics();
  const layout = getDefaultIconLayout();
  const iconPosCache = loadIconPositions();
  const occupied = new Map();
  const placedIds = new Set();

  const placeItem = (id, pos)=>{
    const placed = placeOnFreeCell(pos.x, pos.y, occupied, metrics);
    upsertFsItem({ id, parentId: null, x: placed.x, y: placed.y }, { save: false, syncIconPos: true, iconPosCache });
    placedIds.add(id);
  };

  Object.entries(layout).forEach(([id, pos])=>{
    const item = getFsItem(id) || ensureFsItemForApp(id, { save: false });
    if(!item) return;
    if(state.trash.has(id)) return;
    if((state.folders.games || []).includes(id)) return;
    if(item.parentId) return;
    placeItem(id, pos);
  });

  const rootItems = Object.values(state.fs.items || {}).filter(it => it.parentId == null && !state.trash.has(it.id));
  rootItems.forEach(it => {
    if(placedIds.has(it.id)) return;
    if((state.folders.games || []).includes(it.id)) return;
    const base = Number.isFinite(it.x) && Number.isFinite(it.y) ? { x: it.x, y: it.y } : { x: 0, y: 0 };
    placeItem(it.id, base);
  });

  saveIconPositions(iconPosCache);
  saveDesktopFs();
  renderIcons();
}

function resetIconPositions(){
  try{ localStorage.removeItem(ICON_POS_KEY); } catch {}
  arrangeIcons();
}

function loadAnimations(){
  try{
    const raw = localStorage.getItem(ANIMATIONS_KEY);
    if(raw === null) return true;
    return raw === '1';
  } catch {
    return true;
  }
}

function saveAnimations(){
  try{
    localStorage.setItem(ANIMATIONS_KEY, state.animations ? '1' : '0');
  } catch {}
}

function loadAppOpenAnim(){
  try{
    const raw = localStorage.getItem(APP_OPEN_ANIM_KEY);
    if(raw === null) return true;
    return raw === '1';
  } catch {
    return true;
  }
}

function saveAppOpenAnim(){
  try{
    localStorage.setItem(APP_OPEN_ANIM_KEY, state.settings.appOpenAnim ? '1' : '0');
  } catch {}
}

function updateAnimationButtons(root=document){
  $$('[data-set-animations]', root).forEach(btn => {
    const on = btn.dataset.setAnimations === 'on';
    btn.classList.toggle('pressed', on === state.animations);
  });
}

function updateAppOpenAnimButtons(root=document){
  $$('[data-set-appopenanim]', root).forEach(btn => {
    const on = btn.dataset.setAppopenanim === 'on';
    btn.classList.toggle('pressed', on === state.settings.appOpenAnim);
  });
}

function setAnimations(enabled){
  state.animations = !!enabled;
  saveAnimations();
  updateAnimationButtons();
}

function setAppOpenAnim(enabled){
  state.settings.appOpenAnim = !!enabled;
  saveAppOpenAnim();
  updateAppOpenAnimButtons();
}

function updateScanlinesButtons(root=document){
  $$('[data-set-scanlines]', root).forEach(btn => {
    const on = btn.dataset.setScanlines === 'on';
    btn.classList.toggle('pressed', on === state.settings.scanlines);
  });
}

function setScanlines(enabled){
  state.settings.scanlines = !!enabled;
  applyScanlines();
  updateScanlinesButtons();
  syncOsProfile();
}

function updateRetroGlowButtons(root=document){
  $$('[data-set-retro]', root).forEach(btn => {
    const on = btn.dataset.setRetro === 'on';
    btn.classList.toggle('pressed', on === state.settings.retroGlow);
  });
}

function setRetroGlow(enabled){
  state.settings.retroGlow = !!enabled;
  applyRetroGlow();
  updateRetroGlowButtons();
  syncOsProfile();
}

function updateClockButtons(root=document){
  $$('[data-set-clock]', root).forEach(btn => {
    const is24 = btn.dataset.setClock === '24';
    btn.classList.toggle('pressed', is24 === state.settings.clock24);
  });
}

function setClockFormat(use24){
  state.settings.clock24 = !!use24;
  saveClockFormat();
  updateClockButtons();
  tickClock();
  syncOsProfile();
}

function updateOldCrtButtons(root=document){
  $$('[data-set-oldcrt]', root).forEach(btn => {
    const on = btn.dataset.setOldcrt === 'on';
    btn.classList.toggle('pressed', on === state.settings.oldCrt);
  });
}

function setOldCrt(enabled){
  state.settings.oldCrt = !!enabled;
  applyOldCrt();
  updateOldCrtButtons();
  syncOsProfile();
}

function updateDarkModeButtons(root=document){
  $$('[data-set-darkmode]', root).forEach(btn => {
    const on = btn.dataset.setDarkmode === 'on';
    btn.classList.toggle('pressed', on === state.settings.darkMode);
  });
}

function updateBlissOSDarkButtons(root=document){
  $$('[data-set-blissos-darkmode]', root).forEach(btn => {
    const on = btn.dataset.setBlissosDarkmode === 'on';
    btn.classList.toggle('pressed', on === state.settings.blissosDarkMode);
  });
}

function updateBlissOSAquaButtons(root=document){
  $$('[data-set-blissos-aqua]', root).forEach(btn => {
    const on = btn.dataset.setBlissosAqua === 'on';
    btn.classList.toggle('pressed', on === state.settings.blissosAqua);
  });
}

function updateBlissosAccentButtons(root=document){
  $$('[data-set-blissos-accent]', root).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setBlissosAccent === state.settings.blissosAccent);
    // Remove 'pressed' class which might have been used by old button styling
    btn.classList.remove('pressed');
  });
}

function setDarkMode(enabled, fromPreset=false){
  state.settings.darkMode = !!enabled;
  applyDarkMode();
  updateDarkModeButtons();
  if(!fromPreset && !themeApplying && state.settings.theme !== 'blissos') setThemePresetCustom();
  syncOsProfile();
}

function setBlissOSDarkMode(enabled){
  if(state.settings.theme !== 'blissos') return;
  state.settings.blissosDarkMode = !!enabled;
  applyDarkMode();
  applyBlissosAccent(state.settings.blissosAccent);
  updateBlissOSDarkButtons();
  syncOsProfile();
}

function applyBlissOSAqua(){
  const isBlissOS = state.settings.theme === 'blissos';
  document.body.dataset.blissosStyle = (isBlissOS && state.settings.blissosAqua) ? 'aqua' : 'classic';
  updateBlissOSAquaButtons();
}

function setBlissOSAqua(enabled){
  if(state.settings.theme !== 'blissos') return;
  const turningOn = !!enabled;
  state.settings.blissosAqua = turningOn;
  applyBlissOSAqua();
  if(turningOn && state.wallpaper !== 'aqua'){
    applyWallpaper('aqua');
    return;
  }
  syncOsProfile();
}

function loadScanlines(){
  try{
    const raw = localStorage.getItem(SCANLINES_KEY);
    if(raw === null) return false;
    return raw === '1';
  } catch {
    return false;
  }
}

function loadClockFormat(){
  try{
    const raw = localStorage.getItem(CLOCK_KEY);
    if(raw === null) return true;
    return raw === '1';
  } catch {
    return true;
  }
}

function saveClockFormat(){
  try{
    localStorage.setItem(CLOCK_KEY, state.settings.clock24 ? '1' : '0');
  } catch {}
}

function loadOldCrt(){
  try{
    const raw = localStorage.getItem(OLDCRT_KEY);
    if(raw === null) return false;
    return raw === '1';
  } catch {
    return false;
  }
}

function saveOldCrt(){
  try{
    localStorage.setItem(OLDCRT_KEY, state.settings.oldCrt ? '1' : '0');
  } catch {}
}

function areSystemSoundsEnabled(){
  return state.settings.systemSoundsEnabled !== false;
}

function loadSystemSoundsEnabled(){
  try{
    const raw = localStorage.getItem(SYSTEM_SOUNDS_ENABLED_KEY);
    if(raw === null) return true;
    return raw === '1';
  } catch {
    return true;
  }
}

function saveSystemSoundsEnabled(){
  try{
    localStorage.setItem(SYSTEM_SOUNDS_ENABLED_KEY, areSystemSoundsEnabled() ? '1' : '0');
  } catch {}
}

function loadMasterVolume(){
  try{
    const raw = localStorage.getItem(MASTER_VOL_KEY);
    if(raw === null) return 0.8;
    const val = parseFloat(raw);
    return Number.isFinite(val) ? clamp(val, 0, 1) : 0.8;
  } catch {
    return 0.8;
  }
}

function saveMasterVolume(){
  try{
    localStorage.setItem(MASTER_VOL_KEY, String(state.settings.masterVolume));
  } catch {}
}

function loadSystemVolume(){
  try{
    const raw = localStorage.getItem(SYSTEM_VOL_KEY);
    if(raw === null) return 0.8;
    const val = parseFloat(raw);
    return Number.isFinite(val) ? clamp(val, 0, 1) : 0.8;
  } catch {
    return 0.8;
  }
}

function saveSystemVolume(){
  try{
    localStorage.setItem(SYSTEM_VOL_KEY, String(state.settings.systemVolume));
  } catch {}
}

function applySoundVolumes(){
  const master = state.settings.masterVolume ?? 0.8;
  const system = state.settings.systemVolume ?? 0.8;
  const enabled = areSystemSoundsEnabled();
  const vol = enabled ? clamp(master * system, 0, 1) : 0;
  Object.values(SFX).forEach(entry => {
    if(entry.audio) entry.audio.volume = vol;
  });
}

function getMusicVolume(){
  const vol = (typeof mp === 'object' && mp && typeof mp.vol === 'number') ? mp.vol : 0.1;
  return clamp(vol, 0, 1);
}

function updateSystemSoundsToggle(root=document){
  const on = areSystemSoundsEnabled();
  const label = on ? t('settings.sound.toggleOn') : t('settings.sound.toggleOff');
  $$('[data-toggle-system-sounds]', root).forEach(btn => {
    btn.textContent = label;
    btn.dataset.enabled = on ? '1' : '0';
    btn.classList.toggle('pressed', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function updateSoundUI(root=document){
  const masterSlider = root.querySelector('[data-sound-slider="master"]');
  const systemSlider = root.querySelector('[data-sound-slider="system"]');
  const musicSlider = root.querySelector('[data-sound-slider="music"]');
  const masterLabel = root.querySelector('[data-sound-value="master"]');
  const systemLabel = root.querySelector('[data-sound-value="system"]');
  const musicLabel = root.querySelector('[data-sound-value="music"]');
  const masterValue = Math.round((state.settings.masterVolume ?? 0.8) * 100);
  const systemValue = Math.round((state.settings.systemVolume ?? 0.8) * 100);
  const musicValue = Math.round(getMusicVolume() * 100);

  if(masterSlider) masterSlider.value = String(masterValue);
  if(systemSlider) systemSlider.value = String(systemValue);
  if(musicSlider) musicSlider.value = String(musicValue);
  if(masterLabel) masterLabel.textContent = `${masterValue}%`;
  if(systemLabel) systemLabel.textContent = `${systemValue}%`;
  if(musicLabel) musicLabel.textContent = `${musicValue}%`;

  const mpVolSlider = document.getElementById('mpVol');
  if(mpVolSlider) mpVolSlider.value = String(getMusicVolume());

  updateSystemSoundsToggle(root);
  if(root !== document){
    updateSystemSoundsToggle(document);
  }
}

function setMasterVolume(val){
  state.settings.masterVolume = clamp(val, 0, 1);
  saveMasterVolume();
  applySoundVolumes();
  updateSoundUI();
  syncOsProfile();
}

function setSystemVolume(val){
  state.settings.systemVolume = clamp(val, 0, 1);
  saveSystemVolume();
  applySoundVolumes();
  updateSoundUI();
  syncOsProfile();
}

function setMusicVolume(val){
  mp.vol = clamp(val, 0, 1);
  const els = mpEls();
  if(els){
    if(els.vol) els.vol.value = String(mp.vol);
    if(els.audio) els.audio.volume = mp.vol;
  }
  debounceVolumeSave(()=> mpSaveState());
  updateSoundUI();
}

function setSystemSoundsEnabled(enabled){
  state.settings.systemSoundsEnabled = !!enabled;
  saveSystemSoundsEnabled();
  applySoundVolumes();
  updateSoundUI();
  syncOsProfile();
}

function loadDarkMode(){
  try{
    const raw = localStorage.getItem(DARKMODE_KEY);
    if(raw === null) return false;
    return raw === '1';
  } catch {
    return false;
  }
}

function loadTitlebarTheme(){
  try{
    const raw = localStorage.getItem(TITLEBAR_KEY);
    if(raw === 'transparent') return 'blank';
    return raw || 'defaultBlue';
  } catch {
    return 'defaultBlue';
  }
}

function loadThemePreset(){
  try{
    const raw = localStorage.getItem(THEME_PRESET_KEY);
    return raw || 'default';
  } catch {
    return 'default';
  }
}

function saveScanlines(){
  try{
    localStorage.setItem(SCANLINES_KEY, state.settings.scanlines ? '1' : '0');
  } catch {}
}

function saveDarkMode(){
  try{
    localStorage.setItem(DARKMODE_KEY, state.settings.darkMode ? '1' : '0');
  } catch {}
}

function saveTitlebarTheme(){
  try{
    localStorage.setItem(TITLEBAR_KEY, state.theme.titlebar);
  } catch {}
}

function saveThemePreset(){
  try{
    localStorage.setItem(THEME_PRESET_KEY, state.theme.preset);
  } catch {}
}

function loadTrash(){
  try{
    const raw = localStorage.getItem(TRASH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTrash(){
  try{
    localStorage.setItem(TRASH_KEY, JSON.stringify(Array.from(state.trash)));
  } catch {}
}

function loadDockItems(){
  try{
    const raw = localStorage.getItem(DOCK_KEY);
    if(!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveDockItems(){
  try{
    localStorage.setItem(DOCK_KEY, JSON.stringify(state.dockItems));
  } catch {}
}

function loadIconLabels(){
  try{
    const raw = localStorage.getItem(ICON_LABELS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveIconLabels(){
  try{
    localStorage.setItem(ICON_LABELS_KEY, JSON.stringify(state.iconLabels));
  } catch {}
}

function loadFolders(){
  try{
    const raw = localStorage.getItem(FOLDER_KEY);
    if(raw) return JSON.parse(raw);
  } catch {}
  return { games: ['snake', 'dope-skate'] };
}

function saveFolders(){
  try{
    localStorage.setItem(FOLDER_KEY, JSON.stringify(state.folders));
  } catch {}
}

function loadWallpaper(){
  try{
    const saved = localStorage.getItem(WALLPAPER_KEY);
    return saved || WALLPAPERS[0].id;
  } catch {
    return WALLPAPERS[0].id;
  }
}

      function updateWallpaperButtons(root=document){
        $$('[data-set-wallpaper]', root).forEach(btn => {
          const active = btn.dataset.setWallpaper === state.wallpaper;
          btn.classList.toggle('pressed', active);
          btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
      }

      function updateOsThemeButtons(root=document){
        $$('[data-set-os-theme]', root).forEach(btn => {
          btn.classList.toggle('pressed', btn.dataset.setOsTheme === state.settings.theme);
        });
      }

let themeApplying = false;

function loadGamesLayout(){
  try{
    const raw = localStorage.getItem(GAMES_VIEW_KEY);
    return raw || 'grid';
  } catch {
    return 'grid';
  }
}

function saveGamesLayout(){
  try{
    localStorage.setItem(GAMES_VIEW_KEY, state.games.layout);
  } catch {}
}

function loadGamesBigIcons(){
  try{
    const raw = localStorage.getItem(GAMES_BIG_KEY);
    return raw === '1';
  } catch {
    return false;
  }
}

function saveGamesBigIcons(){
  try{
    localStorage.setItem(GAMES_BIG_KEY, state.games.bigIcons ? '1' : '0');
  } catch {}
}

function loadOsTheme(){
  try{
    const raw = localStorage.getItem(OS_THEME_KEY);
    return raw === 'blissos' ? 'blissos' : 'bliss98';
  } catch {
    return 'bliss98';
  }
}

function getSavedOsTheme(){
  try{
    const raw = localStorage.getItem(OS_THEME_KEY);
    if(raw === 'blissos' || raw === 'bliss98') return raw;
  } catch {}
  return null;
}

function detectDefaultOSForFirstVisit(){
  const uaData = navigator.userAgentData;
  if(uaData && typeof uaData.platform === 'string'){
    const platform = uaData.platform.toLowerCase();
    if(platform.includes('windows')) return 'bliss98';
    if(platform.includes('mac')) return 'blissos';
    if(platform.includes('android')) return 'bliss98';
    if(platform.includes('ios')) return 'blissos';
  }
  const ua = (navigator.userAgent || '').toLowerCase();
  const touchPoints = navigator.maxTouchPoints || 0;
  if(/iphone|ipad|ipod/.test(ua)) return 'blissos';
  if(ua.includes('android')) return 'bliss98';
  if(ua.includes('windows nt')) return 'bliss98';
  if(ua.includes('macintosh')){
    if(touchPoints > 1) return 'blissos';
    return 'blissos';
  }
  return null;
}

function loadBlissosAccent(){
  try{
    const raw = localStorage.getItem(BLISSOS_ACCENT_KEY);
    if(raw && ['multicolor', 'blue', 'purple', 'pink', 'red', 'orange', 'yellow', 'green', 'graphite'].includes(raw)){
      return raw;
    }
    return 'multicolor'; // Default accent
  } catch {
    return 'multicolor';
  }
}

const BLISSOS_ACCENT_COLORS = {
  multicolor: {
    // Neutral blue base for multicolor
    '--blissos-accent': '#1B7BE5',
    '--blissos-accent-2': '#2B8BEF',
    '--blissos-accent-weak': 'rgba(27, 123, 229, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    // Dark mode specific
    '--blissos-accent-dark': '#4F9BFA',
    '--blissos-accent-2-dark': '#5FAAFF',
    '--blissos-accent-weak-dark': 'rgba(79, 155, 250, 0.15)',
    '--blissos-accent-contrast-dark': '#111111',
  },
  blue: {
    '--blissos-accent': '#1B7BE5',
    '--blissos-accent-2': '#2B8BEF',
    '--blissos-accent-weak': 'rgba(27, 123, 229, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    // Dark mode specific
    '--blissos-accent-dark': '#4F9BFA',
    '--blissos-accent-2-dark': '#5FAAFF',
    '--blissos-accent-weak-dark': 'rgba(79, 155, 250, 0.15)',
    '--blissos-accent-contrast-dark': '#111111',
  },
  purple: {
    '--blissos-accent': '#9B4AEE',
    '--blissos-accent-2': '#A958FF',
    '--blissos-accent-weak': 'rgba(155, 74, 238, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    // Dark mode specific
    '--blissos-accent-dark': '#BE80FA',
    '--blissos-accent-2-dark': '#D090FF',
    '--blissos-accent-weak-dark': 'rgba(190, 128, 250, 0.15)',
    '--blissos-accent-contrast-dark': '#111111',
  },
  pink: {
    '--blissos-accent': '#E54DE4',
    '--blissos-accent-2': '#EF5DED',
    '--blissos-accent-weak': 'rgba(229, 77, 228, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    // Dark mode specific
    '--blissos-accent-dark': '#FA80FA',
    '--blissos-accent-2-dark': '#FF90FF',
    '--blissos-accent-weak-dark': 'rgba(250, 128, 250, 0.15)',
    '--blissos-accent-contrast-dark': '#111111',
  },
  red: {
    '--blissos-accent': '#E53D3D',
    '--blissos-accent-2': '#EF4D4D',
    '--blissos-accent-weak': 'rgba(229, 61, 61, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    // Dark mode specific
    '--blissos-accent-dark': '#FA6A6A',
    '--blissos-accent-2-dark': '#FF7A7A',
    '--blissos-accent-weak-dark': 'rgba(250, 106, 106, 0.15)',
    '--blissos-accent-contrast-dark': '#111111',
  },
  orange: {
    '--blissos-accent': '#E58A3D',
    '--blissos-accent-2': '#EF9A4D',
    '--blissos-accent-weak': 'rgba(229, 138, 61, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    // Dark mode specific
    '--blissos-accent-dark': '#FAAC6A',
    '--blissos-accent-2-dark': '#FFBC7A',
    '--blissos-accent-weak-dark': 'rgba(250, 172, 106, 0.15)',
    '--blissos-accent-contrast-dark': '#111111',
  },
  yellow: {
    '--blissos-accent': '#E5D13D',
    '--blissos-accent-2': '#E5D84D',
    '--blissos-accent-weak': 'rgba(229, 209, 61, 0.15)',
    '--blissos-accent-contrast': '#111111', // Black text for yellow
    // Dark mode specific
    '--blissos-accent-dark': '#FAE26A',
    '--blissos-accent-2-dark': '#FFEA7A',
    '--blissos-accent-weak-dark': 'rgba(250, 226, 106, 0.15)',
    '--blissos-accent-contrast-dark': '#111111',
  },
  green: {
    '--blissos-accent': '#19B34A',
    '--blissos-accent-2': '#29C35A',
    '--blissos-accent-weak': 'rgba(25, 179, 74, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    // Dark mode specific
    '--blissos-accent-dark': '#3CBF6A',
    '--blissos-accent-2-dark': '#4CD07A',
    '--blissos-accent-weak-dark': 'rgba(60, 191, 106, 0.15)',
    '--blissos-accent-contrast-dark': '#ffffff',
  },
  graphite: {
    '--blissos-accent': '#8C8C8C',
    '--blissos-accent-2': '#999999',
    '--blissos-accent-weak': 'rgba(140, 140, 140, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    // Dark mode specific
    '--blissos-accent-dark': '#AFAFAF',
    '--blissos-accent-2-dark': '#BBBBBB',
    '--blissos-accent-weak-dark': 'rgba(175, 175, 175, 0.15)',
    '--blissos-accent-contrast-dark': '#111111',
  },
};

function saveOsTheme(){
  try{
    localStorage.setItem(OS_THEME_KEY, state.settings.theme);
  } catch {}
}

function getDefaultOsProfiles(){
  return {
    bliss98: {
      wallpaper: loadWallpaper(),
      themePreset: loadThemePreset(),
      titlebar: loadTitlebarTheme(),
      darkMode: loadDarkMode(),
      blissosDarkMode: false,
      blissosAqua: false,
      retroGlow: loadRetroGlow(),
      scanlines: loadScanlines(),
      clock24: loadClockFormat(),
      oldCrt: loadOldCrt(),
      masterVolume: loadMasterVolume(),
      systemVolume: loadSystemVolume(),
      systemSoundsEnabled: loadSystemSoundsEnabled(),
    },
    blissos: {
      wallpaper: 'blissos',
      themePreset: 'default',
      titlebar: 'defaultBlue',
      darkMode: false,
      blissosDarkMode: false,
      blissosAqua: false,
      retroGlow: false,
      scanlines: false,
      clock24: true,
      oldCrt: false,
      masterVolume: loadMasterVolume(),
      systemVolume: loadSystemVolume(),
      systemSoundsEnabled: loadSystemSoundsEnabled(),
    },
  };
}

function loadOsProfiles(){
  try{
    const raw = localStorage.getItem(OS_PROFILE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      const defaults = getDefaultOsProfiles();
      return {
        bliss98: { ...defaults.bliss98, ...(parsed.bliss98 || {}) },
        blissos: { ...defaults.blissos, ...(parsed.blissos || {}) },
      };
    }
  } catch {}
  return getDefaultOsProfiles();
}

function saveOsProfiles(){
  try{
    localStorage.setItem(OS_PROFILE_KEY, JSON.stringify(state.settings.osProfiles || getDefaultOsProfiles()));
  } catch {}
}

function syncOsProfile(){
  if(!state.settings.osProfiles) state.settings.osProfiles = getDefaultOsProfiles();
  const theme = state.settings.theme || 'bliss98';
  state.settings.osProfiles[theme] = {
    wallpaper: state.wallpaper,
    themePreset: state.theme.preset,
    titlebar: state.theme.titlebar,
    darkMode: state.settings.darkMode,
    blissosDarkMode: state.settings.blissosDarkMode,
    blissosAqua: state.settings.blissosAqua,
    retroGlow: state.settings.retroGlow,
    scanlines: state.settings.scanlines,
    clock24: state.settings.clock24,
    oldCrt: state.settings.oldCrt,
    masterVolume: state.settings.masterVolume,
    systemVolume: state.settings.systemVolume,
    systemSoundsEnabled: state.settings.systemSoundsEnabled,
  };
  saveOsProfiles();
}

function applyOsProfile(theme){
  if(!state.settings.osProfiles) state.settings.osProfiles = getDefaultOsProfiles();
  const profile = state.settings.osProfiles[theme] || getDefaultOsProfiles()[theme];
  state.wallpaper = profile.wallpaper || (theme === 'blissos' ? 'blissos' : 'classic');
  state.theme.preset = profile.themePreset || 'default';
  state.theme.titlebar = profile.titlebar || 'defaultBlue';
  if(theme === 'blissos' && state.theme.titlebar === 'blank'){
    state.theme.titlebar = 'defaultBlue';
  }
  state.settings.darkMode = !!profile.darkMode;
  state.settings.blissosDarkMode = !!profile.blissosDarkMode;
  state.settings.blissosAqua = !!profile.blissosAqua;
  state.settings.retroGlow = !!profile.retroGlow;
  state.settings.scanlines = !!profile.scanlines;
  state.settings.clock24 = profile.clock24 !== false;
  state.settings.oldCrt = !!profile.oldCrt;
  state.settings.masterVolume = typeof profile.masterVolume === 'number' ? profile.masterVolume : loadMasterVolume();
  state.settings.systemVolume = typeof profile.systemVolume === 'number' ? profile.systemVolume : loadSystemVolume();
  state.settings.systemSoundsEnabled = profile.systemSoundsEnabled !== false;

  if(theme === 'bliss98'){
    if(state.theme.preset !== 'custom'){
      setThemePreset(state.theme.preset, { init:true });
    } else {
      applyThemePalette();
      applyTitlebarTheme();
    }
  } else {
    applyThemePalette();
    applyTitlebarTheme();
  }
  applyWallpaper(state.wallpaper);
  applyDarkMode();
  applyRetroGlow();
  applyScanlines();
  applyOldCrt();
  applySoundVolumes();
  updateSoundUI();
  updateClockButtons();
  updateWallpaperButtons();
  updateOsThemeButtons();
}

function applyOsTheme(){
  const theme = state.settings.theme || 'bliss98';
  document.body.dataset.theme = theme;
  const blissos = theme === 'blissos';
  const menubar = $('#blissosMenubar');
  const dock = $('#blissosDock');
  const appleMenu = $('#blissosAppleMenu');
  const appMenu = $('#blissosAppMenuDrop');
  if(menubar) menubar.classList.toggle('hidden', !blissos);
  if(dock) dock.classList.toggle('hidden', !blissos);
  if(appleMenu && !blissos) appleMenu.classList.add('hidden');
  if(appMenu && !blissos) appMenu.classList.add('hidden');
  if(!blissos) closeStartMenu();
  updateOsThemeButtons();
  renderBlissOSDock();
  applySettingsIcons();
  renderIcons();
  renderStartMenu();
  refreshOpenFolderWindows();
  refreshOpenTxtWindows();
  renderTaskButtons();
  updateBlissOSActiveApp();
  updateOpenWindowTitleIcons();

  if(blissos){
    applyBlissosAccent(state.settings.blissosAccent);
  }
  applyBlissOSAqua();
}

function setOsTheme(theme){
  syncOsProfile();
  state.settings.theme = (theme === 'blissos') ? 'blissos' : 'bliss98';
  saveOsTheme();
  // Force blissos wallpaper if theme is blissos
  if (state.settings.theme === 'blissos') {
    state.wallpaper = 'blissos';
  }
  applyOsProfile(state.settings.theme);
  applyOsTheme();
  if(document.getElementById('win_settings')) renderSettingsWindow();
}

function loadRetroGlow(){
  try{
    const raw = localStorage.getItem(RETRO_KEY);
    return raw === '1';
  } catch {
    return false;
  }
}

function saveRetroGlow(){
  try{
    localStorage.setItem(RETRO_KEY, state.settings.retroGlow ? '1' : '0');
  } catch {}
}

function updateTitlebarButtons(root=document){
  $$('[data-set-titlebar]', root).forEach(btn => {
    btn.classList.toggle('pressed', btn.dataset.setTitlebar === state.theme.titlebar);
  });
}

function updateThemeButtons(root=document){
  $$('[data-set-theme]', root).forEach(btn => {
    btn.classList.toggle('pressed', btn.dataset.setTheme === state.theme.preset);
  });
  const current = root.querySelector('[data-theme-current]');
  if(current){
    const key = `theme.${state.theme.preset}`;
    current.textContent = t(key);
  }
}

function applyThemePalette(){
  const palette = state.theme.palette || (state.theme.preset === 'xp98' ? 'xp98' : 'default');
  document.body.classList.toggle('theme-xp98', palette === 'xp98');
}

function setThemePresetCustom(){
  if(state.theme.preset !== 'custom'){
    state.theme.preset = 'custom';
    saveThemePreset();
    applyThemePalette();
    updateThemeButtons();
    updateThemeThumbs();
  }
  syncOsProfile();
}

const MATRIX_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const matrixFx = {
  canvas: null,
  ctx: null,
  rafId: 0,
  running: false,
  columns: [],
  fontSize: 16,
  width: 0,
  height: 0,
  lastTime: 0,
  frameInterval: 48,
  speed: 0.6,
  bound: false,
};

function ensureMatrixCanvas(){
  if(matrixFx.canvas) return matrixFx.canvas;
  const canvas = $('#matrixCanvas');
  if(!canvas) return null;
  matrixFx.canvas = canvas;
  matrixFx.ctx = canvas.getContext('2d');
  return canvas;
}

function resizeMatrixCanvas(){
  const canvas = ensureMatrixCanvas();
  if(!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if(rect.width === 0 || rect.height === 0) return;
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.floor(rect.width * dpr));
  const height = Math.max(1, Math.floor(rect.height * dpr));
  if(canvas.width !== width) canvas.width = width;
  if(canvas.height !== height) canvas.height = height;
  matrixFx.width = width;
  matrixFx.height = height;
  matrixFx.fontSize = Math.max(12, Math.round(14 * dpr));
  const cols = Math.max(1, Math.floor(width / matrixFx.fontSize));
  matrixFx.columns = Array.from({ length: cols }, () => Math.floor(Math.random() * (height / matrixFx.fontSize)));
  if(matrixFx.ctx) matrixFx.ctx.font = `${matrixFx.fontSize}px monospace`;
}

function drawMatrixFrame(ts){
  if(!matrixFx.running || !matrixFx.ctx) return;
  if(!matrixFx.lastTime) matrixFx.lastTime = ts;
  const elapsed = ts - matrixFx.lastTime;
  if(elapsed < matrixFx.frameInterval){
    matrixFx.rafId = requestAnimationFrame(drawMatrixFrame);
    return;
  }
  matrixFx.lastTime = ts;
  const { ctx, width, height, columns, fontSize } = matrixFx;
  if(width <= 0 || height <= 0){
    matrixFx.rafId = requestAnimationFrame(drawMatrixFrame);
    return;
  }
  ctx.fillStyle = 'rgba(2,2,2,0.18)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#00ff6a';
  ctx.textBaseline = 'top';
  for(let i = 0; i < columns.length; i++){
    const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
    const x = i * fontSize;
    const y = columns[i] * fontSize;
    ctx.fillText(char, x, y);
    if(y > height && Math.random() > 0.985) columns[i] = 0;
    columns[i] += matrixFx.speed;
  }
  matrixFx.rafId = requestAnimationFrame(drawMatrixFrame);
}

function startMatrixEffect(){
  const canvas = ensureMatrixCanvas();
  if(!canvas) return;
  if(matrixFx.rafId) cancelAnimationFrame(matrixFx.rafId);
  matrixFx.rafId = 0;
  matrixFx.running = true;
  matrixFx.lastTime = 0;
  canvas.classList.remove('hidden');
  resizeMatrixCanvas();
  matrixFx.rafId = requestAnimationFrame(drawMatrixFrame);
}

function stopMatrixEffect(){
  if(matrixFx.rafId){
    cancelAnimationFrame(matrixFx.rafId);
    matrixFx.rafId = 0;
  }
  matrixFx.running = false;
  if(matrixFx.ctx && matrixFx.canvas){
    matrixFx.ctx.clearRect(0, 0, matrixFx.canvas.width, matrixFx.canvas.height);
  }
  if(matrixFx.canvas) matrixFx.canvas.classList.add('hidden');
}

function updateMatrixEffect(){
  const desktop = $('#desktop');
  const shouldRun = !!desktop && !desktop.classList.contains('hidden') && state.wallpaper === 'matrix';
  if(shouldRun){
    startMatrixEffect();
  } else {
    stopMatrixEffect();
  }
}

function initMatrixEffect(){
  if(matrixFx.bound) return;
  matrixFx.bound = true;
  const onResize = ()=>{
    if(!matrixFx.running) return;
    resizeMatrixCanvas();
  };
  window.addEventListener('resize', onResize);
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', onResize);
  }
}

function applyWallpaper(id){
  const wp = WALLPAPERS.find(w => w.id === id) || WALLPAPERS[0];
  state.wallpaper = wp.id;
  const desktop = $('#desktop');
  if(desktop){
    desktop.classList.remove('wallpaper-matrix', 'wallpaper-grid');
    if(wp.className){
      desktop.classList.add(wp.className);
      desktop.style.background = '';
      desktop.style.backgroundSize = '';
      desktop.style.backgroundRepeat = '';
      desktop.style.backgroundPosition = '';
    } else {
      desktop.style.background = wp.background;
      desktop.style.backgroundSize = wp.size || 'auto';
      desktop.style.backgroundRepeat = wp.repeat || 'repeat';
      desktop.style.backgroundPosition = wp.position || 'top left';
    }
  }
  updateMatrixEffect();
  if(state.settings.theme !== 'blissos'){
    try{ localStorage.setItem(WALLPAPER_KEY, wp.id); } catch {}
  }
  updateWallpaperButtons();
  renderCtxMenu();
  if(!themeApplying && state.settings.theme !== 'blissos') setThemePresetCustom();
  syncOsProfile();
}

function setTitlebarTheme(id, fromPreset=false){
  state.theme.titlebar = id;
  saveTitlebarTheme();
  applyTitlebarTheme();
  updateTitlebarButtons();
  if(!fromPreset && !themeApplying && state.settings.theme !== 'blissos') setThemePresetCustom();
  syncOsProfile();
}

function applyTitlebarTheme(){
  const isBlissOS = state.settings.theme === 'blissos';
  const isBlank = state.theme.titlebar === 'blank';
  const cur = (isBlissOS && isBlank)
    ? TITLEBAR_THEMES.defaultBlue
    : (TITLEBAR_THEMES[state.theme.titlebar] || TITLEBAR_THEMES.defaultBlue);
  document.body.dataset.titlebarTheme = state.theme.titlebar || 'defaultBlue';
  document.body.classList.toggle('titlebar-blank', !isBlissOS && isBlank);
  document.body.style.setProperty('--title', cur.bar1);
  document.body.style.setProperty('--title2', cur.bar2);
  document.body.style.setProperty('--titlebar-text', cur.text);
  updateRetroGlowPalette();
}

function setThemePreset(id, opts={}){
  const preset = THEME_PRESETS.find(t => t.id === id);
  if(!preset) return;
  themeApplying = true;
  state.theme.preset = id;
  state.theme.palette = (id === 'xp98') ? 'xp98' : 'default';
  saveThemePreset();
  applyThemePalette();
  setDarkMode(preset.darkMode, true);
  applyWallpaper(preset.wallpaperId);
  setTitlebarTheme(preset.titlebarColor, true);
  themeApplying = false;
  updateThemeButtons();
  updateThemeThumbs();
  if(!opts.init) renderCtxMenu();
  syncOsProfile();
}

function loadCustomTheme(){
  try{
    const raw = localStorage.getItem(THEME_CUSTOM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCustomTheme(data){
  try{
    localStorage.setItem(THEME_CUSTOM_KEY, JSON.stringify(data));
  } catch {}
}

function updateThemeThumbs(root=document){
  $$('[data-theme-thumb]', root).forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.themeThumb === state.theme.preset);
  });
  const customBtn = root.querySelector('[data-theme-custom="load"]');
  if(customBtn){
    const hasCustom = !!loadCustomTheme();
    customBtn.classList.toggle('disabled', !hasCustom);
    const label = customBtn.querySelector('[data-theme-custom-label]');
    if(label) label.textContent = hasCustom ? t('theme.custom') : t('theme.customEmpty');
  }
}

function saveCustomThemeFromState(){
  const data = {
    wallpaper: state.wallpaper,
    titlebar: state.theme.titlebar,
    darkMode: state.settings.darkMode,
    scanlines: state.settings.scanlines,
    retroGlow: state.settings.retroGlow,
    palette: state.theme.palette || 'default'
  };
  saveCustomTheme(data);
  updateThemeThumbs();
}

function applyCustomTheme(){
  const data = loadCustomTheme();
  if(!data) return;
  themeApplying = true;
  state.theme.preset = 'custom';
  state.theme.palette = data.palette || 'default';
  saveThemePreset();
  applyThemePalette();
  setDarkMode(!!data.darkMode, true);
  applyWallpaper(data.wallpaper || WALLPAPERS[0].id);
  setTitlebarTheme(data.titlebar || 'defaultBlue', true);
  state.settings.scanlines = !!data.scanlines;
  applyScanlines();
  state.settings.retroGlow = !!data.retroGlow;
  applyRetroGlow();
  themeApplying = false;
  updateThemeButtons();
  updateThemeThumbs();
  renderCtxMenu();
}

function applyMusicState(winEl){
  const win = winEl || document.getElementById('win_music');
  if(!win) return;
  const grid = win.querySelector('.music-grid');
  if(!grid) return;
  grid.classList.toggle('music-small', state.music.tileSize === 'small');
  win.classList.toggle('music-hide-icons', !state.music.showIcons);
  grid.querySelectorAll('[data-music-id]').forEach(card => {
    const id = card.dataset.musicId;
    card.classList.toggle('selected', state.music.selected.has(id));
  });
}

function applyMediaplayerState(winEl){
  const win = winEl || document.getElementById('win_mediaplayer');
  if(!win) return;
  const hasList = !!win.querySelector('#mpList');
  if(hasList){
    win.classList.toggle('mp-hide-list', !state.mediaplayer.showPlaylist);
  }
  win.classList.toggle('mp-compact', state.mediaplayer.compact);
}

function applyDievState(winEl){
  const win = winEl || document.getElementById('win_diev');
  if(!win) return;
  win.classList.toggle('diev-small', state.diev.textSize === 'small');
  win.classList.toggle('diev-large', state.diev.textSize === 'large');
  win.classList.toggle('diev-contrast', state.diev.highContrast);
}

function applyArtState(winEl){
  const win = winEl || document.getElementById('win_art');
  if(!win) return;
  win.classList.toggle('art-zoom-50', state.art.zoom === 50);
  win.classList.toggle('art-zoom-100', state.art.zoom === 100);
  win.classList.toggle('art-zoom-200', state.art.zoom === 200);
}

function getAppById(id){
  return APPS.find(a => a.id === id) || null;
}

function getVirtualIconById(id){
  return VIRTUAL_ICONS.find(v => v.id === id) || null;
}

function openAppFromDesktopIcon(appId, iconEl){
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!state.settings.appOpenAnim || reduceMotion || !iconEl){
    openApp(appId);
    return;
  }
  cancelAppOpenAnimation({ revealPending: true });
  const winEl = openApp(appId, { deferReveal: true, skipAnimOpen: true });
  if(!winEl){
    openApp(appId);
    return;
  }
  let finished = false;
  const finalize = ()=>{
    if(finished) return;
    finished = true;
    revealWindow(appId, { skipAnim: true });
    focusWindow(appId);
    renderTaskButtons();
  };
  const timeoutId = window.setTimeout(finalize, 900);
  waitForSmartFitCompletion(appId).then(targetRect => {
    if(finished) return;
    window.clearTimeout(timeoutId);
    if(!targetRect){
      finalize();
      return;
    }
    animateAppOpenFromIcon(iconEl, targetRect, finalize, appId);
  }).catch(finalize);
}

function openIconById(id, opts = {}){
  const sourceEl = opts.sourceEl || null;
  const isDesktopIcon = !!(opts.fromDesktop && sourceEl && sourceEl.closest && sourceEl.closest('#iconGrid'));
  let fsItem = getFsItem(id);
  if(!fsItem) fsItem = ensureFsItemForApp(id, { save: false }) || fsItem;
  if(id === 'snake'){
    state.games.view = 'snake';
    state.games.selectedId = 'snake';
    if(isDesktopIcon && !state.windows.has('games')){
      openAppFromDesktopIcon('games', sourceEl);
    } else {
      openApp('games');
      renderGamesWindow();
    }
    return;
  }
  if(fsItem && fsItem.type === 'folder'){
    openFolderWindow(id, { sourceEl, fromDesktop: isDesktopIcon });
    return;
  }
  if(fsItem && fsItem.type === 'txt'){
    openTxtFileWindow(id, { sourceEl, fromDesktop: isDesktopIcon });
    return;
  }
  if(isDesktopIcon && !state.windows.has(id)){
    openAppFromDesktopIcon(id, sourceEl);
    return;
  }
  openApp(id);
}

let fsIdCounter = 0;

function generateFsId(prefix){
  fsIdCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${fsIdCounter.toString(36)}`;
}

function getFsItemLabel(item){
  if(!item) return '';
  if(item.type === 'app'){
    const app = getAppById(item.appId || item.id);
    return app ? getIconLabel(app) : (item.name || item.id);
  }
  if(item.type === 'virtual'){
    const virtual = getVirtualIconById(item.appId || item.id);
    return virtual ? t(virtual.titleKey) : (item.name || item.id);
  }
  return item.name || item.id;
}

function isInFolder(id){
  if((state.folders.games || []).includes(id)) return true;
  const item = getFsItem(id);
  return !!(item && item.parentId);
}

function isDesktopVisibleItem(item){
  if(!item || item.parentId != null) return false;
  if(item.id !== 'trash' && state.trash.has(item.id)) return false;
  if((state.folders.games || []).includes(item.id)) return false;
  if(item.type === 'app'){
    const app = getAppById(item.appId || item.id);
    return !!app && app.showOnDesktop !== false;
  }
  if(item.type === 'virtual'){
    return !!getVirtualIconById(item.appId || item.id);
  }
  return true;
}

function getSiblingNames(parentId, excludeId){
  const lower = new Set();
  getFsChildren(parentId).forEach(it => {
    if(excludeId && it.id === excludeId) return;
    lower.add(String(getFsItemLabel(it)).toLowerCase());
  });
  return lower;
}

function makeUniqueName(parentId, baseName, ext){
  const suffix = ext ? `.${ext}` : '';
  const root = ext && baseName.toLowerCase().endsWith(suffix)
    ? baseName.slice(0, -suffix.length)
    : baseName;
  const taken = getSiblingNames(parentId);
  const baseFull = `${root}${suffix}`;
  if(!taken.has(baseFull.toLowerCase())) return baseFull;
  let i = 2;
  while(i < 1000){
    const candidate = `${root} (${i})${suffix}`;
    if(!taken.has(candidate.toLowerCase())) return candidate;
    i += 1;
  }
  return `${root}-${Date.now()}${suffix}`;
}

function clampIconPosToSize(x, y, width, height){
  const maxX = Math.max(0, Math.floor(width - ICON_SIZE.w - 6));
  const maxY = Math.max(0, Math.floor(height - ICON_SIZE.h - 6));
  return {
    x: clamp(Math.floor(x), 0, maxX),
    y: clamp(Math.floor(y), 0, maxY),
  };
}

function getDesktopPosFromClient(clientX, clientY){
  const area = $('#desktopArea').getBoundingClientRect();
  const localX = clientX - area.left - (ICON_SIZE.w / 2);
  const localY = clientY - area.top - (ICON_SIZE.h / 2);
  return clampIconPos(localX, localY);
}

function getFreeIconPlacement(parentId, preferred, containerEl, excludeIds){
  const normalized = normalizeFolderNavId(parentId);
  const isDesktop = normalized == null;
  const isFolderView = !!(containerEl && containerEl.dataset && containerEl.dataset.folderView === '1');
  const metrics = (!isDesktop || isFolderView)
    ? getFolderGridMetrics(containerEl, getRenderableFsChildren(normalized), 1)
    : (containerEl ? getGridMetricsForContainer(containerEl) : getGridMetrics());
  const base = preferred || { x: 0, y: 0 };
  const bounds = isDesktop
    ? (containerEl ? containerEl.getBoundingClientRect() : $('#desktopArea').getBoundingClientRect())
    : (containerEl ? containerEl.getBoundingClientRect() : FOLDER_VIEW_FALLBACK_SIZE);
  const clamped = clampIconPosToSize(base.x, base.y, bounds.width, bounds.height);
  if(isDesktop && !isFolderView && !state.gridSnap){
    return { x: clamped.x, y: clamped.y };
  }
  const occupied = buildOccupiedFromFs(normalized, excludeIds, metrics, { visibleOnly: isDesktop });
  return placeOnFreeCell(clamped.x, clamped.y, occupied, metrics);
}

function isDescendantFolder(targetId, ancestorId){
  if(!targetId || !ancestorId) return false;
  let cur = getFsItem(targetId);
  const guard = new Set();
  while(cur && cur.parentId && !guard.has(cur.id)){
    guard.add(cur.id);
    if(cur.parentId === ancestorId) return true;
    cur = getFsItem(cur.parentId);
  }
  return false;
}

function canMoveItemToFolder(itemId, folderId){
  if(!itemId) return false;
  if(state.trash.has(itemId)) return false;
  if(folderId == null) return true;
  const folder = getFsItem(folderId);
  if(!folder || folder.type !== 'folder') return false;
  if(state.trash.has(folderId)) return false;
  if(itemId === folderId) return false;
  const item = getFsItem(itemId) || ensureFsItemForApp(itemId, { save: false });
  if(!item) return false;
  let cur = folder;
  const guard = new Set();
  while(cur && cur.parentId && !guard.has(cur.id)){
    guard.add(cur.id);
    if(state.trash.has(cur.parentId)) return false;
    cur = getFsItem(cur.parentId);
  }
  if(item.type === 'folder' && isDescendantFolder(folderId, itemId)) return false;
  return true;
}

function moveItemToFolder(itemId, folderId, opts = {}){
  const item = getFsItem(itemId) || ensureFsItemForApp(itemId, { save: false });
  if(!item) return false;
  const targetParentId = folderId || null;
  if(item.parentId === targetParentId && !opts.force) return true;
  if(!canMoveItemToFolder(itemId, targetParentId)) return false;

  if(targetParentId !== 'games'){
    removeFromFolder('games', [itemId]);
  }

  const shouldRememberOrigin = targetParentId !== null
    && item.parentId == null
    && isCoreFsItem(itemId)
    && !Number.isFinite(item.originalDesktopX)
    && !Number.isFinite(item.originalDesktopY);

  const preferred = opts.preferredPos || { x: (item.x || 0) + 16, y: (item.y || 0) + 16 };
  const placed = getFreeIconPlacement(targetParentId, preferred, opts.containerEl, [itemId]);
  upsertFsItem({
    id: itemId,
    parentId: targetParentId,
    x: placed.x,
    y: placed.y,
    originalDesktopX: shouldRememberOrigin ? item.x : item.originalDesktopX,
    originalDesktopY: shouldRememberOrigin ? item.y : item.originalDesktopY,
    originalDesktopParent: shouldRememberOrigin ? null : item.originalDesktopParent,
  }, { save: false, syncIconPos: true, iconPosCache: opts.iconPosCache });

  if(opts.save !== false) saveDesktopFs();
  return true;
}

function addToFolder(folderId, ids){
  const folder = state.folders[folderId] || [];
  ids.forEach(id => {
    if(id === 'games' || id === 'trash') return;
    if(!folder.includes(id)) folder.push(id);
    const item = ensureFsItemForApp(id, { save: false });
    if(item && item.parentId){
      upsertFsItem({ id, parentId: null }, { save: false, syncIconPos: false });
    }
  });
  state.folders[folderId] = folder;
  saveFolders();
  saveDesktopFs();
}

function removeFromFolder(folderId, ids, opts = {}){
  const folder = state.folders[folderId] || [];
  const next = folder.filter(id => !ids.includes(id));
  state.folders[folderId] = next;
  if(opts.save !== false && next.length !== folder.length) saveFolders();
}

function getDropTargetElement(x, y, dragEls){
  if(!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const dragLayer = $('#dragLayer');
  const prevLayerPe = dragLayer ? (dragLayer.style.pointerEvents || '') : '';
  const prevEls = (dragEls || []).map(el => el.style.pointerEvents || '');
  if(dragLayer) dragLayer.style.pointerEvents = 'none';
  (dragEls || []).forEach(el => { el.style.pointerEvents = 'none'; });
  const target = document.elementFromPoint(x, y);
  (dragEls || []).forEach((el, idx) => { el.style.pointerEvents = prevEls[idx]; });
  if(dragLayer) dragLayer.style.pointerEvents = prevLayerPe;
  return target;
}

function getFolderDropTargetAt(x, y, dragEls, draggedIds){
  if(!dragEls || dragEls.length === 0) return null;
  const target = getDropTargetElement(x, y, dragEls);
  const folderEl = target && target.closest ? target.closest('.icon[data-item-type="folder"]') : null;
  if(!folderEl || !folderEl.dataset) return null;
  const folderId = folderEl.dataset.appId;
  if(!folderId) return null;
  const canMoveAll = (draggedIds || []).every(id => canMoveItemToFolder(id, folderId));
  return canMoveAll ? { id: folderId, el: folderEl } : null;
}

function getRelativeIconPosFromClient(containerEl, clientX, clientY){
  if(!containerEl) return { x: 0, y: 0 };
  const rect = containerEl.getBoundingClientRect();
  const localX = clientX - rect.left - (ICON_SIZE.w / 2);
  const localY = clientY - rect.top - (ICON_SIZE.h / 2);
  return clampIconPosToSize(localX, localY, rect.width, rect.height);
}

const DESKTOP_NAV_ID = 'desktop';

function normalizeFolderNavId(navId){
  if(navId == null || navId === '' || navId === DESKTOP_NAV_ID) return null;
  return navId;
}

function getFolderWindowDropTargetAt(x, y, dragEls, draggedIds){
  if(!dragEls || dragEls.length === 0) return null;
  const target = getDropTargetElement(x, y, dragEls);
  if(!target || !target.closest) return null;

  const folderIcon = target.closest('.folder-item[data-item-type="folder"]');
  if(folderIcon && folderIcon.dataset){
    const folderId = folderIcon.dataset.appId;
    const containerEl = folderIcon.closest('[data-folder-view="1"]');
    const canMoveAll = (draggedIds || []).every(id => canMoveItemToFolder(id, folderId));
    if(folderId && containerEl && canMoveAll){
      return { folderId, containerEl, windowId: containerEl.dataset.folderWindowId || '' };
    }
  }

  const viewEl = target.closest('[data-folder-view="1"]');
  if(!viewEl || !viewEl.dataset) return null;
  const rawNavId = viewEl.dataset.folderNavId;
  const folderId = normalizeFolderNavId(rawNavId);
  if(folderId == null && rawNavId !== DESKTOP_NAV_ID) return null;
  const canMoveAll = (draggedIds || []).every(id => canMoveItemToFolder(id, folderId));
  return canMoveAll ? { folderId, containerEl: viewEl, windowId: viewEl.dataset.folderWindowId || '' } : null;
}

function getFolderWindowId(folderId){
  return `folder_${folderId}`;
}

function getTxtWindowId(txtId){
  return `txt_${txtId}`;
}

function isFolderWindowId(winId){
  return typeof winId === 'string' && winId.startsWith('folder_');
}

function isTxtWindowId(winId){
  return typeof winId === 'string' && winId.startsWith('txt_');
}

function getFolderIdFromWindowId(winId){
  return isFolderWindowId(winId) ? winId.slice(7) : null;
}

function getTxtIdFromWindowId(winId){
  return isTxtWindowId(winId) ? winId.slice(4) : null;
}

function getOpenFolderView(parentId){
  if(!parentId) return null;
  return document.querySelector(`[data-folder-view="1"][data-folder-nav-id="${parentId}"]`);
}

function resolveFolderContainer(parentId, containerEl){
  const normalized = normalizeFolderNavId(parentId);
  if(normalized == null) return containerEl || null;
  return containerEl || getOpenFolderView(normalized);
}

function resolvePreferredPos(parentId, opts, containerEl){
  const hasPoint = Number.isFinite(opts.clientX) && Number.isFinite(opts.clientY);
  if(!hasPoint) return opts.preferredPos || null;
  const normalized = normalizeFolderNavId(parentId);
  if(normalized == null){
    if(containerEl) return getRelativeIconPosFromClient(containerEl, opts.clientX, opts.clientY);
    return getDesktopPosFromClient(opts.clientX, opts.clientY);
  }
  if(containerEl) return getRelativeIconPosFromClient(containerEl, opts.clientX, opts.clientY);
  return opts.preferredPos || null;
}

function refreshOpenFolderWindows(){
  const toClose = [];
  state.windows.forEach(w => {
    if(w && w.kind === 'folder' && state.trash.has(w.folderId)){
      toClose.push(w.id);
    }
  });
  toClose.forEach(id => closeApp(id));
  state.windows.forEach(w => {
    if(w && w.kind === 'folder'){
      renderFolderWindow(w.id, w.folderNavId || w.folderId);
    }
  });
}

function refreshOpenTxtWindows(txtId){
  state.windows.forEach(w => {
    if(!w || w.kind !== 'txt') return;
    if(txtId && w.txtId !== txtId) return;
    renderTxtFileWindow(w.id);
  });
}

const FOLDER_SMARTFIT_MIN_INTERVAL = 180;

function scheduleFolderSmartFit(winEl, wstate, navId, reason){
  if(!winEl || !wstate || wstate.kind !== 'folder') return;
  if(wstate.userSized) return;
  const nextNavId = navId || wstate.folderNavId || wstate.folderId;
  const navChanged = nextNavId !== (wstate.folderFitNavId || '');
  const shouldInit = !wstate.folderFitInitialized;
  if(!shouldInit && !navChanged) return;
  const now = Date.now();
  if(!shouldInit && now - (wstate.folderFitLastAt || 0) < FOLDER_SMARTFIT_MIN_INTERVAL) return;
  if(wstate.folderFitLock) return;
  if(wstate.folderFitRaf){
    try{ cancelAnimationFrame(wstate.folderFitRaf); } catch {}
    wstate.folderFitRaf = 0;
  }
  wstate.folderFitInitialized = true;
  wstate.folderFitNavId = nextNavId;
  wstate.folderFitReason = reason || (navChanged ? 'navChange' : 'init');
  wstate.folderFitToken = (wstate.folderFitToken || 0) + 1;
  const token = wstate.folderFitToken;
  wstate.folderFitRaf = requestAnimationFrame(()=>{
    wstate.folderFitRaf = requestAnimationFrame(()=>{
      if(token !== wstate.folderFitToken) return;
      if(wstate.userSized) return;
      wstate.folderFitLock = true;
      smartFitWindow(winEl, 'tabChange', {
        onDone: ()=>{
          wstate.folderFitLock = false;
          wstate.folderFitLastAt = Date.now();
          wstate.lastSmartFitNavId = nextNavId;
        }
      }).catch(()=>{
        wstate.folderFitLock = false;
        wstate.folderFitLastAt = Date.now();
      });
    });
  });
}

function createTxtFile(opts = {}){
  const parentId = opts.parentId || null;
  if(parentId){
    const parent = getFsItem(parentId);
    if(!parent || parent.type !== 'folder' || state.trash.has(parentId)) return null;
  }
  const containerEl = resolveFolderContainer(parentId, opts.containerEl);
  const baseName = t('fs.newTextFileName');
  const name = makeUniqueName(parentId, baseName, 'txt');
  const preferred = resolvePreferredPos(parentId, opts, containerEl);
  const placed = getFreeIconPlacement(parentId, preferred, containerEl);
  const id = generateFsId('txt');
  const item = {
    id,
    type: 'txt',
    name,
    parentId,
    x: placed.x,
    y: placed.y,
    content: '',
    iconFile: './assets/icons/txt.png',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  upsertFsItem(item, { save: false, syncIconPos: false });
  saveDesktopFs();
  renderIcons();
  refreshOpenFolderWindows();
  if(parentId == null){
    selectIcon(id, $('#iconGrid'));
  } else if(containerEl){
    selectIcon(id, containerEl);
  }
  return item;
}

function createFolder(opts = {}){
  const parentId = opts.parentId || null;
  if(parentId){
    const parent = getFsItem(parentId);
    if(!parent || parent.type !== 'folder' || state.trash.has(parentId)) return null;
  }
  const containerEl = resolveFolderContainer(parentId, opts.containerEl);
  const baseName = t('fs.newFolderName');
  const name = makeUniqueName(parentId, baseName);
  const preferred = resolvePreferredPos(parentId, opts, containerEl);
  const placed = getFreeIconPlacement(parentId, preferred, containerEl);
  const id = generateFsId('folder');
  const item = {
    id,
    type: 'folder',
    name,
    parentId,
    x: placed.x,
    y: placed.y,
    iconFile: './assets/icons/folder.png',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  upsertFsItem(item, { save: false, syncIconPos: false });
  saveDesktopFs();
  renderIcons();
  refreshOpenFolderWindows();
  if(parentId == null){
    selectIcon(id, $('#iconGrid'));
  } else if(containerEl){
    selectIcon(id, containerEl);
  }
  return item;
}

function duplicateTxtFile(txtId, opts = {}){
  const original = getFsItem(txtId);
  if(!original || original.type !== 'txt') return null;
  let parentId = original.parentId || null;
  if(parentId){
    const parent = getFsItem(parentId);
    if(!parent || parent.type !== 'folder' || state.trash.has(parentId)) parentId = null;
  }
  const containerEl = resolveFolderContainer(parentId, opts.containerEl);
  const base = original.name.replace(/\.txt$/i, '');
  const copyBase = `${base} ${t('fs.copySuffix')}`.trim();
  const name = makeUniqueName(parentId, copyBase, 'txt');
  const preferred = opts.preferredPos || { x: (original.x || 0) + 16, y: (original.y || 0) + 16 };
  const placed = getFreeIconPlacement(parentId, preferred, containerEl);
  const id = generateFsId('txt');
  const item = {
    ...original,
    id,
    name,
    parentId,
    x: placed.x,
    y: placed.y,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  upsertFsItem(item, { save: false, syncIconPos: false });
  saveDesktopFs();
  renderIcons();
  refreshOpenFolderWindows();
  return item;
}

function setWindowTitle(winId, title){
  const w = state.windows.get(winId);
  const titleChanged = !w || w.title !== title;
  if(w) w.title = title;
  const winEl = document.getElementById(`win_${winId}`);
  if(winEl){
    const strong = winEl.querySelector('.title-left strong');
    if(strong && titleChanged) strong.textContent = title;
    const iconHost = winEl.querySelector('[data-win-title-icon="1"]');
    if(iconHost && w){
      iconHost.innerHTML = getThemedIconHtml(w, title, 16);
    }
  }
  if(titleChanged) renderTaskButtons();
  if(state.activeWindowId === winId) updateBlissOSActiveApp();
}

function getFolderPath(folderId){
  const path = [];
  let cur = getFsItem(folderId);
  const guard = new Set();
  while(cur && cur.type === 'folder' && !guard.has(cur.id)){
    path.unshift(cur);
    guard.add(cur.id);
    if(!cur.parentId) break;
    cur = getFsItem(cur.parentId);
  }
  return path;
}

function getPathbarIconHtml(type, label){
  if(type === 'desktop'){
    const base = './assets/icons/computer.png';
    if(state.settings.theme === 'blissos'){
      const src = getBlissOSAssetPath(base);
      const fallback = getBlissOSFallbackPath(src);
      return `<img class="crumb-icon pixel" src="${src}" data-fallback-src="${fallback}" width="14" height="14" alt="${escapeHTML(label)}" />`;
    }
    return `<img class="crumb-icon pixel" src="${base}" width="14" height="14" alt="${escapeHTML(label)}" />`;
  }
  if(type === 'folder'){
    const src = getFolderIconPath();
    const fallback = isBlissOS() ? getBlissOSFallbackPath(src) : '';
    const fbAttr = fallback ? ` data-fallback-src="${fallback}"` : '';
    return `<img class="crumb-icon pixel" src="${src}"${fbAttr} width="14" height="14" alt="${escapeHTML(label)}" />`;
  }
  return '';
}

function renderFolderPathbar(winEl, folderId){
  if(!winEl) return;
  const wstate = state.windows.get(getWindowId(winEl));
  const host = winEl.querySelector('[data-folder-pathbar="1"]');
  if(!host || !wstate) return;
  const path = getFolderPath(folderId);
  const rootId = DESKTOP_NAV_ID;
  const rootLabel = t('fs.desktop');
  const segments = [
    `<button class="path-seg" type="button" data-folder-nav-id="${rootId}"><span class="crumb">${getPathbarIconHtml('desktop', rootLabel)}<span class="crumb-label">${rootLabel}</span></span></button>`
  ].concat(path.map(seg => `
    <span class="path-sep">›</span>
    <button class="path-seg" type="button" data-folder-nav-id="${seg.id}"><span class="crumb">${getPathbarIconHtml('folder', seg.name || '')}<span class="crumb-label">${escapeHTML(seg.name || '')}</span></span></button>
  `));
  host.innerHTML = segments.join('');
  if(!host.dataset.bound){
    host.addEventListener('click', (e)=>{
      const target = getEventTargetEl(e);
      const btn = target && target.closest ? target.closest('[data-folder-nav-id]') : null;
      if(!btn || !btn.dataset) return;
      const navId = btn.dataset.folderNavId;
      if(navId) renderFolderWindow(wstate.id, navId);
    });
    host.dataset.bound = '1';
  }
}

function openFolderWindow(folderId, opts = {}){
  const folder = getFsItem(folderId);
  if(!folder || folder.type !== 'folder' || state.trash.has(folderId)) return null;
  playSfx('fileOpen');
  const winId = getFolderWindowId(folderId);
  const navId = opts.navId || folderId;

  if(state.windows.has(winId)){
    const w = state.windows.get(winId);
    w.minimized = false;
    w.folderNavId = navId;
    const el = document.getElementById(`win_${winId}`);
    if(el){
      el.classList.remove('hidden');
      renderFolderWindow(winId, navId);
    }
    focusWindow(winId);
    renderTaskButtons();
    return el;
  }

  const area = $('#desktopArea').getBoundingClientRect();
  const rect = normalizeWindowRect(defaultWindowRect(), area, 16);
  const wstate = {
    id: winId,
    title: folder.name || t('fs.newFolderName'),
    icon: 'folder',
    iconFile: './assets/icons/folder.png',
    minimized: false,
    fit: false,
    prevRect: null,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    z: ++state.zTop,
    savedRect: false,
    userSized: false,
    autoFitObserver: null,
    lastFitKey: '',
    lastFitW: 0,
    lastFitH: 0,
    fitCache: null,
    lastSmartFit: null,
    mediaplayerFixed: false,
    deferReveal: false,
    skipAnimOpen: false,
    smartFitPromise: Promise.resolve(getWindowRectFromState({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })),
    kind: 'folder',
    folderId,
    folderNavId: navId,
    lastRenderedNavId: '',
    folderFitInitialized: true,
    folderFitNavId: navId,
    folderFitLock: false,
    folderFitRaf: 0,
    folderFitToken: 0,
    folderFitLastAt: Date.now(),
    folderFitReason: '',
    contentHTML: () => `
      <div class="folder-shell" data-folder-shell="1">
        <div class="folder-view" data-folder-view="1"></div>
      </div>
    `,
  };
  state.windows.set(winId, wstate);
  createWindowElement(wstate);
  const winEl = document.getElementById(`win_${winId}`);
  focusWindow(winId);
  renderTaskButtons();
  return winEl;
}

function openTxtFileWindow(txtId, opts = {}){
  const item = getFsItem(txtId);
  if(!item || item.type !== 'txt' || state.trash.has(txtId)) return null;
  playSfx('fileOpen');
  const winId = getTxtWindowId(txtId);

  if(state.windows.has(winId)){
    const w = state.windows.get(winId);
    w.minimized = false;
    const el = document.getElementById(`win_${winId}`);
    if(el){
      el.classList.remove('hidden');
      renderTxtFileWindow(winId);
    }
    focusWindow(winId);
    renderTaskButtons();
    return el;
  }

  const area = $('#desktopArea').getBoundingClientRect();
  const rect = normalizeWindowRect(defaultWindowRect(), area, 16);
  const wstate = {
    id: winId,
    title: item.name,
    icon: 'file',
    iconFile: './assets/icons/txt.png',
    minimized: false,
    fit: false,
    prevRect: null,
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    z: ++state.zTop,
    savedRect: false,
    userSized: false,
    autoFitObserver: null,
    lastFitKey: '',
    lastFitW: 0,
    lastFitH: 0,
    fitCache: null,
    lastSmartFit: null,
    mediaplayerFixed: false,
    deferReveal: false,
    skipAnimOpen: false,
    smartFitPromise: Promise.resolve(getWindowRectFromState({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })),
    kind: 'txt',
    txtId,
    txtDirty: false,
    txtSaveTimer: null,
    contentHTML: () => `
      <div class="txt-shell" data-txt-shell="1">
        <div class="txt-toolbar">
          <button class="btn bevel" type="button" data-txt-action="new" data-i18n="menu.txt.new">${t('menu.txt.new')}</button>
          <button class="btn bevel" type="button" data-txt-action="save" data-i18n="menu.txt.save">${t('menu.txt.save')}</button>
          <button class="btn bevel" type="button" data-txt-action="duplicate" data-i18n="menu.txt.duplicate">${t('menu.txt.duplicate')}</button>
        </div>
        <textarea class="txt-editor bevel-in" data-txt-editor="1" spellcheck="false"></textarea>
      </div>
    `,
  };
  state.windows.set(winId, wstate);
  createWindowElement(wstate);
  const winEl = document.getElementById(`win_${winId}`);
  focusWindow(winId);
  renderTaskButtons();
  return winEl;
}

function getRenderableFsChildren(parentId){
  return getFsChildren(parentId).filter(item => {
    if(item.type === 'app') return !!getAppById(item.appId || item.id);
    if(item.type === 'virtual') return !!getVirtualIconById(item.appId || item.id);
    return true;
  });
}

function makeFolderItemDraggable(iconEl, winId, containerEl){
  let down = false;
  let dragging = false;
  let pointerId = null;
  let lastEvent = null;
  let startX = 0;
  let startY = 0;
  let startParentId = containerEl ? normalizeFolderNavId(containerEl.dataset.folderNavId) : null;
  let group = [];
  let startPositions = [];
  let dxMin = 0;
  let dxMax = 0;
  let dyMin = 0;
  let dyMax = 0;
  let prevOverflow = '';
  let ghostEl = null;
  let ghostOffsetX = 0;
  let ghostOffsetY = 0;

  const clearGhost = ()=>{
    if(ghostEl){
      ghostEl.remove();
      ghostEl = null;
    }
    group.forEach(el => { el.style.opacity = ''; });
  };

  const createGhost = (e)=>{
    if(ghostEl) return;
    const src = group[0] || iconEl;
    if(!src) return;
    const rect = src.getBoundingClientRect();
    ghostOffsetX = e.clientX - rect.left;
    ghostOffsetY = e.clientY - rect.top;
    ghostEl = src.cloneNode(true);
    ghostEl.classList.add('folder-drag-ghost');
    ghostEl.style.width = rect.width + 'px';
    ghostEl.style.height = rect.height + 'px';
    ghostEl.style.left = rect.left + 'px';
    ghostEl.style.top = rect.top + 'px';
    ghostEl.style.transform = 'none';
    document.body.appendChild(ghostEl);
    group.forEach(el => { el.style.opacity = '0.2'; });
  };

  const updateGhost = (e)=>{
    if(!ghostEl) return;
    ghostEl.style.left = (e.clientX - ghostOffsetX) + 'px';
    ghostEl.style.top = (e.clientY - ghostOffsetY) + 'px';
  };

  const endDrag = (e, cancel)=>{
    if(!down) return;
    if(pointerId !== null && e && e.pointerId !== pointerId) return;

    down = false;
    if(pointerId !== null){
      try{ iconEl.releasePointerCapture(pointerId); } catch {}
    }
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
    window.removeEventListener('blur', onWindowBlur);
    document.body.classList.remove('dragging');
    if(containerEl) containerEl.style.overflow = prevOverflow;
    clearGhost();

    if(dragging && !cancel && e){
      const ids = startPositions.map(p => p.id);
      const dragEls = startPositions.map(p => p.el);
      const iconPosCache = loadIconPositions();
      const movedAppLike = ids.some(id => isAppLikeItem(getFsItem(id) || ensureFsItemForApp(id, { save: false })));
      const topTarget = getDropTargetElement(e.clientX, e.clientY, dragEls);
      const overWindow = topTarget && topTarget.closest ? topTarget.closest('.window') : null;

      if(isOverTrashWindow(e.clientX, e.clientY) || isOverTrash(e.clientX, e.clientY)){
        moveIconsToTrash(ids);
        refreshOpenFolderWindows();
      } else if(isOverGamesWindow(e.clientX, e.clientY)){
        addToFolder('games', ids);
        ids.forEach(id => { delete iconPosCache[id]; });
        debounceIconSave(()=> saveIconPositions(iconPosCache));
        refreshOpenFolderWindows();
        renderIcons();
        renderGamesWindow();
      } else {
        const dockTarget = getDockDropTargetAt(e.clientX, e.clientY);
        if(dockTarget){
          const entries = ids.map(id => {
            if(id === 'trash') return { type:'trash', refId:'trash' };
            const fsItem = getFsItem(id);
            if(fsItem && (fsItem.type === 'folder' || fsItem.type === 'txt')) return { type: fsItem.type, refId: id };
            return { type:'app', refId: id };
          });
          addDockItemsAt(entries, dockTarget.index);
        } else {
          const folderWindowTarget = getFolderWindowDropTargetAt(e.clientX, e.clientY, dragEls, ids);
          const desktopFolderTarget = folderWindowTarget ? null : getFolderDropTargetAt(e.clientX, e.clientY, dragEls, ids);
          const desktopDrop = !folderWindowTarget && !desktopFolderTarget && isOverDesktopArea(e.clientX, e.clientY) && !overWindow;
          const targetParentId = folderWindowTarget
            ? folderWindowTarget.folderId
            : (desktopFolderTarget ? desktopFolderTarget.id : (desktopDrop ? null : startParentId));
          const targetContainer = folderWindowTarget ? folderWindowTarget.containerEl : (desktopDrop ? null : containerEl);
          const preferred = targetParentId == null
            ? (targetContainer ? getRelativeIconPosFromClient(targetContainer, e.clientX, e.clientY) : getDesktopPosFromClient(e.clientX, e.clientY))
            : (targetContainer ? getRelativeIconPosFromClient(targetContainer, e.clientX, e.clientY) : { x: 0, y: 0 });

          let moved = false;
          ids.forEach(id => {
            if(moveItemToFolder(id, targetParentId, {
              force: true,
              save: false,
              iconPosCache,
              containerEl: targetContainer,
              preferredPos: preferred,
            })){
              moved = true;
            }
          });
          if(moved){
            if(movedAppLike) saveIconPositions(iconPosCache);
            saveDesktopFs();
            renderIcons();
            refreshOpenFolderWindows();
          }
        }
      }
    }

    if(dragging){
      startPositions.forEach(p => {
        p.el.style.transform = '';
        p.el.dataset.dragged = '1';
      });
    }
    clearDockDropPreview();
    setDockDropHighlight(false);

    dragging = false;
    pointerId = null;
  };

  const onWindowBlur = ()=>{
    endDrag(lastEvent, true);
  };

  const onPointerDown = (e)=>{
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    const winEl = document.getElementById(`win_${winId}`);
    if(winEl) focusWindow(winId);
    e.stopPropagation();
    closeStartMenu();
    closeCtxMenu();
    closeWindowMenu();

    startParentId = containerEl ? normalizeFolderNavId(containerEl.dataset.folderNavId || startParentId) : startParentId;
    clearIconSelectionExcept(containerEl);
    const selectedEls = containerEl ? Array.from(containerEl.querySelectorAll('.icon.selected')) : [];
    const isSelected = iconEl.classList.contains('selected');
    if(selectedEls.length > 1 && isSelected){
      group = selectedEls;
    } else {
      selectIcon(iconEl.dataset.appId, containerEl);
      group = [iconEl];
    }

    down = true;
    dragging = false;
    pointerId = e.pointerId;
    try{ iconEl.setPointerCapture(pointerId); } catch {}
    startX = e.clientX;
    startY = e.clientY;
    prevOverflow = containerEl ? containerEl.style.overflow : '';
    if(containerEl) containerEl.style.overflow = 'visible';

    startPositions = group.map(el => ({
      el,
      id: el.dataset.appId,
      x: parseInt(el.style.left || '0', 10),
      y: parseInt(el.style.top || '0', 10),
    }));

    const area = containerEl ? containerEl.getBoundingClientRect() : $('#desktopArea').getBoundingClientRect();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    startPositions.forEach(p => {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x + ICON_SIZE.w);
      maxY = Math.max(maxY, p.y + ICON_SIZE.h);
    });
    dxMin = -minX;
    dxMax = (Math.floor(area.width - 6) - maxX);
    dyMin = -minY;
    dyMax = (Math.floor(area.height - 6) - maxY);

    group.forEach(el => { el.dataset.dragged = '0'; });
    document.body.classList.add('dragging');
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('blur', onWindowBlur);
    e.preventDefault();
  };

  const onPointerMove = (e)=>{
    if(!down) return;
    if(pointerId !== null && e.pointerId !== pointerId) return;
    lastEvent = e;
    const dxRaw = e.clientX - startX;
    const dyRaw = e.clientY - startY;
    if(!dragging && (Math.abs(dxRaw) + Math.abs(dyRaw) > 4)){
      dragging = true;
      createGhost(e);
    }
    if(!dragging) return;
    updateGhost(e);
    const dx = clamp(dxRaw, dxMin, dxMax);
    const dy = clamp(dyRaw, dyMin, dyMax);
    startPositions.forEach(p => {
      p.el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    if(isBlissOS()){
      const dockTarget = getDockDropTargetAt(e.clientX, e.clientY);
      if(dockTarget){
        setDockDropPreview(dockTarget.index);
        setDockDropHighlight(true);
      } else {
        clearDockDropPreview();
        setDockDropHighlight(false);
      }
    }
    e.preventDefault();
  };

  const onPointerUp = (e)=>{
    endDrag(e, false);
  };

  iconEl.addEventListener('pointerdown', onPointerDown);
}

function renderFolderWindow(winId, navId){
  const wstate = state.windows.get(winId);
  if(!wstate || wstate.kind !== 'folder') return;
  const winEl = document.getElementById(`win_${winId}`);
  if(!winEl) return;

  const requestedNavId = navId || wstate.folderNavId || wstate.folderId;
  const isDesktopView = requestedNavId === DESKTOP_NAV_ID;
  let currentId = isDesktopView ? null : requestedNavId;
  let current = currentId ? getFsItem(currentId) : null;
  if(!isDesktopView && (!current || current.type !== 'folder' || state.trash.has(currentId))){
    currentId = wstate.folderId;
    current = getFsItem(currentId);
    if(!current) return;
  }
  wstate.folderNavId = isDesktopView ? DESKTOP_NAV_ID : currentId;
  setWindowTitle(winId, isDesktopView ? t('fs.desktop') : (current.name || t('fs.newFolderName')));
  const navKey = isDesktopView ? DESKTOP_NAV_ID : currentId;
  const navChangedForFit = navKey !== (wstate.lastRenderedNavId || '');
  wstate.lastRenderedNavId = navKey;

  const content = winEl.querySelector('.content');
  if(!content) return;
  let shell = content.querySelector('[data-folder-shell="1"]');
  if(!shell){
    content.innerHTML = `
      <div class="folder-shell" data-folder-shell="1">
        <div class="folder-view" data-folder-view="1"></div>
      </div>
    `;
    shell = content.querySelector('[data-folder-shell="1"]');
  }
  const viewEl = shell ? shell.querySelector('[data-folder-view="1"]') : null;
  if(!viewEl) return;
  viewEl.dataset.folderNavId = isDesktopView ? DESKTOP_NAV_ID : currentId;
  viewEl.dataset.folderWindowId = winId;
  viewEl.dataset.folderRootId = wstate.folderId;

  if(!viewEl.dataset.bound){
    viewEl.addEventListener('click', (e)=>{
      const target = getEventTargetEl(e);
      if(target && target.closest && target.closest('.icon')) return;
      clearAllIconSelection();
    });
    viewEl.addEventListener('contextmenu', (e)=>{
      const target = getEventTargetEl(e);
      if(target && target.closest && target.closest('.icon')) return;
      e.preventDefault();
      const parentId = normalizeFolderNavId(viewEl.dataset.folderNavId);
      openCtxMenu(e.clientX, e.clientY, 'desktop', null, {
        parentId,
        containerEl: viewEl,
      });
    });
    installLongPress(viewEl, ()=>({
      target: 'desktop',
      appId: null,
      parentId: normalizeFolderNavId(viewEl.dataset.folderNavId),
      containerEl: viewEl,
    }));
    viewEl.dataset.bound = '1';
  }

  const parentId = normalizeFolderNavId(viewEl.dataset.folderNavId);
  const orderedIds = APPS.filter(app => app.showOnDesktop !== false).map(app => app.id)
    .concat(VIRTUAL_ICONS.map(v => v.id));
  const orderIndex = new Map(orderedIds.map((id, idx) => [id, idx]));
  const iconPosCache = loadIconPositions();
  let fsDirty = false;
  let iconPosDirty = false;

  const children = getRenderableFsChildren(parentId).sort((a, b) => {
    const ia = orderIndex.has(a.id) ? orderIndex.get(a.id) : 1e6;
    const ib = orderIndex.has(b.id) ? orderIndex.get(b.id) : 1e6;
    if(ia !== ib) return ia - ib;
    const ca = a.createdAt || 0;
    const cb = b.createdAt || 0;
    if(ca !== cb) return ca - cb;
    return getFsItemLabel(a).localeCompare(getFsItemLabel(b));
  });
  const metrics = getFolderGridMetrics(viewEl, children);
  const occupied = new Map();

  const fragment = document.createDocumentFragment();
  viewEl.innerHTML = '';
  if(children.length === 0){
    viewEl.innerHTML = `<div class="folder-empty tiny">${t('fs.emptyFolder')}</div>`;
    renderFolderPathbar(winEl, currentId);
    scheduleFolderSmartFit(winEl, wstate, currentId, navChangedForFit ? 'navChange' : 'update');
    return;
  }

  children.forEach((item, idx) => {
    const basePos = (Number.isFinite(item.x) && Number.isFinite(item.y))
      ? { x: item.x, y: item.y }
      : legacyDefaultIconPos(idx);
    const placed = placeOnFreeCell(basePos.x, basePos.y, occupied, metrics);
    if(isAppLikeItem(item) && iconPosCache[item.id]){
      delete iconPosCache[item.id];
      iconPosDirty = true;
    }
    if(placed.changed || item.parentId !== parentId || !Number.isFinite(item.x) || !Number.isFinite(item.y)){
      upsertFsItem({ id: item.id, parentId, x: placed.x, y: placed.y }, { save: false, syncIconPos: true, iconPosCache });
      fsDirty = true;
      if(isAppLikeItem(item)) iconPosDirty = true;
    }

    const label = getFsItemLabel(item);
    const iconHtml = getFsIconHtml(item, label, 32);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon folder-item';
    btn.style.left = placed.x + 'px';
    btn.style.top = placed.y + 'px';
    btn.dataset.appId = item.id;
    btn.dataset.itemType = item.type || 'app';
    btn.dataset.parentId = parentId || '';
    btn.dataset.windowId = winId;
    if(item.type === 'folder') btn.dataset.folderId = item.id;
    btn.innerHTML = `
      <div class="pixel" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;">${iconHtml}</div>
      <span>${label}</span>
    `;

    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(btn.dataset.dragged === '1'){
        btn.dataset.dragged = '0';
        return;
      }
      selectIcon(item.id, viewEl);
    });
    btn.addEventListener('dblclick', (e)=>{
      e.stopPropagation();
      if(item.type === 'folder'){
        renderFolderWindow(winId, item.id);
        return;
      }
      if(item.type === 'txt'){
        openTxtFileWindow(item.id);
        return;
      }
      openIconById(item.id);
    });
    btn.addEventListener('contextmenu', (ev)=>{
      ev.preventDefault();
      ev.stopPropagation();
      openCtxMenu(ev.clientX, ev.clientY, 'icon', item.id, {
        itemType: item.type,
        parentId,
        containerEl: viewEl,
      });
    });
    installLongPress(btn, ()=>({
      target: 'icon',
      appId: item.id,
      itemType: item.type,
      parentId,
      containerEl: viewEl,
    }));
    makeFolderItemDraggable(btn, winId, viewEl);
    fragment.appendChild(btn);
  });

  viewEl.appendChild(fragment);
  if(iconPosDirty) saveIconPositions(iconPosCache);
  if(fsDirty) saveDesktopFs();
  renderFolderPathbar(winEl, parentId);
  scheduleFolderSmartFit(winEl, wstate, navKey, navChangedForFit ? 'navChange' : 'update');
}

function saveTxtFileContent(txtId, content){
  const item = getFsItem(txtId);
  if(!item || item.type !== 'txt') return false;
  upsertFsItem({ id: txtId, content }, { save: false, syncIconPos: false });
  saveDesktopFs();
  return true;
}

function scheduleTxtAutosave(winId, content){
  const wstate = state.windows.get(winId);
  if(!wstate || wstate.kind !== 'txt') return;
  if(wstate.txtSaveTimer) clearTimeout(wstate.txtSaveTimer);
  wstate.txtSaveTimer = setTimeout(()=>{
    saveTxtFileContent(wstate.txtId, content);
    wstate.txtDirty = false;
    wstate.txtSaveTimer = null;
  }, 600);
}

function handleTxtAction(winId, action){
  const wstate = state.windows.get(winId);
  if(!wstate || wstate.kind !== 'txt') return;
  const item = getFsItem(wstate.txtId);
  if(!item) return;
  const winEl = document.getElementById(`win_${winId}`);
  if(!winEl) return;
  const textarea = winEl.querySelector('[data-txt-editor="1"]');
  const parentId = item.parentId || null;
  const containerEl = resolveFolderContainer(parentId, null);

  if(action === 'new'){
    const created = createTxtFile({ parentId, containerEl });
    if(created) openTxtFileWindow(created.id);
    return;
  }
  if(action === 'duplicate'){
    const dup = duplicateTxtFile(item.id, { containerEl });
    if(dup) openTxtFileWindow(dup.id);
    return;
  }
  if(action === 'save' && textarea){
    if(wstate.txtSaveTimer) clearTimeout(wstate.txtSaveTimer);
    wstate.txtSaveTimer = null;
    saveTxtFileContent(item.id, textarea.value);
    wstate.txtDirty = false;
  }
}

function renderTxtFileWindow(winId){
  const wstate = state.windows.get(winId);
  if(!wstate || wstate.kind !== 'txt') return;
  const item = getFsItem(wstate.txtId);
  if(!item){
    closeApp(winId);
    return;
  }
  if(wstate.title !== item.name){
    setWindowTitle(winId, item.name);
  }
  const winEl = document.getElementById(`win_${winId}`);
  if(!winEl) return;
  const content = winEl.querySelector('.content');
  if(!content) return;
  let shell = content.querySelector('[data-txt-shell="1"]');
  if(!shell){
    content.innerHTML = wstate.contentHTML ? wstate.contentHTML() : '';
    shell = content.querySelector('[data-txt-shell="1"]');
  }
  if(!shell) return;
  const textarea = shell.querySelector('[data-txt-editor="1"]');
  if(!textarea) return;
  const value = item.content || '';
  if(textarea.value !== value) textarea.value = value;

  if(!shell.dataset.bound){
    shell.addEventListener('click', (e)=>{
      const target = getEventTargetEl(e);
      const btn = target && target.closest ? target.closest('[data-txt-action]') : null;
      if(btn && btn.dataset){
        e.preventDefault();
        e.stopPropagation();
        handleTxtAction(winId, btn.dataset.txtAction);
      }
    });
    textarea.addEventListener('input', ()=>{
      wstate.txtDirty = true;
      scheduleTxtAutosave(winId, textarea.value);
    });
    textarea.addEventListener('blur', ()=>{
      if(wstate.txtDirty) handleTxtAction(winId, 'save');
    });
    shell.dataset.bound = '1';
  }

  smartFitWindow(winEl, 'tabChange');
}

function isOverTrashWindow(x, y){
  const win = document.getElementById('win_trash');
  if(!win || win.classList.contains('hidden')) return false;
  const content = win.querySelector('.content');
  if(!content) return false;
  const r = content.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function isOverGamesWindow(x, y){
  const win = document.getElementById('win_games');
  if(!win || win.classList.contains('hidden')) return false;
  if(state.games.view !== 'list') return false;
  const content = win.querySelector('.content');
  if(!content) return false;
  const r = content.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function isOverDesktopArea(x, y){
  const area = $('#desktopArea').getBoundingClientRect();
  return x >= area.left && x <= area.right && y >= area.top && y <= area.bottom;
}

function setIconPosition(id, x, y){
  const item = getFsItem(id) || ensureFsItemForApp(id, { save: false });
  if(!item) return;
  const saved = loadIconPositions();
  let nx = x;
  let ny = y;
  if(state.gridSnap){
    const snapped = snapToGrid(nx, ny);
    nx = snapped.x;
    ny = snapped.y;
  }
  let placed;
  if(state.gridSnap){
    const metrics = getGridMetrics();
    const occupied = buildOccupiedFromFs(null, [id], metrics, { visibleOnly: true });
    placed = placeOnFreeCell(nx, ny, occupied, metrics);
  } else {
    const clamped = clampIconPos(nx, ny);
    placed = { x: clamped.x, y: clamped.y };
  }
  upsertFsItem({ id, parentId: null, x: placed.x, y: placed.y }, { save: false, syncIconPos: true, iconPosCache: saved });
  saveIconPositions(saved);
  saveDesktopFs();
}

function makeGameItemDraggable(itemEl, id){
  let down = false;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let ghost = null;
  const dragLayer = $('#dragLayer');

  const onPointerDown = (e)=>{
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    down = true;
    dragging = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    itemEl.setPointerCapture(pointerId);
    itemEl.addEventListener('pointermove', onPointerMove);
    itemEl.addEventListener('pointerup', onPointerUp);
    itemEl.addEventListener('pointercancel', onPointerUp);
  };

  const onPointerMove = (e)=>{
    if(!down) return;
    if(pointerId !== null && e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if(!dragging && (Math.abs(dx) + Math.abs(dy) > 4)){
      dragging = true;
      if(dragLayer){
        dragLayer.classList.add('active');
        ghost = itemEl.cloneNode(true);
        ghost.classList.add('games-drag-ghost');
        if(state.games.bigIcons && state.games.layout === 'grid') ghost.classList.add('big');
        dragLayer.appendChild(ghost);
      }
    }
    if(!dragging || !ghost) return;
    const area = $('#desktopArea').getBoundingClientRect();
    ghost.style.left = (e.clientX - area.left - 20) + 'px';
    ghost.style.top = (e.clientY - area.top - 20) + 'px';
  };

  const onPointerUp = (e)=>{
    if(pointerId !== null && e.pointerId !== pointerId) return;
    down = false;
    try{ itemEl.releasePointerCapture(e.pointerId); } catch {}
    itemEl.removeEventListener('pointermove', onPointerMove);
    itemEl.removeEventListener('pointerup', onPointerUp);
    itemEl.removeEventListener('pointercancel', onPointerUp);

    if(ghost && dragLayer){
      ghost.remove();
      dragLayer.classList.remove('active');
      ghost = null;
    }

    if(dragging){
      const dragEls = [itemEl];
      const iconPosCache = loadIconPositions();
      const topTarget = getDropTargetElement(e.clientX, e.clientY, dragEls);
      const overWindow = topTarget && topTarget.closest ? topTarget.closest('.window') : null;

      if(isOverTrashWindow(e.clientX, e.clientY) || isOverTrash(e.clientX, e.clientY)){
        moveIconsToTrash([id]);
        refreshOpenFolderWindows();
        renderGamesWindow();
      } else if(!isOverGamesWindow(e.clientX, e.clientY)){
        const folderWindowTarget = getFolderWindowDropTargetAt(e.clientX, e.clientY, dragEls, [id]);
        if(folderWindowTarget){
          removeFromFolder('games', [id]);
          const preferred = getRelativeIconPosFromClient(folderWindowTarget.containerEl, e.clientX, e.clientY);
          moveItemToFolder(id, folderWindowTarget.folderId, {
            force: true,
            save: false,
            iconPosCache,
            containerEl: folderWindowTarget.containerEl,
            preferredPos: preferred,
          });
          saveIconPositions(iconPosCache);
          saveDesktopFs();
          renderIcons();
          refreshOpenFolderWindows();
          renderGamesWindow();
        } else {
          const folderTarget = getFolderDropTargetAt(e.clientX, e.clientY, dragEls, [id]);
          if(folderTarget){
            removeFromFolder('games', [id]);
            moveItemToFolder(id, folderTarget.id, { force: true, save: false, iconPosCache, preferredPos: { x: 0, y: 0 } });
            saveIconPositions(iconPosCache);
            saveDesktopFs();
            renderIcons();
            refreshOpenFolderWindows();
            renderGamesWindow();
          } else if(isOverDesktopArea(e.clientX, e.clientY) && !overWindow){
            removeFromFolder('games', [id]);
            const preferred = getDesktopPosFromClient(e.clientX, e.clientY);
            moveItemToFolder(id, null, { force: true, save: false, iconPosCache, preferredPos: preferred });
            saveIconPositions(iconPosCache);
            saveDesktopFs();
            renderIcons();
            refreshOpenFolderWindows();
            renderGamesWindow();
          }
        }
      }
    }

    dragging = false;
    pointerId = null;
  };

  itemEl.addEventListener('pointerdown', onPointerDown);
}

const VIDEO_DEFAULT_THUMB = './assets/icons/Videos.png';
const VIDEO_THUMBS = new Map();

const LOCAL_VIDEOS = [
  {
    id: 'feb-22',
    src: './assets/videos/FEB.22.mp4',
    title: 'FEB.22',
    meta: 'MP4',
    thumbTime: 1.2,
  },
  {
    id: 'bliss4life',
    src: './assets/videos/bliss4life.mp4',
    title: 'bliss4life',
    meta: 'MP4',
    thumbTime: 1.2,
  }
];

function getVideoTitleFromSrc(src){
  const file = String(src || '').split('/').pop() || '';
  return file.replace(/\.[^.]+$/, '');
}

function getLocalVideos(){
  return LOCAL_VIDEOS.map((item, index) => {
    const id = item.id || `local-video-${index + 1}`;
    return {
      id,
      src: item.src || '',
      thumb: VIDEO_THUMBS.get(id) || item.thumb || VIDEO_DEFAULT_THUMB,
      title: item.title || getVideoTitleFromSrc(item.src),
      meta: item.meta || '',
      thumbTime: Number.isFinite(item.thumbTime) ? item.thumbTime : 1.2,
    };
  }).filter(item => item.src);
}

function captureVideoThumbnail(src, seekTime = 1.2){
  return new Promise(resolve => {
    const video = document.createElement('video');
    let done = false;
    let timeoutId = null;

    const onError = ()=> finish('');
    const onSeeked = ()=> drawFrame();

    function cleanup(){
      if(timeoutId) clearTimeout(timeoutId);
      video.removeEventListener('error', onError);
      video.removeEventListener('seeked', onSeeked);
      try{ video.pause(); } catch {}
      try{
        video.removeAttribute('src');
        video.load();
      } catch {}
    }

    function finish(value){
      if(done) return;
      done = true;
      cleanup();
      resolve(value || '');
    }

    function drawFrame(){
      try{
        const width = video.videoWidth || 320;
        const height = video.videoHeight || 180;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if(!ctx){
          finish('');
          return;
        }
        ctx.drawImage(video, 0, 0, width, height);
        finish(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        finish('');
      }
    }

    function onLoadedData(){
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if(duration <= 0.05){
        drawFrame();
        return;
      }
      const target = Math.min(Math.max(seekTime, 0), Math.max(duration - 0.05, 0));
      if(target <= 0.01){
        drawFrame();
        return;
      }
      video.addEventListener('seeked', onSeeked, { once:true });
      try{
        video.currentTime = target;
      } catch {
        drawFrame();
      }
    }

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    timeoutId = setTimeout(()=>finish(''), 8000);
    video.addEventListener('error', onError, { once:true });
    video.addEventListener('loadeddata', onLoadedData, { once:true });
    video.src = src;
    video.load();
  });
}

function generateLocalVideoThumbnails(items){
  if(state && state.isMobile) return;
  const pending = (items || []).filter(item => item && item.id && item.src && !VIDEO_THUMBS.has(item.id));
  if(!pending.length) return;
  pending.forEach(item => {
    captureVideoThumbnail(item.src, item.thumbTime).then(thumb => {
      if(!thumb) return;
      VIDEO_THUMBS.set(item.id, thumb);
      const stateItem = (state.videos.items || []).find(v => v.id === item.id);
      if(!stateItem) return;
      stateItem.thumb = thumb;
      const cardPlayer = document.querySelector(`#win_videos [data-video-card="${item.id}"] .videos-card-player`);
      if(cardPlayer) cardPlayer.poster = thumb;
    });
  });
}

function renderVideosList(winEl, items){
  const win = winEl || document.getElementById('win_videos');
  if(!win) return;
  const list = win.querySelector('#videosList');
  if(!list) return;
  if(!items || items.length === 0){
    list.innerHTML = '';
    return;
  }
  list.innerHTML = items.map(it => {
    const meta = it.meta || '';
    const poster = it.thumb ? ` poster="${escapeHTML(it.thumb)}"` : '';
    return `
      <article class="videos-item bevel-in" data-video-card="${it.id}">
        <video class="videos-thumb videos-card-player pixel" src="${it.src}" controls playsinline webkit-playsinline preload="none"${poster}></video>
        <div class="videos-meta">
          <div class="videos-title">${escapeHTML(it.title)}</div>
          <div class="videos-sub">${escapeHTML(meta)}</div>
        </div>
      </article>
    `;
  }).join('');
  const players = list.querySelectorAll('.videos-card-player');
  players.forEach(player => {
    player.addEventListener('play', ()=>{
      players.forEach(other => {
        if(other !== player) other.pause();
      });
    });
  });
}

function initVideosWindow(winEl){
  const win = winEl || document.getElementById('win_videos');
  if(!win) return;
  state.videos.items = getLocalVideos();
  state.videos.selectedId = state.videos.items[0]?.id || null;
  renderVideosList(win, state.videos.items);
  generateLocalVideoThumbnails(state.videos.items);
}

function applyScanlines(){
  document.body.classList.toggle('scanlines', state.settings.scanlines);
  saveScanlines();
  updateScanlinesButtons();
}

function applyRetroGlow(){
  document.body.classList.toggle('retro-glow', state.settings.retroGlow);
  updateRetroGlowPalette();
  saveRetroGlow();
  updateRetroGlowButtons();
}

function applyOldCrt(){
  document.body.classList.toggle('old-crt', state.settings.oldCrt);
  saveOldCrt();
  updateOldCrtButtons();
}

function applyDarkMode(){
  const isBlissOS = state.settings.theme === 'blissos';
  document.body.classList.toggle('dark', !isBlissOS && state.settings.darkMode);
  document.body.dataset.blissosMode = (isBlissOS && state.settings.blissosDarkMode) ? 'dark' : 'classic';
  applyBlissOSAqua();
  if(!isBlissOS) saveDarkMode();
  updateDarkModeButtons();
  if(isBlissOS) updateBlissOSDarkButtons();
  renderCtxMenu();
  applyTitlebarTheme();
}

function applyWindowState(winEl, appId){
  if(appId === 'music') applyMusicState(winEl);
  if(appId === 'clothes') applyClothesState(winEl);
  if(appId === 'mediaplayer') applyMediaplayerState(winEl);
  if(appId === 'diev') applyDievState(winEl);
  if(appId === 'art') applyArtState(winEl);
}

function getPoemById(id){
  return POEMS.find(p => p.id === id) || null;
}

function getPoemBody(poem, lang){
  if(!poem) return '';
  if(lang === 'pt') return poem.body_pt || poem.body_en || '';
  return poem.body_en || poem.body_pt || '';
}

// Context menu state
let ctxState = { open:false, target:'desktop', appId:null, itemType:null, parentId:null, containerEl:null, dockId:null, lastX:0, lastY:0 };

function renderCtxMenu(){
  const menu = $('#ctxMenu');
  if(!menu) return;

  const isIcon = ctxState.target === 'icon' && !!ctxState.appId;
  const isDock = ctxState.target === 'dock' && !!ctxState.appId;
  const fsItem = ctxState.appId ? getFsItem(ctxState.appId) : null;
  const itemType = ctxState.itemType || (fsItem ? fsItem.type : null);
  const gridMark = state.gridSnap ? '✓' : '';

  const items = [];
  if(isDock){
    const disableRemove = ctxState.itemType === 'trash' || ctxState.appId === 'trash';
    items.push({ action:'removeDock', label:t('ctx.removeDock'), disabled: disableRemove });
    menu.innerHTML = items.map(it => {
      if(it.sep) return `<div class="ctx-sep"></div>`;
      const check = it.check ? `<span class="ctx-check" aria-hidden="true">${it.check}</span>` : `<span class="ctx-check" aria-hidden="true"></span>`;
      const right = it.right ? `<span class="ctx-shortcut">${it.right}</span>` : `<span class="ctx-shortcut"></span>`;
      const disabled = it.disabled ? ' disabled' : '';
      return `
        <button class="ctx-item${disabled}" type="button" role="menuitem" data-ctx-action="${it.action}" ${it.disabled ? 'disabled' : ''}>
          <span class="ctx-left">${check}<span>${it.label}</span></span>
          ${right}
        </button>
      `;
    }).join('');
    return;
  }
  if(isIcon){
    items.push({ action:'open', label:t('ctx.open') });
    items.push({ sep:true });
    if(ctxState.appId === 'trash'){
      items.push({ action:'emptyTrash', label:t('ctx.emptyTrash') });
      const docked = isDockItemPresent('trash', 'trash');
      items.push({ action:'addDock', label: docked ? t('ctx.alreadyDock') : t('ctx.addDock'), disabled: docked });
      items.push({ sep:true });
    } else {
      items.push({ action:'rename', label:t('ctx.rename') });
      items.push({ action:'crop', label:t('ctx.crop') });
      items.push({ action:'copy', label:t('ctx.copy') });
      if(itemType === 'txt'){
        items.push({ action:'duplicateTxt', label:t('ctx.duplicateTxt') });
      }
      if(isDockableItem(itemType, ctxState.appId)){
        const dockType = itemType === 'app' ? 'app' : itemType;
        const docked = isDockItemPresent(dockType, ctxState.appId);
        items.push({ action: docked ? 'removeDock' : 'addDock', label: t(docked ? 'ctx.removeDock' : 'ctx.addDock') });
      }
      items.push({ sep:true });
      items.push({ action:'moveTrash', label:t('ctx.moveTrash') });
      items.push({ sep:true });
    }
  }

  if(!isIcon){
    items.push({ action:'newTxt', label:t('ctx.newTextFile') });
    items.push({ action:'newFolder', label:t('ctx.newFolder') });
    items.push({ sep:true });
    items.push({ action:'arrange', label:t('ctx.arrange') });
    if(ctxState.parentId == null){
      items.push({ action:'grid', label:t('ctx.grid'), check:gridMark });
      items.push({ action:'wallpaper', label:t('ctx.wallpaper') });
      items.push({ sep:true });
      items.push({ action:'settings', label:t('ctx.settings') });
      items.push({ action:'language', label:t('ctx.language'), right: state.lang.toUpperCase() });
      items.push({ action:'about', label:t('ctx.about') });
      items.push({ sep:true });
      items.push({ action:'logoff', label:t('ctx.logoff') });
    }
  }

  menu.innerHTML = items.map(it => {
    if(it.sep) return `<div class="ctx-sep"></div>`;
    const check = it.check ? `<span class="ctx-check" aria-hidden="true">${it.check}</span>` : `<span class="ctx-check" aria-hidden="true"></span>`;
    const right = it.right ? `<span class="ctx-shortcut">${it.right}</span>` : `<span class="ctx-shortcut"></span>`;
    const disabled = it.disabled ? ' disabled' : '';
    return `
      <button class="ctx-item${disabled}" type="button" role="menuitem" data-ctx-action="${it.action}" ${it.disabled ? 'disabled' : ''}>
        <span class="ctx-left">${check}<span>${it.label}</span></span>
        ${right}
      </button>
    `;
  }).join('');
}

function positionCtxMenu(x, y){
  const menu = $('#ctxMenu');
  if(!menu) return;
  const area = $('#desktopArea').getBoundingClientRect();

  menu.classList.remove('hidden');
  menu.style.left = '0px';
  menu.style.top = '0px';
  const rect = menu.getBoundingClientRect();

  const maxX = area.left + area.width - rect.width - 6;
  const maxY = area.top + area.height - rect.height - 6;

  const px = clamp(x, area.left + 6, maxX);
  const py = clamp(y, area.top + 6, area.top + area.height - rect.height - 6);

  menu.style.left = (px - area.left) + 'px';
  menu.style.top = (py - area.top) + 'px';
}

function openCtxMenu(x, y, target='desktop', appId=null, opts = {}){
  if($('#desktop').classList.contains('hidden')) return;
  ctxState = {
    open: true,
    target,
    appId,
    itemType: opts.itemType || null,
    parentId: opts.parentId === undefined ? null : opts.parentId,
    containerEl: opts.containerEl || null,
    dockId: opts.dockId || null,
    lastX: Number.isFinite(x) ? x : 0,
    lastY: Number.isFinite(y) ? y : 0,
  };
  closeStartMenu();
  closeWindowMenu();
  renderCtxMenu();
  positionCtxMenu(x, y);
  const menu = $('#ctxMenu');
  if(menu){
    menu.classList.remove('hidden');
    menu.setAttribute('tabindex', '-1');
    if(document.activeElement && document.activeElement.blur) document.activeElement.blur();
    menu.focus();
  }
}

function closeCtxMenu(){
  const menu = $('#ctxMenu');
  if(!menu) return;
  menu.classList.add('hidden');
  ctxState = { open:false, target:'desktop', appId:null, itemType:null, parentId:null, containerEl:null, dockId:null, lastX:0, lastY:0 };
}

function handleCtxAction(action){
  if(action === 'open' && ctxState.target === 'icon' && ctxState.appId){
    openIconById(ctxState.appId);
  }
  if(action === 'rename' && ctxState.target === 'icon' && ctxState.appId && ctxState.appId !== 'trash'){
    const fsItem = getFsItem(ctxState.appId);
    const isFsRename = fsItem && fsItem.type !== 'app' && fsItem.type !== 'virtual';
    if(isFsRename){
      const current = fsItem.name || '';
      showInputDialog({
        titleKey: 'dialog.rename.title',
        descKey: 'dialog.rename.desc',
        value: current,
        confirmKey: 'dialog.rename.confirm',
        onConfirm: (val)=>{
          let next = String(val || '').trim();
          if(!next) return;
          if(fsItem.type === 'txt' && !next.toLowerCase().endsWith('.txt')){
            next += '.txt';
          }
          const base = fsItem.type === 'txt' ? next.replace(/\.txt$/i, '') : next;
          const unique = fsItem.type === 'txt'
            ? makeUniqueName(fsItem.parentId, base, 'txt')
            : makeUniqueName(fsItem.parentId, base);
          upsertFsItem({ id: fsItem.id, name: unique }, { save: false, syncIconPos: false });
          saveDesktopFs();
          renderIcons();
          refreshOpenFolderWindows();
          refreshOpenTxtWindows(fsItem.id);
        }
      });
      return;
    }
    const app = getAppById(ctxState.appId);
    const virtual = getVirtualIconById(ctxState.appId);
    const key = app ? app.titleKey : (virtual ? virtual.titleKey : null);
    if(!key) return;
    const current = state.iconLabels[ctxState.appId] || t(key);
    showInputDialog({
      titleKey: 'dialog.rename.title',
      descKey: 'dialog.rename.desc',
      value: current,
      confirmKey: 'dialog.rename.confirm',
      onConfirm: (val)=>{
        const next = String(val || '').trim();
        if(next){
          state.iconLabels[ctxState.appId] = next;
        } else {
          delete state.iconLabels[ctxState.appId];
        }
        saveIconLabels();
        if(fsItem){
          upsertFsItem({ id: fsItem.id, name: state.iconLabels[fsItem.id] || t(key) }, { save: false, syncIconPos: false });
          saveDesktopFs();
        }
        renderIcons();
      }
    });
  }
  if(action === 'crop' && ctxState.target === 'icon' && ctxState.appId){
    showMessage('dialog.notAvailable.title', 'dialog.notAvailable.body');
  }
  if(action === 'copy' && ctxState.target === 'icon' && ctxState.appId){
    const fsItem = getFsItem(ctxState.appId);
    const app = APPS.find(a => a.id === ctxState.appId);
    const label = fsItem ? getFsItemLabel(fsItem) : (app ? getIconLabel(app) : '');
    if(label){
      copyText(label).then(ok => ok && showMessage('dialog.copied.title', 'dialog.copied.body'));
    } else {
      showMessage('dialog.selectItem.title', 'dialog.selectItem.body');
    }
  }
  if(action === 'moveTrash' && ctxState.target === 'icon' && ctxState.appId){
    moveIconsToTrash([ctxState.appId]);
    refreshOpenFolderWindows();
  }
  if(action === 'emptyTrash' && ctxState.target === 'icon' && ctxState.appId === 'trash'){
    emptyTrash();
  }
  if(action === 'duplicateTxt' && ctxState.target === 'icon' && ctxState.appId){
    const dup = duplicateTxtFile(ctxState.appId);
    if(dup) openTxtFileWindow(dup.id);
  }
  if(action === 'addDock' && ctxState.appId){
    const type = ctxState.itemType === 'app' ? 'app' : ctxState.itemType;
    if(isDockableItem(type, ctxState.appId)){
      addDockItem(type, ctxState.appId);
    }
  }
  if(action === 'removeDock' && ctxState.appId){
    const type = ctxState.itemType === 'app' ? 'app' : ctxState.itemType;
    if(isDockableItem(type, ctxState.appId)){
      if(ctxState.appId === 'trash' || type === 'trash') return;
      removeDockItem(type, ctxState.appId);
    }
  }
  if(action === 'newTxt' && ctxState.target === 'desktop'){
    createTxtFile({ clientX: ctxState.lastX, clientY: ctxState.lastY, parentId: ctxState.parentId, containerEl: ctxState.containerEl });
  }
  if(action === 'newFolder' && ctxState.target === 'desktop'){
    createFolder({ clientX: ctxState.lastX, clientY: ctxState.lastY, parentId: ctxState.parentId, containerEl: ctxState.containerEl });
  }
  if(action === 'arrange') arrangeIcons(ctxState.parentId || null, ctxState.containerEl || null);
  if(action === 'grid'){
    state.gridSnap = !state.gridSnap;
    saveGridSnap();
    renderCtxMenu();
  }
  if(action === 'wallpaper'){
    openSettingsAndTab('appearance', 'settingsWallpaper');
  }
  if(action === 'settings') openApp('settings');
  if(action === 'language') toggleLang();
  if(action === 'about') openApp('about');
  if(action === 'logoff'){
    closeCtxMenu();
    closeStartMenu();
    doLogoff();
  }
}

// Long-press support (mobile/touch)
function installLongPress(el, getTarget){
  let timer = null;
  let start = null;
  let pointerId = null;
  const threshold = 8;
  const delay = 520;

  const clear = ()=>{
    if(timer){ clearTimeout(timer); timer = null; }
    start = null;
    if(pointerId !== null){
      try { el.releasePointerCapture(pointerId); } catch {}
      pointerId = null;
    }
  };

  el.addEventListener('pointerdown', (e)=>{
    if(e.pointerType !== 'touch') return;
    
    // Filter: if this is #desktopArea, don't start long-press if touch begins on interactive elements
    if(el.id === 'desktopArea'){
      const target = e.target;
      if(!target) return;
      // List of selectors to filter out (don't start long-press on these)
      const blockedSelectors = '.window, .icon, #startMenu, #ctxMenu, .menu-drop, .menu-sub, .modal, .blissos-menubar, .blissos-menu-drop, .blissos-appmenu-drop, .blissos-apple-menu';
      if(target.closest && target.closest(blockedSelectors)){
        return;
      }
    }
    
    start = { x:e.clientX, y:e.clientY };
    pointerId = e.pointerId;
    
    // Capture pointer to ensure pointerup/pointercancel arrives even if DOM changes
    try { el.setPointerCapture(pointerId); } catch {}
    
    timer = setTimeout(()=>{
      const tgt = getTarget ? getTarget() : { target:'desktop', appId:null };
      openCtxMenu(start.x, start.y, tgt.target, tgt.appId, { itemType: tgt.itemType, parentId: tgt.parentId, containerEl: tgt.containerEl });
      clear();
    }, delay);
  });

  el.addEventListener('pointermove', (e)=>{
    if(!start || !timer) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if(Math.hypot(dx,dy) > threshold){
      clear();
    }
  });

  el.addEventListener('pointerup', clear);
  el.addEventListener('pointercancel', clear);
}
