
      const $ = (sel, root=document) => root.querySelector(sel);
      const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

      // Normalize event target: text nodes -> parent element
      function getEventTargetEl(e){
        if(!e) return null;
        const path = (typeof e.composedPath === 'function') ? e.composedPath() : null;
        const first = (path && path.length) ? path[0] : e.target;
        if(!first) return null;
        // Text node -> use parent element
        if(first.nodeType === 3) return first.parentElement;
        // Element node
        if(first.nodeType === 1) return first;
        return first.parentElement || null;
      }

      // Short alias used throughout event handlers
      function ET(e){ return getEventTargetEl(e) || e.target; }

      // XSS Prevention: Escape HTML strings before rendering
      function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }

      // Mobile optimization: Pointer Events are handled natively without suppression

      // Debounce helper: prevents frequent storage writes
      function createDebounce(delay = 500){
        let timeoutId = null;
        return function debounced(fn){
          clearTimeout(timeoutId);
          timeoutId = setTimeout(fn, delay);
        };
      }
      
      // Debounce instances for localStorage operations
      const debounceIconSave = createDebounce(600);
      const debounceVolumeSave = createDebounce(500);

      const state = {
        user: null,
        windows: new Map(),
        zTop: 10,
        activeWindowId: null,
        selectedIconId: null,
        lang: 'en',
        wallpaper: 'classic',
        animations: true,
        music: {
          selected: new Set(),
          tileSize: 'large',
          openNewTab: true,
          showIcons: true,
        },
        clothes: {
          items: [],
          sort: 'new',
          preview: true,
        },
        mediaplayer: {
          selected: new Set(),
          shuffle: false,
          repeat: 'off',
          showPlaylist: true,
          compact: false,
          needsReimport: false,
        },
        diev: {
          textSize: 'normal',
          highContrast: false,
        },
        videos: {
          openNewTab: true,
          thumbSize: 'large',
          items: [],
          selectedId: null,
        },
        art: {
          zoom: 100,
        },
        settings: {
          blissosAccent: 'multicolor',
          scanlines: false,
          tab: 'general',
          darkMode: false,
          blissosDarkMode: false,
          retroGlow: false,
          clock24: true,
          oldCrt: false,
          masterVolume: 0.8,
          systemVolume: 0.8,
          systemSoundsEnabled: true,
          theme: 'bliss98',
          appOpenAnim: true,
        },
        theme: {
          preset: 'default',
          titlebar: 'defaultBlue',
          palette: 'default',
        },
        games: {
          view: 'list',
          selectedId: null,
          layout: 'grid',
          bigIcons: false,
        },
        folders: {
          games: [],
        },
        fs: {
          version: 1,
          items: {},
        },
        snake: {
          speed: 'normal',
          highScore: 0,
        },
        dopeSkate: {
          highScore: 0,
          preview: {
            active: false,
            loadout: {},
            selectedCategory: null,
            selectedItemId: null,
          },
        },
        trash: new Set(),
        iconLabels: {},
        trashSelection: new Set(),
        dockItems: [],
        dockAnimations: new Map(),
        poetry: {
          view: 'list',
          selectedId: null,
          currentId: null,
          readLang: 'en',
        },
        menuOpen: null,
        activeAppId: 'bliss',
        hiddenApps: new Set(),
        lastFocusedWindowByApp: {},
        gridSnap: true,
        autoPlayTimer: null,
        didAutoPlayThisSession: false,
      };
      

      // --- Mobile detection (used for UI + clock formatting) ---
      const MOBILE_MQ = window.matchMedia('(hover:none) and (pointer:coarse)');
      state.isMobile = !!MOBILE_MQ.matches;
      try{
        const onChange = (e) => {
          state.isMobile = !!(e && e.matches);
          if(typeof tickClock === 'function') tickClock();
          if(typeof scheduleWindowRelayout === 'function') scheduleWindowRelayout();
        };
        if(typeof MOBILE_MQ.addEventListener === 'function') MOBILE_MQ.addEventListener('change', onChange);
        else if(typeof MOBILE_MQ.addListener === 'function') MOBILE_MQ.addListener(onChange);
      } catch {}

      // Helper functions for OS mode detection
      function isBlissOS(){
        return state.settings.theme === 'blissos';
      }
      function isBliss98(){
        return state.settings.theme !== 'blissos';
      }

      const ICON_POS_KEY = 'bliss98_icon_positions';
      const ICON_SIZE = { w: 92, h: 88 };
      const ICON_GAP = { x: 12, y: 8 };
      const WALLPAPER_KEY = 'bliss98_wallpaper';
      const BLISSOS_ACCENT_KEY = 'bliss98_blissos_accent';
      const ANIMATIONS_KEY = 'bliss98_animations';
      const APP_OPEN_ANIM_KEY = 'bliss98_app_open_anim';
      const DESKTOP_FS_KEY = 'bliss98_desktop_fs_v1';
      const FOLDER_VIEW_FALLBACK_SIZE = { width: 520, height: 420 };
      const SCANLINES_KEY = 'bliss98_scanlines';
      const CLOCK_KEY = 'bliss98_clock24';
      const OLDCRT_KEY = 'bliss98_oldcrt';
      const MASTER_VOL_KEY = 'bliss98_master_volume';
      const SYSTEM_VOL_KEY = 'bliss98_system_volume';
      const SYSTEM_SOUNDS_ENABLED_KEY = 'bliss98_system_sounds_enabled';
      const DARKMODE_KEY = 'bliss98_darkmode';
      const TRASH_KEY = 'bliss98_trash';
      const ICON_LABELS_KEY = 'bliss98_icon_labels';
      const CLOTHES_CACHE_KEY = 'bliss98_clothes_cache';
      const CLOTHES_CACHE_TTL = 1000 * 60 * 60 * 3;
      const CLOTHES_PROFILE_USERNAME = 'blissworldweb';
      const CLOTHES_PROFILE_QUERY_ID = '34579740524958711';
      const CLOTHES_PROFILE_URL = 'https://www.instagram.com/blissworldweb/';
      const CLOTHES_SIZING_URL = 'https://www.instagram.com/direct/new/?username=blissworldweb';
      const SNAKE_HIGH_KEY = 'bliss98_snake_highscore';
      const DOPE_SKATE_HIGH_KEY = 'bliss98_dope_skate_highscore';
      const TITLEBAR_KEY = 'bliss98_titlebar_theme';
      const THEME_PRESET_KEY = 'bliss98_theme_preset';
      const THEME_CUSTOM_KEY = 'bliss98_theme_custom';
      const OS_THEME_KEY = 'bliss98_os_theme';
      const OS_PROFILE_KEY = 'bliss98_os_profiles';
      const FOLDER_KEY = 'bliss98_folders';
      const DOCK_KEY = 'bliss98_dock_items';
      const GAMES_VIEW_KEY = 'bliss98_games_view';
      const GAMES_BIG_KEY = 'bliss98_games_big';
      const DOCK_MOBILE_MAX_TOTAL = 9;
      const DOCK_MOBILE_MAX_NORMAL = 8;
const RETRO_KEY = 'bliss98_retro_glow';
const MOBILE_CONTROLS_KEY = 'bliss98_mobile_controls_mode';
      function loadMobileControlsMode(){
        try{
          const raw = localStorage.getItem(MOBILE_CONTROLS_KEY);
          return (raw === 'analog' || raw === 'dpad') ? raw : 'dpad';
        } catch {
          return 'dpad';
        }
      }

      function saveMobileControlsMode(mode){
        try{ localStorage.setItem(MOBILE_CONTROLS_KEY, mode); } catch {}
      }

      state.mobileControlsMode = loadMobileControlsMode();

      const SFX = {
        boot: {
          src: './assets/audio/boot.mp3',
          audio: null,
          played: false,
          pending: false,
          unlockArmed: false,
          playing: false,
        },
        logoff: {
          src: './assets/audio/logoff.mp3',
          audio: null,
          playing: false,
        },
        windowClose: {
          src: './assets/sounds/window-close.wav',
          audio: null,
          playing: false,
        },
        windowMinimize: {
          src: './assets/sounds/window-minimize.wav',
          audio: null,
          playing: false,
        },
        windowRestore: {
          src: './assets/sounds/window-restore.wav',
          audio: null,
          playing: false,
        },
        fileOpen: {
          src: './assets/sounds/file-open.wav',
          audio: null,
          playing: false,
        },
        trashMove: {
          src: './assets/sounds/trash-move.wav',
          audio: null,
          playing: false,
        },
        trashRestore: {
          src: './assets/sounds/trash-restore.wav',
          audio: null,
          playing: false,
        },
        trashEmpty: {
          src: './assets/sounds/trash-empty.wav',
          audio: null,
          playing: false,
        },
        tabChange: {
          src: './assets/sounds/tab-change.wav',
          audio: null,
          playing: false,
        },
      };
      const WALLPAPERS = [
        {
          id: 'blissos',
          labelKey: 'wallpaper.blissos',
          background: 'url("./assets/wallpapers/BlissOS.png")',
          size: 'cover',
          repeat: 'no-repeat',
          position: 'center'
        },
        {
          id: 'classic',
          labelKey: 'wallpaper.classic',
          background: '#008080',
          size: 'auto',
          repeat: 'repeat'
        },
        {
          id: 'bliss',
          labelKey: 'wallpaper.bliss',
          background: 'radial-gradient(circle at 20% 20%, #fff2c4 0%, #ffb77a 30%, #7fc7ff 65%, #1d5b9e 100%)',
          size: 'cover',
          repeat: 'no-repeat'
        },
        {
          id: 'clouds',
          labelKey: 'wallpaper.clouds',
          background: 'linear-gradient(180deg, #9ad0ff 0%, #cfe9ff 45%, #f7fbff 100%)',
          size: 'cover',
          repeat: 'no-repeat'
        },
        {
          id: 'diev',
          labelKey: 'wallpaper.diev',
          className: 'wallpaper-grid'
        },
        {
          id: 'tot',
          labelKey: 'wallpaper.tot',
          background: 'radial-gradient(circle at 20% 20%, #ffd1e6 0%, #ff9fcb 45%, #ff7fb7 100%), repeating-radial-gradient(circle, rgba(255,255,255,0.35) 0 1px, transparent 1px 10px)',
          size: 'cover',
          repeat: 'repeat'
        },
        {
          id: 'matrix',
          labelKey: 'wallpaper.matrix',
          className: 'wallpaper-matrix'
        },
        {
          id: 'blissxp',
          labelKey: 'wallpaper.blissxp',
          background: 'url("./assets/wallpapers/BlissXP.png")',
          size: 'cover',
          repeat: 'no-repeat',
          position: 'center'
        },
      ];

      const TITLEBAR_THEMES = {
        defaultBlue: { bar1:'#000080', bar2:'#1084d0', text:'#ffffff' },
        pinkLight: { bar1:'#f6a6cf', bar2:'#e46aa9', text:'#1a1a1a' },
        purple: { bar1:'#7b2cbf', bar2:'#5a189a', text:'#ffffff' },
        red: { bar1:'#cc2f2f', bar2:'#9a1f1f', text:'#ffffff' },
        orange: { bar1:'#f08a24', bar2:'#d16002', text:'#1a1a1a' },
        yellow: { bar1:'#f2d53c', bar2:'#d4b118', text:'#1a1a1a' },
        green: { bar1:'#2fa44f', bar2:'#1f7f39', text:'#ffffff' },
        graphite: { bar1:'#6b6f78', bar2:'#4f545d', text:'#ffffff' },
        purpleDark: { bar1:'#3a1c5a', bar2:'#1b0f30', text:'#f1f1f1' },
        offWhite: { bar1:'#e6e6e6', bar2:'#cfcfcf', text:'#1a1a1a' },
        greenDark: { bar1:'#1b4a2a', bar2:'#0e2e1a', text:'#f1f1f1' },
        redDark: { bar1:'#5a1a1a', bar2:'#2f0b0b', text:'#f1f1f1' },
        blank: { bar1:'#b6b6b6', bar2:'#c9c9c9', text:'#f1f1f1' },
        xpBlue: { bar1:'#0a2e8f', bar2:'#4f86d8', text:'#ffffff' },
      };

      const THEME_PRESETS = [
        { id:'default', nameKey:'theme.default', titlebarColor:'defaultBlue', wallpaperId:'classic', darkMode:false },
        { id:'totvers', nameKey:'theme.totvers', titlebarColor:'pinkLight', wallpaperId:'tot', darkMode:false },
        { id:'matrix', nameKey:'theme.matrix', titlebarColor:'greenDark', wallpaperId:'matrix', darkMode:true },
        { id:'xp98', nameKey:'theme.xp98', titlebarColor:'xpBlue', wallpaperId:'blissxp', darkMode:false },
        { id:'blank', nameKey:'theme.blank', titlebarColor:'blank', wallpaperId:'classic', darkMode:false },
      ];

      const VIRTUAL_ICONS = [
        { id:'snake', titleKey:'games.snake', iconFile:'./assets/icons/snake.png' },
        { id:'dope-skate', titleKey:'games.dopeSkate', iconFile:'./assets/icons/dope-skate.png' }
      ];

      function initSfx(){
        Object.values(SFX).forEach(entry => {
          entry.audio = new Audio(entry.src);
          entry.audio.preload = 'auto';
          entry.audio.volume = 0.5;
        });
        applySoundVolumes();
      }

      function playSfx(name){
        const entry = SFX[name];
        if(!entry || !entry.audio) return Promise.resolve(false);
        if(!areSystemSoundsEnabled()) return Promise.resolve(false);
        if(entry.playing) return Promise.resolve(false);
        entry.playing = true;
        try{
          entry.audio.currentTime = 0;
          const p = entry.audio.play();
          if(p && typeof p.then === 'function'){
            return p.then(()=>{
              entry.playing = false;
              return true;
            }).catch(()=>{
              entry.playing = false;
              return false;
            });
          }
          entry.playing = false;
          return Promise.resolve(true);
        } catch {
          entry.playing = false;
          return Promise.resolve(false);
        }
      }

      function playSfxOnce(name, opts = {}){
        const entry = SFX[name];
        if(!entry || entry.played) return Promise.resolve(false);
        return playSfx(name).then((ok)=>{
          if(ok){
            entry.played = true;
            entry.pending = false;
          } else if(opts.allowPending){
            entry.pending = true;
          }
          return ok;
        });
      }

      function playSfxAndWait(name){
        const entry = SFX[name];
        if(!entry || !entry.audio) return Promise.resolve(false);
        if(!areSystemSoundsEnabled()) return Promise.resolve(false);
        if(entry.playing) return Promise.resolve(false);
        entry.playing = true;
        return new Promise(resolve => {
          const audio = entry.audio;
          const cleanup = ()=>{
            audio.removeEventListener('ended', onEnd);
            audio.removeEventListener('error', onError);
          };
          const onEnd = ()=>{
            cleanup();
            entry.playing = false;
            resolve(true);
          };
          const onError = ()=>{
            cleanup();
            entry.playing = false;
            resolve(false);
          };
          audio.addEventListener('ended', onEnd, { once: true });
          audio.addEventListener('error', onError, { once: true });
          try{
            audio.currentTime = 0;
            const p = audio.play();
            if(p && typeof p.then === 'function'){
              p.catch(()=>{ onError(); });
            }
          } catch {
            onError();
          }
        });
      }

      function armBootUnlock(){
        const entry = SFX.boot;
        if(!entry || entry.played || !entry.pending || entry.unlockArmed) return;
        entry.unlockArmed = true;
        const loginEl = $('#login');
        if(!loginEl){
          entry.unlockArmed = false;
          return;
        }
        const handler = ()=>{
          if($('#login').classList.contains('hidden')){
            entry.pending = false;
            entry.unlockArmed = false;
            return;
          }
          playSfxOnce('boot').finally(()=>{
            entry.pending = false;
            entry.unlockArmed = false;
          });
        };
        const wrapped = ()=>{
          loginEl.removeEventListener('pointerdown', wrapped, true);
          loginEl.removeEventListener('keydown', wrapped, true);
          handler();
        };
        loginEl.addEventListener('pointerdown', wrapped, true);
        loginEl.addEventListener('keydown', wrapped, true);
      }

      function loadIconPositions(){
        try{
          const raw = localStorage.getItem(ICON_POS_KEY);
          return raw ? JSON.parse(raw) : {};
        } catch {
          return {};
        }
      }

      function saveIconPositions(pos){
        try{
          localStorage.setItem(ICON_POS_KEY, JSON.stringify(pos));
        } catch {}
      }

      function getTxtIconPath(osMode){
        return getIconFor('./assets/icons/txt.png', osMode);
      }

      function getFolderIconPath(osMode){
        return getIconFor('./assets/icons/folder.png', osMode);
      }

      function loadDesktopFs(){
        try{
          const raw = localStorage.getItem(DESKTOP_FS_KEY);
          if(!raw) return {};
          const parsed = JSON.parse(raw);
          if(!parsed || !Array.isArray(parsed.items)) return {};
          const items = {};
          parsed.items.forEach(it => {
            if(it && it.id) items[it.id] = it;
          });
          return items;
        } catch {
          return {};
        }
      }

      function saveDesktopFs(){
        try{
          const items = Object.values(state.fs.items || {});
          localStorage.setItem(DESKTOP_FS_KEY, JSON.stringify({ version: state.fs.version || 1, items }));
        } catch {}
      }

      function getFsItem(id){
        if(!id || !state.fs || !state.fs.items) return null;
        return state.fs.items[id] || null;
      }

      function getFsChildren(parentId){
        const items = Object.values(state.fs.items || {});
        return items.filter(it => (it.parentId || null) === (parentId || null) && !state.trash.has(it.id));
      }

      function isAppLikeItem(item){
        return !!item && (item.type === 'app' || item.type === 'virtual');
      }

      function updateIconStorageForItem(item, iconPosCache){
        if(!isAppLikeItem(item)) return;
        const saved = iconPosCache || loadIconPositions();
        if(item.parentId == null && Number.isFinite(item.x) && Number.isFinite(item.y)){
          saved[item.id] = { x: item.x, y: item.y };
        } else {
          delete saved[item.id];
        }
        if(!iconPosCache) saveIconPositions(saved);
      }

      function upsertFsItem(item, opts = {}){
        if(!item || !item.id) return null;
        const existing = getFsItem(item.id);
        const now = Date.now();
        const next = {
          ...(existing || {}),
          ...item,
          parentId: item.parentId === undefined ? (existing ? existing.parentId : null) : (item.parentId || null),
          updatedAt: now,
          createdAt: existing && existing.createdAt ? existing.createdAt : (item.createdAt || now),
        };
        state.fs.items[next.id] = next;
        if(opts.syncIconPos !== false) updateIconStorageForItem(next, opts.iconPosCache);
        if(opts.save !== false) saveDesktopFs();
        return next;
      }

      function ensureFsItemForApp(appId, opts = {}){
        if(!appId) return null;
        const app = getAppById(appId);
        const virtual = getVirtualIconById(appId);
        if(!app && !virtual) return null;

        const existing = getFsItem(appId);
        if(existing) return existing;

        const saved = loadIconPositions();
        const layout = getDefaultIconLayout();
        const allDesktop = APPS.filter(a => a.showOnDesktop !== false).map(a => a.id)
          .concat(VIRTUAL_ICONS.map(v => v.id));
        const idx = Math.max(0, allDesktop.indexOf(appId));
        const def = layout[appId] || legacyDefaultIconPos(idx);
        const pos = saved[appId] || def;

        const item = {
          id: appId,
          type: app ? 'app' : 'virtual',
          appId,
          name: app ? t(app.titleKey) : t(virtual.titleKey),
          parentId: null,
          x: pos.x,
          y: pos.y,
        };
        return upsertFsItem(item, { save: opts.save, syncIconPos: true });
      }

      function initDesktopFs(){
        state.fs.items = loadDesktopFs();
        if(!state.fs.items || typeof state.fs.items !== 'object') state.fs.items = {};

        const iconPosCache = loadIconPositions();
        const layout = getDefaultIconLayout();
        let iconPosDirty = false;

        const syncAppItem = (id, type, titleKey)=>{
          const existing = getFsItem(id);
          const idx = APPS.concat(VIRTUAL_ICONS).findIndex(it => it.id === id);
          const def = layout[id] || legacyDefaultIconPos(Math.max(0, idx));
          const saved = iconPosCache[id] || def;
          const base = existing || { id, type, appId: id };
          const parentId = base.parentId || null;
          const needsPos = parentId == null;
          const x = needsPos ? (Number.isFinite(base.x) ? base.x : saved.x) : base.x;
          const y = needsPos ? (Number.isFinite(base.y) ? base.y : saved.y) : base.y;
          const next = {
            ...base,
            id,
            type,
            appId: id,
            name: state.iconLabels[id] || t(titleKey),
            parentId,
          };
          if(needsPos){
            next.x = x;
            next.y = y;
            iconPosCache[id] = { x, y };
            iconPosDirty = true;
          }
          state.fs.items[id] = next;
        };

        APPS.filter(app => app.showOnDesktop !== false).forEach(app => {
          syncAppItem(app.id, 'app', app.titleKey);
        });
        VIRTUAL_ICONS.forEach(v => syncAppItem(v.id, 'virtual', v.titleKey));

        if(iconPosDirty) saveIconPositions(iconPosCache);
        saveDesktopFs();
      }

      function legacyDefaultIconPos(index){
        // Layout similar to the old grid: 6 rows then new column
        const rows = 6;
        const col = Math.floor(index / rows);
        const row = index % rows;
        return {
          x: col * (ICON_SIZE.w + ICON_GAP.x),
          y: row * (ICON_SIZE.h + ICON_GAP.y)
        };
      }

      function defaultIconPos(index){
        // Layout similar to the old grid: 6 rows then new column
        const rows = 6;
        const col = Math.floor(index / rows);
        const row = index % rows;
        return {
          x: col * (ICON_SIZE.w + ICON_GAP.x),
          y: row * (ICON_SIZE.h + ICON_GAP.y)
        };
      }

      function clampIconPos(x, y){
        const area = $('#desktopArea').getBoundingClientRect();
        const maxX = Math.max(0, Math.floor(area.width - ICON_SIZE.w - 6));
        const maxY = Math.max(0, Math.floor(area.height - ICON_SIZE.h - 6));
        return {
          x: clamp(Math.floor(x), 0, maxX),
          y: clamp(Math.floor(y), 0, maxY)
        };
      }
      const GRID_SNAP_KEY = 'bliss98_grid_snap';

function loadGridSnap(){
  try{
    const raw = localStorage.getItem(GRID_SNAP_KEY);
    if(raw === null) return true;
    return raw === '1';
  } catch {
    return true;
  }
}

function saveGridSnap(){
  try{
    localStorage.setItem(GRID_SNAP_KEY, state.gridSnap ? '1' : '0');
  } catch {}
}

function snapToGrid(x, y){
  const stepX = ICON_SIZE.w + ICON_GAP.x;
  const stepY = ICON_SIZE.h + ICON_GAP.y;
  const sx = Math.round(x / stepX) * stepX;
  const sy = Math.round(y / stepY) * stepY;
  return clampIconPos(sx, sy);
}

function getGridMetrics(){
  const area = $('#desktopArea').getBoundingClientRect();
  return getGridMetricsForSize(area.width, area.height);
}

function getGridMetricsForSize(width, height){
  const stepX = ICON_SIZE.w + ICON_GAP.x;
  const stepY = ICON_SIZE.h + ICON_GAP.y;
  const cols = Math.max(1, Math.floor((width - 6) / stepX));
  const rows = Math.max(1, Math.floor((height - 6) / stepY));
  return { stepX, stepY, cols, rows };
}

function getGridMetricsForContainer(containerEl){
  if(!containerEl) return getGridMetrics();
  return getGridMetricsForSize(containerEl.clientWidth, containerEl.clientHeight);
}

function getFolderGridMetrics(containerEl, items, extraSlots = 0){
  const base = containerEl
    ? getGridMetricsForContainer(containerEl)
    : getGridMetricsForSize(FOLDER_VIEW_FALLBACK_SIZE.width, FOLDER_VIEW_FALLBACK_SIZE.height);
  if(containerEl && containerEl.dataset && containerEl.dataset.folderView !== '1'){
    return base;
  }
  const stepX = base.stepX;
  const stepY = base.stepY;
  const cols = base.cols;
  let rows = base.rows;
  let maxRow = rows - 1;
  (items || []).forEach(it => {
    if(!Number.isFinite(it.y)) return;
    const row = Math.round(it.y / stepY);
    if(row > maxRow) maxRow = row;
  });
  const count = (items ? items.length : 0) + (extraSlots || 0);
  const minRows = cols > 0 ? Math.ceil(count / cols) : count;
  rows = Math.max(rows, minRows, maxRow + 1);
  return { stepX, stepY, cols, rows };
}

function snapToGridClamped(x, y, metrics){
  const snapped = snapToGrid(x, y);
  const maxX = (metrics.cols - 1) * metrics.stepX;
  const maxY = (metrics.rows - 1) * metrics.stepY;
  return {
    x: clamp(snapped.x, 0, maxX),
    y: clamp(snapped.y, 0, maxY)
  };
}

function gridCellFromPos(x, y, metrics){
  return {
    col: clamp(Math.round(x / metrics.stepX), 0, metrics.cols - 1),
    row: clamp(Math.round(y / metrics.stepY), 0, metrics.rows - 1)
  };
}

function gridPosFromCell(cell, metrics){
  return { x: cell.col * metrics.stepX, y: cell.row * metrics.stepY };
}

function findFreeCell(startCell, occupied, metrics){
  const total = metrics.cols * metrics.rows;
  const startIdx = startCell.row * metrics.cols + startCell.col;
  for(let i = 0; i < total; i++){
    const idx = (startIdx + i) % total;
    const col = idx % metrics.cols;
    const row = Math.floor(idx / metrics.cols);
    const key = `${col},${row}`;
    if(!occupied.has(key)){
      return { col, row };
    }
  }
  return startCell;
}

function placeOnFreeCell(x, y, occupied, metrics){
  const snapped = snapToGridClamped(x, y, metrics);
  const cell = gridCellFromPos(snapped.x, snapped.y, metrics);
  const key = `${cell.col},${cell.row}`;
  const targetCell = occupied.has(key) ? findFreeCell(cell, occupied, metrics) : cell;
  const pos = gridPosFromCell(targetCell, metrics);
  occupied.set(`${targetCell.col},${targetCell.row}`, true);
  return {
    x: pos.x,
    y: pos.y,
    changed: targetCell.col !== cell.col || targetCell.row !== cell.row || pos.x !== snapped.x || pos.y !== snapped.y
  };
}

function getIconLabel(app){
  return state.iconLabels[app.id] || t(app.titleKey);
}

function getIconFor(key, osMode){
  const theme = osMode || state.settings.theme || 'bliss98';
  const resolved = (typeof key === 'function') ? key() : key;
  if(!resolved) return iconSVG('file', theme);
  if(typeof resolved === 'string'){
    const trimmed = resolved.trim();
    if(trimmed.startsWith('<svg')) return trimmed;
    const looksLikePath = trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('/') || trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('/assets/');
    if(looksLikePath){
      return (theme === 'blissos') ? getBlissOSAssetPath(trimmed) : trimmed;
    }
    return iconSVG(trimmed, theme);
  }
  return iconSVG('file', theme);
}

function getThemedIconHtml(item, label, size=32){
  const theme = state.settings.theme || 'bliss98';
  const iconFile = typeof item.iconFile === 'function' ? item.iconFile() : item.iconFile;
  const iconKey = iconFile || item.icon || 'file';
  const icon = getIconFor(iconKey, theme);
  if(typeof icon === 'string' && icon.trim().startsWith('<svg')){
    return icon;
  }
  const src = (typeof icon === 'string') ? icon : '';
  const fallback = theme === 'blissos' ? getBlissOSFallbackPath(src) : '';
  const fbAttr = fallback ? ` data-fallback-src="${fallback}"` : '';
  const idAttr = item && item.id ? ` data-app-id="${item.id}"` : '';
  return `<img class="pixel" src="${src}"${fbAttr}${idAttr} width="${size}" height="${size}" alt="${label}" style="display:block;" />`;
}

function getFsIconHtml(item, label, size = 32){
  if(!item) return iconSVG('file', state.settings.theme);
  if(item.type === 'app'){
    const app = getAppById(item.appId || item.id);
    return app ? getThemedIconHtml(app, label, size) : iconSVG('app', state.settings.theme);
  }
  if(item.type === 'virtual'){
    const virtual = getVirtualIconById(item.appId || item.id);
    return virtual ? getThemedIconHtml({ icon: 'game', id: virtual.id, iconFile: virtual.iconFile }, label, size) : iconSVG('game', state.settings.theme);
  }
  if(item.type === 'folder'){
    const src = getFolderIconPath();
    const fallback = isBlissOS() ? getBlissOSFallbackPath(src) : '';
    const fbAttr = fallback ? ` data-fallback-src="${fallback}"` : '';
    return `<img class="pixel" src="${src}"${fbAttr} width="${size}" height="${size}" alt="${label}" style="display:block;" />`;
  }
  if(item.type === 'txt'){
    const src = getTxtIconPath();
    const fallback = isBlissOS() ? getBlissOSFallbackPath(src) : '';
    const fbAttr = fallback ? ` data-fallback-src="${fallback}"` : '';
    return `<img class="pixel" src="${src}"${fbAttr} width="${size}" height="${size}" alt="${label}" style="display:block;" />`;
  }
  return iconSVG('file', state.settings.theme);
}

function getTrashIconFile(osMode){
  const base = state.trash && state.trash.size > 0
    ? './assets/icons/trash2.png'
    : './assets/icons/trash1.png';
  return getIconFor(base, osMode);
}

function updateTrashIconUI(){
  const trashFile = getTrashIconFile();
  const fallback = getBlissOSFallbackPath(trashFile);

  const desktopIcon = document.querySelector('.icon[data-app-id="trash"] img');
  if(desktopIcon) setImageWithFallback(desktopIcon, trashFile, fallback);

  const startIcon = document.querySelector('#startMenu .menu-item img[data-app-id="trash"]');
  if(startIcon) setImageWithFallback(startIcon, trashFile, fallback);

  const win = document.getElementById('win_trash');
  if(win){
    const titleIcon = win.querySelector('.title-left img');
    if(titleIcon) setImageWithFallback(titleIcon, trashFile, fallback);
  }

  const taskBtn = document.querySelector('#taskButtons img[data-app-id="trash"]');
  if(taskBtn) setImageWithFallback(taskBtn, trashFile, fallback);
  if(state.settings.theme === 'blissos') renderBlissOSDock();
}

function buildOccupied(excludeIds, metrics){
  const occupied = new Map();
  const exclude = new Set(excludeIds || []);
  $$('.icon').forEach(el => {
    const id = el.dataset.appId;
    if(exclude.has(id)) return;
    const x = parseInt(el.style.left || '0', 10);
    const y = parseInt(el.style.top || '0', 10);
    const cell = gridCellFromPos(x, y, metrics);
    occupied.set(`${cell.col},${cell.row}`, true);
  });
  return occupied;
}

function buildOccupiedFromFs(parentId, excludeIds, metrics, opts = {}){
  const occupied = new Map();
  const exclude = new Set(excludeIds || []);
  const visibleOnly = !!opts.visibleOnly && parentId == null;
  const baseItems = parentId == null ? getFsChildren(parentId) : getRenderableFsChildren(parentId);
  const items = visibleOnly ? baseItems.filter(isDesktopVisibleItem) : baseItems;
  items.forEach(it => {
    if(exclude.has(it.id)) return;
    if(!Number.isFinite(it.x) || !Number.isFinite(it.y)) return;
    const cell = gridCellFromPos(it.x, it.y, metrics);
    occupied.set(`${cell.col},${cell.row}`, true);
  });
  return occupied;
}

function getDefaultIconLayout(){
  const area = $('#desktopArea').getBoundingClientRect();
  const metrics = getGridMetrics();
  const isMobile = area.width <= 520;
  const order = ['settings','games','about','videos','mediaplayer','diev','art','contact','poetry','music','clothes'];
  const available = APPS.filter(app => app.showOnDesktop !== false && app.id !== 'trash' && !state.trash.has(app.id) && !isInFolder(app.id));
  const availableIds = new Set(available.map(app => app.id));
  const ordered = order.filter(id => availableIds.has(id)).concat(
    available.map(app => app.id).filter(id => !order.includes(id))
  );

  const layout = {};
  const maxX = Math.max(0, Math.floor(area.width - ICON_SIZE.w - 6));
  const maxY = Math.max(0, Math.floor(area.height - ICON_SIZE.h - 6));

  if(isMobile){
    const cols = Math.max(1, Math.floor((area.width - 6) / metrics.stepX));
    const rows = Math.max(1, Math.floor((area.height - 6) / metrics.stepY));
    const trashCell = { col: cols - 1, row: rows - 1 };
    let i = 0;
    ordered.forEach(id => {
      let col = i % cols;
      let row = Math.floor(i / cols);
      if(col === trashCell.col && row === trashCell.row){
        i += 1;
        col = i % cols;
        row = Math.floor(i / cols);
      }
      const x = clamp(col * metrics.stepX, 0, maxX);
      const y = clamp(row * metrics.stepY, 0, maxY);
      layout[id] = snapToGridClamped(x, y, metrics);
      i += 1;
    });
  } else {
    let col = 0;
    let row = 0;
    const maxRows = Math.max(1, Math.floor((area.height - 6) / metrics.stepY));
    ordered.forEach(id => {
      const x = clamp(col * metrics.stepX, 0, maxX);
      const y = clamp(row * metrics.stepY, 0, maxY);
      layout[id] = snapToGridClamped(x, y, metrics);
      row += 1;
      if(row >= maxRows){
        row = 0;
        col += 1;
      }
    });
  }

  const trashX = snapToGridClamped(maxX, maxY, metrics).x;
  const trashY = snapToGridClamped(maxX, maxY, metrics).y;
  layout.trash = { x: trashX, y: trashY };

  return layout;
}

function isOverTrash(x, y){
  const trashEl = document.querySelector('.icon[data-app-id="trash"]');
  if(!trashEl) return false;
  const r = trashEl.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function moveIconsToTrash(ids){
  const filtered = ids.filter(id => id && id !== 'trash');
  if(filtered.length === 0) return;
  const changed = filtered.some(id => !state.trash.has(id));
  if(!changed) return;
  playSfx('trashMove');
  filtered.forEach(id => state.trash.add(id));
  Object.keys(state.folders).forEach(folderId => {
    removeFromFolder(folderId, filtered);
  });
  state.trashSelection = new Set();
  saveTrash();
  renderIcons();
  refreshOpenFolderWindows();
  renderTrashWindow();
  updateTrashIconUI();
}

function restoreFromTrash(ids){
  const filtered = ids.filter(id => id && id !== 'trash');
  if(filtered.length === 0) return;
  const changed = filtered.some(id => state.trash.has(id));
  if(!changed) return;
  playSfx('trashRestore');
  filtered.forEach(id => state.trash.delete(id));
  Object.keys(state.folders).forEach(folderId => {
    removeFromFolder(folderId, filtered);
  });
  state.trashSelection = new Set();
  saveTrash();
  renderIcons();
  refreshOpenFolderWindows();
  renderTrashWindow();
  updateTrashIconUI();
}

function isCoreFsItem(id){
  if(!id || id === 'trash') return true;
  const item = getFsItem(id);
  if(item) return item.type === 'app' || item.type === 'virtual';
  return !!getAppById(id) || !!getVirtualIconById(id);
}

function collectFolderDescendants(folderId){
  const items = Object.values(state.fs.items || {});
  const byParent = new Map();
  items.forEach(it => {
    const pid = it.parentId || null;
    if(!byParent.has(pid)) byParent.set(pid, []);
    byParent.get(pid).push(it.id);
  });
  const out = [];
  const stack = [folderId];
  const seen = new Set();
  while(stack.length){
    const cur = stack.pop();
    if(!cur || seen.has(cur)) continue;
    seen.add(cur);
    out.push(cur);
    const children = byParent.get(cur) || [];
    children.forEach(id => stack.push(id));
  }
  return out;
}

function restoreCoreItemToDesktop(id, iconPosCache){
  const item = getFsItem(id) || ensureFsItemForApp(id, { save: false });
  if(!item) return false;
  const preferred = (Number.isFinite(item.originalDesktopX) && Number.isFinite(item.originalDesktopY))
    ? { x: item.originalDesktopX, y: item.originalDesktopY }
    : { x: item.x || 0, y: item.y || 0 };
  const placed = getFreeIconPlacement(null, preferred, null, [id]);
  upsertFsItem({
    id,
    parentId: null,
    x: placed.x,
    y: placed.y,
  }, { save: false, syncIconPos: true, iconPosCache });
  state.trash.delete(id);
  removeFromFolder('games', [id]);
  return true;
}

function restoreCoreAppsFromFolder(folderId, iconPosCache){
  const ids = collectFolderDescendants(folderId);
  ids.forEach(id => {
    if(isCoreFsItem(id)) restoreCoreItemToDesktop(id, iconPosCache);
  });
}

function hardDeleteItem(itemId, iconPosCache){
  const item = getFsItem(itemId);
  if(!item){
    state.trash.delete(itemId);
    return;
  }
  if(isCoreFsItem(itemId)){
    restoreCoreItemToDesktop(itemId, iconPosCache);
    return;
  }
  if(item.type === 'txt'){
    closeApp(getTxtWindowId(itemId));
    delete state.fs.items[itemId];
    state.trash.delete(itemId);
    return;
  }
  if(item.type === 'folder'){
    restoreCoreAppsFromFolder(itemId, iconPosCache);
    const ids = collectFolderDescendants(itemId);
    ids.forEach(id => {
      if(isCoreFsItem(id)) return;
      const it = getFsItem(id);
      if(!it) return;
      if(it.type === 'txt') closeApp(getTxtWindowId(id));
      if(it.type === 'folder') closeApp(getFolderWindowId(id));
      delete state.fs.items[id];
      state.trash.delete(id);
    });
    return;
  }
  delete state.fs.items[itemId];
  state.trash.delete(itemId);
}

function hardDeleteTrashContents(){
  const ids = Array.from(state.trash);
  if(ids.length === 0) return;
  playSfx('trashEmpty');
  const iconPosCache = loadIconPositions();
  ids.forEach(id => hardDeleteItem(id, iconPosCache));
  state.trash = new Set();
  state.trashSelection = new Set();
  saveIconPositions(iconPosCache);
  saveDesktopFs();
  saveTrash();
  renderIcons();
  refreshOpenFolderWindows();
  renderTrashWindow();
  updateTrashIconUI();
}

function emptyTrash(opts = {}){
  if(state.trash.size === 0) return;
  if(opts.confirm === false){
    hardDeleteTrashContents();
    return;
  }
  showModal({
    title: t('dialog.trash.confirmTitle'),
    body: `<p style="margin:0;">${t('dialog.trash.confirmBody')}</p>`,
    actions: [
      { label: t('dialog.trash.deleteAction'), action: 'confirm', primary: true },
      { label: t('common.cancel'), action: 'close' }
    ]
  });
  modalState.onConfirm = ()=>{
    emptyTrash({ confirm: false });
  };
}

function renderTrashWindow(){
  const win = document.getElementById('win_trash');
  if(!win) return;
  const content = win.querySelector('.content');
  if(!content) return;
  content.innerHTML = CONTENT.trash();
  applyI18nTo(win);
  content.classList.toggle('trash-empty', state.trash.size === 0);
  const items = win.querySelectorAll('[data-trash-id]');
  items.forEach(item => {
    const id = item.dataset.trashId;
    item.classList.toggle('selected', state.trashSelection.has(id));
  });
  const restoreBtn = win.querySelector('[data-trash-action="restore"]');
  const restoreAllBtn = win.querySelector('[data-trash-action="restoreAll"]');
  if(restoreBtn) restoreBtn.disabled = state.trash.size === 0;
  if(restoreAllBtn) restoreAllBtn.disabled = state.trash.size === 0;
  smartFitWindow(win, 'tabChange');
}

function renderPoetryWindow(){
  const win = document.getElementById('win_poetry');
  if(!win) return;
  const content = win.querySelector('.content');
  if(!content) return;
  content.innerHTML = CONTENT.poetry();
  applyI18nTo(win);
  const items = win.querySelectorAll('[data-poem-id]');
  items.forEach(item => {
    const id = item.dataset.poemId;
    item.classList.toggle('selected', state.poetry.selectedId === id);
  });
  smartFitWindow(win, 'tabChange');
}

function renderSettingsWindow(){
  const win = document.getElementById('win_settings');
  if(!win) return;
  const content = win.querySelector('.content');
  if(!content) return;
  const keepTab = state.settings.tab;
  content.innerHTML = CONTENT.settings();
  applyI18nTo(win);
  initSettingsTabs(win);
  applySettingsIcons(win);
  smartFitWindow(win, 'tabChange');
}

function updateOpenWindowTitleIcons(){
  state.windows.forEach((w) => {
    const winEl = document.getElementById(`win_${w.id}`);
    if(!winEl) return;
    const iconHost = winEl.querySelector('[data-win-title-icon]');
    if(iconHost){
      iconHost.innerHTML = getThemedIconHtml(w, w.title, 16);
    }
  });
}
