/* AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY. */
/* Source modules: assets/js/modules/*.js (see order.json) */

/* ===== Module: 01-core.js ===== */

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
          bliss98Accent: 'classic',
          blissosAccent: 'multicolor',
          scanlines: false,
          tab: 'general',
          darkMode: false,
          blissosDarkMode: false,
          blissosAqua: false,
          dockSize: 58,
          dockMagnification: true,
          dockMagnificationStrength: 60,
          dockOpacity: 100,
          dockAutoHide: false,
          showDesktopIcons: true,
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
        seeker: {
          section: 'desktop',
          view: 'icons',
          search: '',
          history: ['desktop'],
          historyIndex: 0,
          recent: [],
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
      function normalizeOsThemeChoice(theme){
        if(theme === 'blissos' || theme === 'blissaqua' || theme === 'bliss98') return theme;
        return 'bliss98';
      }
      function getCurrentOsThemeChoice(){
        const normalized = normalizeOsThemeChoice(state.settings.theme || 'bliss98');
        if(normalized === 'blissaqua') return 'blissaqua';
        if(normalized === 'blissos') return state.settings.blissosAqua ? 'blissaqua' : 'blissos';
        return 'bliss98';
      }
      function isBlissOS(){
        const theme = normalizeOsThemeChoice(state.settings.theme || 'bliss98');
        return theme === 'blissos' || theme === 'blissaqua';
      }
      function isBliss98(){
        return !isBlissOS();
      }
      function shouldAlignDesktopIconsRight(){
        return isBlissOS();
      }

      const ICON_POS_KEY = 'bliss98_icon_positions';
      const ICON_SIZE = { w: 92, h: 88 };
      const ICON_GAP = { x: 12, y: 8 };
      const WALLPAPER_KEY = 'bliss98_wallpaper';
      const BLISS98_ACCENT_KEY = 'bliss98_bliss98_accent';
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
      const DESKTOP_ICONS_KEY = 'bliss98_show_desktop_icons';
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
          id: 'aqua',
          labelKey: 'wallpaper.aqua',
          background: 'url("./assets/wallpapers/Aqua.png")',
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
          background: 'url("./assets/wallpapers/clouds.png")',
          size: 'cover',
          repeat: 'no-repeat',
          position: 'center'
        },
        {
          id: 'galaxy',
          labelKey: 'wallpaper.galaxy',
          background: 'url("./assets/wallpapers/galaxy.png")',
          size: 'cover',
          repeat: 'no-repeat',
          position: 'center'
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
        {
          id: 'scarbliss',
          labelKey: 'wallpaper.scarbliss',
          background: 'url("./assets/wallpapers/scarbliss.png")',
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
        scarbliss: { bar1:'#080808', bar2:'#000000', text:'#f4f4f4' },
        blank: { bar1:'#b6b6b6', bar2:'#c9c9c9', text:'#f1f1f1' },
        xpBlue: { bar1:'#0a2e8f', bar2:'#4f86d8', text:'#ffffff' },
      };

      const THEME_PRESETS = [
        { id:'default', nameKey:'theme.default', titlebarColor:'defaultBlue', wallpaperId:'classic', darkMode:false },
        { id:'totvers', nameKey:'theme.totvers', titlebarColor:'pinkLight', wallpaperId:'tot', darkMode:false },
        { id:'matrix', nameKey:'theme.matrix', titlebarColor:'greenDark', wallpaperId:'matrix', darkMode:true },
        { id:'xp98', nameKey:'theme.xp98', titlebarColor:'xpBlue', wallpaperId:'blissxp', darkMode:false },
        { id:'scarbliss', nameKey:'theme.scarbliss', titlebarColor:'scarbliss', wallpaperId:'scarbliss', darkMode:true },
        { id:'blank', nameKey:'theme.blank', titlebarColor:'blank', wallpaperId:'classic', darkMode:false },
      ];

      const VIRTUAL_ICONS = [
        { id:'snake', titleKey:'games.snake', iconFile:'./assets/icons/snake.png' }
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
          const key = `${ICON_POS_KEY}_${getCurrentOsThemeChoice()}`;
          const raw = localStorage.getItem(key);
          if(raw){
            const parsed = JSON.parse(raw);
            if(parsed && typeof parsed === 'object') return parsed;
          }
          const legacy = localStorage.getItem(ICON_POS_KEY);
          return legacy ? JSON.parse(legacy) : {};
        } catch {
          return {};
        }
      }

      function saveIconPositions(pos){
        try{
          const key = `${ICON_POS_KEY}_${getCurrentOsThemeChoice()}`;
          localStorage.setItem(key, JSON.stringify(pos));
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
          const hasSaved = !!iconPosCache[id];
          const saved = hasSaved ? iconPosCache[id] : def;
          const base = existing || { id, type, appId: id };
          const parentId = base.parentId || null;
          const needsPos = parentId == null;
          const x = needsPos ? (hasSaved ? saved.x : (Number.isFinite(base.x) ? base.x : saved.x)) : base.x;
          const y = needsPos ? (hasSaved ? saved.y : (Number.isFinite(base.y) ? base.y : saved.y)) : base.y;
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

function loadDesktopIconsVisible(){
  try{
    const raw = localStorage.getItem(DESKTOP_ICONS_KEY);
    if(raw === null) return true;
    return raw !== '0';
  } catch {
    return true;
  }
}

function saveDesktopIconsVisible(){
  try{
    localStorage.setItem(DESKTOP_ICONS_KEY, state.settings.showDesktopIcons === false ? '0' : '1');
  } catch {}
}

function applyDesktopIconsVisibility(){
  const show = state.settings.showDesktopIcons !== false;
  const area = $('#desktopArea');
  const grid = $('#iconGrid');
  if(area){
    area.dataset.desktopIcons = show ? '1' : '0';
  }
  if(grid){
    grid.style.display = show ? '' : 'none';
  }
  document.body.dataset.desktopIcons = show ? '1' : '0';
  if(!show){
    state.selectedIconId = null;
    if(typeof clearAllIconSelection === 'function'){
      clearAllIconSelection();
    }
  }
}

function setDesktopIconsVisible(enabled){
  const next = enabled !== false;
  if(state.settings.showDesktopIcons === next){
    applyDesktopIconsVisibility();
    return;
  }
  state.settings.showDesktopIcons = next;
  saveDesktopIconsVisible();
  applyDesktopIconsVisibility();
  if(typeof syncOsProfile === 'function'){
    syncOsProfile();
  }
}

function toggleDesktopIconsVisible(){
  setDesktopIconsVisible(!(state.settings.showDesktopIcons !== false));
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

function getAppThemeTitle(app){
  if(!app) return '';
  if(app.id === 'seeker'){
    return state.settings.theme === 'blissos'
      ? t('app.seeker.short')
      : t('app.seeker.file');
  }
  return t(app.titleKey);
}

function getIconLabel(app){
  return state.iconLabels[app.id] || getAppThemeTitle(app);
}

const AQUA_ICON_MAP = {
  'about.png': 'About.png',
  'art.png': 'Art.png',
  'bliss mediaplayer.png': 'BLISS mediaplayer.png',
  'clothes.png': 'Clothes.png',
  'diev.png': 'DIEV.png',
  'games.png': 'Games.png',
  'videos.png': 'Videos.png',
  'music.png': 'music.png',
  'poetry.png': 'poetry.png',
  'poetry2.png': 'poetry2.png',
  'settings.png': 'settings.png',
  'contact.png': 'contact.png',
  'computer.png': 'computer.png',
  'desktop.png': 'desktop.png',
  'applications.png': 'applications.png',
  'documents.png': 'documents.png',
  'hd.png': 'hd.png',
  'recents.png': 'recents.png',
  'language.png': 'language.png',
  'appearance.png': 'appearance.png',
  'system.png': 'settings.png',
  'sound.png': 'Sound.png',
  'performance.png': 'performance.png',
  'dock.png': 'dock.png',
  'seeker.png': 'seeker.png',
  'logout.png': 'logout.png',
  'folder.png': 'folder.png',
  'txt.png': 'txt.png',
  'trash.png': 'trash.png',
  'trash1.png': 'trash.png',
  'trash2.png': 'trash2.png',
  'bliss.png': 'bliss.png',
};

function isAquaIconThemeActive(theme){
  const mode = normalizeOsThemeChoice(theme || state.settings.theme || 'bliss98');
  if(mode === 'blissaqua') return true;
  return mode === 'blissos' && !!state.settings.blissosAqua;
}

function getAquaIconPath(iconPath, theme){
  if(!isAquaIconThemeActive(theme) || typeof iconPath !== 'string') return '';
  let clean = iconPath.trim();
  if(!clean) return '';
  try{
    clean = decodeURIComponent(clean);
  } catch {}
  clean = clean.split('#')[0].split('?')[0];
  const slash = clean.lastIndexOf('/');
  const base = (slash >= 0 ? clean.slice(slash + 1) : clean).toLowerCase();
  const mapped = AQUA_ICON_MAP[base];
  return mapped ? encodeURI(`./assets/aqua/${mapped}`) : '';
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
      if(theme === 'blissos' || theme === 'blissaqua'){
        const aquaPath = getAquaIconPath(trimmed, theme);
        if(aquaPath) return aquaPath;
        if(isAquaIconThemeActive(theme)) return trimmed;
        return getBlissOSAssetPath(trimmed);
      }
      return trimmed;
    }
    return iconSVG(trimmed, theme);
  }
  return iconSVG('file', theme);
}

function getThemedIconHtml(item, label, size=32){
  const theme = state.settings.theme || 'bliss98';
  const iconFile = typeof item.iconFile === 'function' ? item.iconFile() : item.iconFile;
  let iconKey = iconFile || item.icon || 'file';
  if(item && item.id === 'settings' && (theme === 'blissos' || theme === 'blissaqua')){
    iconKey = isAquaIconThemeActive(theme)
      ? './assets/aqua/settings.png'
      : './assets/BlissOS/system.png';
  }
  const icon = getIconFor(iconKey, theme);
  if(typeof icon === 'string' && icon.trim().startsWith('<svg')){
    return icon;
  }
  const src = (typeof icon === 'string') ? icon : '';
  const fallback = ((theme === 'blissos' || theme === 'blissaqua') && !isAquaIconThemeActive(theme)) ? getBlissOSFallbackPath(src) : '';
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
    const lookupId = item.appId || item.id;
    const virtual = getVirtualIconById(lookupId);
    if(virtual){
      return getThemedIconHtml({ icon: 'game', id: virtual.id, iconFile: virtual.iconFile }, label, size);
    }
    const app = getAppById(lookupId);
    if(app){
      return getThemedIconHtml(app, label, size);
    }
    return iconSVG('game', state.settings.theme);
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
  const fallbackWidth = Math.max(ICON_SIZE.w + 6, window.innerWidth || 0);
  const fallbackHeight = Math.max(ICON_SIZE.h + 6, (window.innerHeight || 0) - 36);
  const width = area.width > (ICON_SIZE.w + 6) ? area.width : fallbackWidth;
  const height = area.height > (ICON_SIZE.h + 6) ? area.height : fallbackHeight;
  const metrics = getGridMetricsForSize(width, height);
  const isMobile = width <= 520;
  const order = ['seeker','settings','games','about','videos','mediaplayer','diev','art','contact','poetry','music','clothes'];
  const available = APPS.filter(app => app.showOnDesktop !== false && app.id !== 'trash' && !state.trash.has(app.id) && !isInFolder(app.id));
  const availableIds = new Set(available.map(app => app.id));
  const ordered = order.filter(id => availableIds.has(id)).concat(
    available.map(app => app.id).filter(id => !order.includes(id))
  );

  const layout = {};
  const maxX = Math.max(0, Math.floor(width - ICON_SIZE.w - 6));
  const maxY = Math.max(0, Math.floor(height - ICON_SIZE.h - 6));

  const alignRight = !isMobile && shouldAlignDesktopIconsRight();

  if(isMobile){
    const cols = Math.max(1, Math.floor((width - 6) / metrics.stepX));
    const rows = Math.max(1, Math.floor((height - 6) / metrics.stepY));
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
    const maxRows = Math.max(1, Math.floor((height - 6) / metrics.stepY));
    const usableRows = alignRight ? Math.max(1, maxRows - 1) : maxRows;
    const cols = Math.max(1, Math.floor((width - 6) / metrics.stepX));
    ordered.forEach(id => {
      const actualCol = alignRight ? Math.max(0, (cols - 1) - col) : col;
      const x = clamp(actualCol * metrics.stepX, 0, maxX);
      const y = clamp(row * metrics.stepY, 0, maxY);
      layout[id] = snapToGridClamped(x, y, metrics);
      row += 1;
      if(row >= usableRows){
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

function emptyTrash(){
  if(state.trash.size === 0) return;
  hardDeleteTrashContents();
}

function renderTrashWindow(){
  const win = document.getElementById('win_trash');
  if(!win) return;
  const content = win.querySelector('.content');
  if(!content) return;
  content.innerHTML = CONTENT.trash();
  applyI18nTo(win);
  content.classList.toggle('trash-empty', state.trash.size === 0);
  const emptyBtn = win.querySelector('[data-trash-action="empty"]');
  if(emptyBtn) emptyBtn.disabled = state.trash.size === 0;
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

/* ===== Module: 02-games-and-ui.js ===== */
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
  const shell = win.querySelector('.settings-shell');
  const tabs = Array.from(win.querySelectorAll('.settings-tab'));
  const panels = Array.from(win.querySelectorAll('.settings-panel'));
  if(!tabs.length || !panels.length) return;
  const panelMap = new Map(panels.map(p => [p.dataset.tab, p]));
  const isBlissOsPrefs = state.settings.theme === 'blissos';
  const isAquaPrefs = isBlissOsPrefs && !!state.settings.blissosAqua;
  const usesBlissOsPrefsShell = isBlissOsPrefs;
  let fitRunToken = 0;
  const aquaHistory = { stack:['home'], index:0 };

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

  const getTabLabel = (tabId)=>{
    const tabBtn = tabs.find(tab => tab.dataset.tab === tabId);
    return tabBtn ? tabBtn.textContent.trim() : tabId;
  };

  const getTabIconMarkup = (tabId)=>{
    const panel = panelMap.get(tabId);
    const iconImg = panel ? (panel.querySelector('.settings-panel-icon img') || panel.querySelector('.settings-logo img')) : null;
    if(iconImg){
      const src = iconImg.getAttribute('src') || './assets/icons/Settings.png';
      const iconName = iconImg.dataset ? iconImg.dataset.settingsIcon : '';
      const iconAttr = iconName ? ` data-settings-icon="${iconName}"` : '';
      return `<img class="pixel" src="${src}"${iconAttr} width="52" height="52" alt="" />`;
    }
    return `<img class="pixel" src="./assets/icons/Settings.png" data-settings-icon="Settings.png" width="52" height="52" alt="" />`;
  };

  const aquaGroups = [
    { id:'personal', title:t('settings.aqua.category.personal'), tabs:['appearance', 'language', 'dock'] },
    { id:'system', title:t('settings.aqua.category.system'), tabs:['general', 'sound', 'system', 'performance'] },
  ];

  const ensureAquaLayout = ()=>{
    if(!usesBlissOsPrefsShell || !shell) return null;
    if(shell.dataset.settingsAquaEnhanced === '1'){
      shell.dataset.settingsMode = isAquaPrefs ? 'aqua' : 'classic';
      return {
        toolbar: shell.querySelector('[data-settings-aqua-toolbar]'),
        home: shell.querySelector('[data-settings-home]'),
        pages: shell.querySelector('.settings-panels'),
      };
    }
    shell.dataset.settingsAquaEnhanced = '1';
    shell.dataset.settingsMode = isAquaPrefs ? 'aqua' : 'classic';
    shell.dataset.settingsView = 'home';
    shell.classList.add('settings-shell-aqua');

    const tabsEl = shell.querySelector('.settings-tabs');
    const pagesEl = shell.querySelector('.settings-panels');
    if(tabsEl) tabsEl.classList.add('settings-tabs-aqua-hidden');

    const toolbar = document.createElement('div');
    toolbar.className = 'settings-aqua-toolbar';
    toolbar.dataset.settingsAquaToolbar = '1';
    toolbar.innerHTML = `
      <div class="settings-aqua-nav" role="group" aria-label="${escapeHTML(t('settings.aqua.nav'))}">
        <button class="btn bevel settings-aqua-nav-btn" type="button" data-settings-nav="back" aria-label="${escapeHTML(t('settings.aqua.back'))}">&#9664;</button>
        <button class="btn bevel settings-aqua-nav-btn" type="button" data-settings-nav="forward" aria-label="${escapeHTML(t('settings.aqua.forward'))}">&#9654;</button>
      </div>
      <button class="btn bevel settings-aqua-showall" type="button" data-settings-show-all="1">${escapeHTML(t('settings.aqua.showAll'))}</button>
      <label class="settings-aqua-search" aria-label="${escapeHTML(t('settings.aqua.searchAria'))}">
        <span class="settings-aqua-search-icon" aria-hidden="true"></span>
        <input type="search" class="bevel-in" data-settings-search="1" placeholder="${escapeHTML(t('settings.aqua.searchPlaceholder'))}" />
      </label>
    `;

    const home = document.createElement('div');
    home.className = 'settings-aqua-home';
    home.dataset.settingsHome = '1';
    home.innerHTML = aquaGroups.map(group => {
      const tiles = group.tabs
        .filter(tabId => panelMap.has(tabId))
        .map(tabId => `
          <button class="settings-aqua-item" type="button" data-settings-open="${tabId}">
            <span class="settings-aqua-item-icon">${getTabIconMarkup(tabId)}</span>
            <span class="settings-aqua-item-label">${escapeHTML(getTabLabel(tabId))}</span>
          </button>
        `).join('');
      if(!tiles) return '';
      return `
        <section class="settings-aqua-group" data-settings-group="${group.id}">
          <h3 class="settings-aqua-group-title">${escapeHTML(group.title)}</h3>
          <div class="settings-aqua-grid">${tiles}</div>
        </section>
      `;
    }).join('');

    const insertBeforeEl = tabsEl || pagesEl || null;
    shell.insertBefore(toolbar, insertBeforeEl);
    shell.insertBefore(home, insertBeforeEl);
    if(typeof applySettingsIcons === 'function') applySettingsIcons(win);
    return { toolbar, home, pages: pagesEl };
  };

  const aquaRefs = ensureAquaLayout();
  const aquaHome = aquaRefs ? aquaRefs.home : null;
  const aquaPages = aquaRefs ? aquaRefs.pages : null;
  const aquaToolbar = aquaRefs ? aquaRefs.toolbar : null;
  const aquaBackBtn = aquaToolbar ? aquaToolbar.querySelector('[data-settings-nav="back"]') : null;
  const aquaForwardBtn = aquaToolbar ? aquaToolbar.querySelector('[data-settings-nav="forward"]') : null;
  const aquaShowAllBtn = aquaToolbar ? aquaToolbar.querySelector('[data-settings-show-all]') : null;
  const aquaSearchInput = aquaToolbar ? aquaToolbar.querySelector('[data-settings-search]') : null;
  const aquaTiles = aquaHome ? Array.from(aquaHome.querySelectorAll('[data-settings-open]')) : [];
  const aquaGroupsEls = aquaHome ? Array.from(aquaHome.querySelectorAll('[data-settings-group]')) : [];

  function runAquaTransition(el, cls){
    if(!el || !cls) return;
    const all = ['settings-aqua-enter-home', 'settings-aqua-enter-forward', 'settings-aqua-enter-back'];
    all.forEach(name => el.classList.remove(name));
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(()=>{
      el.classList.remove(cls);
    }, 260);
  }

  function updateAquaNavButtons(){
    if(!usesBlissOsPrefsShell) return;
    if(aquaBackBtn) aquaBackBtn.disabled = aquaHistory.index <= 0;
    if(aquaForwardBtn) aquaForwardBtn.disabled = aquaHistory.index >= (aquaHistory.stack.length - 1);
  }

  function pushAquaHistory(token){
    if(!usesBlissOsPrefsShell) return;
    const currentToken = aquaHistory.stack[aquaHistory.index];
    if(currentToken === token) return;
    aquaHistory.stack = aquaHistory.stack.slice(0, aquaHistory.index + 1);
    aquaHistory.stack.push(token);
    aquaHistory.index = aquaHistory.stack.length - 1;
    updateAquaNavButtons();
  }

  function setAquaView(view, opts = {}){
    if(!usesBlissOsPrefsShell || !shell) return;
    shell.dataset.settingsView = view;
    if(opts.silent) return;
    if(view === 'home'){
      runAquaTransition(aquaHome, opts.direction === 'back' ? 'settings-aqua-enter-back' : 'settings-aqua-enter-home');
    } else {
      runAquaTransition(aquaPages, opts.direction === 'back' ? 'settings-aqua-enter-back' : 'settings-aqua-enter-forward');
    }
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
    updateFullscreenButtons(win);
    updateOldCrtButtons(win);
    updateSoundUI(win);
    updateDockSettingsUI(win);
    const content = win.querySelector('.content');
    if(content){
      content.dataset.fitKey = `settings:${tabId}`;
      const isBlissOsDesktop = !state.isMobile && state.settings.theme === 'blissos';
      if(usesBlissOsPrefsShell && isBlissOsDesktop){
        content.dataset.fitMinW = (tabId === 'appearance')
          ? (isAquaPrefs ? '760' : '700')
          : (isAquaPrefs ? '700' : '620');
      } else if(tabId === 'appearance'){
        content.dataset.fitMinW = isBlissOsDesktop ? '620' : '560';
      } else if(isBlissOsDesktop){
        content.dataset.fitMinW = '600';
      } else {
        delete content.dataset.fitMinW;
      }
    }
    if(usesBlissOsPrefsShell){
      setAquaView('panel', opts);
      if(!opts.fromHistory) pushAquaHistory(`panel:${tabId}`);
    }
    smartFitWindow(win, 'tabChange').then(()=>{
      ensureSettingsNoHorizontalOverflow(tabId, token);
    });
    if(!opts.silent && previousTab !== tabId){
      playSfx('tabChange');
    }
  };

  const showAquaHome = (opts = {})=>{
    if(!usesBlissOsPrefsShell) return;
    const token = ++fitRunToken;
    tabs.forEach(tab => {
      tab.setAttribute('aria-selected', 'false');
      tab.tabIndex = -1;
    });
    panels.forEach(panel => panel.classList.remove('active'));
    setAquaView('home', opts);
    if(!opts.fromHistory) pushAquaHistory('home');
    const content = win.querySelector('.content');
    if(content){
      content.dataset.fitKey = 'settings:home';
      if(!state.isMobile) content.dataset.fitMinW = '760';
    }
    smartFitWindow(win, 'tabChange').then(()=>{
      ensureSettingsNoHorizontalOverflow('home', token);
    });
    updateAquaNavButtons();
    if(!opts.silent){
      playSfx('tabChange');
    }
  };

  function openAquaHistoryToken(token, direction){
    if(!usesBlissOsPrefsShell || !token) return;
    if(token === 'home'){
      showAquaHome({ fromHistory:true, direction, silent:false });
      return;
    }
    if(token.startsWith('panel:')){
      const tabId = token.slice(6);
      activate(tabId, { fromHistory:true, direction, silent:false });
    }
  }

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

  if(usesBlissOsPrefsShell){
    if(aquaShowAllBtn){
      aquaShowAllBtn.addEventListener('click', ()=>{
        showAquaHome({ direction:'back' });
      });
    }
    if(aquaBackBtn){
      aquaBackBtn.addEventListener('click', ()=>{
        if(aquaHistory.index <= 0) return;
        aquaHistory.index -= 1;
        updateAquaNavButtons();
        openAquaHistoryToken(aquaHistory.stack[aquaHistory.index], 'back');
      });
    }
    if(aquaForwardBtn){
      aquaForwardBtn.addEventListener('click', ()=>{
        if(aquaHistory.index >= aquaHistory.stack.length - 1) return;
        aquaHistory.index += 1;
        updateAquaNavButtons();
        openAquaHistoryToken(aquaHistory.stack[aquaHistory.index], 'forward');
      });
    }
    aquaTiles.forEach(tile => {
      const tabId = tile.dataset.settingsOpen;
      tile.addEventListener('click', ()=>{
        activate(tabId, { direction:'forward' });
      });
    });

    const filterAquaTiles = ()=>{
      if(!aquaSearchInput) return null;
      const query = (aquaSearchInput.value || '').trim().toLowerCase();
      let firstVisible = null;
      aquaTiles.forEach(tile => {
        const labelEl = tile.querySelector('.settings-aqua-item-label');
        const label = (labelEl ? labelEl.textContent : tile.textContent || '').trim().toLowerCase();
        const visible = !query || label.includes(query);
        tile.classList.toggle('hidden', !visible);
        if(visible && !firstVisible) firstVisible = tile;
      });
      aquaGroupsEls.forEach(groupEl => {
        const hasVisible = !!groupEl.querySelector('.settings-aqua-item:not(.hidden)');
        groupEl.classList.toggle('hidden', !hasVisible);
      });
      return firstVisible;
    };

    if(aquaSearchInput){
      aquaSearchInput.addEventListener('input', ()=>{
        if(shell && shell.dataset.settingsView !== 'home'){
          showAquaHome({ silent:true, fromHistory:true });
        }
        filterAquaTiles();
      });
      aquaSearchInput.addEventListener('keydown', (e)=>{
        if(e.key !== 'Enter') return;
        const firstVisible = filterAquaTiles();
        if(!firstVisible) return;
        e.preventDefault();
        firstVisible.click();
      });
    }

    const requestedTab = (state.settings.pendingOpenTab && panelMap.has(state.settings.pendingOpenTab))
      ? state.settings.pendingOpenTab
      : '';
    state.settings.pendingOpenTab = '';
    if(requestedTab){
      activate(requestedTab, { silent:true, direction:'forward' });
      aquaHistory.stack = ['home', `panel:${requestedTab}`];
      aquaHistory.index = 1;
    } else {
      showAquaHome({ silent:true, fromHistory:true });
      aquaHistory.stack = ['home'];
      aquaHistory.index = 0;
    }
    updateAquaNavButtons();
  } else {
    const current = (state.settings.tab && panelMap.has(state.settings.tab))
      ? state.settings.tab
      : tabs[0].dataset.tab;
    const requestedTab = (state.settings.pendingOpenTab && panelMap.has(state.settings.pendingOpenTab))
      ? state.settings.pendingOpenTab
      : current;
    state.settings.pendingOpenTab = '';
    activate(requestedTab, { silent: true });
  }

  // Event listeners for BlissOS accent color buttons
  $$('[data-set-blissos-accent]', win).forEach(btn => {
    btn.addEventListener('click', ()=>{
      const accent = btn.dataset.setBlissosAccent;
      setBlissosAccent(accent);
    });
  });
  updateBlissosAccentButtons(win);

  // Event listeners for Bliss98 accent color buttons
  $$('[data-set-bliss98-accent]', win).forEach(btn => {
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const accent = btn.dataset.setBliss98Accent;
      setBliss98Accent(accent);
    });
  });
  updateBliss98AccentButtons(win);
}

function openSettingsAndTab(tabId, scrollId){
  state.settings.tab = tabId || 'general';
  state.settings.pendingOpenTab = tabId || '';
  openApp('settings');
  setTimeout(()=>{
    const winEl = document.getElementById('win_settings');
    if(winEl) initSettingsTabs(winEl);
    if(winEl && tabId){
      const tabBtn = winEl.querySelector(`.settings-tab[data-tab="${tabId}"]`);
      if(tabBtn) tabBtn.click();
    }
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
  try{
    localStorage.removeItem(`${ICON_POS_KEY}_${getCurrentOsThemeChoice()}`);
    localStorage.removeItem(ICON_POS_KEY);
  } catch {}
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

function isFullscreenEnabled(){
  return !!document.fullscreenElement;
}

function updateFullscreenButtons(root=document){
  const on = isFullscreenEnabled();
  $$('[data-set-fullscreen]', root).forEach(btn => {
    const enable = btn.dataset.setFullscreen === 'on';
    btn.classList.toggle('pressed', enable === on);
  });
  $$('[data-toggle-fullscreen]', root).forEach(input => {
    input.checked = on;
    input.setAttribute('aria-checked', on ? 'true' : 'false');
  });
}

function setFullscreen(enabled){
  const shouldEnable = !!enabled;
  const isOn = isFullscreenEnabled();
  if(shouldEnable === isOn){
    updateFullscreenButtons();
    return;
  }
  const request = shouldEnable
    ? (document.documentElement && document.documentElement.requestFullscreen
      ? document.documentElement.requestFullscreen()
      : Promise.resolve())
    : (document.exitFullscreen ? document.exitFullscreen() : Promise.resolve());
  Promise.resolve(request).catch(()=>{}).finally(()=>{
    updateFullscreenButtons();
  });
}

function updateBlissOSDarkButtons(root=document){
  $$('[data-set-blissos-darkmode]', root).forEach(btn => {
    const on = btn.dataset.setBlissosDarkmode === 'on';
    btn.classList.toggle('pressed', on === state.settings.blissosDarkMode);
  });
  $$('[data-toggle-blissos-darkmode]', root).forEach(input => {
    input.checked = !!state.settings.blissosDarkMode;
    input.setAttribute('aria-checked', state.settings.blissosDarkMode ? 'true' : 'false');
  });
}

function updateBlissOSAquaButtons(root=document){
  const enabled = getCurrentOsThemeChoice() === 'blissaqua';
  $$('[data-set-blissos-aqua]', root).forEach(btn => {
    const on = btn.dataset.setBlissosAqua === 'on';
    btn.classList.toggle('pressed', on === enabled);
  });
  $$('[data-toggle-blissos-aqua]', root).forEach(input => {
    input.checked = !!enabled;
    input.setAttribute('aria-checked', enabled ? 'true' : 'false');
  });
}

function updateBlissosAccentButtons(root=document){
  $$('[data-set-blissos-accent]', root).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setBlissosAccent === state.settings.blissosAccent);
    // Remove 'pressed' class which might have been used by old button styling
    btn.classList.remove('pressed');
  });
}

function updateBliss98AccentButtons(root=document){
  $$('[data-set-bliss98-accent]', root).forEach(btn => {
    btn.classList.toggle('active', btn.dataset.setBliss98Accent === state.settings.bliss98Accent);
    btn.classList.remove('pressed');
  });
}

function applyBliss98Accent(accent){
  const palette = BLISS98_ACCENT_COLORS[accent] || BLISS98_ACCENT_COLORS.classic;
  const dark = !!state.settings.darkMode;
  const tone = dark ? palette.dark : palette.light;
  const rgb = hexToRgb(tone.accent) || { r:0, g:0, b:128 };
  const root = document.body;
  root.style.setProperty('--bliss98-accent', tone.accent);
  root.style.setProperty('--selection-border', tone.accent);
  root.style.setProperty('--selection-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${dark ? 0.3 : 0.22})`);
  root.style.setProperty('--select', tone.accent);
  root.style.setProperty('--select-text', tone.text);
  updateBliss98AccentButtons();
}

function setBliss98Accent(accent, opts = {}){
  if(!BLISS98_ACCENT_COLORS[accent]) return;
  state.settings.bliss98Accent = accent;
  saveBliss98Accent();
  applyBliss98Accent(accent);
  if(!opts.fromPreset && !themeApplying && state.settings.theme !== 'blissos'){
    setThemePresetCustom();
  }
  syncOsProfile();
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
  const isAqua = getCurrentOsThemeChoice() === 'blissaqua';
  document.body.dataset.blissosStyle = (isBlissOS && isAqua) ? 'aqua' : 'classic';
  const brandIconEl = document.querySelector('.blissos-menu-brand img');
  if(isBlissOS && brandIconEl){
    const brandSrc = getIconFor('./assets/icons/bliss.png', 'blissos');
    if(typeof brandSrc === 'string' && !brandSrc.trim().startsWith('<svg')){
      brandIconEl.src = brandSrc;
    }
  }
  updateBlissOSAquaButtons();
}

function setBlissOSAqua(enabled){
  const choice = enabled ? 'blissaqua' : 'blissos';
  setOsTheme(choice);
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

function getDockSizePercent(){
  const raw = Number(state.settings.dockSize);
  if(!Number.isFinite(raw)) return 58;
  return clamp(Math.round(raw), 0, 100);
}

function getDockMagnificationStrengthPercent(){
  const raw = Number(state.settings.dockMagnificationStrength);
  if(!Number.isFinite(raw)) return 60;
  return clamp(Math.round(raw), 0, 100);
}

function getDockOpacityPercent(){
  const raw = Number(state.settings.dockOpacity);
  if(!Number.isFinite(raw)) return 100;
  return clamp(Math.round(raw), 0, 100);
}

function isDockMagnificationEnabled(){
  return state.settings.dockMagnification !== false;
}

function isDockAutoHideEnabled(){
  return !!state.settings.dockAutoHide;
}

function updateDockSettingsUI(root=document){
  const size = getDockSizePercent();
  const magnification = isDockMagnificationEnabled();
  const magnificationStrength = getDockMagnificationStrengthPercent();
  const opacity = getDockOpacityPercent();
  const autoHide = isDockAutoHideEnabled();

  $$('[data-dock-slider="size"]', root).forEach(slider => {
    slider.value = String(size);
  });
  $$('[data-dock-slider="magnification"]', root).forEach(slider => {
    slider.value = String(magnificationStrength);
    slider.disabled = !magnification;
  });
  $$('[data-dock-slider="opacity"]', root).forEach(slider => {
    slider.value = String(opacity);
  });
  $$('[data-dock-toggle="magnification"]', root).forEach(input => {
    input.checked = magnification;
    input.setAttribute('aria-checked', magnification ? 'true' : 'false');
  });
  $$('[data-dock-toggle="autohide"]', root).forEach(input => {
    input.checked = autoHide;
    input.setAttribute('aria-checked', autoHide ? 'true' : 'false');
  });
  $$('[data-dock-slider="magnification"]', root).forEach(slider => {
    const row = slider.closest('.settings-dock-row-toggle');
    if(row) row.classList.toggle('disabled', !magnification);
  });
}

function setDockSize(value){
  state.settings.dockSize = clamp(Math.round(Number(value) || 0), 0, 100);
  updateDockSettingsUI();
  renderBlissOSDock();
  syncOsProfile();
}

function setDockMagnification(enabled){
  state.settings.dockMagnification = !!enabled;
  updateDockSettingsUI();
  renderBlissOSDock();
  syncOsProfile();
}

function setDockMagnificationStrength(value){
  state.settings.dockMagnificationStrength = clamp(Math.round(Number(value) || 0), 0, 100);
  updateDockSettingsUI();
  renderBlissOSDock();
  syncOsProfile();
}

function setDockOpacity(value){
  state.settings.dockOpacity = clamp(Math.round(Number(value) || 0), 0, 100);
  updateDockSettingsUI();
  renderBlissOSDock();
  syncOsProfile();
}

function setDockAutoHide(enabled){
  state.settings.dockAutoHide = !!enabled;
  updateDockSettingsUI();
  renderBlissOSDock();
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
        const current = getCurrentOsThemeChoice();
        $$('[data-set-os-theme]', root).forEach(btn => {
          btn.classList.toggle('pressed', btn.dataset.setOsTheme === current);
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
    return normalizeOsThemeChoice(raw || 'bliss98');
  } catch {
    return 'bliss98';
  }
}

function getSavedOsTheme(){
  try{
    const raw = localStorage.getItem(OS_THEME_KEY);
    if(raw === 'blissos'){
      try{
        const profilesRaw = localStorage.getItem(OS_PROFILE_KEY);
        if(profilesRaw){
          const parsed = JSON.parse(profilesRaw);
          if(parsed && parsed.blissos && parsed.blissos.blissosAqua){
            return 'blissaqua';
          }
        }
      } catch {}
    }
    const normalized = normalizeOsThemeChoice(raw || '');
    if(normalized !== 'bliss98' || raw === 'bliss98') return normalized;
    if(raw === 'bliss98') return 'bliss98';
    if(raw === 'blissos') return 'blissos';
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
    if(raw && Object.prototype.hasOwnProperty.call(BLISSOS_ACCENT_COLORS, raw)){
      return raw;
    }
    return 'multicolor'; // Default accent
  } catch {
    return 'multicolor';
  }
}

function loadBliss98Accent(){
  try{
    const raw = localStorage.getItem(BLISS98_ACCENT_KEY);
    if(raw && Object.prototype.hasOwnProperty.call(BLISS98_ACCENT_COLORS, raw)){
      return raw;
    }
    return 'classic';
  } catch {
    return 'classic';
  }
}

function saveBliss98Accent(){
  try{
    localStorage.setItem(BLISS98_ACCENT_KEY, state.settings.bliss98Accent || 'classic');
  } catch {}
}

const BLISS98_ACCENT_COLORS = {
  classic: {
    light: { accent:'#000080', text:'#ffffff' },
    dark: { accent:'#7fa8ff', text:'#10192a' },
  },
  teal: {
    light: { accent:'#006f6f', text:'#ffffff' },
    dark: { accent:'#4dc7c7', text:'#102020' },
  },
  green: {
    light: { accent:'#1f7f39', text:'#ffffff' },
    dark: { accent:'#67d28a', text:'#0f2415' },
  },
  purple: {
    light: { accent:'#5a2b9a', text:'#ffffff' },
    dark: { accent:'#b08cff', text:'#1d1430' },
  },
  pink: {
    light: { accent:'#e54de4', text:'#ffffff' },
    dark: { accent:'#fa80fa', text:'#2a102a' },
  },
  rose: {
    light: { accent:'#a13268', text:'#ffffff' },
    dark: { accent:'#f08dbc', text:'#2f1020' },
  },
  red: {
    light: { accent:'#e53d3d', text:'#ffffff' },
    dark: { accent:'#fa6a6a', text:'#2a1010' },
  },
  orange: {
    light: { accent:'#e58a3d', text:'#111111' },
    dark: { accent:'#faac6a', text:'#2e1b08' },
  },
  yellow: {
    light: { accent:'#e5d13d', text:'#111111' },
    dark: { accent:'#fae26a', text:'#2d2808' },
  },
  graphite: {
    light: { accent:'#4f545d', text:'#ffffff' },
    dark: { accent:'#aeb7c4', text:'#111827' },
  },
};

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
  teal: {
    '--blissos-accent': '#006f6f',
    '--blissos-accent-2': '#0b8686',
    '--blissos-accent-weak': 'rgba(0, 111, 111, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    '--blissos-accent-dark': '#4dc7c7',
    '--blissos-accent-2-dark': '#66d9d9',
    '--blissos-accent-weak-dark': 'rgba(77, 199, 199, 0.16)',
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
  rose: {
    '--blissos-accent': '#A13268',
    '--blissos-accent-2': '#B83F7A',
    '--blissos-accent-weak': 'rgba(161, 50, 104, 0.15)',
    '--blissos-accent-contrast': '#ffffff',
    '--blissos-accent-dark': '#F08DBC',
    '--blissos-accent-2-dark': '#F59EC7',
    '--blissos-accent-weak-dark': 'rgba(240, 141, 188, 0.16)',
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
    localStorage.setItem(OS_THEME_KEY, getCurrentOsThemeChoice());
  } catch {}
}

function getDefaultOsProfiles(){
  const desktopIconsVisible = loadDesktopIconsVisible();
  const bliss98Accent = loadBliss98Accent();
  return {
    bliss98: {
      wallpaper: loadWallpaper(),
      themePreset: loadThemePreset(),
      titlebar: loadTitlebarTheme(),
      bliss98Accent,
      darkMode: loadDarkMode(),
      blissosDarkMode: false,
      blissosAqua: false,
      dockSize: 58,
      dockMagnification: true,
      dockMagnificationStrength: 60,
      dockOpacity: 100,
      dockAutoHide: false,
      showDesktopIcons: desktopIconsVisible,
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
      bliss98Accent,
      darkMode: false,
      blissosDarkMode: false,
      blissosAqua: false,
      dockSize: 58,
      dockMagnification: true,
      dockMagnificationStrength: 60,
      dockOpacity: 100,
      dockAutoHide: false,
      showDesktopIcons: desktopIconsVisible,
      retroGlow: false,
      scanlines: false,
      clock24: true,
      oldCrt: false,
      masterVolume: loadMasterVolume(),
      systemVolume: loadSystemVolume(),
      systemSoundsEnabled: loadSystemSoundsEnabled(),
    },
    blissaqua: {
      wallpaper: 'aqua',
      themePreset: 'default',
      titlebar: 'defaultBlue',
      bliss98Accent,
      darkMode: false,
      blissosDarkMode: false,
      blissosAqua: true,
      dockSize: 58,
      dockMagnification: true,
      dockMagnificationStrength: 60,
      dockOpacity: 100,
      dockAutoHide: false,
      showDesktopIcons: desktopIconsVisible,
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
      const legacyBlissos = parsed && parsed.blissos ? parsed.blissos : {};
      const migratedBlissAqua = (parsed && parsed.blissaqua) ? parsed.blissaqua : (
        legacyBlissos && legacyBlissos.blissosAqua
          ? { ...legacyBlissos, blissosAqua: true, wallpaper: legacyBlissos.wallpaper || 'aqua' }
          : {}
      );
      return {
        bliss98: { ...defaults.bliss98, ...(parsed.bliss98 || {}) },
        blissos: { ...defaults.blissos, ...legacyBlissos, blissosAqua: false },
        blissaqua: { ...defaults.blissaqua, ...migratedBlissAqua, blissosAqua: true },
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
  const theme = getCurrentOsThemeChoice();
  state.settings.osProfiles[theme] = {
    wallpaper: state.wallpaper,
    themePreset: state.theme.preset,
    titlebar: state.theme.titlebar,
    bliss98Accent: state.settings.bliss98Accent || 'classic',
    darkMode: state.settings.darkMode,
    blissosDarkMode: state.settings.blissosDarkMode,
    blissosAqua: state.settings.blissosAqua,
    dockSize: getDockSizePercent(),
    dockMagnification: isDockMagnificationEnabled(),
    dockMagnificationStrength: getDockMagnificationStrengthPercent(),
    dockOpacity: getDockOpacityPercent(),
    dockAutoHide: isDockAutoHideEnabled(),
    showDesktopIcons: state.settings.showDesktopIcons !== false,
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
  const profileTheme = normalizeOsThemeChoice(theme || getCurrentOsThemeChoice());
  const defaults = getDefaultOsProfiles();
  const profile = state.settings.osProfiles[profileTheme] || defaults[profileTheme];
  const blissFamily = profileTheme !== 'bliss98';
  const isAqua = profileTheme === 'blissaqua';
  state.settings.theme = blissFamily ? 'blissos' : 'bliss98';
  state.settings.blissosAqua = isAqua;
  state.wallpaper = profile.wallpaper || (isAqua ? 'aqua' : (blissFamily ? 'blissos' : 'classic'));
  state.theme.preset = profile.themePreset || 'default';
  state.theme.titlebar = profile.titlebar || 'defaultBlue';
  state.settings.bliss98Accent = profile.bliss98Accent || loadBliss98Accent();
  saveBliss98Accent();
  if(blissFamily && state.theme.titlebar === 'blank'){
    state.theme.titlebar = 'defaultBlue';
  }
  state.settings.darkMode = !!profile.darkMode;
  state.settings.blissosDarkMode = !!profile.blissosDarkMode;
  state.settings.dockSize = typeof profile.dockSize === 'number' ? clamp(Math.round(profile.dockSize), 0, 100) : 58;
  state.settings.dockMagnification = profile.dockMagnification !== false;
  state.settings.dockMagnificationStrength = typeof profile.dockMagnificationStrength === 'number' ? clamp(Math.round(profile.dockMagnificationStrength), 0, 100) : 60;
  state.settings.dockOpacity = typeof profile.dockOpacity === 'number' ? clamp(Math.round(profile.dockOpacity), 0, 100) : 100;
  state.settings.dockAutoHide = !!profile.dockAutoHide;
  state.settings.showDesktopIcons = profile.showDesktopIcons !== false;
  state.settings.retroGlow = !!profile.retroGlow;
  state.settings.scanlines = !!profile.scanlines;
  state.settings.clock24 = profile.clock24 !== false;
  state.settings.oldCrt = !!profile.oldCrt;
  state.settings.masterVolume = typeof profile.masterVolume === 'number' ? profile.masterVolume : loadMasterVolume();
  state.settings.systemVolume = typeof profile.systemVolume === 'number' ? profile.systemVolume : loadSystemVolume();
  state.settings.systemSoundsEnabled = profile.systemSoundsEnabled !== false;

  if(profileTheme === 'bliss98'){
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
  updateDockSettingsUI();
  updateClockButtons();
  updateFullscreenButtons();
  updateWallpaperButtons();
  updateOsThemeButtons();
  applyDesktopIconsVisibility();
}

function applyOsTheme(){
  const current = getCurrentOsThemeChoice();
  const theme = current === 'bliss98' ? 'bliss98' : 'blissos';
  state.settings.theme = theme;
  state.settings.blissosAqua = current === 'blissaqua';
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
  refreshOpenSeekerWindows();
  renderTaskButtons();
  updateBlissOSActiveApp();
  updateOpenWindowTitleIcons();

  if(blissos){
    applyBlissosAccent(state.settings.blissosAccent);
  } else {
    applyBliss98Accent(state.settings.bliss98Accent || 'classic');
  }
  applyBlissOSAqua();
  applyDesktopIconsVisibility();
}

function setOsTheme(theme){
  const wasRightAligned = shouldAlignDesktopIconsRight();
  const nextTheme = normalizeOsThemeChoice(theme);
  const settingsWinOpen = !!document.getElementById('win_settings');
  const currentSettingsTab = settingsWinOpen ? (state.settings.tab || '') : '';
  syncOsProfile();
  applyOsProfile(nextTheme);
  saveOsTheme();
  initDesktopFs();
  applyOsTheme();
  const isRightAligned = shouldAlignDesktopIconsRight();
  if(wasRightAligned !== isRightAligned){
    arrangeIcons();
  }
  if(settingsWinOpen){
    state.settings.pendingOpenTab = currentSettingsTab;
    renderSettingsWindow();
  }
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
  if(!isBlissOS){
    applyBliss98Accent(state.settings.bliss98Accent || 'classic');
  }
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
    bliss98Accent: state.settings.bliss98Accent || 'classic',
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
  state.settings.bliss98Accent = data.bliss98Accent || loadBliss98Accent();
  saveBliss98Accent();
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
  win.classList.add('mp-app-window');
  win.classList.toggle('mp-mobile-player', !!state.isMobile);
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
    focusWindowAndRefreshTaskbar(appId);
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
  if(id === 'trash'){
    if(state.windows.has('trash')) closeApp('trash');
    openSeekerSection('trash');
    return;
  }
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
  if(item.id === 'trash' && state.settings.theme === 'blissos' && !!state.settings.blissosAqua) return false;
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

function canPlaceItemInFolder(itemId, folderId, opts = {}){
  if(!itemId) return false;
  const allowTrashed = !!opts.allowTrashed;
  if(!allowTrashed && state.trash.has(itemId)) return false;
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

function canMoveItemToFolder(itemId, folderId){
  return canPlaceItemInFolder(itemId, folderId, { allowTrashed: false });
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

function getFolderDropTargetAt(x, y, dragEls, draggedIds, opts = {}){
  if(!dragEls || dragEls.length === 0) return null;
  const target = getDropTargetElement(x, y, dragEls);
  const folderEl = target && target.closest ? target.closest('.icon[data-item-type="folder"]') : null;
  if(!folderEl || !folderEl.dataset) return null;
  const folderId = folderEl.dataset.appId;
  if(!folderId) return null;
  const canMoveAll = (draggedIds || []).every(id => canPlaceItemInFolder(id, folderId, { allowTrashed: !!opts.allowTrashed }));
  return canMoveAll ? { id: folderId, el: folderEl } : null;
}

function normalizeDraggedFsIds(ids){
  const out = [];
  const seen = new Set();
  (ids || []).forEach(id => {
    if(!id || id === 'trash' || seen.has(id)) return;
    const item = getFsItem(id) || ensureFsItemForApp(id, { save: false });
    if(!item) return;
    seen.add(id);
    out.push(id);
  });
  return out;
}

function moveDraggedItemsToFolderTarget(ids, folderId, opts = {}){
  const filtered = normalizeDraggedFsIds(ids);
  if(!filtered.length) return false;
  const iconPosCache = opts.iconPosCache || loadIconPositions();
  const basePreferred = opts.preferredPos || null;
  let movedAny = false;
  let restoredAny = false;
  filtered.forEach((id, idx) => {
    if(!canPlaceItemInFolder(id, folderId, { allowTrashed: true })) return;
    if(state.trash.has(id)){
      state.trash.delete(id);
      restoredAny = true;
    }
    const preferred = basePreferred
      ? {
          x: Math.max(0, Math.floor(basePreferred.x + (idx * 16))),
          y: Math.max(0, Math.floor(basePreferred.y + (idx * 14))),
        }
      : { x: 16 + (idx * 16), y: 16 + (idx * 14) };
    if(moveItemToFolder(id, folderId, {
      force: true,
      save: false,
      iconPosCache,
      preferredPos: preferred,
      containerEl: opts.containerEl || null,
    })){
      movedAny = true;
    }
  });
  if(restoredAny){
    playSfx('trashRestore');
    saveTrash();
  }
  if(movedAny){
    saveIconPositions(iconPosCache);
    saveDesktopFs();
  }
  if(restoredAny || movedAny){
    renderIcons();
    refreshOpenFolderWindows();
    renderTrashWindow();
    updateTrashIconUI();
  }
  return restoredAny || movedAny;
}

function seekerSectionAcceptsDrag(sectionId){
  const section = normalizeSeekerSection(sectionId);
  return section === 'trash' || !!getSeekerFolderIdFromSection(section);
}

function clearSeekerDropPreview(){
  const win = document.getElementById('win_seeker');
  if(!win) return;
  win.querySelectorAll('.seeker-drop-target').forEach(el => el.classList.remove('seeker-drop-target'));
}

function setSeekerDropPreview(target){
  clearSeekerDropPreview();
  if(!target || !target.el) return;
  target.el.classList.add('seeker-drop-target');
}

function getSeekerDropTargetAt(x, y, dragEls, draggedIds){
  const ids = normalizeDraggedFsIds(draggedIds);
  if(!ids.length || !dragEls || dragEls.length === 0) return null;
  const target = getDropTargetElement(x, y, dragEls);
  if(!target || !target.closest) return null;
  const win = target.closest('#win_seeker');
  if(!win || win.classList.contains('hidden')) return null;
  const shell = win.querySelector('[data-seeker-shell="1"]');
  if(!shell) return null;
  const section = normalizeSeekerSection(ensureSeekerState().section || 'desktop');

  const trashSideItem = target.closest('.seeker-side-item[data-seeker-open="trash"]');
  if(trashSideItem){
    return { kind: 'trash', section, shell, el: trashSideItem };
  }

  if(!seekerSectionAcceptsDrag(section)) return null;

  if(section === 'trash'){
    const main = shell.querySelector('.seeker-main');
    if(main && (main.contains(target) || target === main)){
      return { kind: 'trash', section, shell, el: main };
    }
    return null;
  }

  const currentFolderId = getSeekerFolderIdFromSection(section);
  if(!currentFolderId) return null;

  const itemEl = target.closest('[data-seeker-item]');
  if(itemEl && shell.contains(itemEl)){
    const key = itemEl.dataset ? itemEl.dataset.seekerItem : '';
    const items = Array.isArray(shell._seekerItems) ? shell._seekerItems : [];
    const entry = items.find(it => it.key === key);
    if(entry && entry.kind === 'folder'){
      const canAll = ids.every(id => canPlaceItemInFolder(id, entry.id, { allowTrashed: true }));
      if(canAll){
        return { kind: 'folder', folderId: entry.id, section, shell, el: itemEl };
      }
    }
  }

  const itemsHost = shell.querySelector('[data-seeker-items="1"]');
  if(itemsHost && (itemsHost.contains(target) || target.closest('.seeker-main'))){
    const canAll = ids.every(id => canPlaceItemInFolder(id, currentFolderId, { allowTrashed: true }));
    if(canAll){
      return { kind: 'folder', folderId: currentFolderId, section, shell, el: itemsHost };
    }
  }

  return null;
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

function getTxtWindowId(txtId){
  return `txt_${txtId}`;
}

function isTxtWindowId(winId){
  return typeof winId === 'string' && winId.startsWith('txt_');
}

function getTxtIdFromWindowId(winId){
  return isTxtWindowId(winId) ? winId.slice(4) : null;
}

function resolveFolderContainer(parentId, containerEl){
  const normalized = normalizeFolderNavId(parentId);
  if(normalized == null) return containerEl || null;
  return containerEl || null;
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
  refreshOpenSeekerWindows();
}

function refreshOpenTxtWindows(txtId){
  state.windows.forEach(w => {
    if(!w || w.kind !== 'txt') return;
    if(txtId && w.txtId !== txtId) return;
    renderTxtFileWindow(w.id);
  });
}

const TXT_SPACING_MAP = {
  tight: 1.22,
  normal: 1.42,
  relaxed: 1.64,
  loose: 1.88,
};

const TXT_DEFAULT_PREFS = Object.freeze({
  spacing: 'normal',
  left: 24,
  right: 24,
  indent: 0,
});

function cloneTxtPrefs(prefs = TXT_DEFAULT_PREFS){
  return {
    spacing: prefs.spacing,
    left: prefs.left,
    right: prefs.right,
    indent: prefs.indent,
  };
}

function normalizeTxtPrefs(raw){
  const prefs = cloneTxtPrefs();
  if(!raw || typeof raw !== 'object') return prefs;
  if(typeof raw.spacing === 'string' && TXT_SPACING_MAP[raw.spacing]){
    prefs.spacing = raw.spacing;
  }
  if(Number.isFinite(raw.left)) prefs.left = Math.round(raw.left);
  if(Number.isFinite(raw.right)) prefs.right = Math.round(raw.right);
  if(Number.isFinite(raw.indent)) prefs.indent = Math.round(raw.indent);
  return prefs;
}

function getTxtSpacingValue(spacing){
  return TXT_SPACING_MAP[spacing] || TXT_SPACING_MAP.normal;
}

function escapeTxtHtml(value){
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function plainTextToTxtHtml(value){
  const raw = typeof value === 'string' ? value.replace(/\r\n?/g, '\n') : '';
  if(!raw.trim()) return '<p><br></p>';
  return raw
    .split('\n')
    .map(line => `<p>${line ? escapeTxtHtml(line) : '<br>'}</p>`)
    .join('');
}

function looksLikeHtml(value){
  return typeof value === 'string' && /<\/?[a-z][\s\S]*>/i.test(value);
}

function sanitizeTxtHtml(value){
  const host = document.createElement('div');
  host.innerHTML = typeof value === 'string' ? value : '';
  host.querySelectorAll('script,style,iframe,object,embed').forEach(node => node.remove());
  const showElements = window.NodeFilter ? window.NodeFilter.SHOW_ELEMENT : 1;
  const walker = document.createTreeWalker(host, showElements);
  let node = walker.currentNode;
  while(node){
    const attrs = Array.from(node.attributes || []);
    attrs.forEach(attr => {
      if(/^on/i.test(attr.name)) node.removeAttribute(attr.name);
    });
    node = walker.nextNode();
  }
  if(!host.innerHTML.trim()) return '<p><br></p>';
  if(!host.querySelector('p,div,h1,h2,h3,h4,h5,h6,blockquote,ul,ol,li,pre')){
    const inline = host.innerHTML.trim();
    return inline ? `<p>${inline}</p>` : '<p><br></p>';
  }
  return host.innerHTML;
}

function getTxtDocumentHtml(item){
  if(!item || item.type !== 'txt') return '<p><br></p>';
  const raw = typeof item.content === 'string' ? item.content : '';
  if(item.contentFormat === 'html' || looksLikeHtml(raw)){
    return sanitizeTxtHtml(raw);
  }
  return plainTextToTxtHtml(raw);
}

function serializeTxtEditorHtml(editor){
  if(!editor) return '<p><br></p>';
  return sanitizeTxtHtml(editor.innerHTML);
}

function getTxtEditorFromShell(shell){
  return shell ? shell.querySelector('[data-txt-editor="1"]') : null;
}

function updateTxtShellResponsive(shell){
  if(!shell) return;
  shell.classList.remove('txt-shell-compact', 'txt-shell-narrow');
  const width = Math.max(260, Math.round(shell.clientWidth || 0));
  const toolbarChrome = 20;
  const toolbarAtFullScale = 974;
  const globalUiScale = 0.874;
  const toolbarBudget = Math.max(140, width - toolbarChrome);
  const rawScale = (toolbarBudget / toolbarAtFullScale) * 0.99;
  const scale = clamp(rawScale * globalUiScale, 0.52, globalUiScale);
  shell.style.setProperty('--txt-toolbar-scale', String(Number(scale.toFixed(3))));
}

function applyTxtPrefsToShell(shell, rawPrefs){
  const editor = getTxtEditorFromShell(shell);
  const rail = shell ? shell.querySelector('[data-txt-ruler-rail="1"]') : null;
  const leftMarker = shell ? shell.querySelector('[data-txt-ruler-marker="left"]') : null;
  const indentMarker = shell ? shell.querySelector('[data-txt-ruler-marker="indent"]') : null;
  const rightMarker = shell ? shell.querySelector('[data-txt-ruler-marker="right"]') : null;
  if(!editor || !rail) return normalizeTxtPrefs(rawPrefs);

  const prefs = normalizeTxtPrefs(rawPrefs);
  const width = Math.max(260, Math.round(rail.clientWidth || editor.clientWidth || 320));
  const minMargin = 10;
  const minBody = 96;
  prefs.left = clamp(prefs.left, minMargin, Math.max(minMargin, width - minBody - minMargin));
  prefs.right = clamp(prefs.right, minMargin, Math.max(minMargin, width - prefs.left - minBody));
  const maxIndent = Math.max(-24, width - prefs.left - prefs.right - 30);
  prefs.indent = clamp(prefs.indent, -24, maxIndent);

  editor.style.paddingLeft = `${prefs.left}px`;
  editor.style.paddingRight = `${prefs.right}px`;
  editor.style.textIndent = `${prefs.indent}px`;
  editor.style.lineHeight = String(getTxtSpacingValue(prefs.spacing));

  const leftPos = prefs.left;
  const rightPos = width - prefs.right;
  const indentPos = clamp(prefs.left + prefs.indent, 5, rightPos - 8);
  if(leftMarker) leftMarker.style.left = `${leftPos}px`;
  if(indentMarker) indentMarker.style.left = `${indentPos}px`;
  if(rightMarker) rightMarker.style.left = `${rightPos}px`;
  return prefs;
}

function isTxtSelectionInside(editor){
  const sel = window.getSelection ? window.getSelection() : null;
  if(!sel || sel.rangeCount === 0) return false;
  const anchor = sel.anchorNode;
  return !!anchor && editor.contains(anchor);
}

function updateTxtCommandButtonState(shell){
  const editor = getTxtEditorFromShell(shell);
  if(!editor) return;
  const inEditor = document.activeElement === editor || isTxtSelectionInside(editor);
  const buttons = shell.querySelectorAll('[data-txt-command]');
  buttons.forEach(btn => {
    const query = btn.dataset.txtQuery || btn.dataset.txtCommand;
    let active = false;
    if(inEditor){
      try{
        active = !!document.queryCommandState(query);
      } catch {
        active = false;
      }
    }
    btn.classList.toggle('active', active);
    btn.dataset.active = active ? '1' : '0';
  });
  if(inEditor){
    const leftBtn = shell.querySelector('[data-txt-command="justifyLeft"]');
    const centerBtn = shell.querySelector('[data-txt-command="justifyCenter"]');
    const rightBtn = shell.querySelector('[data-txt-command="justifyRight"]');
    const justifyBtn = shell.querySelector('[data-txt-command="justifyFull"]');
    const hasOtherAlign = [centerBtn, rightBtn, justifyBtn].some(btn => btn && btn.dataset.active === '1');
    if(leftBtn && !hasOtherAlign){
      leftBtn.classList.add('active');
      leftBtn.dataset.active = '1';
    }
  }
}

function ensureTxtEditorFocus(editor){
  if(!editor) return;
  try{
    editor.focus({ preventScroll: true });
  } catch {
    editor.focus();
  }
}

function runTxtEditorCommand(winId, shell, command){
  const editor = getTxtEditorFromShell(shell);
  const wstate = state.windows.get(winId);
  if(!editor || !wstate || wstate.kind !== 'txt') return;
  ensureTxtEditorFocus(editor);
  let changed = false;
  try{
    document.execCommand('styleWithCSS', false, false);
  } catch {}
  try{
    changed = !!document.execCommand(command, false, null);
  } catch {
    changed = false;
  }
  if(changed || command.startsWith('justify')){
    wstate.txtDirty = true;
    scheduleTxtAutosave(winId, serializeTxtEditorHtml(editor));
  }
  updateTxtCommandButtonState(shell);
}

function handleTxtControlChange(winId, shell, control, value){
  const editor = getTxtEditorFromShell(shell);
  const wstate = state.windows.get(winId);
  if(!editor || !wstate || wstate.kind !== 'txt' || !control || !value) return;

  if(control === 'style'){
    const blockMap = {
      paragraph: 'P',
      heading: 'H1',
      subheading: 'H2',
      quote: 'BLOCKQUOTE',
    };
    ensureTxtEditorFocus(editor);
    try{
      document.execCommand('formatBlock', false, blockMap[value] || 'P');
    } catch {}
    wstate.txtDirty = true;
    scheduleTxtAutosave(winId, serializeTxtEditorHtml(editor));
    updateTxtCommandButtonState(shell);
    return;
  }

  if(control === 'list'){
    ensureTxtEditorFocus(editor);
    if(value === 'bullets'){
      try{ document.execCommand('insertUnorderedList', false, null); } catch {}
    } else if(value === 'numbers'){
      try{ document.execCommand('insertOrderedList', false, null); } catch {}
    } else if(value === 'none'){
      try{
        if(document.queryCommandState('insertUnorderedList')){
          document.execCommand('insertUnorderedList', false, null);
        }
      } catch {}
      try{
        if(document.queryCommandState('insertOrderedList')){
          document.execCommand('insertOrderedList', false, null);
        }
      } catch {}
    }
    wstate.txtDirty = true;
    scheduleTxtAutosave(winId, serializeTxtEditorHtml(editor));
    updateTxtCommandButtonState(shell);
    return;
  }

  if(control === 'spacing' && TXT_SPACING_MAP[value]){
    wstate.txtPrefs = applyTxtPrefsToShell(shell, { ...(wstate.txtPrefs || TXT_DEFAULT_PREFS), spacing: value });
    wstate.txtDirty = true;
    scheduleTxtAutosave(winId, serializeTxtEditorHtml(editor));
  }
}

function beginTxtRulerDrag(winId, shell, markerType, startEvent){
  const editor = getTxtEditorFromShell(shell);
  const rail = shell ? shell.querySelector('[data-txt-ruler-rail="1"]') : null;
  const wstate = state.windows.get(winId);
  if(!editor || !rail || !wstate || wstate.kind !== 'txt') return;
  startEvent.preventDefault();
  const pointerId = startEvent.pointerId;
  const pointerTarget = startEvent.currentTarget;
  if(pointerTarget && pointerTarget.setPointerCapture){
    try{ pointerTarget.setPointerCapture(pointerId); } catch {}
  }

  const onMove = (e)=>{
    if(e.pointerId !== pointerId) return;
    const rect = rail.getBoundingClientRect();
    if(rect.width <= 0) return;
    const localX = clamp(Math.round(e.clientX - rect.left), 0, Math.round(rect.width));
    const next = cloneTxtPrefs(wstate.txtPrefs || TXT_DEFAULT_PREFS);
    if(markerType === 'left'){
      next.left = localX;
    } else if(markerType === 'right'){
      next.right = Math.round(rect.width - localX);
    } else if(markerType === 'indent'){
      next.indent = localX - next.left;
    } else {
      return;
    }
    wstate.txtPrefs = applyTxtPrefsToShell(shell, next);
    wstate.txtDirty = true;
    scheduleTxtAutosave(winId, serializeTxtEditorHtml(editor));
  };

  const stop = (e)=>{
    if(e.pointerId !== pointerId) return;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
    if(pointerTarget && pointerTarget.releasePointerCapture){
      try{ pointerTarget.releasePointerCapture(pointerId); } catch {}
    }
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', stop);
  window.addEventListener('pointercancel', stop);
  onMove(startEvent);
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
    content: '<p><br></p>',
    contentFormat: 'html',
    txtPrefs: cloneTxtPrefs(),
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

function openFolderWindow(folderId, opts = {}){
  const folder = getFsItem(folderId);
  if(!folder || folder.type !== 'folder' || state.trash.has(folderId)) return null;
  let navId = opts.navId || folderId;
  if(navId === DESKTOP_NAV_ID) navId = folderId;
  const navItem = getFsItem(navId);
  const targetFolderId = (navItem && navItem.type === 'folder' && !state.trash.has(navItem.id))
    ? navItem.id
    : folderId;
  const seekerWasOpen = state.windows.has('seeker');
  rememberSeekerRecent({ kind:'folder', id:targetFolderId }, { refresh: false });
  const winEl = openSeekerSection(getSeekerSectionForFolderId(targetFolderId));
  if(seekerWasOpen) playSfx('fileOpen');
  return winEl;
}

function openTxtFileWindow(txtId, opts = {}){
  const item = getFsItem(txtId);
  if(!item || item.type !== 'txt' || state.trash.has(txtId)) return null;
  rememberSeekerRecent({ kind:'txt', id:txtId });
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
    focusWindowAndRefreshTaskbar(winId);
    return el;
  }

  const area = $('#desktopArea').getBoundingClientRect();
  const desiredWidth = clamp(Math.round(area.width * (state.isMobile ? 0.86 : 0.48)), 320, 680);
  const desiredHeight = clamp(Math.round(area.height * (state.isMobile ? 0.78 : 0.52)), 250, 560);
  const rect = normalizeWindowRect({
    left: Math.round((area.width - desiredWidth) / 2),
    top: Math.round((area.height - desiredHeight) / (state.isMobile ? 2.6 : 2.2)),
    width: desiredWidth,
    height: desiredHeight,
  }, area, 14);
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
    txtPrefs: normalizeTxtPrefs(item.txtPrefs),
    txtSaveTimer: null,
    txtResizeObserver: null,
    contentHTML: () => `
      <div class="txt-shell" data-txt-shell="1">
        <div class="txt-toolbar" role="toolbar" aria-label="${t('txt.toolbar')}">
          <label class="txt-select-wrap txt-select-wrap-styles" title="${t('txt.styles')}">
            <span class="txt-select-label">${t('txt.styles')}</span>
            <select class="txt-select" data-txt-control="style" aria-label="${t('txt.styles')}">
              <option value="">${t('txt.styles')}</option>
              <option value="paragraph">${t('txt.style.paragraph')}</option>
              <option value="heading">${t('txt.style.heading')}</option>
              <option value="subheading">${t('txt.style.subheading')}</option>
              <option value="quote">${t('txt.style.quote')}</option>
            </select>
          </label>
          <div class="txt-segment" role="group" aria-label="${t('txt.align.group')}">
            <button class="txt-tool-btn" type="button" data-txt-command="justifyLeft" data-txt-query="justifyLeft" aria-label="${t('txt.align.left')}" title="${t('txt.align.left')}"><span class="txt-glyph txt-glyph-left" aria-hidden="true"></span></button>
            <button class="txt-tool-btn" type="button" data-txt-command="justifyCenter" data-txt-query="justifyCenter" aria-label="${t('txt.align.center')}" title="${t('txt.align.center')}"><span class="txt-glyph txt-glyph-center" aria-hidden="true"></span></button>
            <button class="txt-tool-btn" type="button" data-txt-command="justifyRight" data-txt-query="justifyRight" aria-label="${t('txt.align.right')}" title="${t('txt.align.right')}"><span class="txt-glyph txt-glyph-right" aria-hidden="true"></span></button>
            <button class="txt-tool-btn" type="button" data-txt-command="justifyFull" data-txt-query="justifyFull" aria-label="${t('txt.align.justify')}" title="${t('txt.align.justify')}"><span class="txt-glyph txt-glyph-justify" aria-hidden="true"></span></button>
          </div>
          <label class="txt-select-wrap txt-select-wrap-spacing" title="${t('txt.spacing')}">
            <span class="txt-select-label">${t('txt.spacing')}</span>
            <select class="txt-select" data-txt-control="spacing" aria-label="${t('txt.spacing')}">
              <option value="">${t('txt.spacing')}</option>
              <option value="tight">${t('txt.spacing.tight')}</option>
              <option value="normal">${t('txt.spacing.normal')}</option>
              <option value="relaxed">${t('txt.spacing.relaxed')}</option>
              <option value="loose">${t('txt.spacing.loose')}</option>
            </select>
          </label>
          <label class="txt-select-wrap txt-select-wrap-lists" title="${t('txt.lists')}">
            <span class="txt-select-label">${t('txt.lists')}</span>
            <select class="txt-select" data-txt-control="list" aria-label="${t('txt.lists')}">
              <option value="">${t('txt.lists')}</option>
              <option value="none">${t('txt.list.none')}</option>
              <option value="bullets">${t('txt.list.bullets')}</option>
              <option value="numbers">${t('txt.list.numbers')}</option>
            </select>
          </label>
          <div class="txt-mini-group" role="group" aria-label="${t('txt.format.group')}">
            <button class="txt-tool-btn txt-tool-btn-text" type="button" data-txt-command="bold" data-txt-query="bold" title="${t('txt.format.bold')}" aria-label="${t('txt.format.bold')}">B</button>
            <button class="txt-tool-btn txt-tool-btn-text" type="button" data-txt-command="italic" data-txt-query="italic" title="${t('txt.format.italic')}" aria-label="${t('txt.format.italic')}">I</button>
            <button class="txt-tool-btn txt-tool-btn-text" type="button" data-txt-command="underline" data-txt-query="underline" title="${t('txt.format.underline')}" aria-label="${t('txt.format.underline')}">U</button>
          </div>
          <div class="txt-toolbar-spacer"></div>
          <div class="txt-mini-group txt-mini-group-file" role="group" aria-label="${t('txt.file.group')}">
            <button class="txt-tool-btn txt-tool-btn-mini" type="button" data-txt-action="new" title="${t('menu.txt.new')}" aria-label="${t('menu.txt.new')}">N</button>
            <button class="txt-tool-btn txt-tool-btn-mini" type="button" data-txt-action="duplicate" title="${t('menu.txt.duplicate')}" aria-label="${t('menu.txt.duplicate')}">D</button>
            <button class="txt-tool-btn txt-tool-btn-mini" type="button" data-txt-action="save" title="${t('menu.txt.save')}" aria-label="${t('menu.txt.save')}">S</button>
          </div>
        </div>
        <div class="txt-ruler" data-txt-ruler="1" aria-label="${t('txt.ruler')}">
          <div class="txt-ruler-rail" data-txt-ruler-rail="1">
            <span class="txt-ruler-num" style="left:0%;">0</span>
            <span class="txt-ruler-num" style="left:16.66%;">1</span>
            <span class="txt-ruler-num" style="left:33.33%;">2</span>
            <span class="txt-ruler-num" style="left:50%;">3</span>
            <span class="txt-ruler-num" style="left:66.66%;">4</span>
            <span class="txt-ruler-num" style="left:83.33%;">5</span>
            <span class="txt-ruler-num" style="left:100%;">6</span>
            <button class="txt-ruler-marker txt-ruler-marker-left" type="button" data-txt-ruler-marker="left" aria-label="${t('txt.ruler.left')}" title="${t('txt.ruler.left')}"></button>
            <button class="txt-ruler-marker txt-ruler-marker-indent" type="button" data-txt-ruler-marker="indent" aria-label="${t('txt.ruler.indent')}" title="${t('txt.ruler.indent')}"></button>
            <button class="txt-ruler-marker txt-ruler-marker-right" type="button" data-txt-ruler-marker="right" aria-label="${t('txt.ruler.right')}" title="${t('txt.ruler.right')}"></button>
          </div>
        </div>
        <div class="txt-editor-wrap">
          <div class="txt-editor" data-txt-editor="1" contenteditable="true" spellcheck="false"></div>
        </div>
      </div>
    `,
  };
  state.windows.set(winId, wstate);
  createWindowElement(wstate);
  const winEl = document.getElementById(`win_${winId}`);
  focusWindowAndRefreshTaskbar(winId);
  return winEl;
}

function getRenderableFsChildren(parentId){
  return getFsChildren(parentId).filter(item => {
    if(item.type === 'app') return !!getAppById(item.appId || item.id);
    if(item.type === 'virtual') return !!getVirtualIconById(item.appId || item.id);
    return true;
  });
}

function saveTxtFileContent(txtId, content, txtPrefs = null){
  const item = getFsItem(txtId);
  if(!item || item.type !== 'txt') return false;
  const payload = {
    id: txtId,
    content: sanitizeTxtHtml(content),
    contentFormat: 'html',
  };
  if(txtPrefs && typeof txtPrefs === 'object'){
    payload.txtPrefs = normalizeTxtPrefs(txtPrefs);
  }
  upsertFsItem(payload, { save: false, syncIconPos: false });
  saveDesktopFs();
  return true;
}

function scheduleTxtAutosave(winId, content){
  const wstate = state.windows.get(winId);
  if(!wstate || wstate.kind !== 'txt') return;
  if(wstate.txtSaveTimer) clearTimeout(wstate.txtSaveTimer);
  const prefs = normalizeTxtPrefs(wstate.txtPrefs);
  wstate.txtSaveTimer = setTimeout(()=>{
    saveTxtFileContent(wstate.txtId, content, prefs);
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
  const editor = winEl.querySelector('[data-txt-editor="1"]');
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
  if(action === 'save' && editor){
    if(wstate.txtSaveTimer) clearTimeout(wstate.txtSaveTimer);
    wstate.txtSaveTimer = null;
    saveTxtFileContent(item.id, serializeTxtEditorHtml(editor), wstate.txtPrefs);
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
  updateTxtShellResponsive(shell);
  const editor = getTxtEditorFromShell(shell);
  if(!editor) return;
  if(!wstate.txtPrefs) wstate.txtPrefs = normalizeTxtPrefs(item.txtPrefs);
  wstate.txtPrefs = applyTxtPrefsToShell(shell, wstate.txtPrefs);
  const value = getTxtDocumentHtml(item);
  if(!wstate.txtDirty){
    const current = serializeTxtEditorHtml(editor);
    if(current !== value){
      editor.innerHTML = value;
    }
  }

  if(!shell.dataset.bound){
    shell.addEventListener('click', (e)=>{
      const target = getEventTargetEl(e);
      const actionBtn = target && target.closest ? target.closest('[data-txt-action]') : null;
      if(actionBtn && actionBtn.dataset){
        e.preventDefault();
        e.stopPropagation();
        handleTxtAction(winId, actionBtn.dataset.txtAction);
        return;
      }
      const cmdBtn = target && target.closest ? target.closest('[data-txt-command]') : null;
      if(cmdBtn && cmdBtn.dataset && cmdBtn.dataset.txtCommand){
        e.preventDefault();
        e.stopPropagation();
        runTxtEditorCommand(winId, shell, cmdBtn.dataset.txtCommand);
      }
    });
    shell.addEventListener('change', (e)=>{
      const target = getEventTargetEl(e);
      if(!target || !target.dataset || !target.dataset.txtControl) return;
      handleTxtControlChange(winId, shell, target.dataset.txtControl, target.value);
      target.value = '';
    });
    shell.addEventListener('pointerdown', (e)=>{
      const target = getEventTargetEl(e);
      const marker = target && target.closest ? target.closest('[data-txt-ruler-marker]') : null;
      if(!marker || !marker.dataset || !marker.dataset.txtRulerMarker) return;
      beginTxtRulerDrag(winId, shell, marker.dataset.txtRulerMarker, e);
    });
    editor.addEventListener('focus', ()=>{
      try{ document.execCommand('defaultParagraphSeparator', false, 'p'); } catch {}
      updateTxtCommandButtonState(shell);
    });
    editor.addEventListener('input', ()=>{
      wstate.txtDirty = true;
      scheduleTxtAutosave(winId, serializeTxtEditorHtml(editor));
      updateTxtCommandButtonState(shell);
    });
    editor.addEventListener('keyup', ()=>{ updateTxtCommandButtonState(shell); });
    editor.addEventListener('mouseup', ()=>{ updateTxtCommandButtonState(shell); });
    editor.addEventListener('keydown', (e)=>{
      const key = String(e.key || '').toLowerCase();
      if((e.metaKey || e.ctrlKey) && key === 's'){
        e.preventDefault();
        handleTxtAction(winId, 'save');
      }
    });
    editor.addEventListener('blur', ()=>{
      if(wstate.txtDirty) handleTxtAction(winId, 'save');
    });
    if(typeof ResizeObserver === 'function'){
      const observer = new ResizeObserver(()=>{
        const current = state.windows.get(winId);
        if(!current || current.kind !== 'txt') return;
        updateTxtShellResponsive(shell);
        current.txtPrefs = applyTxtPrefsToShell(shell, current.txtPrefs);
      });
      observer.observe(shell);
      wstate.txtResizeObserver = observer;
    }
    shell.dataset.bound = '1';
  }
  updateTxtCommandButtonState(shell);

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

function ensureSeekerState(){
  if(!state.seeker || typeof state.seeker !== 'object'){
    state.seeker = {};
  }
  if(!Array.isArray(state.seeker.history)) state.seeker.history = ['desktop'];
  if(typeof state.seeker.historyIndex !== 'number') state.seeker.historyIndex = 0;
  if(!state.seeker.history[state.seeker.historyIndex]) state.seeker.history = ['desktop'];
  if(typeof state.seeker.section !== 'string') state.seeker.section = state.seeker.history[state.seeker.historyIndex] || 'desktop';
  if(state.seeker.view !== 'list' && state.seeker.view !== 'icons') state.seeker.view = 'icons';
  if(typeof state.seeker.search !== 'string') state.seeker.search = '';
  if(!Array.isArray(state.seeker.recent)) state.seeker.recent = [];
  if(typeof state.seeker.selectedKey !== 'string') state.seeker.selectedKey = '';
  if(typeof state.seeker.lastClickKey !== 'string') state.seeker.lastClickKey = '';
  if(typeof state.seeker.lastClickTs !== 'number') state.seeker.lastClickTs = 0;
  return state.seeker;
}

function refreshOpenSeekerWindows(){
  const win = document.getElementById('win_seeker');
  if(win) renderSeekerWindow(win);
}

function rememberSeekerRecent(entry, opts = {}){
  const seeker = ensureSeekerState();
  if(!entry || !entry.kind || !entry.id) return;
  if(entry.kind === 'app' && entry.id === 'seeker') return;
  const key = `${entry.kind}:${entry.id}`;
  const list = Array.isArray(seeker.recent) ? seeker.recent.slice() : [];
  const next = list.filter(it => `${it.kind}:${it.id}` !== key);
  next.unshift({
    kind: entry.kind,
    id: entry.id,
    ts: Date.now(),
  });
  seeker.recent = next.slice(0, 40);
  if(opts.refresh !== false) refreshOpenSeekerWindows();
}

const SEEKER_FOLDER_PREFIX = 'folder:';
const SEEKER_COMPUTER_SECTION = 'device-macintosh';
const SEEKER_COMPUTER_HD_SECTION = 'computer-hd';

function getSeekerComputerLabel(){
  const user = (state.user || '').trim();
  if(!user) return t('seeker.device.macintosh');
  return `${user}'s Computer`;
}

function getSeekerSectionForFolderId(folderId){
  const folder = getFsItem(folderId);
  if(!folder || folder.type !== 'folder' || state.trash.has(folder.id)){
    return 'desktop';
  }
  return `${SEEKER_FOLDER_PREFIX}${folder.id}`;
}

function getSeekerFolderIdFromSection(sectionId){
  if(typeof sectionId !== 'string') return null;
  const token = sectionId.trim();
  if(!token || !token.startsWith(SEEKER_FOLDER_PREFIX)) return null;
  const folderId = token.slice(SEEKER_FOLDER_PREFIX.length);
  if(!folderId) return null;
  const folder = getFsItem(folderId);
  if(!folder || folder.type !== 'folder' || state.trash.has(folder.id)) return null;
  return folder.id;
}

function getSeekerSectionMeta(sectionId){
  const section = normalizeSeekerSection(sectionId || 'desktop');
  const folderId = getSeekerFolderIdFromSection(section);
  if(folderId){
    const folder = getFsItem(folderId);
    return {
      id: section,
      title: folder ? getFsItemLabel(folder) : t('seeker.section.desktop'),
      icon: getFolderIconPath(),
    };
  }
  if(section === SEEKER_COMPUTER_SECTION){
    return { id:SEEKER_COMPUTER_SECTION, title:getSeekerComputerLabel(), icon:'./assets/icons/computer.png' };
  }
  if(section === SEEKER_COMPUTER_HD_SECTION){
    return { id:SEEKER_COMPUTER_HD_SECTION, title:'HD', icon:'./assets/icons/hd.png' };
  }
  if(section === 'applications'){
    return { id:'applications', title:t('seeker.section.applications'), icon:'./assets/icons/applications.png' };
  }
  if(section === 'documents'){
    return { id:'documents', title:t('seeker.section.documents'), icon:'./assets/icons/documents.png' };
  }
  if(section === 'trash'){
    return { id:'trash', title:t('seeker.section.trash'), icon:getTrashIconFile() };
  }
  if(section === 'recent'){
    return { id:'recent', title:t('seeker.section.recent'), icon:'./assets/icons/recents.png' };
  }
  return { id:'desktop', title:t('seeker.section.desktop'), icon:'./assets/icons/desktop.png' };
}

function getSeekerSidebarIconSpec(sectionId){
  const section = normalizeSeekerSection(sectionId || 'desktop');
  if(section === SEEKER_COMPUTER_SECTION){
    return {
      id: 'seeker-device-mac',
      icon: 'app',
      iconFile: './assets/icons/computer.png',
      label: getSeekerComputerLabel(),
    };
  }
  if(section === 'desktop'){
    return {
      id: 'seeker-place-desktop',
      icon: 'app',
      iconFile: './assets/icons/desktop.png',
      label: t('seeker.section.desktop'),
    };
  }
  if(section === 'applications'){
    return {
      id: 'seeker-place-apps',
      icon: 'app',
      iconFile: './assets/icons/applications.png',
      label: t('seeker.section.applications'),
    };
  }
  if(section === 'documents'){
    return {
      id: 'seeker-place-docs',
      icon: 'file',
      iconFile: './assets/icons/documents.png',
      label: t('seeker.section.documents'),
    };
  }
  if(section === 'trash'){
    return {
      id: 'seeker-place-trash',
      icon: 'trash',
      iconFile: getTrashIconFile,
      label: t('seeker.section.trash'),
    };
  }
  if(section === 'recent'){
    return {
      id: 'seeker-place-recent',
      icon: 'settings',
      iconFile: './assets/icons/recents.png',
      label: t('seeker.section.recent'),
    };
  }
  return null;
}

function normalizeSeekerSection(sectionId){
  if(typeof sectionId !== 'string') return 'desktop';
  const token = sectionId.trim();
  if(!token) return 'desktop';
  const folderTokenId = getSeekerFolderIdFromSection(token);
  if(folderTokenId) return `${SEEKER_FOLDER_PREFIX}${folderTokenId}`;
  const plainFolder = getFsItem(token);
  if(plainFolder && plainFolder.type === 'folder' && !state.trash.has(plainFolder.id)){
    return `${SEEKER_FOLDER_PREFIX}${plainFolder.id}`;
  }
  if(
    token === SEEKER_COMPUTER_SECTION ||
    token === SEEKER_COMPUTER_HD_SECTION ||
    token === 'applications' ||
    token === 'documents' ||
    token === 'trash' ||
    token === 'recent'
  ){
    return token;
  }
  return 'desktop';
}

function getSeekerContentIconSize(){
  return state.isMobile ? 34 : 48;
}

function buildSeekerAppItem(app){
  if(!app) return null;
  const label = getIconLabel(app);
  const iconSize = getSeekerContentIconSize();
  return {
    key: `app:${app.id}`,
    kind: 'app',
    id: app.id,
    label,
    subtitle: t('seeker.section.applications'),
    iconHtml: getThemedIconHtml(app, label, iconSize),
  };
}

function buildSeekerFsItem(fsItem){
  if(!fsItem) return null;
  const label = getFsItemLabel(fsItem);
  const iconSize = getSeekerContentIconSize();
  let subtitle = '';
  if(fsItem.type === 'folder') subtitle = t('fs.newFolderName');
  if(fsItem.type === 'txt') subtitle = t('seeker.section.documents');
  if(fsItem.type === 'app') subtitle = t('seeker.section.applications');
  return {
    key: `fs:${fsItem.id}`,
    kind: fsItem.type,
    id: fsItem.id,
    label,
    subtitle,
    iconHtml: getFsIconHtml(fsItem, label, iconSize),
  };
}

function buildSeekerPoemItem(poem){
  if(!poem) return null;
  const iconSize = getSeekerContentIconSize();
  return {
    key: `poem:${poem.id}`,
    kind: 'poem',
    id: poem.id,
    label: poem.title,
    subtitle: t('app.poetry'),
    iconHtml: getThemedIconHtml({ id:`poem-${poem.id}`, icon:'file', iconFile:'./assets/icons/poetry2.png' }, poem.title, iconSize),
  };
}

function buildSeekerComputerHdItem(){
  const label = 'HD';
  const iconSize = getSeekerContentIconSize();
  return {
    key: `virtual:${SEEKER_COMPUTER_HD_SECTION}`,
    kind: 'virtual',
    id: SEEKER_COMPUTER_HD_SECTION,
    label,
    subtitle: '',
    openSection: SEEKER_COMPUTER_HD_SECTION,
    iconHtml: getThemedIconHtml({ id:'seeker-hd', icon:'folder', iconFile:'./assets/icons/hd.png' }, label, iconSize),
  };
}

function getSeekerComputerItems(){
  const hd = buildSeekerComputerHdItem();
  return hd ? [hd] : [];
}

function getSeekerDesktopItems(){
  const items = getRenderableFsChildren(null)
    .filter(isDesktopVisibleItem)
    .map(buildSeekerFsItem)
    .filter(Boolean);
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

function getSeekerApplicationsItems(){
  const apps = APPS
    .filter(app => app.id !== 'trash' && app.id !== 'dope-skate')
    .map(buildSeekerAppItem)
    .filter(Boolean);
  return apps.sort((a, b) => a.label.localeCompare(b.label));
}

function getSeekerDocumentsItems(){
  const docs = Object.values(state.fs.items || {})
    .filter(item => item && item.type === 'txt' && !state.trash.has(item.id))
    .map(buildSeekerFsItem)
    .filter(Boolean);
  const poems = POEMS.map(buildSeekerPoemItem).filter(Boolean);
  return docs.concat(poems).sort((a, b) => a.label.localeCompare(b.label));
}

function getSeekerComputerHdItems(){
  const apps = APPS
    .filter(app => app && app.id !== 'trash' && app.id !== 'dope-skate')
    .map(buildSeekerAppItem)
    .filter(Boolean);
  const fsItems = Object.values(state.fs.items || {})
    .filter(item => item && !state.trash.has(item.id) && (
      item.type === 'folder' ||
      item.type === 'txt' ||
      item.type === 'virtual'
    ))
    .map(buildSeekerFsItem)
    .filter(Boolean);
  const poems = POEMS.map(buildSeekerPoemItem).filter(Boolean);
  const merged = [];
  const seen = new Set();
  apps.concat(fsItems, poems).forEach(item => {
    if(!item || !item.key || seen.has(item.key)) return;
    seen.add(item.key);
    merged.push(item);
  });
  return merged.sort((a, b) => a.label.localeCompare(b.label));
}

function getSeekerTrashItems(){
  const items = Array.from(state.trash)
    .map(id => {
      const app = getAppById(id);
      if(app){
        const appItem = buildSeekerAppItem(app);
        if(!appItem) return null;
        appItem.subtitle = t('seeker.section.trash');
        return appItem;
      }
      const fsItem = getFsItem(id);
      if(!fsItem) return null;
      const entry = buildSeekerFsItem(fsItem);
      if(!entry) return null;
      entry.subtitle = t('seeker.section.trash');
      return entry;
    })
    .filter(Boolean);
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

function getSeekerFolderItems(folderId){
  const folder = getFsItem(folderId);
  if(!folder || folder.type !== 'folder' || state.trash.has(folder.id)) return [];
  const orderedIds = APPS.filter(app => app.showOnDesktop !== false).map(app => app.id)
    .concat(VIRTUAL_ICONS.map(v => v.id));
  const orderIndex = new Map(orderedIds.map((id, idx) => [id, idx]));
  const items = getRenderableFsChildren(folderId)
    .map(buildSeekerFsItem)
    .filter(Boolean);
  items.sort((a, b) => {
    const ia = orderIndex.has(a.id) ? orderIndex.get(a.id) : 1e6;
    const ib = orderIndex.has(b.id) ? orderIndex.get(b.id) : 1e6;
    if(ia !== ib) return ia - ib;
    const fsA = getFsItem(a.id);
    const fsB = getFsItem(b.id);
    const createdA = fsA && Number.isFinite(fsA.createdAt) ? fsA.createdAt : 0;
    const createdB = fsB && Number.isFinite(fsB.createdAt) ? fsB.createdAt : 0;
    if(createdA !== createdB) return createdA - createdB;
    return a.label.localeCompare(b.label);
  });
  return items;
}

function resolveSeekerRecentEntry(entry){
  if(!entry || !entry.kind || !entry.id) return null;
  if(entry.kind === 'app'){
    const app = getAppById(entry.id);
    if(!app) return null;
    return buildSeekerAppItem(app);
  }
  if(entry.kind === 'folder' || entry.kind === 'txt'){
    const fsItem = getFsItem(entry.id);
    if(!fsItem || state.trash.has(entry.id)) return null;
    return buildSeekerFsItem(fsItem);
  }
  if(entry.kind === 'poem'){
    const poem = getPoemById(entry.id);
    if(!poem) return null;
    return buildSeekerPoemItem(poem);
  }
  return null;
}

function getSeekerOpenWindowItems(){
  const windows = Array.from(state.windows.values())
    .filter(win => !!win)
    .sort((a, b) => (b.z || 0) - (a.z || 0));
  const items = [];
  windows.forEach(win => {
    if(win.id === 'seeker') return;
    if(win.kind === 'folder'){
      const folder = getFsItem(win.folderId || win.folderNavId);
      if(folder && !state.trash.has(folder.id)){
        const item = buildSeekerFsItem(folder);
        if(item) items.push(item);
      }
      return;
    }
    if(win.kind === 'txt'){
      const txt = getFsItem(win.txtId);
      if(txt && !state.trash.has(txt.id)){
        const item = buildSeekerFsItem(txt);
        if(item) items.push(item);
      }
      return;
    }
    const app = getAppById(win.id);
    if(!app || app.id === 'trash') return;
    const item = buildSeekerAppItem(app);
    if(item) items.push(item);
  });
  return items;
}

function getSeekerRecentKey(item){
  if(!item) return '';
  if(item.kind === 'folder' || item.kind === 'txt' || item.kind === 'app' || item.kind === 'poem'){
    return `${item.kind}:${item.id}`;
  }
  return item.key || '';
}

function getSeekerRecentItems(){
  const seeker = ensureSeekerState();
  const items = [];
  const seen = new Set();
  getSeekerOpenWindowItems().forEach(item => {
    if(!item) return;
    const key = getSeekerRecentKey(item);
    if(!key || seen.has(key)) return;
    seen.add(key);
    items.push(item);
  });
  seeker.recent.forEach(entry => {
    const key = `${entry.kind}:${entry.id}`;
    if(seen.has(key)) return;
    const item = resolveSeekerRecentEntry(entry);
    if(!item) return;
    seen.add(key);
    items.push(item);
  });
  return items;
}

function getSeekerItemsBySection(sectionId){
  const section = normalizeSeekerSection(sectionId);
  const folderId = getSeekerFolderIdFromSection(section);
  if(folderId) return getSeekerFolderItems(folderId);
  if(section === SEEKER_COMPUTER_SECTION) return getSeekerComputerItems();
  if(section === SEEKER_COMPUTER_HD_SECTION) return getSeekerComputerHdItems();
  if(section === 'applications') return getSeekerApplicationsItems();
  if(section === 'documents') return getSeekerDocumentsItems();
  if(section === 'trash') return getSeekerTrashItems();
  if(section === 'recent') return getSeekerRecentItems();
  return getSeekerDesktopItems();
}

function updateSeekerHistory(sectionId, opts = {}){
  const seeker = ensureSeekerState();
  const section = normalizeSeekerSection(sectionId);
  seeker.section = section;
  if(opts.fromHistory) return;
  const currentToken = seeker.history[seeker.historyIndex];
  if(currentToken === section) return;
  seeker.history = seeker.history.slice(0, seeker.historyIndex + 1);
  seeker.history.push(section);
  seeker.historyIndex = seeker.history.length - 1;
}

function setSeekerView(mode){
  const seeker = ensureSeekerState();
  if(mode !== 'icons' && mode !== 'list') return;
  if(seeker.view === mode) return;
  seeker.view = mode;
  refreshOpenSeekerWindows();
}

function moveSeekerHistory(delta){
  const seeker = ensureSeekerState();
  const nextIndex = clamp(seeker.historyIndex + delta, 0, seeker.history.length - 1);
  if(nextIndex === seeker.historyIndex) return;
  seeker.historyIndex = nextIndex;
  seeker.section = normalizeSeekerSection(seeker.history[nextIndex] || 'desktop');
  refreshOpenSeekerWindows();
}

function getFsIdFromSeekerEntry(entry){
  if(!entry) return null;
  if(entry.kind === 'folder' || entry.kind === 'txt' || entry.kind === 'app' || entry.kind === 'virtual'){
    return entry.id || null;
  }
  return null;
}

function makeSeekerItemDraggable(itemEl, shell){
  if(!itemEl || !shell || itemEl.dataset.seekerDragBound === '1') return;
  itemEl.dataset.seekerDragBound = '1';

  let down = false;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let ghost = null;
  let dragId = null;
  let lastEvent = null;
  const dragLayer = $('#dragLayer');

  const cleanup = ()=>{
    itemEl.removeEventListener('pointermove', onPointerMove);
    itemEl.removeEventListener('pointerup', onPointerUp);
    itemEl.removeEventListener('pointercancel', onPointerUp);
    window.removeEventListener('blur', onWindowBlur);
    if(ghost && dragLayer){
      ghost.remove();
      ghost = null;
      dragLayer.classList.remove('active');
    }
    clearSeekerDropPreview();
    dragging = false;
    pointerId = null;
    dragId = null;
  };

  const endDrag = (e, cancel = false)=>{
    if(!down) return;
    if(pointerId !== null && e && e.pointerId !== pointerId) return;
    down = false;
    try{ itemEl.releasePointerCapture(pointerId); } catch {}

    const eventRef = e || lastEvent;
    const didDrag = dragging;

    if(didDrag && !cancel && eventRef && dragId){
      const ids = [dragId];
      const dragEls = [];
      if(ghost) dragEls.push(ghost);
      dragEls.push(itemEl);

      if(isOverTrashWindow(eventRef.clientX, eventRef.clientY) || isOverTrash(eventRef.clientX, eventRef.clientY)){
        moveIconsToTrash(ids);
      } else {
        const seekerTarget = getSeekerDropTargetAt(eventRef.clientX, eventRef.clientY, dragEls, ids);
        if(seekerTarget){
          if(seekerTarget.kind === 'trash'){
            moveIconsToTrash(ids);
          } else if(seekerTarget.kind === 'folder'){
            moveDraggedItemsToFolderTarget(ids, seekerTarget.folderId, {
              preferredPos: { x: 20, y: 20 },
            });
          }
        } else {
          const folderTarget = getFolderDropTargetAt(eventRef.clientX, eventRef.clientY, dragEls, ids, { allowTrashed: true });
          if(folderTarget){
            moveDraggedItemsToFolderTarget(ids, folderTarget.id, {
              preferredPos: { x: 20, y: 20 },
            });
          } else {
            const targetEl = getDropTargetElement(eventRef.clientX, eventRef.clientY, dragEls);
            const overWindow = targetEl && targetEl.closest ? targetEl.closest('.window') : null;
            if(isOverDesktopArea(eventRef.clientX, eventRef.clientY) && !overWindow){
              const preferred = getDesktopPosFromClient(eventRef.clientX, eventRef.clientY);
              moveDraggedItemsToFolderTarget(ids, null, { preferredPos: preferred });
            }
          }
        }
      }
      itemEl.dataset.dragged = '1';
    }

    cleanup();
  };

  const onWindowBlur = ()=> endDrag(lastEvent, true);

  const onPointerMove = (e)=>{
    if(!down) return;
    if(pointerId !== null && e.pointerId !== pointerId) return;
    lastEvent = e;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if(!dragging && (Math.abs(dx) + Math.abs(dy) > 4)){
      dragging = true;
      if(dragLayer){
        dragLayer.classList.add('active');
        ghost = itemEl.cloneNode(true);
        ghost.classList.add('folder-drag-ghost', 'seeker-drag-ghost');
        const rect = itemEl.getBoundingClientRect();
        ghost.style.width = `${Math.max(110, Math.round(rect.width))}px`;
        dragLayer.appendChild(ghost);
      }
    }
    if(!dragging) return;
    if(ghost){
      const area = $('#desktopArea').getBoundingClientRect();
      ghost.style.left = `${Math.round(e.clientX - area.left - 54)}px`;
      ghost.style.top = `${Math.round(e.clientY - area.top - 28)}px`;
    }
    if(dragId){
      const dragEls = [];
      if(ghost) dragEls.push(ghost);
      dragEls.push(itemEl);
      const seekerTarget = getSeekerDropTargetAt(e.clientX, e.clientY, dragEls, [dragId]);
      setSeekerDropPreview(seekerTarget);
    }
    e.preventDefault();
  };

  const onPointerUp = (e)=> endDrag(e, false);

  const onPointerDown = (e)=>{
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    const section = normalizeSeekerSection(ensureSeekerState().section || 'desktop');
    if(!seekerSectionAcceptsDrag(section)) return;
    const key = itemEl.dataset ? itemEl.dataset.seekerItem : '';
    const items = Array.isArray(shell._seekerItems) ? shell._seekerItems : [];
    const entry = items.find(it => it.key === key);
    const nextId = getFsIdFromSeekerEntry(entry);
    if(!nextId || nextId === 'trash') return;

    down = true;
    dragging = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    lastEvent = e;
    dragId = nextId;
    itemEl.dataset.dragged = '0';

    try{ itemEl.setPointerCapture(pointerId); } catch {}
    itemEl.addEventListener('pointermove', onPointerMove);
    itemEl.addEventListener('pointerup', onPointerUp);
    itemEl.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('blur', onWindowBlur);
    e.preventDefault();
    e.stopPropagation();
  };

  itemEl.addEventListener('pointerdown', onPointerDown);
}

function openSeekerSection(sectionId, opts = {}){
  const winEl = openApp('seeker', opts);
  updateSeekerHistory(sectionId);
  renderSeekerWindow(winEl);
  return winEl;
}

function openSeekerItem(item){
  if(!item) return;
  if(item.kind === 'app'){
    openApp(item.id);
    return;
  }
  if(item.kind === 'virtual'){
    if(item.openSection){
      openSeekerSection(item.openSection);
      return;
    }
    openIconById(item.id);
    return;
  }
  if(item.kind === 'folder'){
    openFolderWindow(item.id);
    return;
  }
  if(item.kind === 'txt'){
    openTxtFileWindow(item.id);
    return;
  }
  if(item.kind === 'poem'){
    state.poetry.view = 'read';
    state.poetry.currentId = item.id;
    state.poetry.readLang = state.lang;
    rememberSeekerRecent({ kind:'poem', id:item.id });
    if(!state.windows.has('poetry')){
      openApp('poetry');
    }
    renderPoetryWindow();
  }
}

function renderSeekerWindow(winEl){
  const win = winEl || document.getElementById('win_seeker');
  if(!win) return;
  const shell = win.querySelector('[data-seeker-shell="1"]');
  if(!shell) return;
  const seeker = ensureSeekerState();

  const section = normalizeSeekerSection(seeker.section);
  seeker.section = section;
  const meta = getSeekerSectionMeta(section);
  const query = (seeker.search || '').trim().toLowerCase();
  const allItems = getSeekerItemsBySection(section);
  const filtered = !query
    ? allItems
    : allItems.filter(item => {
      const hay = `${item.label} ${item.subtitle || ''}`.toLowerCase();
      return hay.includes(query);
    });
  shell._seekerItems = filtered;

  const locationIcon = shell.querySelector('[data-seeker-location-icon="1"]');
  const locationName = shell.querySelector('[data-seeker-location-name="1"]');
  const mainTitle = shell.querySelector('[data-seeker-main-title="1"]');
  const itemsHost = shell.querySelector('[data-seeker-items="1"]');
  const searchInput = shell.querySelector('[data-seeker-search="1"]');
  const statusEl = shell.querySelector('[data-seeker-status="1"]');
  const backBtn = shell.querySelector('[data-seeker-nav="back"]');
  const forwardBtn = shell.querySelector('[data-seeker-nav="forward"]');
  const trashEmptyBtn = shell.querySelector('[data-seeker-trash-empty="1"]');

  if(searchInput && searchInput.value !== seeker.search){
    searchInput.value = seeker.search;
  }
  if(locationName) locationName.textContent = meta.title;
  if(mainTitle) mainTitle.textContent = meta.title;
  if(locationIcon){
    locationIcon.innerHTML = getThemedIconHtml({ id:`seeker-loc-${meta.id}`, icon:'folder', iconFile:meta.icon }, meta.title, 16);
  }
  shell.querySelectorAll('.seeker-side-item[data-seeker-open]').forEach(btn => {
    const token = normalizeSeekerSection((btn.dataset && btn.dataset.seekerOpen) || 'desktop');
    const spec = getSeekerSidebarIconSpec(token);
    if(!spec) return;
    const iconHost = btn.querySelector('.seeker-side-icon');
    if(iconHost){
      iconHost.innerHTML = getThemedIconHtml(
        { id: spec.id, icon: spec.icon, iconFile: spec.iconFile },
        spec.label,
        16
      );
    }
    const computerLabel = btn.querySelector('[data-seeker-device-mac-label="1"]');
    if(computerLabel && token === SEEKER_COMPUTER_SECTION){
      computerLabel.textContent = spec.label;
    }
  });

  if(itemsHost){
    itemsHost.classList.toggle('seeker-items-list', seeker.view === 'list');
    itemsHost.classList.toggle('seeker-items-icons', seeker.view !== 'list');
    if(filtered.length === 0){
      itemsHost.innerHTML = `<div class="seeker-empty tiny">${t('seeker.empty')}</div>`;
    } else if(seeker.view === 'list'){
      itemsHost.innerHTML = filtered.map(item => `
        <button class="seeker-item seeker-item-row${item.key === seeker.selectedKey ? ' selected' : ''}" type="button" data-seeker-item="${item.key}">
          <span class="seeker-item-icon pixel">${item.iconHtml}</span>
          <span class="seeker-item-copy">
            <span class="seeker-item-label">${escapeHTML(item.label)}</span>
            <span class="seeker-item-subtitle">${escapeHTML(item.subtitle || '')}</span>
          </span>
        </button>
      `).join('');
    } else {
      itemsHost.innerHTML = filtered.map(item => `
        <button class="seeker-item seeker-item-card${item.key === seeker.selectedKey ? ' selected' : ''}" type="button" data-seeker-item="${item.key}">
          <span class="seeker-item-icon pixel">${item.iconHtml}</span>
          <span class="seeker-item-label">${escapeHTML(item.label)}</span>
        </button>
      `).join('');
    }
    itemsHost.querySelectorAll('[data-seeker-item]').forEach(itemEl => {
      makeSeekerItemDraggable(itemEl, shell);
    });
  }

  if(statusEl){
    statusEl.textContent = `${filtered.length} ${t('seeker.itemLabel')}`;
  }
  if(trashEmptyBtn){
    const inTrashSection = section === 'trash';
    trashEmptyBtn.classList.toggle('hidden', !inTrashSection);
    trashEmptyBtn.disabled = !inTrashSection || state.trash.size === 0;
  }
  if(backBtn) backBtn.disabled = seeker.historyIndex <= 0;
  if(forwardBtn) forwardBtn.disabled = seeker.historyIndex >= seeker.history.length - 1;

  shell.querySelectorAll('[data-seeker-view]').forEach(btn => {
    btn.classList.toggle('pressed', btn.dataset.seekerView === seeker.view);
  });
  shell.querySelectorAll('[data-seeker-open]').forEach(btn => {
    const token = normalizeSeekerSection(btn.dataset.seekerOpen || 'desktop');
    btn.classList.toggle('active', token === section);
  });
}

function initSeekerWindow(winEl){
  const win = winEl || document.getElementById('win_seeker');
  if(!win) return;
  const shell = win.querySelector('[data-seeker-shell="1"]');
  if(!shell) return;
  ensureSeekerState();

  if(!shell.dataset.seekerBound){
    shell.dataset.seekerBound = '1';

    shell.addEventListener('click', (e)=>{
      const target = getEventTargetEl(e);
      if(!target || !target.closest) return;
      const sectionBtn = target.closest('[data-seeker-open]');
      if(sectionBtn && sectionBtn.dataset){
        updateSeekerHistory(sectionBtn.dataset.seekerOpen || 'desktop');
        renderSeekerWindow(win);
        return;
      }

      const emptyBtn = target.closest('[data-seeker-trash-empty]');
      if(emptyBtn){
        emptyTrash();
        return;
      }

      const navBtn = target.closest('[data-seeker-nav]');
      if(navBtn && navBtn.dataset){
        const dir = navBtn.dataset.seekerNav === 'back' ? -1 : 1;
        moveSeekerHistory(dir);
        return;
      }

      const viewBtn = target.closest('[data-seeker-view]');
      if(viewBtn && viewBtn.dataset){
        setSeekerView(viewBtn.dataset.seekerView);
        return;
      }

      const itemBtn = target.closest('[data-seeker-item]');
      if(itemBtn && itemBtn.dataset){
        if(itemBtn.dataset.dragged === '1'){
          itemBtn.dataset.dragged = '0';
          return;
        }
        const key = itemBtn.dataset.seekerItem;
        const items = Array.isArray(shell._seekerItems) ? shell._seekerItems : [];
        const item = items.find(it => it.key === key);
        const seeker = ensureSeekerState();
        seeker.selectedKey = key || '';
        shell.querySelectorAll('[data-seeker-item]').forEach(el => {
          el.classList.toggle('selected', el === itemBtn);
        });
        if(!item) return;

        // Keyboard activation should keep single-activate behavior for accessibility.
        const clickDetail = Number(e.detail || 0);
        if(clickDetail === 0){
          openSeekerItem(item);
          seeker.lastClickKey = '';
          seeker.lastClickTs = 0;
          return;
        }

        const nowTs = Date.now();
        const isDoubleActivate = seeker.lastClickKey === key && (nowTs - seeker.lastClickTs) <= 420;
        seeker.lastClickKey = key || '';
        seeker.lastClickTs = nowTs;
        if(isDoubleActivate){
          openSeekerItem(item);
          seeker.lastClickKey = '';
          seeker.lastClickTs = 0;
        }
      }
    });

    const searchInput = shell.querySelector('[data-seeker-search="1"]');
    if(searchInput){
      searchInput.addEventListener('input', ()=>{
        ensureSeekerState().search = searchInput.value || '';
        renderSeekerWindow(win);
      });
    }
  }

  renderSeekerWindow(win);
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
  const isBliss98Theme = state.settings.theme === 'bliss98';
  const fsItem = ctxState.appId ? getFsItem(ctxState.appId) : null;
  const itemType = ctxState.itemType || (fsItem ? fsItem.type : null);
  const gridMark = state.gridSnap ? '✓' : '';

  const items = [];
  if(isDock){
    const disableRemove = ctxState.itemType === 'trash' || ctxState.appId === 'trash' || (ctxState.itemType === 'app' && ctxState.appId === 'seeker');
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
      if(!isBliss98Theme && isDockableItem(itemType, ctxState.appId)){
        const dockType = itemType === 'app' ? 'app' : itemType;
        const docked = isDockItemPresent(dockType, ctxState.appId);
        const lockedDockItem = dockType === 'app' && ctxState.appId === 'seeker';
        if(lockedDockItem && docked){
          items.push({ action:'addDock', label:t('ctx.alreadyDock'), disabled:true });
        } else {
          items.push({ action: docked ? 'removeDock' : 'addDock', label: t(docked ? 'ctx.removeDock' : 'ctx.addDock') });
        }
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
      items.push({ action:'desktopIcons', label:t('ctx.showDesktopIcons'), check:(state.settings.showDesktopIcons !== false) ? '✓' : '' });
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
      if(ctxState.appId === 'trash' || type === 'trash' || (type === 'app' && ctxState.appId === 'seeker')) return;
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
  if(action === 'desktopIcons'){
    setDesktopIconsVisible(!(state.settings.showDesktopIcons !== false));
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

/* ===== Module: 03-i18n-and-theme.js ===== */
      const I18N = {
        en: {
          'login.sub': 'Enter your name to login',
          'login.labelName': 'Name:',
          'login.placeholder': 'Enter your name',
          'login.chooseOs': 'Choose Your OS',
          'login.os.bliss98': 'Bliss98',
          'login.os.blissos': 'BlissOS',
          'login.os.blissaqua': 'Bliss Aqua',
          'login.hint': 'Hint: Ignorance is BLISS',
          'login.clear': 'Clear',
          'login.enter': 'Enter',
          'login.copyright': '© BLISS / DIEV — Bliss 98 OS',

          'common.soon': 'Soon.',
          'common.ok': 'OK',
          'common.cancel': 'Cancel',
          'common.save': 'Save',
          'common.open': 'Open',
          'common.copy': 'Copy',

          'aria.language': 'Language',
          'aria.startMenu': 'BLISS Menu',
          'aria.contextMenu': 'Context menu',
          'aria.close': 'Close',
          'start.menu': 'Menu',

          'menubar.file': 'File',
          'menubar.edit': 'Edit',
          'menubar.view': 'View',
          'menubar.help': 'Help',

          'status.ready': 'Ready',

          'win.minimize': 'Minimize',
          'win.maximize': 'Fit to content',
          'win.close': 'Close',
          'win.resize': 'Resize',

          'app.clothes': 'Clothes',
          'app.music': 'Music',
          'app.art': 'Artists',
          'app.games': 'Games',
          'app.videos': 'Videos',
          'app.about': 'About',
          'app.contact': 'Contact',
          'app.diev': 'DIEV',
          'app.settings': 'Settings',
          'app.poetry': 'Poetry',
          'app.trash': 'Trash',
          'app.mediaplayer': 'BLISS Media Player',
          'app.seeker': 'File Seeker',
          'app.seeker.file': 'File Seeker',
          'app.seeker.short': 'Seeker',
          'games.snake': 'Snake',
          'games.dopeSkate': 'Dope Skate (beta)',
          'games.back': 'Back',
          'games.empty': 'No games yet.',
          'games.tab.hub': 'Games',
          'games.tab.leaderboard': 'Leaderboard',
          'games.leaderboard.total': 'Total Score',
          'games.leaderboard.empty': 'No scores yet.',
          'skate.menu.play': 'Play',
          'skate.menu.settings': 'Settings',
          'skate.menu.shop': 'Shop',
          'skate.menu.howto': 'How to play',
          'skate.menu.leaderboard': 'Leaderboard',
          'skate.menu.playDesc': 'Skate away',
          'skate.action.start': 'Start run',
          'skate.action.retry': 'Retry',
          'skate.action.menu': 'Menu',
          'skate.action.resume': 'Resume',
          'skate.action.back': 'Back to menu',
          'skate.action.jump': 'Jump',
          'skate.action.trick1': 'Trick 1',
          'skate.action.trick2': 'Trick 2',
          'skate.action.trick3': 'Trick 3',
          'mobile.controls.analog': 'ANALOG',
          'mobile.controls.select': 'SELECT',
          'mobile.controls.start': 'START',
          'aria.mobile.controls.joystick': 'Joystick',
          'aria.mobile.controls.analog': 'Toggle analog mode',
          'aria.mobile.controls.select': 'Select',
          'aria.mobile.controls.start': 'Start',
          'aria.mobile.controls.up': 'Up',
          'aria.mobile.controls.down': 'Down',
          'aria.mobile.controls.left': 'Left',
          'aria.mobile.controls.right': 'Right',
          'aria.mobile.controls.upRight': 'Up-right',
          'aria.mobile.controls.downRight': 'Down-right',
          'aria.mobile.controls.downLeft': 'Down-left',
          'aria.mobile.controls.upLeft': 'Up-left',
          'skate.hud.score': 'Score',
          'skate.hud.combo': 'Combo',
          'skate.hud.best': 'Best',
          'skate.hud.cds': 'CDs',
          'skate.gameOver': 'Game Over',
          'skate.grind.balance': 'Balance',
          'skate.settings.camera': 'Camera',
          'skate.settings.cameraDesc': 'Classic side view',
          'skate.settings.speed': 'Speed',
          'skate.settings.speedDesc': 'Auto runner',
          'skate.settings.difficulty': 'Difficulty',
          'skate.settings.difficultyEasy': 'Easy',
          'skate.settings.difficultyMedium': 'Medium',
          'skate.settings.difficultyHard': 'Hard',
          'skate.settings.sfx': 'Sound effects',
          'skate.settings.sfxOn': 'On',
          'skate.settings.sfxOff': 'Off',
          'skate.settings.hitboxes': 'Hitboxes',
          'skate.settings.hitboxesOn': 'On',
          'skate.settings.hitboxesOff': 'Off',
          'skate.shop.ground': 'Ground',
          'skate.shop.background': 'Background',
          'skate.shop.sky': 'Sky',
          'skate.shop.skater': 'Skater',
          'skate.shop.hat': 'Hat',
          'skate.shop.board': 'Skate',
          'skate.shop.wheels': 'Wheels',
          'skate.shop.wallet': 'Wallet',
          'skate.shop.owned': 'Owned',
          'skate.shop.buy': 'Buy',
          'skate.shop.equip': 'Equip',
          'skate.shop.equipped': 'Equipped',
          'skate.shop.previewing': 'Previewing',
          'skate.shop.previewActive': 'Preview active',
          'skate.shop.previewNone': 'Use equipped',
          'skate.shop.useEquipped': 'Use equipped',
          'skate.howto.body': 'Jump, throw tricks in the air, and link combos before you land.',
          'skate.howto.controls': 'Controls',
          'skate.howto.controlsDesc': 'Jump: Space/Up/X. Tricks: Z/X/C or Square/Triangle/Circle.',
          'skate.howto.trick1': 'Trick 1',
          'skate.howto.trick1Desc': 'Kickflip in the air. Hold Left/Right for Heelflip.',
          'skate.howto.trick2': 'Trick 2',
          'skate.howto.trick2Desc': 'Shuv-it in the air. Hold Left/Right for Varial Kickflip.',
          'skate.howto.trick3': 'Trick 3',
          'skate.howto.trick3Desc': 'Hardflip in the air or on a grind.',
          'skate.howto.combo': 'Combos',
          'skate.howto.comboDesc': 'Tricks only count in air or grind. Chain tricks before landing to raise the multiplier.',
          'skate.howto.grind': 'Grinds',
          'skate.howto.grindDesc': 'Jump onto a rail, balance with Left/Right, and press Jump to exit.',
          'skate.leaderboard.body': 'Local and global records will show here.',
          'skate.leaderboard.local': 'Local best',
          'skate.leaderboard.global': 'Global best',
          'skate.over.base': 'Base',
          'skate.over.combo': 'Combo bonus',
          'skate.over.bliss': 'BLISS bonus',
          'skate.over.total': 'Total',
          'skate.over.cds': 'CDs',
          'snake.title': 'Snake',
          'snake.start': 'Start',
          'snake.restart': 'Restart',
          'snake.pause': 'Pause',
          'snake.resume': 'Resume',
          'snake.paused': 'Paused',
          'snake.score': 'Score:',
          'snake.highScore': 'High Score:',
          'snake.length': 'Length:',
          'snake.level': 'Level:',
          'snake.bonus': 'Bonus:',
          'snake.bonus.none': '--',
          'snake.speed': 'Speed:',
          'snake.speed.slow': 'Slow',
          'snake.speed.normal': 'Normal',
          'snake.speed.fast': 'Fast',
          'snake.instructions': 'Use arrow keys or WASD. On mobile, swipe or use the controller.',
          'snake.gameOver': 'Game Over',
          'snake.playAgain': 'Play again',

          'menu.logoff': 'Log off…',

          'seeker.nav': 'Seeker navigation',
          'seeker.back': 'Back',
          'seeker.forward': 'Forward',
          'seeker.view': 'View mode',
          'seeker.view.icons': 'Icons',
          'seeker.view.list': 'List',
          'seeker.search': 'Search in Seeker',
          'seeker.search.placeholder': 'Search',
          'seeker.group.devices': 'Devices',
          'seeker.group.places': 'Places',
          'seeker.group.searchFor': 'Search For',
          'seeker.device.macintosh': 'Macintosh',
          'seeker.section.desktop': 'Desktop',
          'seeker.section.applications': 'Applications',
          'seeker.section.documents': 'Documents',
          'seeker.section.trash': 'Trash',
          'seeker.section.recent': 'Recent Opened',
          'seeker.empty': 'No items found.',
          'seeker.itemLabel': 'items',

          'ctx.open': 'Open',
          'ctx.rename': 'Rename',
          'ctx.crop': 'Crop',
          'ctx.copy': 'Copy',
          'ctx.moveTrash': 'Move to Trash',
          'ctx.emptyTrash': 'Empty Trash',
          'ctx.addDock': 'Add to Dock',
          'ctx.removeDock': 'Remove from Dock',
          'ctx.alreadyDock': 'Already in Dock',
          'ctx.newTextFile': 'New Text File',
          'ctx.newFolder': 'New Folder',
          'ctx.duplicateTxt': 'Duplicate',
          'ctx.arrange': 'Arrange icons',
          'ctx.grid': 'Grid (snap)',
          'ctx.showDesktopIcons': 'Show Desktop Icons',
          'ctx.wallpaper': 'Wallpaper',
          'ctx.settings': 'Settings',
          'ctx.language': 'Language',
          'ctx.about': 'About',
          'ctx.logoff': 'Log off…',

          'fs.newTextFileName': 'New Text File',
          'fs.newFolderName': 'New Folder',
          'fs.copySuffix': 'copy',
          'fs.desktop': 'Desktop',
          'fs.emptyFolder': 'Folder is empty.',

          'menu.txt.new': 'New',
          'menu.txt.save': 'Save',
          'menu.txt.duplicate': 'Duplicate',
          'txt.toolbar': 'Text formatting toolbar',
          'txt.styles': 'Styles',
          'txt.style.paragraph': 'Body Text',
          'txt.style.heading': 'Heading',
          'txt.style.subheading': 'Subheading',
          'txt.style.quote': 'Quote',
          'txt.align.group': 'Alignment',
          'txt.align.left': 'Align left',
          'txt.align.center': 'Align center',
          'txt.align.right': 'Align right',
          'txt.align.justify': 'Justify',
          'txt.spacing': 'Spacing',
          'txt.spacing.tight': 'Tight',
          'txt.spacing.normal': 'Normal',
          'txt.spacing.relaxed': 'Relaxed',
          'txt.spacing.loose': 'Loose',
          'txt.lists': 'Lists',
          'txt.list.none': 'No list',
          'txt.list.bullets': 'Bulleted list',
          'txt.list.numbers': 'Numbered list',
          'txt.format.group': 'Text formatting',
          'txt.format.bold': 'Bold',
          'txt.format.italic': 'Italic',
          'txt.format.underline': 'Underline',
          'txt.file.group': 'File actions',
          'txt.ruler': 'Paragraph ruler',
          'txt.ruler.left': 'Left margin',
          'txt.ruler.indent': 'First line indent',
          'txt.ruler.right': 'Right margin',

          'settings.title': 'Settings',
          'settings.tab.general': 'General',
          'settings.tab.language': 'Language',
          'settings.tab.appearance': 'Appearance',
          'settings.tab.dock': 'Dock',
          'settings.tab.sound': 'Sounds',
          'settings.tab.system': 'System',
          'settings.tab.performance': 'Performance',
          'settings.general.title': 'BLISS 98',
          'settings.general.desc': 'System properties and preferences for BLISS 98.',
          'settings.general.user': 'User:',
          'settings.general.guest': 'Guest',
          'settings.general.version': 'Version:',
          'settings.general.registeredTo': 'Registered to:',
          'settings.general.registeredName': 'A Bad Motherfucker',
          'settings.general.registeredCode': '616-FTP-420-333',
          'settings.languageTab': 'Language',
          'settings.languageDesc': 'Choose your language for BLISS 98.',
          'settings.lang.en': 'English',
          'settings.lang.pt': 'Português (BR)',
          'settings.appearanceTab': 'Appearance',
          'settings.appearanceDesc': 'Customize how BLISS 98 looks.',
          'settings.soundTab': 'Sounds',
          'settings.soundDesc': 'Control music and system volume levels.',
          'settings.sound.master': 'Master Volume',
          'settings.sound.music': 'Music',
          'settings.sound.system': 'System Sounds',
          'settings.sound.toggleOn': 'On',
          'settings.sound.toggleOff': 'Off',
          'settings.dock.desc': 'Adjust Dock size, magnification, and visibility.',
          'settings.dock.size': 'Size:',
          'settings.dock.small': 'Small',
          'settings.dock.large': 'Large',
          'settings.dock.magnification': 'Magnification:',
          'settings.dock.opacity': 'Opacity:',
          'settings.dock.min': 'Min',
          'settings.dock.max': 'Max',
          'settings.dock.autohide': 'Automatically hide and show the Dock',
          'settings.osTheme.title': 'Choose your OS',
          'settings.osTheme.desc': 'Switch between Bliss98, BlissOS, and Bliss Aqua.',
          'settings.tab.system': 'System',
          'settings.systemTab': 'System',
          'settings.systemDesc': 'System clock and visual effects.',
          'settings.fullscreen.title': 'Fullscreen',
          'settings.fullscreen.on': 'On',
          'settings.fullscreen.off': 'Off',
          'settings.clock.title': 'Clock Format',
          'settings.clock.desc': 'Choose 24-hour or 12-hour time.',
          'settings.clock.24': '24-hour',
          'settings.clock.12': '12-hour',
          'settings.oldcrt.title': 'Old CRT Effect',
          'settings.oldcrt.desc': 'Add CRT curvature, phosphor texture, and screen sweep.',
          'settings.oldcrt.on': 'On',
          'settings.oldcrt.off': 'Off',
          'settings.osTheme.bliss98': 'Bliss 98',
          'settings.osTheme.blissos': 'BlissOS',
          'settings.osTheme.blissaqua': 'Bliss Aqua',
          'blissos.menu.about': 'About This BlissOS',
          'blissos.menu.settings': 'Control Panels',
          'blissos.appmenu.preferences': 'System Preferences…',
          'blissos.appmenu.hide': 'Hide',
          'blissos.appmenu.hideOthers': 'Hide Others',
          'blissos.appmenu.showAll': 'Show All',
          'settings.themes.title': 'Themes',
          'settings.themes.desc': 'Select a theme to change wallpaper, title color, and dark mode.',
          'settings.themes.current': 'Current theme:',
          'settings.titlebar.title': 'Window Title Color',
          'settings.titlebar.desc': 'Choose the color of the window title bars.',
          'settings.darkMode.title': 'Dark Mode',
          'settings.darkMode.desc': 'Makes BLISS 98 darker and easier on the eyes.',
          'settings.darkMode.on': 'On',
          'settings.darkMode.off': 'Off',
          'settings.blissosDark.title': 'BlissOS Dark Mode',
          'settings.blissosDark.desc': 'Enables a dark Mac OS 9 inspired look for BlissOS.',
          'settings.blissosDark.on': 'On',
          'settings.blissosDark.off': 'Off',
          'settings.blissosAqua.title': 'BlissOS Aqua Theme',
          'settings.blissosAqua.desc': 'Enable the classic Apple Aqua look for BlissOS.',
          'settings.blissosAqua.on': 'On',
          'settings.blissosAqua.off': 'Off',
          'settings.retro.title': 'Glow',
          'settings.retro.desc': 'Add glow to windows and icons.',
          'settings.retro.on': 'On',
          'settings.retro.off': 'Off',
          'settings.animationsTab': 'Animations',
          'settings.animationsDesc': 'Toggle window animations.',
          'settings.animations.on': 'On',
          'settings.animations.off': 'Off',
          'settings.appOpenAnim.title': 'App open animation',
          'settings.appOpenAnim.desc': 'Animate a dotted selection box from the icon to the window.',
          'settings.appOpenAnim.on': 'On',
          'settings.appOpenAnim.off': 'Off',
          'settings.wallpaperTab': 'Wallpaper',
          'settings.wallpaperDesc': 'Choose a wallpaper for your desktop.',
          'settings.aqua.nav': 'Settings navigation',
          'settings.aqua.back': 'Back',
          'settings.aqua.forward': 'Forward',
          'settings.aqua.showAll': 'Show All',
          'settings.aqua.searchAria': 'Search settings',
          'settings.aqua.searchPlaceholder': 'Search',
          'settings.aqua.category.personal': 'Personal',
          'settings.aqua.category.system': 'System',
          'settings.scanlinesTab': 'Scanlines',
          'settings.scanlinesDesc': 'Add scanline effect to the display.',
          'settings.scanlines.on': 'On',
          'settings.scanlines.off': 'Off',
          
          'settings.blissosAccent.title': 'Accent Color',
          'settings.blissosAccent.desc': 'Choose your BlissOS accent color.',
          'blissosAccent.multicolor': 'Multicolor',
          'blissosAccent.blue': 'Blue',
          'blissosAccent.teal': 'Teal',
          'blissosAccent.purple': 'Purple',
          'blissosAccent.pink': 'Pink',
          'blissosAccent.rose': 'Rose',
          'blissosAccent.red': 'Red',
          'blissosAccent.orange': 'Orange',
          'blissosAccent.yellow': 'Yellow',
          'blissosAccent.green': 'Green',
          'blissosAccent.graphite': 'Graphite',
          'settings.bliss98Accent.title': 'Accent Color',
          'settings.bliss98Accent.desc': 'Choose the highlight color for menus and selections.',
          'bliss98Accent.classic': 'Classic Blue',
          'bliss98Accent.teal': 'Teal',
          'bliss98Accent.green': 'Green',
          'bliss98Accent.purple': 'Purple',
          'bliss98Accent.pink': 'Pink',
          'bliss98Accent.rose': 'Rose',
          'bliss98Accent.red': 'Red',
          'bliss98Accent.orange': 'Orange',
          'bliss98Accent.yellow': 'Yellow',
          'bliss98Accent.graphite': 'Graphite',
          'titlebar.defaultBlue': 'Blue',
          'titlebar.pinkLight': 'Pink',
          'titlebar.purple': 'Purple',
          'titlebar.red': 'Red',
          'titlebar.orange': 'Orange',
          'titlebar.yellow': 'Yellow',
          'titlebar.green': 'Green',
          'titlebar.graphite': 'Graphite',
          'titlebar.purpleDark': 'Dark Purple',
          'titlebar.offWhite': 'Off-white',
          'titlebar.greenDark': 'Dark Green',
          'titlebar.redDark': 'Dark Red',
          'titlebar.scarbliss': 'ScarBliss',
          'titlebar.blank': 'Blank',
          'titlebar.xpBlue': 'XP Blue',
          'theme.default': 'Default',
          'theme.totvers': 'Totvers',
          'theme.matrix': 'Matrix',
          'theme.xp98': 'XP98',
          'theme.scarbliss': 'ScarBliss',
          'theme.blank': 'Blank',
          'theme.custom': 'Custom',
          'theme.customEmpty': 'Empty',
          'theme.save': 'Save Custom',
          'poetry.title': 'Poetry Library',
          'poetry.back': 'Back',
          'poetry.language': 'Language',
          'poetry.empty': 'No poems yet.',

          'menu.file.newWindow': 'New Window…',
          'menu.file.close': 'Close',
          'menu.file.logoff': 'Log off…',
          'menu.help.controls': 'Tips',
          'menu.help.about': 'About BLISS 98',
          'menu.special.emptyTrash': 'Empty Trash…',
          'menu.special.eject': 'Eject',
          'menu.special.eraseDisk': 'Erase Disk…',
          'menu.special.restart': 'Restart',
          'menu.special.shutdown': 'Shut Down…',
          'dialog.diskErased.title': 'Disk Utility',
          'dialog.diskErased.body': 'Disk erased successfully.',

          'menu.music.openLink': 'Open Link…',
          'menu.music.copyLink': 'Copy Link',
          'menu.music.selectAll': 'Select All',
          'menu.music.clearSelection': 'Clear Selection',
          'menu.music.tileSize': 'Tile size',
          'menu.music.tileSize.small': 'Small',
          'menu.music.tileSize.large': 'Large',
          'menu.music.openNewTab': 'Open in new tab (default)',
          'menu.music.showIcons': 'Show platform icons',
          'menu.music.where': 'Where to listen',

          'menu.player.openTrack': 'Open Track…',
          'menu.player.reload': 'Reload Library',
          'menu.player.selectAll': 'Select All',
          'menu.player.copyName': 'Copy Track Name',
          'menu.player.clearSelection': 'Clear Selection',
          'menu.player.shuffle': 'Shuffle',
          'menu.player.repeat': 'Repeat',
          'menu.player.repeat.off': 'Off',
          'menu.player.repeat.one': 'One',
          'menu.player.repeat.all': 'All',
          'menu.player.showPlaylist': 'Show Playlist',
          'menu.player.compact': 'Compact mode',
          'menu.player.tips': 'Playback tips',
          'menu.player.howto': 'How to add songs',

          'menu.clothes.openLookbook': 'Open Lookbook',
          'menu.clothes.shop': 'Shop…',
          'menu.clothes.copy': 'Copy',
          'menu.clothes.selectAll': 'Select All',
          'menu.clothes.viewGrid': 'Grid',
          'menu.clothes.sort': 'Sort by',
          'menu.clothes.sort.new': 'New',
          'menu.clothes.sort.popular': 'Popular',
          'menu.clothes.preview': 'Preview images',
          'menu.clothes.sizing': 'Sizing',

          'menu.diev.openPress': 'Open Press Kit',
          'menu.diev.copyBio': 'Copy Bio',
          'menu.diev.copy': 'Copy',
          'menu.diev.selectAll': 'Select All',
          'menu.diev.textSize': 'Text size',
          'menu.diev.textSize.small': 'Small',
          'menu.diev.textSize.normal': 'Normal',
          'menu.diev.textSize.large': 'Large',
          'menu.diev.highContrast': 'High contrast',
          'menu.diev.links': 'Links',

          'menu.contact.copyEmail': 'Copy Email',
          'menu.contact.openInstagram': 'Open Instagram',
          'menu.contact.copy': 'Copy',
          'menu.contact.selectAll': 'Select All',
          'menu.contact.showQr': 'Show QR',
          'menu.contact.compact': 'Compact',
          'menu.contact.support': 'Support',

          'menu.settings.apply': 'Apply',
          'menu.settings.reset': 'Reset to default',
          'menu.settings.undo': 'Undo',
          'menu.settings.redo': 'Redo',
          'menu.settings.fullscreen': 'Fullscreen',
          'menu.settings.scanlines': 'Scanlines',
          'menu.settings.wallpaper': 'Wallpaper…',
          'menu.settings.what': 'What is this?',

          'menu.art.openGallery': 'Open Gallery',
          'menu.art.saveImage': 'Save Image…',
          'menu.art.copy': 'Copy',
          'menu.art.selectAll': 'Select All',
          'menu.art.zoom': 'Zoom',
          'menu.art.zoom.50': '50%',
          'menu.art.zoom.100': '100%',
          'menu.art.zoom.200': '200%',
          'menu.art.slideshow': 'Slideshow',
          'menu.art.credits': 'Credits',

          'menu.games.openFolder': 'Open Games Folder',
          'menu.games.download': 'Download…',
          'menu.games.copy': 'Copy',
          'menu.games.selectAll': 'Select All',
          'menu.games.grid': 'Grid',
          'menu.games.sort': 'Sort by',
          'menu.games.sort.new': 'New',
          'menu.games.sort.favorite': 'Favorite',
          'menu.games.howto': 'How to Play',
          'menu.games.requirements': 'Requirements',

          'menu.videos.openChannel': 'Open Channel',
          'menu.videos.copyLink': 'Copy Link',
          'menu.videos.copy': 'Copy',
          'menu.videos.selectAll': 'Select All',
          'menu.videos.thumbSize': 'Thumbnail size',
          'menu.videos.thumbSize.small': 'Small',
          'menu.videos.thumbSize.large': 'Large',
          'menu.videos.openNewTab': 'Open in new tab',
          'menu.videos.tips': 'Playback tips',
          'videos.channelLink': 'Watch on Youtube',
          'videos.watchTitle': 'Watch inside BLISS 98',
          'videos.openChannel': 'Watch channel videos',
          'videos.addKey': 'Add YouTube API Key…',
          'videos.noKey': 'Add a YouTube API key to load the full list. You can still watch here.',
          'videos.autoFail': 'Unable to load videos automatically. You can still open the channel.',
          'videos.loading': 'Loading videos…',
          'videos.listEmpty': 'No videos yet.',
          'videos.keyTitle': 'YouTube API Key',
          'videos.keyDesc': 'Paste your YouTube Data API v3 key to load the channel videos.',

          'menu.about.copy': 'Copy',
          'menu.about.selectAll': 'Select All',
          'menu.about.version': 'Version info',
          'menu.about.credits': 'Credits',
          'menu.about.controls': 'Controls',

          'dialog.newWindow.title': 'New Window',
          'dialog.newWindow.desc': 'Choose an app to open.',
          'dialog.newWindow.open': 'Open',
          'dialog.openLink.title': 'Open Link',
          'dialog.openLink.desc': 'Choose a platform.',
          'dialog.openLink.open': 'Open',
          'dialog.openTrack.title': 'Open Track',
          'dialog.openTrack.desc': 'Choose a track from the playlist.',
          'dialog.openTrack.open': 'Open',
          'dialog.controls.title': 'Tips',
          'dialog.controls.body': 'Whenever in doubt, turn off your mind, relax, float downstream',
          'dialog.gamesHowTo.title': 'How to Play',
          'dialog.gamesHowTo.body': 'Use arrow keys or WASD. On mobile, swipe or use the controller.',
          'dialog.where.title': 'Where to listen',
          'dialog.where.body': 'These are official BLISS links. Pick a platform to open or copy the link.',
          'dialog.playerTips.title': 'Playback tips',
          'dialog.playerTips.body': 'Autoplay may be blocked. If it does not start, press Play once.',
          'dialog.support.title': 'Support',
          'dialog.support.body': 'Report issues through the Contact window when available. We will keep the system updated.',
          'dialog.settingsWhat.title': 'Settings',
          'dialog.settingsWhat.body': 'Adjust language, wallpaper, and window animations for BLISS 98.',
          'dialog.version.title': 'Version info',
          'dialog.version.body': 'BLISS 98 — Build 98.0',
          'dialog.credits.title': 'Credits',
          'dialog.credits.body': 'Created by DIEV.',
          'dialog.notAvailable.title': 'Coming soon',
          'dialog.notAvailable.body': 'This feature is not available yet.',
          'dialog.dockFull.title': 'Dock full',
          'dialog.dockFull.body': 'Dock is full on mobile (max. 9 icons). Remove an item to add another.',
          'dialog.selectItem.title': 'Select an item',
          'dialog.selectItem.body': 'Select an item first to continue.',
          'dialog.copied.title': 'Copied',
          'dialog.copied.body': 'Copied to clipboard.',
          'dialog.settingsApplied.title': 'Settings',
          'dialog.settingsApplied.body': 'Settings applied.',
          'dialog.noUndo.title': 'Undo',
          'dialog.noUndo.body': 'Nothing to undo.',
          'dialog.noRedo.title': 'Redo',
          'dialog.noRedo.body': 'Nothing to redo.',
          'dialog.rename.title': 'Rename',
          'dialog.rename.desc': 'Enter a new name.',
          'dialog.rename.confirm': 'Rename',
          'dialog.loginEmpty.title': 'Enter your name',
          'dialog.loginEmpty.body': 'Please type a name to continue.',
          'dialog.trash.empty': 'Trash is empty.',
          'dialog.trash.restore': 'Restore',
          'dialog.trash.restoreAll': 'Restore All',
          'dialog.trash.emptyAction': 'Empty Trash',

          'wallpaper.classic': 'Classic Teal',
          'wallpaper.blissos': 'BlissOS',
          'wallpaper.aqua': 'Aqua',
          'wallpaper.bliss': 'Sunrise',
          'wallpaper.clouds': 'Clouds',
          'wallpaper.galaxy': 'Galaxy',
          'wallpaper.diev': 'Grid',
          'wallpaper.tot': 'Pink Tot',
          'wallpaper.matrix': 'Matrix',
          'wallpaper.blissxp': 'BlissXP',
          'wallpaper.scarbliss': 'ScarBliss',

          'music.title': 'BLISS — Music',
          'music.subtitle': 'Listen everywhere:',
          'music.tip': 'Music is a beautiful thing, innit?',

          'clothes.title': 'BLISS — Clothes',
          'clothes.subtitle': 'Latest from Instagram.',
          'clothes.loading': 'Loading…',
          'clothes.unavailable': 'Unable to load right now.',
          'clothes.thumbAlt': 'BLISS Instagram',

          'about.title': 'About',
          'about.p1': 'BLISS is a project that aims to bring together independent, weird, and unique artists,',
          'about.p2': 'supporting every form of art and self-expression.',
          'about.p3': 'Against the system and the dogmas created by humans,',
          'about.p4': 'we are our own GODS.',
          'about.p5': 'There are no rules.',
          'about.p6': 'We create our own world from the inside out.',
          'about.footer': 'Designed by DIEV',

          'contact.title': 'Contact',
          'contact.label.instagramDIEV': 'Instagram (DIEV):',
          'contact.label.twitterDIEV': 'Twitter/X (DIEV):',
          'contact.label.emailBusiness': 'Email (Business):',
          'contact.label.instagramBLISS': 'Instagram (BLISS):',
          'diev.title': 'DIEV',
          'diev.p1': 'Página oficial do DIEV.',

          'player.title': 'BLISS Media Player',
          'player.now': 'Now playing:',
          'player.play': 'Play',
          'player.pause': 'Pause',
          'player.prev': 'Prev',
          'player.next': 'Next',
          'player.vol': 'Vol',
          'player.shuffle': 'Shuffle',
          'player.repeat': 'Repeat',
          'player.repeat.off': 'Off',
          'player.repeat.one': 'One',
          'player.repeat.all': 'All',
          'player.loading': 'Loading tracks…',
          'player.notfound': 'No songs yet.',
          'player.autoplay': 'Autoplay may be blocked by your browser. If it does not start, press Play.',
          'player.addSongs': 'Add songs…',
          'player.reimport': 'Re-import files',
          'player.reimportHint': 'Re-import files to restore your playlist.',
          'player.drop': 'Drop audio files here',
          'player.flacUnsupported': 'Your browser does not support FLAC. Use MP3/WAV/OGG or another browser.',
          'dialog.playerHowTo.title': 'How to add songs',
          'dialog.playerHowTo.body': 'Add songs by dragging audio files into the player window, or click Add songs… to choose files.'
        },
        pt: {
          'login.sub': 'Digite seu nome para entrar',
          'login.labelName': 'Nome:',
          'login.placeholder': 'Digite seu nome',
          'login.chooseOs': 'Escolha seu OS',
          'login.os.bliss98': 'Bliss98',
          'login.os.blissos': 'BlissOS',
          'login.os.blissaqua': 'Bliss Aqua',
          'login.hint': 'Dica: Ignorância é BLISS',
          'login.clear': 'Limpar',
          'login.enter': 'Entrar',
          'login.copyright': '© BLISS / DIEV — Bliss 98 OS',

          'common.soon': 'Em breve.',
          'common.ok': 'OK',
          'common.cancel': 'Cancelar',
          'common.save': 'Salvar',
          'common.open': 'Abrir',
          'common.copy': 'Copiar',

          'aria.language': 'Idioma',
          'aria.startMenu': 'Menu BLISS',
          'aria.contextMenu': 'Menu de contexto',
          'aria.close': 'Fechar',
          'start.menu': 'Menu',

          'menubar.file': 'Arquivo',
          'menubar.edit': 'Editar',
          'menubar.view': 'Exibir',
          'menubar.help': 'Ajuda',

          'status.ready': 'Pronto',

          'win.minimize': 'Minimizar',
          'win.maximize': 'Ajustar ao conteúdo',
          'win.close': 'Fechar',
          'win.resize': 'Redimensionar',

          'app.clothes': 'Roupas',
          'app.music': 'Música',
          'app.art': 'Artists',
          'app.games': 'Jogos',
          'app.videos': 'Vídeos',
          'app.about': 'Sobre',
          'app.contact': 'Contato',
          'app.diev': 'DIEV',
          'app.settings': 'Configurações',
          'app.poetry': 'Poesias',
          'app.trash': 'Lixeira',
          'app.mediaplayer': 'BLISS Media Player',
          'app.seeker': 'File Seeker',
          'app.seeker.file': 'File Seeker',
          'app.seeker.short': 'Seeker',
          'games.snake': 'Snake',
          'games.dopeSkate': 'Dope Skate (beta)',
          'games.back': 'Voltar',
          'games.empty': 'Sem jogos ainda.',
          'games.tab.hub': 'Jogos',
          'games.tab.leaderboard': 'Leaderboard',
          'games.leaderboard.total': 'Score total',
          'games.leaderboard.empty': 'Sem scores ainda.',
          'skate.menu.play': 'Jogar',
          'skate.menu.settings': 'Configurações',
          'skate.menu.shop': 'Shop',
          'skate.menu.howto': 'Como jogar',
          'skate.menu.leaderboard': 'Leaderboard',
          'skate.menu.playDesc': 'Skate away',
          'skate.action.start': 'Iniciar run',
          'skate.action.retry': 'Tentar de novo',
          'skate.action.menu': 'Menu',
          'skate.action.resume': 'Voltar ao jogo',
          'skate.action.back': 'Voltar ao menu',
          'skate.action.jump': 'Pular',
          'skate.action.trick1': 'Trick 1',
          'skate.action.trick2': 'Trick 2',
          'skate.action.trick3': 'Trick 3',
          'mobile.controls.analog': 'ANALOG',
          'mobile.controls.select': 'SELECT',
          'mobile.controls.start': 'START',
          'aria.mobile.controls.joystick': 'Joystick',
          'aria.mobile.controls.analog': 'Alternar modo analogico',
          'aria.mobile.controls.select': 'Selecionar',
          'aria.mobile.controls.start': 'Iniciar',
          'aria.mobile.controls.up': 'Cima',
          'aria.mobile.controls.down': 'Baixo',
          'aria.mobile.controls.left': 'Esquerda',
          'aria.mobile.controls.right': 'Direita',
          'aria.mobile.controls.upRight': 'Cima-direita',
          'aria.mobile.controls.downRight': 'Baixo-direita',
          'aria.mobile.controls.downLeft': 'Baixo-esquerda',
          'aria.mobile.controls.upLeft': 'Cima-esquerda',
          'skate.hud.score': 'Score',
          'skate.hud.combo': 'Combo',
          'skate.hud.best': 'Recorde',
          'skate.hud.cds': 'CDs',
          'skate.gameOver': 'Game Over',
          'skate.grind.balance': 'Equilibrio',
          'skate.settings.difficulty': 'Dificuldade',
          'skate.settings.difficultyEasy': 'Fácil',
          'skate.settings.difficultyMedium': 'Média',
          'skate.settings.difficultyHard': 'Difícil',
          'skate.settings.sfx': 'Efeitos sonoros',
          'skate.settings.sfxOn': 'Ligado',
          'skate.settings.sfxOff': 'Desligado',
          'skate.settings.hitboxes': 'Hitboxes',
          'skate.settings.hitboxesOn': 'Ligado',
          'skate.settings.hitboxesOff': 'Desligado',
          'skate.shop.ground': 'Chao',
          'skate.shop.background': 'Fundo',
          'skate.shop.sky': 'Ceu',
          'skate.shop.skater': 'Skater',
          'skate.shop.hat': 'Chapeu',
          'skate.shop.board': 'Skate',
          'skate.shop.wheels': 'Rodas',
          'skate.shop.wallet': 'Carteira',
          'skate.shop.owned': 'Comprado',
          'skate.shop.buy': 'Comprar',
          'skate.shop.equip': 'Equipar',
          'skate.shop.equipped': 'Equipado',
          'skate.shop.previewing': 'Preview',
          'skate.shop.previewActive': 'Preview ativo',
          'skate.shop.previewNone': 'Usar equipado',
          'skate.shop.useEquipped': 'Usar equipado',
          'skate.howto.body': 'Pule, mande tricks no ar e mantenha o combo antes de aterrissar.',
          'skate.howto.controls': 'Controles',
          'skate.howto.controlsDesc': 'Pulo: Espaco/Seta cima/X. Tricks: Z/X/C ou Quadrado/Triangulo/Circulo.',
          'skate.howto.trick1': 'Trick 1',
          'skate.howto.trick1Desc': 'Kickflip no ar. Segure Esquerda/Direita para Heelflip.',
          'skate.howto.trick2': 'Trick 2',
          'skate.howto.trick2Desc': 'Shuv-it no ar. Segure Esquerda/Direita para Varial Kickflip.',
          'skate.howto.trick3': 'Trick 3',
          'skate.howto.trick3Desc': 'Hardflip no ar ou no grind.',
          'skate.howto.combo': 'Combos',
          'skate.howto.comboDesc': 'Tricks so contam no ar ou no grind. Encadeie antes de aterrissar para subir o multiplicador.',
          'skate.howto.grind': 'Grinds',
          'skate.howto.grindDesc': 'Pule em um rail, equilibre com Esquerda/Direita e aperte Pulo para sair.',
          'skate.leaderboard.body': 'Records locais e globais aparecem aqui.',
          'skate.leaderboard.local': 'Recorde local',
          'skate.leaderboard.global': 'Recorde global',
          'skate.over.base': 'Base',
          'skate.over.combo': 'Bonus combo',
          'skate.over.bliss': 'Bonus BLISS',
          'skate.over.total': 'Total',
          'skate.over.cds': 'CDs',
          'snake.title': 'Snake',
          'snake.start': 'Iniciar',
          'snake.restart': 'Reiniciar',
          'snake.pause': 'Pausar',
          'snake.resume': 'Continuar',
          'snake.paused': 'Pausado',
          'snake.score': 'Score:',
          'snake.highScore': 'High Score:',
          'snake.length': 'Tamanho:',
          'snake.level': 'Nivel:',
          'snake.bonus': 'Bonus:',
          'snake.bonus.none': '--',
          'snake.speed': 'Velocidade:',
          'snake.speed.slow': 'Lento',
          'snake.speed.normal': 'Normal',
          'snake.speed.fast': 'Rápido',
          'snake.instructions': 'Use as setas ou WASD. No celular, deslize ou use o controle.',
          'snake.gameOver': 'Game Over',
          'snake.playAgain': 'Jogar novamente',

          'menu.logoff': 'Sair…',

          'seeker.nav': 'Navegacao do Seeker',
          'seeker.back': 'Voltar',
          'seeker.forward': 'Avancar',
          'seeker.view': 'Modo de visualizacao',
          'seeker.view.icons': 'Icones',
          'seeker.view.list': 'Lista',
          'seeker.search': 'Buscar no Seeker',
          'seeker.search.placeholder': 'Buscar',
          'seeker.group.devices': 'Dispositivos',
          'seeker.group.places': 'Locais',
          'seeker.group.searchFor': 'Buscar por',
          'seeker.device.macintosh': 'Macintosh',
          'seeker.section.desktop': 'Desktop',
          'seeker.section.applications': 'Aplicativos',
          'seeker.section.documents': 'Documentos',
          'seeker.section.trash': 'Lixeira',
          'seeker.section.recent': 'Abertos recentes',
          'seeker.empty': 'Nenhum item encontrado.',
          'seeker.itemLabel': 'itens',

          'ctx.open': 'Abrir',
          'ctx.rename': 'Renomear',
          'ctx.crop': 'Recortar',
          'ctx.copy': 'Copiar',
          'ctx.moveTrash': 'Mover para Lixeira',
          'ctx.emptyTrash': 'Esvaziar Lixeira',
          'ctx.addDock': 'Adicionar ao Dock',
          'ctx.removeDock': 'Remover do Dock',
          'ctx.alreadyDock': 'Ja esta no Dock',
          'ctx.newTextFile': 'Novo arquivo TXT',
          'ctx.newFolder': 'Nova pasta',
          'ctx.duplicateTxt': 'Duplicar',
          'ctx.arrange': 'Organizar Ícones',
          'ctx.grid': 'Grade (snap)',
          'ctx.showDesktopIcons': 'Mostrar ícones da Área de Trabalho',
          'ctx.wallpaper': 'Papel de Parede',
          'ctx.settings': 'Configurações',
          'ctx.language': 'Idioma',
          'ctx.about': 'Sobre',
          'ctx.logoff': 'Sair…',

          'fs.newTextFileName': 'Novo arquivo TXT',
          'fs.newFolderName': 'Nova pasta',
          'fs.copySuffix': 'copia',
          'fs.desktop': 'Area de Trabalho',
          'fs.emptyFolder': 'A pasta esta vazia.',

          'menu.txt.new': 'Novo',
          'menu.txt.save': 'Salvar',
          'menu.txt.duplicate': 'Duplicar',
          'txt.toolbar': 'Barra de formatacao de texto',
          'txt.styles': 'Styles',
          'txt.style.paragraph': 'Corpo de texto',
          'txt.style.heading': 'Titulo',
          'txt.style.subheading': 'Subtitulo',
          'txt.style.quote': 'Citacao',
          'txt.align.group': 'Alinhamento',
          'txt.align.left': 'Alinhar a esquerda',
          'txt.align.center': 'Alinhar ao centro',
          'txt.align.right': 'Alinhar a direita',
          'txt.align.justify': 'Justificar',
          'txt.spacing': 'Spacing',
          'txt.spacing.tight': 'Apertado',
          'txt.spacing.normal': 'Normal',
          'txt.spacing.relaxed': 'Confortavel',
          'txt.spacing.loose': 'Solto',
          'txt.lists': 'Lists',
          'txt.list.none': 'Sem lista',
          'txt.list.bullets': 'Lista com marcadores',
          'txt.list.numbers': 'Lista numerada',
          'txt.format.group': 'Formatacao de texto',
          'txt.format.bold': 'Negrito',
          'txt.format.italic': 'Italico',
          'txt.format.underline': 'Sublinhado',
          'txt.file.group': 'Acoes de arquivo',
          'txt.ruler': 'Regua de paragrafo',
          'txt.ruler.left': 'Margem esquerda',
          'txt.ruler.indent': 'Recuo da primeira linha',
          'txt.ruler.right': 'Margem direita',

          'settings.title': 'Configurações',
          'settings.tab.general': 'Geral',
          'settings.tab.language': 'Idioma',
          'settings.tab.appearance': 'Aparência',
          'settings.tab.dock': 'Dock',
          'settings.tab.sound': 'Sons',
          'settings.tab.system': 'Sistema',
          'settings.tab.performance': 'Performance',
          'settings.general.title': 'BLISS 98',
          'settings.general.desc': 'Propriedades e ajustes do BLISS 98.',
          'settings.general.user': 'Usuário:',
          'settings.general.guest': 'Convidado',
          'settings.general.version': 'Versão:',
          'settings.general.registeredTo': 'Registrado para:',
          'settings.general.registeredName': 'A Bad Motherfucker',
          'settings.general.registeredCode': '616-FTP-420-333',
          'settings.languageTab': 'Idioma',
          'settings.languageDesc': 'Escolha o idioma do BLISS 98.',
          'settings.lang.en': 'English',
          'settings.lang.pt': 'Português (BR)',
          'settings.appearanceTab': 'Aparência',
          'settings.appearanceDesc': 'Personalize o visual do BLISS 98.',
          'settings.soundTab': 'Sons',
          'settings.soundDesc': 'Controle os volumes de música e do sistema.',
          'settings.sound.master': 'Volume geral',
          'settings.sound.music': 'Música',
          'settings.sound.system': 'Sons do sistema',
          'settings.sound.toggleOn': 'On',
          'settings.sound.toggleOff': 'Off',
          'settings.dock.desc': 'Ajuste tamanho, ampliacao e visibilidade do Dock.',
          'settings.dock.size': 'Tamanho:',
          'settings.dock.small': 'Pequeno',
          'settings.dock.large': 'Grande',
          'settings.dock.magnification': 'Ampliacao:',
          'settings.dock.opacity': 'Opacidade:',
          'settings.dock.min': 'Min',
          'settings.dock.max': 'Max',
          'settings.dock.autohide': 'Ocultar e mostrar o Dock automaticamente',
          'settings.osTheme.title': 'Escolha seu OS',
          'settings.osTheme.desc': 'Alterna entre Bliss98, BlissOS e Bliss Aqua.',
          'settings.tab.system': 'Sistema',
          'settings.systemTab': 'Sistema',
          'settings.systemDesc': 'Relogio e efeitos visuais do sistema.',
          'settings.fullscreen.title': 'Tela cheia',
          'settings.fullscreen.on': 'Ligado',
          'settings.fullscreen.off': 'Desligado',
          'settings.clock.title': 'Formato do relogio',
          'settings.clock.desc': 'Escolha 24 horas ou 12 horas.',
          'settings.clock.24': '24 horas',
          'settings.clock.12': '12 horas',
          'settings.oldcrt.title': 'Efeito CRT antigo',
          'settings.oldcrt.desc': 'Adiciona curvatura de CRT, textura de fosforo e varredura de tela.',
          'settings.oldcrt.on': 'Ligado',
          'settings.oldcrt.off': 'Desligado',
          'settings.osTheme.bliss98': 'Bliss 98',
          'settings.osTheme.blissos': 'BlissOS',
          'settings.osTheme.blissaqua': 'Bliss Aqua',
          'blissos.menu.about': 'Sobre este BlissOS',
          'blissos.menu.settings': 'Painel de Controle',
          'blissos.appmenu.preferences': 'Preferencias do sistema…',
          'blissos.appmenu.hide': 'Ocultar',
          'blissos.appmenu.hideOthers': 'Ocultar outros',
          'blissos.appmenu.showAll': 'Mostrar todos',
          'settings.themes.title': 'Temas',
          'settings.themes.desc': 'Selecione um tema para mudar papel de parede, cor do topo e dark mode.',
          'settings.themes.current': 'Tema atual:',
          'settings.titlebar.title': 'Cor do topo da janela',
          'settings.titlebar.desc': 'Escolha a cor das barras de título.',
          'settings.darkMode.title': 'Modo Escuro',
          'settings.darkMode.desc': 'Deixa o BLISS 98 mais escuro e confortável.',
          'settings.darkMode.on': 'Ligado',
          'settings.darkMode.off': 'Desligado',
          'settings.blissosDark.title': 'Modo Escuro do BlissOS',
          'settings.blissosDark.desc': 'Ativa um visual escuro inspirado no Mac OS 9 para o BlissOS.',
          'settings.blissosDark.on': 'Ligado',
          'settings.blissosDark.off': 'Desligado',
          'settings.blissosAqua.title': 'Tema Aqua do BlissOS',
          'settings.blissosAqua.desc': 'Ativa o visual clássico Aqua da Apple no BlissOS.',
          'settings.blissosAqua.on': 'Ligado',
          'settings.blissosAqua.off': 'Desligado',
          'settings.retro.title': 'Glow',
          'settings.retro.desc': 'Adicione brilho nas janelas e ícones.',
          'settings.retro.on': 'Ligado',
          'settings.retro.off': 'Desligado',
          'settings.animationsTab': 'Animações',
          'settings.animationsDesc': 'Ative ou desative as animações das janelas.',
          'settings.animations.on': 'Ligado',
          'settings.animations.off': 'Desligado',
          'settings.appOpenAnim.title': 'Animacao ao abrir app',
          'settings.appOpenAnim.desc': 'Anima uma caixa pontilhada do icone ate a janela.',
          'settings.appOpenAnim.on': 'Ligado',
          'settings.appOpenAnim.off': 'Desligado',
          'settings.wallpaperTab': 'Papel de parede',
          'settings.wallpaperDesc': 'Escolha um papel de parede para o desktop.',
          'settings.aqua.nav': 'Navegação das configurações',
          'settings.aqua.back': 'Voltar',
          'settings.aqua.forward': 'Avançar',
          'settings.aqua.showAll': 'Mostrar tudo',
          'settings.aqua.searchAria': 'Buscar configurações',
          'settings.aqua.searchPlaceholder': 'Buscar',
          'settings.aqua.category.personal': 'Pessoal',
          'settings.aqua.category.system': 'Sistema',
          'settings.scanlinesTab': 'Scanlines',
          'settings.scanlinesDesc': 'Adicione efeito de scanlines na tela.',
          'settings.scanlines.on': 'Ligado',
          'settings.scanlines.off': 'Desligado',

          'settings.blissosAccent.title': 'Cor de destaque',
          'settings.blissosAccent.desc': 'Escolha a cor de destaque do seu BlissOS.',
          'blissosAccent.multicolor': 'Multicolor',
          'blissosAccent.blue': 'Azul',
          'blissosAccent.teal': 'Verde-água',
          'blissosAccent.purple': 'Roxo',
          'blissosAccent.pink': 'Rosa',
          'blissosAccent.rose': 'Rosa escuro',
          'blissosAccent.red': 'Vermelho',
          'blissosAccent.orange': 'Laranja',
          'blissosAccent.yellow': 'Amarelo',
          'blissosAccent.green': 'Verde',
          'blissosAccent.graphite': 'Grafite',
          'settings.bliss98Accent.title': 'Cor de destaque',
          'settings.bliss98Accent.desc': 'Escolha a cor de destaque para menus e seleções.',
          'bliss98Accent.classic': 'Azul clássico',
          'bliss98Accent.teal': 'Verde-água',
          'bliss98Accent.green': 'Verde',
          'bliss98Accent.purple': 'Roxo',
          'bliss98Accent.pink': 'Rosa',
          'bliss98Accent.rose': 'Rosa',
          'bliss98Accent.red': 'Vermelho',
          'bliss98Accent.orange': 'Laranja',
          'bliss98Accent.yellow': 'Amarelo',
          'bliss98Accent.graphite': 'Grafite',
          'titlebar.defaultBlue': 'Azul',
          'titlebar.pinkLight': 'Rosa',
          'titlebar.purple': 'Roxo',
          'titlebar.red': 'Vermelho',
          'titlebar.orange': 'Laranja',
          'titlebar.yellow': 'Amarelo',
          'titlebar.green': 'Verde',
          'titlebar.graphite': 'Grafite',
          'titlebar.purpleDark': 'Roxo escuro',
          'titlebar.offWhite': 'Branco off-white',
          'titlebar.greenDark': 'Verde escuro',
          'titlebar.redDark': 'Vermelho escuro',
          'titlebar.scarbliss': 'ScarBliss',
          'titlebar.blank': 'Vazio',
          'titlebar.xpBlue': 'Azul XP',
          'theme.default': 'Padrão',
          'theme.totvers': 'Totvers',
          'theme.matrix': 'Matrix',
          'theme.xp98': 'XP98',
          'theme.scarbliss': 'ScarBliss',
          'theme.blank': 'Vazio',
          'theme.custom': 'Personalizado',
          'theme.customEmpty': 'Vazio',
          'theme.save': 'Salvar personalizado',
          'poetry.title': 'Biblioteca de Poesias',
          'poetry.back': 'Voltar',
          'poetry.language': 'Idioma',
          'poetry.empty': 'Sem poesias ainda.',

          'menu.file.newWindow': 'Nova janela…',
          'menu.file.close': 'Fechar',
          'menu.file.logoff': 'Sair…',
          'menu.help.controls': 'Tips',
          'menu.help.about': 'Sobre BLISS 98',
          'menu.special.emptyTrash': 'Esvaziar Lixeira…',
          'menu.special.eject': 'Ejetar',
          'menu.special.eraseDisk': 'Apagar Disco…',
          'menu.special.restart': 'Reiniciar',
          'menu.special.shutdown': 'Desligar…',
          'dialog.diskErased.title': 'Utilitario de Disco',
          'dialog.diskErased.body': 'Disco apagado com sucesso.',

          'menu.music.openLink': 'Abrir link…',
          'menu.music.copyLink': 'Copiar link',
          'menu.music.selectAll': 'Selecionar tudo',
          'menu.music.clearSelection': 'Limpar seleção',
          'menu.music.tileSize': 'Tamanho dos cards',
          'menu.music.tileSize.small': 'Pequeno',
          'menu.music.tileSize.large': 'Grande',
          'menu.music.openNewTab': 'Abrir em nova aba (padrão)',
          'menu.music.showIcons': 'Mostrar ícones',
          'menu.music.where': 'Onde ouvir',

          'menu.player.openTrack': 'Abrir faixa…',
          'menu.player.reload': 'Recarregar biblioteca',
          'menu.player.selectAll': 'Selecionar tudo',
          'menu.player.copyName': 'Copiar nome da faixa',
          'menu.player.clearSelection': 'Limpar seleção',
          'menu.player.shuffle': 'Aleatório',
          'menu.player.repeat': 'Repetir',
          'menu.player.repeat.off': 'Desligado',
          'menu.player.repeat.one': 'Uma',
          'menu.player.repeat.all': 'Todas',
          'menu.player.showPlaylist': 'Mostrar playlist',
          'menu.player.compact': 'Modo compacto',
          'menu.player.tips': 'Dicas de reprodução',
          'menu.player.howto': 'Como adicionar músicas',

          'menu.clothes.openLookbook': 'Abrir lookbook',
          'menu.clothes.shop': 'Loja…',
          'menu.clothes.copy': 'Copiar',
          'menu.clothes.selectAll': 'Selecionar tudo',
          'menu.clothes.viewGrid': 'Grade',
          'menu.clothes.sort': 'Ordenar por',
          'menu.clothes.sort.new': 'Novidades',
          'menu.clothes.sort.popular': 'Popular',
          'menu.clothes.preview': 'Pré-visualizar',
          'menu.clothes.sizing': 'Tamanhos',

          'menu.diev.openPress': 'Abrir press kit',
          'menu.diev.copyBio': 'Copiar bio',
          'menu.diev.copy': 'Copiar',
          'menu.diev.selectAll': 'Selecionar tudo',
          'menu.diev.textSize': 'Tamanho do texto',
          'menu.diev.textSize.small': 'Pequeno',
          'menu.diev.textSize.normal': 'Normal',
          'menu.diev.textSize.large': 'Grande',
          'menu.diev.highContrast': 'Alto contraste',
          'menu.diev.links': 'Links oficiais',

          'menu.contact.copyEmail': 'Copiar e-mail',
          'menu.contact.openInstagram': 'Abrir Instagram',
          'menu.contact.copy': 'Copiar',
          'menu.contact.selectAll': 'Selecionar tudo',
          'menu.contact.showQr': 'Mostrar QR',
          'menu.contact.compact': 'Compacto',
          'menu.contact.support': 'Suporte',

          'menu.settings.apply': 'Aplicar',
          'menu.settings.reset': 'Restaurar padrão',
          'menu.settings.undo': 'Desfazer',
          'menu.settings.redo': 'Refazer',
          'menu.settings.fullscreen': 'Tela cheia',
          'menu.settings.scanlines': 'Scanlines',
          'menu.settings.wallpaper': 'Papel de parede…',
          'menu.settings.what': 'O que é isso?',

          'menu.art.openGallery': 'Abrir galeria',
          'menu.art.saveImage': 'Salvar imagem…',
          'menu.art.copy': 'Copiar',
          'menu.art.selectAll': 'Selecionar tudo',
          'menu.art.zoom': 'Zoom',
          'menu.art.zoom.50': '50%',
          'menu.art.zoom.100': '100%',
          'menu.art.zoom.200': '200%',
          'menu.art.slideshow': 'Apresentação',
          'menu.art.credits': 'Créditos',

          'menu.games.openFolder': 'Abrir pasta de jogos',
          'menu.games.download': 'Download…',
          'menu.games.copy': 'Copiar',
          'menu.games.selectAll': 'Selecionar tudo',
          'menu.games.grid': 'Grade',
          'menu.games.sort': 'Ordenar por',
          'menu.games.sort.new': 'Novidades',
          'menu.games.sort.favorite': 'Favorito',
          'menu.games.howto': 'Como Jogar',
          'menu.games.requirements': 'Requisitos',

          'menu.videos.openChannel': 'Abrir canal',
          'menu.videos.copyLink': 'Copiar link',
          'menu.videos.copy': 'Copiar',
          'menu.videos.selectAll': 'Selecionar tudo',
          'menu.videos.thumbSize': 'Tamanho das miniaturas',
          'menu.videos.thumbSize.small': 'Pequeno',
          'menu.videos.thumbSize.large': 'Grande',
          'menu.videos.openNewTab': 'Abrir em nova aba',
          'menu.videos.tips': 'Dicas',
          'videos.channelLink': 'Assistir no Youtube',
          'videos.watchTitle': 'Assista no BLISS 98',
          'videos.openChannel': 'Assistir vídeos do canal',
          'videos.addKey': 'Adicionar chave da API do YouTube…',
          'videos.noKey': 'Adicione uma chave da API do YouTube para carregar a lista completa. Ainda dá para assistir por aqui.',
          'videos.autoFail': 'Não foi possível carregar os vídeos automaticamente. Você ainda pode abrir o canal.',
          'videos.loading': 'Carregando vídeos…',
          'videos.listEmpty': 'Ainda não há vídeos.',
          'videos.keyTitle': 'Chave da API do YouTube',
          'videos.keyDesc': 'Cole sua chave da API do YouTube Data v3 para carregar os vídeos do canal.',

          'menu.about.copy': 'Copiar',
          'menu.about.selectAll': 'Selecionar tudo',
          'menu.about.version': 'Informações da versão',
          'menu.about.credits': 'Créditos',
          'menu.about.controls': 'Controles',

          'dialog.newWindow.title': 'Nova janela',
          'dialog.newWindow.desc': 'Escolha um app para abrir.',
          'dialog.newWindow.open': 'Abrir',
          'dialog.openLink.title': 'Abrir link',
          'dialog.openLink.desc': 'Escolha uma plataforma.',
          'dialog.openLink.open': 'Abrir',
          'dialog.openTrack.title': 'Abrir faixa',
          'dialog.openTrack.desc': 'Escolha uma faixa da playlist.',
          'dialog.openTrack.open': 'Abrir',
          'dialog.controls.title': 'Tips',
          'dialog.controls.body': 'Whenever in doubt, turn off your mind, relax, float downstream',
          'dialog.gamesHowTo.title': 'Como Jogar',
          'dialog.gamesHowTo.body': 'Use arrow keys or WASD. On mobile, swipe or use the controller.',
          'dialog.where.title': 'Onde ouvir',
          'dialog.where.body': 'Estes são links oficiais da BLISS. Escolha uma plataforma para abrir ou copiar.',
          'dialog.playerTips.title': 'Dicas de reprodução',
          'dialog.playerTips.body': 'O autoplay pode ser bloqueado. Se não tocar, aperte Play uma vez.',
          'dialog.support.title': 'Suporte',
          'dialog.support.body': 'Reporte problemas pela janela de Contato quando estiver disponível. Vamos manter o sistema atualizado.',
          'dialog.settingsWhat.title': 'Configurações',
          'dialog.settingsWhat.body': 'Ajuste idioma, papel de parede e animações das janelas do BLISS 98.',
          'dialog.version.title': 'Informações da versão',
          'dialog.version.body': 'BLISS 98 — Build 98.0',
          'dialog.credits.title': 'Créditos',
          'dialog.credits.body': 'Criado por DIEV.',
          'dialog.notAvailable.title': 'Em breve',
          'dialog.notAvailable.body': 'Este recurso ainda não está disponível.',
          'dialog.dockFull.title': 'Dock cheio',
          'dialog.dockFull.body': 'O Dock esta cheio no mobile (max. 9 icones). Remova um item para adicionar outro.',
          'dialog.selectItem.title': 'Selecione um item',
          'dialog.selectItem.body': 'Selecione um item para continuar.',
          'dialog.copied.title': 'Copiado',
          'dialog.copied.body': 'Copiado para a área de transferência.',
          'dialog.settingsApplied.title': 'Configurações',
          'dialog.settingsApplied.body': 'Configurações aplicadas.',
          'dialog.noUndo.title': 'Desfazer',
          'dialog.noUndo.body': 'Nada para desfazer.',
          'dialog.noRedo.title': 'Refazer',
          'dialog.noRedo.body': 'Nada para refazer.',
          'dialog.rename.title': 'Renomear',
          'dialog.rename.desc': 'Digite um novo nome.',
          'dialog.rename.confirm': 'Renomear',
          'dialog.loginEmpty.title': 'Digite seu nome',
          'dialog.loginEmpty.body': 'Digite um nome para continuar.',
          'dialog.trash.empty': 'A lixeira está vazia.',
          'dialog.trash.restore': 'Restaurar',
          'dialog.trash.restoreAll': 'Restaurar tudo',
          'dialog.trash.emptyAction': 'Esvaziar Lixeira',

          'wallpaper.classic': 'Teal clássico',
          'wallpaper.blissos': 'BlissOS',
          'wallpaper.aqua': 'Aqua',
          'wallpaper.bliss': 'Nascer do Sol',
          'wallpaper.clouds': 'Nuvens',
          'wallpaper.galaxy': 'Galáxia',
          'wallpaper.diev': 'Grid',
          'wallpaper.tot': 'Tot (Rosa)',
          'wallpaper.matrix': 'Matrix',
          'wallpaper.blissxp': 'BlissXP',
          'wallpaper.scarbliss': 'ScarBliss',

          'music.title': 'BLISS — Música',
          'music.subtitle': 'Ouça em todas as plataformas:',
          'music.tip': 'Música é uma coisa linda, não é?',

          'clothes.title': 'BLISS — Roupas',
          'clothes.subtitle': 'Últimos do Instagram.',
          'clothes.loading': 'Carregando…',
          'clothes.unavailable': 'Não foi possível carregar agora.',
          'clothes.thumbAlt': 'Instagram da BLISS',

          'about.title': 'Sobre',
          'about.p1': 'BLISS é um projeto que visa unir artistas independentes, estranhos e únicos,',
          'about.p2': 'apoiando toda forma de arte e autoexpressão.',
          'about.p3': 'Contra o sistema e os dogmas criados por humanos,',
          'about.p4': 'nós somos nossos próprios DEUSES.',
          'about.p5': 'Não existem regras.',
          'about.p6': 'Nós criamos o nosso próprio mundo de dentro para fora.',
          'about.footer': 'Designer DIEV',

          'contact.title': 'Contato',
          'contact.label.instagramDIEV': 'Instagram (DIEV):',
          'contact.label.twitterDIEV': 'Twitter/X (DIEV):',
          'contact.label.emailBusiness': 'Email (Business):',
          'contact.label.instagramBLISS': 'Instagram (BLISS):',
          'diev.title': 'DIEV',
          'diev.p1': 'Página oficial do DIEV.',

          'player.title': 'BLISS Media Player',
          'player.now': 'Tocando:',
          'player.play': 'Play',
          'player.pause': 'Pausar',
          'player.prev': 'Anterior',
          'player.next': 'Próxima',
          'player.vol': 'Vol',
          'player.shuffle': 'Aleatório',
          'player.repeat': 'Repetir',
          'player.repeat.off': 'Desligado',
          'player.repeat.one': 'Uma',
          'player.repeat.all': 'Todas',
          'player.loading': 'Carregando músicas…',
          'player.notfound': 'Sem músicas ainda.',
          'player.autoplay': 'O autoplay pode ser bloqueado. Se não tocar, aperte Play.',
          'player.addSongs': 'Adicionar músicas…',
          'player.reimport': 'Reimportar arquivos',
          'player.reimportHint': 'Reimporte os arquivos para restaurar sua playlist.',
          'player.drop': 'Solte arquivos de áudio aqui',
          'player.flacUnsupported': 'Seu navegador não suporta FLAC. Use MP3/WAV/OGG ou outro navegador.',
          'dialog.playerHowTo.title': 'Como adicionar músicas',
          'dialog.playerHowTo.body': 'Adicione músicas arrastando arquivos de áudio para a janela do player, ou clique em Adicionar músicas… para escolher arquivos.'
        }
      };

      function t(key){
        return (I18N[state.lang] && I18N[state.lang][key]) || (I18N.en && I18N.en[key]) || key;
      }

      function applyI18nTo(root){
        // text nodes
        $$('[data-i18n]', root).forEach(el => {
          const key = el.getAttribute('data-i18n');
          if(key) el.textContent = t(key);
        });
        // titles
        $$('[data-i18n-title]', root).forEach(el => {
          const key = el.getAttribute('data-i18n-title');
          if(key) el.setAttribute('title', t(key));
        });
        // aria labels
        $$('[data-i18n-aria]', root).forEach(el => {
          const key = el.getAttribute('data-i18n-aria');
          if(key) el.setAttribute('aria-label', t(key));
        });
        // placeholders
        $$('[data-i18n-placeholder]', root).forEach(el => {
          const key = el.getAttribute('data-i18n-placeholder');
          if(key) el.setAttribute('placeholder', t(key));
        });
        updateWallpaperButtons(root);
        updateAnimationButtons(root);
        updateDarkModeButtons(root);
        updateTitlebarButtons(root);
        updateThemeButtons(root);
        updateThemeThumbs(root);
        updateRetroGlowButtons(root);
        updateScanlinesButtons(root);
        updateClockButtons(root);
        updateOldCrtButtons(root);
        updateSoundUI(root);
        updateBlissosAccentButtons(root);
        updateBliss98AccentButtons(root);
      }

      function applyI18n(){
        applyI18nTo(document);

        // Update language button label
        const lb = $('#langBtn');
        if(lb) lb.textContent = state.lang.toUpperCase();

        // Re-render desktop UI labels
        renderIcons();
        refreshOpenFolderWindows();
        refreshOpenTxtWindows();
        renderStartMenu();
        updateOpenWindowTitles();
        renderTaskButtons();
        renderCtxMenu();
        updateSnakeUI();
        mpRender();
        updateBlissOSActiveApp();
      }

      function setLang(lang){
        state.lang = (lang === 'pt') ? 'pt' : 'en';
        localStorage.setItem('bliss98_lang', state.lang);
        applyI18n();
      }
      
      function hexToRgb(hex) {
        if (!hex || typeof hex !== 'string' || hex.length !== 7 || hex[0] !== '#') {
          return null;
        }
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
      }

      function mixRgb(from, to, amount){
        const t = Math.max(0, Math.min(1, amount));
        return {
          r: Math.round(from.r + (to.r - from.r) * t),
          g: Math.round(from.g + (to.g - from.g) * t),
          b: Math.round(from.b + (to.b - from.b) * t),
        };
      }

      function rgbToRgba(rgb, alpha){
        const a = Math.max(0, Math.min(1, alpha));
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
      }

      function getRetroGlowBaseRgb(){
        const isBlissOS = state.settings.theme === 'blissos';
        if(isBlissOS){
          const root = document.body;
          const inlineAccent = (root.style.getPropertyValue('--blissos-accent') || '').trim();
          let rgb = hexToRgb(inlineAccent);
          if(!rgb){
            const computedAccent = (getComputedStyle(root).getPropertyValue('--blissos-accent') || '').trim();
            rgb = hexToRgb(computedAccent);
          }
          if(!rgb){
            const colors = BLISSOS_ACCENT_COLORS[state.settings.blissosAccent] || BLISSOS_ACCENT_COLORS.multicolor;
            const fallbackHex = state.settings.blissosDarkMode
              ? (colors['--blissos-accent-dark'] || colors['--blissos-accent'])
              : colors['--blissos-accent'];
            rgb = hexToRgb(fallbackHex);
          }
          return rgb;
        }
        const titlebar = TITLEBAR_THEMES[state.theme.titlebar] || TITLEBAR_THEMES.defaultBlue;
        return hexToRgb(titlebar.bar2) || hexToRgb(titlebar.bar1);
      }

      function updateRetroGlowPalette(){
        const root = document.body;
        if(!root) return;
        const base = getRetroGlowBaseRgb();
        if(!base) return;

        const white = { r:255, g:255, b:255 };
        const black = { r:0, g:0, b:0 };
        const isDark = state.settings.theme === 'blissos'
          ? !!state.settings.blissosDarkMode
          : !!state.settings.darkMode;

        const frame1 = mixRgb(base, white, isDark ? 0.28 : 0.22);
        const frame2 = mixRgb(base, white, isDark ? 0.14 : 0.08);
        const frame3 = mixRgb(base, black, isDark ? 0.08 : 0.14);
        const text1 = mixRgb(base, white, isDark ? 0.55 : 0.45);
        const text2 = mixRgb(base, white, isDark ? 0.32 : 0.22);

        root.style.setProperty('--retro-glow-frame-1', rgbToRgba(frame1, isDark ? 0.44 : 0.34));
        root.style.setProperty('--retro-glow-frame-2', rgbToRgba(frame2, isDark ? 0.34 : 0.28));
        root.style.setProperty('--retro-glow-frame-3', rgbToRgba(frame3, isDark ? 0.26 : 0.2));
        root.style.setProperty('--retro-glow-text-1', rgbToRgba(text1, isDark ? 0.86 : 0.78));
        root.style.setProperty('--retro-glow-text-2', rgbToRgba(text2, isDark ? 0.66 : 0.56));
      }
      
      function setBlissosAccent(accent){
        state.settings.blissosAccent = accent;
        try {
          localStorage.setItem(BLISSOS_ACCENT_KEY, accent);
        } catch {}
        applyBlissosAccent(accent); // This function will apply the CSS variables
      }
      
      function applyBlissosAccent(accent){
        const colors = BLISSOS_ACCENT_COLORS[accent];
        if(!colors) return; // Should not happen
      
        const isDarkMode = state.settings.blissosDarkMode;
        const root = document.body; // Apply to body directly for BlissOS theme
      
        // Apply BlissOS specific color variables
        for (const prop in colors) {
          if (prop.endsWith('-dark')) {
            if (isDarkMode) {
              root.style.setProperty(prop.replace('-dark', ''), colors[prop]);
            }
          } else {
            if (!isDarkMode) {
              root.style.setProperty(prop, colors[prop]);
            }
          }
        }
        
        // Dynamically set --selection-bg and --selection-border
        const currentAccentHex = isDarkMode
          ? root.style.getPropertyValue('--blissos-accent') || colors['--blissos-accent-dark'] || colors['--blissos-accent']
          : root.style.getPropertyValue('--blissos-accent') || colors['--blissos-accent'];
        
        const rgb = hexToRgb(currentAccentHex);

        if (rgb) {
          root.style.setProperty('--selection-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
          root.style.setProperty('--selection-border', currentAccentHex);
        } else {
          // Fallback if hexToRgb fails or accent is not properly defined
          root.style.setProperty('--selection-bg', 'rgba(60,90,140,0.2)'); // Default blueish tint
          root.style.setProperty('--selection-border', '#3a5a8c'); // Default blue
        }

        // Dynamically set --blissos-highlight and --blissos-highlight-press
        root.style.setProperty('--blissos-highlight', currentAccentHex);
        root.style.setProperty('--blissos-highlight-press', isDarkMode
          ? colors['--blissos-accent-2-dark'] || colors['--blissos-accent-2']
          : colors['--blissos-accent-2']);

        updateRetroGlowPalette();

        // Update the pressed state for accent buttons in settings
        updateBlissosAccentButtons();
      }
      function toggleLang(){
        setLang(state.lang === 'en' ? 'pt' : 'en');
      }

      function getWindowId(winEl){
        if(!winEl || !winEl.id) return null;
        return winEl.id.replace('win_', '');
      }

      function renderMenuItems(items){
        return items.map(item => {
          if(item.type === 'sep') return '<div class="menu-sep"></div>';
          const label = t(item.labelKey);
          const checkMark = item.type === 'radio' ? '•' : '✓';
          const check = item.checked ? checkMark : '';
          const left = `<span class="menu-left"><span class="menu-check">${check}</span><span>${label}</span></span>`;
          if(item.type === 'submenu'){
            return `
              <div class="menu-item has-sub" tabindex="0">
                ${left}
                <span class="menu-right">▶</span>
                <div class="menu-sub">
                  ${renderMenuItems(item.items)}
                </div>
              </div>
            `;
          }
          const actionAttr = item.action ? `data-menu-action="${item.action}"` : '';
          const right = item.right ? `<span class="menu-right">${item.right}</span>` : '<span class="menu-right"></span>';
          return `
            <button class="menu-item" type="button" ${actionAttr}>
              ${left}
              ${right}
            </button>
          `;
        }).join('');
      }

      function getMenuItems(appId, menuKey){
        const items = [];
        const addSep = () => { if(items.length && items[items.length-1].type !== 'sep') items.push({ type:'sep' }); };
        const isTxtWin = isTxtWindowId(appId);

        if(menuKey === 'file'){
          if(isTxtWin){
            items.push({ labelKey:'menu.txt.new', action:'txt:new' });
            items.push({ labelKey:'menu.txt.save', action:'txt:save' });
            items.push({ labelKey:'menu.txt.duplicate', action:'txt:duplicate' });
            addSep();
            items.push({ labelKey:'menu.file.close', action:'global:close' });
            items.push({ labelKey:'menu.file.logoff', action:'global:logoff' });
            return items;
          }
          if(appId === 'bliss' && state.settings.theme === 'blissos'){
            items.push({ labelKey:'ctx.newTextFile', action:'fs:newTxtDesktop' });
            items.push({ labelKey:'ctx.newFolder', action:'fs:newFolderDesktop' });
            addSep();
          }
          items.push({ labelKey:'menu.file.newWindow', action:'global:newWindow' });
          addSep();
          if(appId === 'music'){
            items.push({ labelKey:'menu.music.openLink', action:'music:openLink' });
            items.push({ labelKey:'menu.music.copyLink', action:'music:copyLink' });
          }
          if(appId === 'mediaplayer'){
            items.push({ labelKey:'menu.player.openTrack', action:'player:openTrack' });
            items.push({ labelKey:'menu.player.reload', action:'player:reload' });
          }
          if(appId === 'clothes'){
            items.push({ labelKey:'menu.clothes.openLookbook', action:'clothes:openLookbook' });
            items.push({ labelKey:'menu.clothes.shop', action:'clothes:shop' });
          }
          if(appId === 'diev'){
            items.push({ labelKey:'menu.diev.openPress', action:'diev:openPress' });
            items.push({ labelKey:'menu.diev.copyBio', action:'diev:copyBio' });
          }
          if(appId === 'contact'){
            items.push({ labelKey:'menu.contact.copyEmail', action:'contact:copyEmail' });
            items.push({ labelKey:'menu.contact.openInstagram', action:'contact:openInstagram' });
          }
          if(appId === 'settings'){
            items.push({ labelKey:'menu.settings.apply', action:'settings:apply' });
            items.push({ labelKey:'menu.settings.reset', action:'settings:reset' });
          }
          if(appId === 'art'){
            items.push({ labelKey:'menu.art.openGallery', action:'art:openGallery' });
            items.push({ labelKey:'menu.art.saveImage', action:'art:saveImage' });
          }
          if(appId === 'games'){
            items.push({ labelKey:'menu.games.openFolder', action:'games:openFolder' });
            items.push({ labelKey:'menu.games.download', action:'games:download' });
          }
          if(appId === 'videos'){
            items.push({ labelKey:'menu.videos.openChannel', action:'videos:openChannel' });
            items.push({ labelKey:'menu.videos.copyLink', action:'videos:copyLink' });
          }
          addSep();
          items.push({ labelKey:'menu.file.close', action:'global:close' });
          items.push({ labelKey:'menu.file.logoff', action:'global:logoff' });
        }

        if(menuKey === 'edit'){
          if(appId === 'music'){
            items.push({ labelKey:'menu.music.selectAll', action:'music:selectAll' });
            items.push({ labelKey:'menu.music.copyLink', action:'music:copyLink' });
            items.push({ labelKey:'menu.music.clearSelection', action:'music:clearSelection' });
          }
          if(appId === 'mediaplayer'){
            items.push({ labelKey:'menu.player.selectAll', action:'player:selectAll' });
            items.push({ labelKey:'menu.player.copyName', action:'player:copyName' });
            items.push({ labelKey:'menu.player.clearSelection', action:'player:clearSelection' });
          }
          if(appId === 'clothes'){
            items.push({ labelKey:'menu.clothes.copy', action:'clothes:copy' });
            items.push({ labelKey:'menu.clothes.selectAll', action:'clothes:selectAll' });
          }
          if(appId === 'diev'){
            items.push({ labelKey:'menu.diev.copy', action:'diev:copy' });
            items.push({ labelKey:'menu.diev.selectAll', action:'diev:selectAll' });
          }
          if(appId === 'contact'){
            items.push({ labelKey:'menu.contact.copy', action:'contact:copy' });
            items.push({ labelKey:'menu.contact.selectAll', action:'contact:selectAll' });
          }
          if(appId === 'settings'){
            items.push({ labelKey:'menu.settings.undo', action:'settings:undo' });
            items.push({ labelKey:'menu.settings.redo', action:'settings:redo' });
          }
          if(appId === 'art'){
            items.push({ labelKey:'menu.art.copy', action:'art:copy' });
            items.push({ labelKey:'menu.art.selectAll', action:'art:selectAll' });
          }
          if(appId === 'games'){
            items.push({ labelKey:'menu.games.copy', action:'games:copy' });
            items.push({ labelKey:'menu.games.selectAll', action:'games:selectAll' });
          }
          if(appId === 'videos'){
            items.push({ labelKey:'menu.videos.copy', action:'videos:copy' });
            items.push({ labelKey:'menu.videos.selectAll', action:'videos:selectAll' });
          }
          if(appId === 'about'){
            items.push({ labelKey:'menu.about.copy', action:'about:copy' });
            items.push({ labelKey:'menu.about.selectAll', action:'about:selectAll' });
          }
        }

        if(menuKey === 'view'){
          if(appId === 'bliss'){
            items.push({ labelKey:'ctx.arrange', action:'global:arrange' });
            items.push({ labelKey:'ctx.grid', action:'global:grid', type:'checkbox', checked: !!state.gridSnap });
            items.push({ labelKey:'ctx.showDesktopIcons', action:'global:desktopIcons', type:'checkbox', checked: state.settings.showDesktopIcons !== false });
            items.push({ labelKey:'ctx.language', action:'global:language', right: state.lang.toUpperCase() });
          }
          if(appId === 'music'){
            items.push({
              type:'submenu',
              labelKey:'menu.music.tileSize',
              items:[
                { labelKey:'menu.music.tileSize.small', action:'music:tileSmall', type:'radio', checked: state.music.tileSize === 'small' },
                { labelKey:'menu.music.tileSize.large', action:'music:tileLarge', type:'radio', checked: state.music.tileSize === 'large' }
              ]
            });
            items.push({ labelKey:'menu.music.openNewTab', action:'music:toggleNewTab', type:'checkbox', checked: state.music.openNewTab });
            items.push({ labelKey:'menu.music.showIcons', action:'music:toggleIcons', type:'checkbox', checked: state.music.showIcons });
          }
          if(appId === 'mediaplayer'){
            items.push({ labelKey:'menu.player.shuffle', action:'player:toggleShuffle', type:'checkbox', checked: state.mediaplayer.shuffle });
            items.push({
              type:'submenu',
              labelKey:'menu.player.repeat',
              items:[
                { labelKey:'menu.player.repeat.off', action:'player:repeatOff', type:'radio', checked: state.mediaplayer.repeat === 'off' },
                { labelKey:'menu.player.repeat.one', action:'player:repeatOne', type:'radio', checked: state.mediaplayer.repeat === 'one' },
                { labelKey:'menu.player.repeat.all', action:'player:repeatAll', type:'radio', checked: state.mediaplayer.repeat === 'all' }
              ]
            });
            items.push({ labelKey:'menu.player.showPlaylist', action:'player:togglePlaylist', type:'checkbox', checked: state.mediaplayer.showPlaylist });
            items.push({ labelKey:'menu.player.compact', action:'player:toggleCompact', type:'checkbox', checked: state.mediaplayer.compact });
          }
          if(appId === 'clothes'){
            items.push({ labelKey:'menu.clothes.viewGrid', action:'clothes:viewGrid' });
            items.push({
              type:'submenu',
              labelKey:'menu.clothes.sort',
              items:[
                { labelKey:'menu.clothes.sort.new', action:'clothes:sortNew', type:'radio', checked: state.clothes.sort === 'new' },
                { labelKey:'menu.clothes.sort.popular', action:'clothes:sortPopular', type:'radio', checked: state.clothes.sort === 'popular' }
              ]
            });
            items.push({ labelKey:'menu.clothes.preview', action:'clothes:togglePreview', type:'checkbox', checked: state.clothes.preview });
          }
          if(appId === 'diev'){
            items.push({
              type:'submenu',
              labelKey:'menu.diev.textSize',
              items:[
                { labelKey:'menu.diev.textSize.small', action:'diev:textSmall', type:'radio', checked: state.diev.textSize === 'small' },
                { labelKey:'menu.diev.textSize.normal', action:'diev:textNormal', type:'radio', checked: state.diev.textSize === 'normal' },
                { labelKey:'menu.diev.textSize.large', action:'diev:textLarge', type:'radio', checked: state.diev.textSize === 'large' }
              ]
            });
            items.push({ labelKey:'menu.diev.highContrast', action:'diev:toggleContrast', type:'checkbox', checked: state.diev.highContrast });
          }
          if(appId === 'contact'){
            items.push({ labelKey:'menu.contact.showQr', action:'contact:showQr' });
            items.push({ labelKey:'menu.contact.compact', action:'contact:compact' });
          }
          if(appId === 'settings'){
            items.push({ labelKey:'menu.settings.fullscreen', action:'settings:fullscreen', type:'checkbox', checked: !!document.fullscreenElement });
            items.push({ labelKey:'menu.settings.scanlines', action:'settings:scanlines', type:'checkbox', checked: state.settings.scanlines });
            items.push({ labelKey:'menu.settings.wallpaper', action:'settings:wallpaper' });
          }
          if(appId === 'art'){
            items.push({
              type:'submenu',
              labelKey:'menu.art.zoom',
              items:[
                { labelKey:'menu.art.zoom.50', action:'art:zoom50', type:'radio', checked: state.art.zoom === 50 },
                { labelKey:'menu.art.zoom.100', action:'art:zoom100', type:'radio', checked: state.art.zoom === 100 },
                { labelKey:'menu.art.zoom.200', action:'art:zoom200', type:'radio', checked: state.art.zoom === 200 }
              ]
            });
            items.push({ labelKey:'menu.art.slideshow', action:'art:slideshow' });
          }
          if(appId === 'games'){
            items.push({ labelKey:'menu.games.grid', action:'games:grid' });
            items.push({
              type:'submenu',
              labelKey:'menu.games.sort',
              items:[
                { labelKey:'menu.games.sort.new', action:'games:sortNew' },
                { labelKey:'menu.games.sort.favorite', action:'games:sortFavorite' }
              ]
            });
          }
          if(appId === 'videos'){
            items.push({
              type:'submenu',
              labelKey:'menu.videos.thumbSize',
              items:[
                { labelKey:'menu.videos.thumbSize.small', action:'videos:thumbSmall', type:'radio', checked: state.videos.thumbSize === 'small' },
                { labelKey:'menu.videos.thumbSize.large', action:'videos:thumbLarge', type:'radio', checked: state.videos.thumbSize === 'large' }
              ]
            });
            items.push({ labelKey:'menu.videos.openNewTab', action:'videos:toggleNewTab', type:'checkbox', checked: state.videos.openNewTab });
          }
          if(appId === 'about'){
            items.push({ labelKey:'menu.about.version', action:'about:version' });
            items.push({ labelKey:'menu.about.credits', action:'about:credits' });
          }
        }

        if(menuKey === 'special' && state.settings.theme === 'blissos' && appId === 'bliss'){
          items.push({ labelKey:'menu.special.emptyTrash', action:'global:emptyTrash' });
          addSep();
          items.push({ labelKey:'menu.special.eject', action:'global:eject' });
          items.push({ labelKey:'menu.special.eraseDisk', action:'global:eraseDisk' });
          addSep();
          items.push({ labelKey:'menu.special.restart', action:'global:restart' });
          items.push({ labelKey:'menu.special.shutdown', action:'global:shutdown' });
        }

        if(menuKey === 'help'){
          if(appId === 'music') items.push({ labelKey:'menu.music.where', action:'music:where' });
          if(appId === 'mediaplayer'){
            items.push({ labelKey:'menu.player.tips', action:'player:tips' });
            items.push({ labelKey:'menu.player.howto', action:'player:howto' });
          }
          if(appId === 'clothes') items.push({ labelKey:'menu.clothes.sizing', action:'clothes:sizing' });
          if(appId === 'diev') items.push({ labelKey:'menu.diev.links', action:'diev:links' });
          if(appId === 'contact') items.push({ labelKey:'menu.contact.support', action:'contact:support' });
          if(appId === 'settings') items.push({ labelKey:'menu.settings.what', action:'settings:what' });
          if(appId === 'art') items.push({ labelKey:'menu.art.credits', action:'art:credits' });
          if(appId === 'games'){
            items.push({ labelKey:'menu.games.howto', action:'games:howto' });
            items.push({ labelKey:'menu.games.requirements', action:'games:requirements' });
          }
          if(appId === 'videos') items.push({ labelKey:'menu.videos.tips', action:'videos:tips' });
          if(appId === 'about') items.push({ labelKey:'menu.about.controls', action:'about:controls' });

          addSep();
          items.push({ labelKey:'menu.help.controls', action:'global:controls' });
          items.push({ labelKey:'menu.help.about', action:'global:about' });
        }

        return items;
      }

      function openWindowMenu(winEl, menuKey, anchorEl){
        const blissos = state.settings.theme === 'blissos';
        const isTop = blissos && anchorEl && anchorEl.closest && anchorEl.closest('#blissosMenubar');
        const appId = isTop ? (state.activeWindowId || 'bliss') : getWindowId(winEl);
        if(!appId) return;
        const drop = isTop ? $('#blissosMenuDrop') : (winEl ? winEl.querySelector('.menu-drop') : null);
        if(!drop) return;

        if(state.menuOpen && state.menuOpen.winId !== appId){
          closeWindowMenu();
        }
        const items = getMenuItems(appId, menuKey);
        if(items.length === 0){
          closeWindowMenu();
          return;
        }
        drop.innerHTML = renderMenuItems(items);
        drop.classList.remove('hidden');

        const anchorRect = anchorEl.getBoundingClientRect();
        if(isTop){
          drop.style.top = anchorRect.bottom + 'px';
          drop.style.left = anchorRect.left + 'px';
        } else {
          const winRect = winEl.getBoundingClientRect();
          const top = Math.max(0, anchorRect.bottom - winRect.top);
          const left = Math.max(0, anchorRect.left - winRect.left);
          drop.style.top = top + 'px';
          drop.style.left = left + 'px';
        }

        if(winEl){
          winEl.querySelectorAll('.menubar span').forEach(span => {
            span.classList.toggle('active', span.dataset.menu === menuKey);
          });
        }
        document.querySelectorAll('.blissos-menu-item').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.blissosMenu === menuKey);
        });

        state.menuOpen = { winId: appId, menuKey, isTop };
      }

      function closeWindowMenu(){
        if(!state.menuOpen) return;
        if(state.menuOpen.isTop){
          const drop = $('#blissosMenuDrop');
          if(drop) drop.classList.add('hidden');
        } else {
          const winEl = document.getElementById(`win_${state.menuOpen.winId}`);
          if(winEl){
            const drop = winEl.querySelector('.menu-drop');
            if(drop) drop.classList.add('hidden');
            winEl.querySelectorAll('.menubar span').forEach(span => span.classList.remove('active'));
          }
        }
        document.querySelectorAll('.blissos-menu-item').forEach(btn => btn.classList.remove('active'));
        state.menuOpen = null;
      }

      const modalState = { onConfirm: null };

      function showModal({ title, body, actions }){
        const modal = $('#modal');
        if(!modal) return;
        $('#modalTitle').textContent = title || '';
        $('#modalBody').innerHTML = body || '';
        const actionsEl = $('#modalActions');
        actionsEl.innerHTML = (actions || []).map((a, idx) => `
          <button class="btn bevel" type="button" data-modal-action="${a.action}" style="${a.primary ? 'font-weight:700;' : ''}">${a.label}</button>
        `).join('');
        modal.classList.remove('hidden');
        const firstBtn = actionsEl.querySelector('button');
        if(firstBtn) firstBtn.focus();
      }

      function closeModal(){
        const modal = $('#modal');
        if(!modal) return;
        modal.classList.add('hidden');
        $('#modalBody').innerHTML = '';
        $('#modalActions').innerHTML = '';
        modalState.onConfirm = null;
      }

      function showMessage(titleKey, bodyKey){
        showModal({
          title: t(titleKey),
          body: `<p style="margin:0;">${t(bodyKey)}</p>`,
          actions: [{ label: t('common.ok'), action: 'close', primary: true }]
        });
      }

      function showSelectDialog({ titleKey, descKey, options, confirmKey, onConfirm, selected }){
        const opts = options.map(o => {
          const sel = (selected !== undefined && String(selected) === String(o.value)) ? ' selected' : '';
          return `<option value="${o.value}"${sel}>${o.label}</option>`;
        }).join('');
        const body = `
          <p style="margin:0 0 8px 0;">${t(descKey)}</p>
          <select id="modalSelect" class="bevel-in" style="width:100%; height:26px;">${opts}</select>
        `;
        modalState.onConfirm = onConfirm || null;
        showModal({
          title: t(titleKey),
          body,
          actions: [
            { label: t(confirmKey), action: 'confirm', primary: true },
            { label: t('common.cancel'), action: 'close' }
          ]
        });
      }

      function showInputDialog({ titleKey, descKey, value, confirmKey, onConfirm }){
        const safeValue = value ? String(value).replace(/"/g, '&quot;') : '';
        const body = `
          <p style="margin:0 0 8px 0;">${t(descKey)}</p>
          <input id="modalInput" class="bevel-in" type="text" value="${safeValue}" style="width:100%; height:26px;" />
        `;
        modalState.onConfirm = onConfirm || null;
        showModal({
          title: t(titleKey),
          body,
          actions: [
            { label: t(confirmKey), action: 'confirm', primary: true },
            { label: t('common.cancel'), action: 'close' }
          ]
        });
      }

      async function copyText(text){
        if(!text) return false;
        try{
          await navigator.clipboard.writeText(text);
          return true;
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand('copy');
          ta.remove();
          return ok;
        }
      }

      function selectAllInWindow(winId){
        const winEl = document.getElementById(`win_${winId}`);
        if(!winEl) return;
        const content = winEl.querySelector('.content');
        if(!content) return;
        const range = document.createRange();
        range.selectNodeContents(content);
        const sel = window.getSelection();
        if(sel){
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }

      function getSelectedText(){
        const sel = window.getSelection();
        return sel ? String(sel.toString()) : '';
      }

      function copySelectedTextOrWarn(){
        const text = getSelectedText();
        if(!text){
          showMessage('dialog.selectItem.title', 'dialog.selectItem.body');
          return;
        }
        copyText(text).then(ok => ok && showMessage('dialog.copied.title', 'dialog.copied.body'));
      }

      function openLink(url, appId){
        if(!url) return;
        if(appId === 'music'){
          if(state.music.openNewTab) window.open(url, '_blank', 'noreferrer');
          else window.location.href = url;
          return;
        }
        if(appId === 'videos'){
          if(state.videos.openNewTab) window.open(url, '_blank', 'noreferrer');
          else window.location.href = url;
          return;
        }
        window.open(url, '_blank', 'noreferrer');
      }

      function shouldPlayFileOpenForMenuAction(action){
        if(!action) return false;
        // Skip actions that already have dedicated SFX or open/close windows with their own sounds.
        if(action === 'global:close') return false;
        if(action === 'global:logoff') return false;
        if(action === 'global:shutdown') return false;
        if(action === 'global:restart') return false;
        if(action === 'global:emptyTrash') return false;
        if(action === 'global:eject') return false;
        if(action === 'global:about') return false;
        if(action === 'settings:wallpaper') return false;
        if(action === 'fs:newTxtDesktop') return false;
        return true;
      }

      function handleMenuAction(action){
        const winId = state.menuOpen ? state.menuOpen.winId : null;
        if(!action) return;
        if(shouldPlayFileOpenForMenuAction(action)){
          playSfx('fileOpen');
        }

        if(action === 'global:newWindow'){
          const options = APPS.filter(a => a.showInStart !== false).map(a => ({ value: a.id, label: t(a.titleKey) }));
          showSelectDialog({
            titleKey: 'dialog.newWindow.title',
            descKey: 'dialog.newWindow.desc',
            options,
            confirmKey: 'dialog.newWindow.open',
            onConfirm: (val)=>{ openApp(val); }
          });
          return;
        }
        if(action === 'global:close' && winId){
          closeApp(winId);
          return;
        }
        if(action === 'global:logoff'){
          doLogoff();
          return;
        }
        if(action === 'global:emptyTrash'){
          emptyTrash();
          return;
        }
        if(action === 'global:eject'){
          playSfx('boot');
          return;
        }
        if(action === 'global:eraseDisk'){
          showMessage('dialog.diskErased.title', 'dialog.diskErased.body');
          return;
        }
        if(action === 'global:restart'){
          location.reload();
          return;
        }
        if(action === 'global:shutdown'){
          doLogoff();
          return;
        }
        if(action === 'global:controls'){
          showMessage('dialog.controls.title', 'dialog.controls.body');
          return;
        }
        if(action === 'global:about'){
          openApp('about');
          return;
        }
        if(action === 'global:arrange'){
          arrangeIcons();
          return;
        }
        if(action === 'global:grid'){
          state.gridSnap = !state.gridSnap;
          saveGridSnap();
          renderCtxMenu();
          return;
        }
        if(action === 'global:desktopIcons'){
          setDesktopIconsVisible(!(state.settings.showDesktopIcons !== false));
          return;
        }
        if(action === 'global:language'){
          toggleLang();
          return;
        }

        if(action.startsWith('txt:') && winId && isTxtWindowId(winId)){
          handleTxtAction(winId, action.split(':')[1]);
          return;
        }
        if(action === 'fs:newTxtDesktop'){
          const created = createTxtFile({ parentId: null });
          if(created) openTxtFileWindow(created.id);
          return;
        }
        if(action === 'fs:newFolderDesktop'){
          createFolder({ parentId: null });
          return;
        }

        if(action === 'music:openLink'){
          const options = MUSIC_LINKS.map(l => ({ value: l.id, label: l.label }));
          const selectedId = Array.from(state.music.selected)[0];
          showSelectDialog({
            titleKey: 'dialog.openLink.title',
            descKey: 'dialog.openLink.desc',
            options,
            confirmKey: 'dialog.openLink.open',
            selected: selectedId,
            onConfirm: (val)=>{
              const link = MUSIC_LINKS.find(l => l.id === val);
              if(link) openLink(link.url, 'music');
            }
          });
          return;
        }
        if(action === 'music:copyLink'){
          const ids = Array.from(state.music.selected);
          const selected = ids.length ? ids : [];
          if(selected.length === 0){
            showMessage('dialog.selectItem.title', 'dialog.selectItem.body');
            return;
          }
          const urls = selected.map(id => (MUSIC_LINKS.find(l => l.id === id) || {}).url).filter(Boolean);
          copyText(urls.join('\n')).then(ok => {
            if(ok) showMessage('dialog.copied.title', 'dialog.copied.body');
          });
          return;
        }
        if(action === 'music:selectAll'){
          state.music.selected = new Set(MUSIC_LINKS.map(l => l.id));
          applyMusicState();
          return;
        }
        if(action === 'music:clearSelection'){
          state.music.selected = new Set();
          applyMusicState();
          return;
        }
        if(action === 'music:tileSmall'){
          state.music.tileSize = 'small';
          applyMusicState();
          return;
        }
        if(action === 'music:tileLarge'){
          state.music.tileSize = 'large';
          applyMusicState();
          return;
        }
        if(action === 'music:toggleNewTab'){
          state.music.openNewTab = !state.music.openNewTab;
          return;
        }
        if(action === 'music:toggleIcons'){
          state.music.showIcons = !state.music.showIcons;
          applyMusicState();
          return;
        }
        if(action === 'music:where'){
          showMessage('dialog.where.title', 'dialog.where.body');
          return;
        }

        if(action === 'player:openTrack'){
          const options = mp.tracks.map((tr, i) => ({ value: String(i), label: tr.title }));
          if(options.length === 0){
            showMessage('dialog.selectItem.title', 'dialog.selectItem.body');
            return;
          }
          showSelectDialog({
            titleKey: 'dialog.openTrack.title',
            descKey: 'dialog.openTrack.desc',
            options,
            confirmKey: 'dialog.openTrack.open',
            selected: mp.idx,
            onConfirm: (val)=>{
              const idx = Number(val);
              state.mediaplayer.selected = new Set([idx]);
              mpSetTrack(idx);
              mpPlay();
            }
          });
          return;
        }
        if(action === 'player:reload'){
          mpLoadTracks(true);
          return;
        }
        if(action === 'player:selectAll'){
          state.mediaplayer.selected = new Set(mp.tracks.map((_, i) => i));
          mpRender();
          return;
        }
        if(action === 'player:copyName'){
          const ids = Array.from(state.mediaplayer.selected);
          if(ids.length === 0){
            showMessage('dialog.selectItem.title', 'dialog.selectItem.body');
            return;
          }
          const names = ids.map(i => (mp.tracks[i] ? mp.tracks[i].title : '')).filter(Boolean);
          copyText(names.join('\n')).then(ok => {
            if(ok) showMessage('dialog.copied.title', 'dialog.copied.body');
          });
          return;
        }
        if(action === 'player:clearSelection'){
          state.mediaplayer.selected = new Set();
          mpRender();
          return;
        }
        if(action === 'player:toggleShuffle'){
          mpSetShuffle(!state.mediaplayer.shuffle);
          return;
        }
        if(action === 'player:repeatOff'){
          state.mediaplayer.repeat = 'off';
          mpRender();
          return;
        }
        if(action === 'player:repeatOne'){
          state.mediaplayer.repeat = 'one';
          mpRender();
          return;
        }
        if(action === 'player:repeatAll'){
          state.mediaplayer.repeat = 'all';
          mpRender();
          return;
        }
        if(action === 'player:togglePlaylist'){
          state.mediaplayer.showPlaylist = !state.mediaplayer.showPlaylist;
          applyMediaplayerState();
          return;
        }
        if(action === 'player:toggleCompact'){
          state.mediaplayer.compact = !state.mediaplayer.compact;
          applyMediaplayerState();
          return;
        }
        if(action === 'player:tips'){
          showMessage('dialog.playerTips.title', 'dialog.playerTips.body');
          return;
        }
        if(action === 'player:howto'){
          showMessage('dialog.playerHowTo.title', 'dialog.playerHowTo.body');
          return;
        }

        if(action === 'clothes:openLookbook'){
          openLink(CLOTHES_PROFILE_URL, 'clothes');
          return;
        }
        if(action === 'clothes:shop'){
          const topItem = getSortedClothesItems(state.clothes.items).find(item => item && item.url);
          openLink((topItem && topItem.url) ? topItem.url : CLOTHES_PROFILE_URL, 'clothes');
          return;
        }
        if(action === 'clothes:sizing'){
          openLink(CLOTHES_SIZING_URL, 'clothes');
          return;
        }
        if(action === 'clothes:viewGrid'){
          const win = document.getElementById('win_clothes');
          const grid = win ? win.querySelector('#clothesGrid') : null;
          if(grid) grid.scrollIntoView({ block: 'nearest' });
          const firstItem = grid ? grid.querySelector('.clothes-item') : null;
          if(firstItem && typeof firstItem.focus === 'function') firstItem.focus();
          return;
        }
        if(action === 'clothes:sortNew'){
          state.clothes.sort = 'new';
          applyClothesState();
          return;
        }
        if(action === 'clothes:sortPopular'){
          state.clothes.sort = 'popular';
          applyClothesState();
          return;
        }
        if(action === 'clothes:togglePreview'){
          state.clothes.preview = !state.clothes.preview;
          applyClothesState();
          return;
        }
        if(action === 'clothes:copy' || action === 'clothes:selectAll'){
          if(action === 'clothes:selectAll' && winId) selectAllInWindow(winId);
          if(action === 'clothes:copy'){
            copySelectedTextOrWarn();
          }
          return;
        }

        if(action === 'diev:openPress' || action === 'diev:copyBio'){
          showMessage('dialog.notAvailable.title', 'dialog.notAvailable.body');
          return;
        }
        if(action === 'diev:copy' || action === 'diev:selectAll'){
          if(action === 'diev:selectAll' && winId) selectAllInWindow(winId);
          if(action === 'diev:copy'){
            copySelectedTextOrWarn();
          }
          return;
        }
        if(action === 'diev:textSmall'){
          state.diev.textSize = 'small';
          applyDievState();
          return;
        }
        if(action === 'diev:textNormal'){
          state.diev.textSize = 'normal';
          applyDievState();
          return;
        }
        if(action === 'diev:textLarge'){
          state.diev.textSize = 'large';
          applyDievState();
          return;
        }
        if(action === 'diev:toggleContrast'){
          state.diev.highContrast = !state.diev.highContrast;
          applyDievState();
          return;
        }
        if(action === 'diev:links'){
          showMessage('dialog.where.title', 'dialog.where.body');
          return;
        }

        if(action === 'contact:support'){
          showMessage('dialog.support.title', 'dialog.support.body');
          return;
        }
        if(action === 'contact:copyEmail' || action === 'contact:openInstagram' || action === 'contact:showQr' || action === 'contact:compact'){
          showMessage('dialog.notAvailable.title', 'dialog.notAvailable.body');
          return;
        }
        if(action === 'contact:copy' || action === 'contact:selectAll'){
          if(action === 'contact:selectAll' && winId) selectAllInWindow(winId);
          if(action === 'contact:copy'){
            copySelectedTextOrWarn();
          }
          return;
        }

        if(action === 'settings:apply'){
          showMessage('dialog.settingsApplied.title', 'dialog.settingsApplied.body');
          return;
        }
        if(action === 'settings:reset'){
          setLang('en');
          applyWallpaper('classic');
          setAnimations(true);
          state.settings.scanlines = false;
          applyScanlines();
          showMessage('dialog.settingsApplied.title', 'dialog.settingsApplied.body');
          return;
        }
        if(action === 'settings:undo'){
          showMessage('dialog.noUndo.title', 'dialog.noUndo.body');
          return;
        }
        if(action === 'settings:redo'){
          showMessage('dialog.noRedo.title', 'dialog.noRedo.body');
          return;
        }
        if(action === 'settings:fullscreen'){
          if(typeof setFullscreen === 'function'){
            setFullscreen(!document.fullscreenElement);
          } else if(!document.fullscreenElement){
            document.documentElement.requestFullscreen().catch(()=>{});
          } else {
            document.exitFullscreen().catch(()=>{});
          }
          return;
        }
        if(action === 'settings:scanlines'){
          state.settings.scanlines = !state.settings.scanlines;
          applyScanlines();
          return;
        }
        if(action === 'settings:wallpaper'){
          openSettingsAndTab('appearance', 'settingsWallpaper');
          return;
        }
        if(action === 'settings:what'){
          showMessage('dialog.settingsWhat.title', 'dialog.settingsWhat.body');
          return;
        }

        if(action === 'games:grid'){
          state.games.layout = (state.games.layout === 'grid') ? 'list' : 'grid';
          saveGamesLayout();
          if(state.activeWindowId === 'games' && state.games.view === 'list'){
            renderGamesWindow();
          }
          return;
        }
        if(action === 'games:howto'){
          showMessage('dialog.gamesHowTo.title', 'dialog.gamesHowTo.body');
          return;
        }

        if(action === 'art:openGallery' || action === 'art:saveImage' || action === 'art:slideshow' || action === 'art:credits'){
          showMessage('dialog.notAvailable.title', 'dialog.notAvailable.body');
          return;
        }
        if(action === 'art:copy' || action === 'art:selectAll'){
          if(action === 'art:selectAll' && winId) selectAllInWindow(winId);
          if(action === 'art:copy'){
            copySelectedTextOrWarn();
          }
          return;
        }
        if(action === 'art:zoom50'){
          state.art.zoom = 50;
          applyArtState();
          return;
        }
        if(action === 'art:zoom100'){
          state.art.zoom = 100;
          applyArtState();
          return;
        }
        if(action === 'art:zoom200'){
          state.art.zoom = 200;
          applyArtState();
          return;
        }

        if(action === 'games:openFolder' || action === 'games:download' || action === 'games:sortNew' || action === 'games:sortFavorite' || action === 'games:requirements'){
          showMessage('dialog.notAvailable.title', 'dialog.notAvailable.body');
          return;
        }
        if(action === 'games:copy' || action === 'games:selectAll'){
          if(action === 'games:selectAll' && winId) selectAllInWindow(winId);
          if(action === 'games:copy'){
            copySelectedTextOrWarn();
          }
          return;
        }

        if(action === 'videos:openChannel'){
          openLink(VIDEO_CHANNEL_URL, 'videos');
          return;
        }
        if(action === 'videos:copyLink'){
          copyText(VIDEO_CHANNEL_URL).then(ok => ok && showMessage('dialog.copied.title', 'dialog.copied.body'));
          return;
        }
        if(action === 'videos:copy' || action === 'videos:selectAll'){
          if(action === 'videos:selectAll' && winId) selectAllInWindow(winId);
          if(action === 'videos:copy'){
            copySelectedTextOrWarn();
          }
          return;
        }
        if(action === 'videos:thumbSmall'){
          state.videos.thumbSize = 'small';
          return;
        }
        if(action === 'videos:thumbLarge'){
          state.videos.thumbSize = 'large';
          return;
        }
        if(action === 'videos:toggleNewTab'){
          state.videos.openNewTab = !state.videos.openNewTab;
          return;
        }
        if(action === 'videos:tips'){
          showMessage('dialog.playerTips.title', 'dialog.playerTips.body');
          return;
        }

        if(action === 'about:version'){
          showMessage('dialog.version.title', 'dialog.version.body');
          return;
        }
        if(action === 'about:credits'){
          showMessage('dialog.credits.title', 'dialog.credits.body');
          return;
        }
        if(action === 'about:controls'){
          showMessage('dialog.controls.title', 'dialog.controls.body');
          return;
        }
        if(action === 'about:copy' || action === 'about:selectAll'){
          if(action === 'about:selectAll' && winId) selectAllInWindow(winId);
          if(action === 'about:copy'){
            copySelectedTextOrWarn();
          }
          return;
        }
      }

      function updateOpenWindowTitles(){
        // Update stored titles and the DOM titlebars
        state.windows.forEach((w, id) => {
          const app = APPS.find(a => a.id === id);
          const title = app ? getIconLabel(app) : (w.titleKey ? t(w.titleKey) : id);
          w.title = title;
          const winEl = document.getElementById(`win_${id}`);
          if(winEl){
            const titleEl = winEl.querySelector('.title-left strong');
            if(titleEl) titleEl.textContent = title;

            const c = winEl.querySelector('.content');
            if(c && CONTENT[id]) {
              c.innerHTML = CONTENT[id]();
            }
            applyI18nTo(winEl);
            applyWindowState(winEl, id);

            const minCtl = winEl.querySelector('[data-action="min"]');
            const maxCtl = winEl.querySelector('[data-action="max"]');
            const closeCtl = winEl.querySelector('[data-action="close"]');
            const resizeCtl = winEl.querySelector('.resize');
            if(minCtl) minCtl.title = t('win.minimize');
            if(maxCtl) maxCtl.title = t('win.maximize');
            if(closeCtl) closeCtl.title = t('win.close');
            if(resizeCtl) resizeCtl.title = t('win.resize');
            const status = winEl.querySelector('.statusbar');
            if(status){
              let center = status.querySelector('.status-center');
              if(!center){
                center = document.createElement('span');
                center.className = 'status-center';
                center.setAttribute('data-i18n', 'about.footer');
                status.insertBefore(center, status.lastElementChild);
              }
              center.textContent = t('about.footer');
            }

          if(id === 'mediaplayer') {
            setTimeout(mpInitInWindow, 0);
          }
          if(id === 'trash'){
            updateTrashIconUI();
          }
          if(id === 'poetry'){
            renderPoetryWindow();
          }
          if(id === 'clothes'){
            initClothesWindow(winEl);
          }
          if(id === 'settings'){
            initSettingsTabs(winEl);
            applySettingsIcons(winEl);
          }
          if(id === 'videos'){
            initVideosWindow(winEl);
          }
          if(id === 'seeker'){
            initSeekerWindow(winEl);
          }
        }
      });
      }

      const BLISSOS_ICON_MAP = {
        enabled: true,
        base: './assets/BlissOS/',
        sourceBase: './assets/icons/',
        // BlissOS keeps this filename in lowercase on disk.
        fileOverrides: Object.freeze({
          'Settings.png': 'system.png',
          'settings.png': 'system.png',
        }),
      };

      const BLISSOS_ICON_REVERSE_MAP = Object.freeze(
        Object.entries(BLISSOS_ICON_MAP.fileOverrides).reduce((acc, [from, to]) => {
          acc[to] = from;
          return acc;
        }, {})
      );

      function splitAssetQuery(src){
        const q = src.indexOf('?');
        if(q === -1) return { path: src, query: '' };
        return { path: src.slice(0, q), query: src.slice(q) };
      }

      function decodeAssetPath(path){
        if(typeof path !== 'string') return '';
        try{
          return decodeURIComponent(path);
        } catch {
          return path;
        }
      }

      function getAssetFileName(path){
        const clean = decodeAssetPath(path).split('#')[0];
        const slash = clean.lastIndexOf('/');
        return slash >= 0 ? clean.slice(slash + 1) : clean;
      }

      function getOverrideMappedFile(file){
        if(!file) return file;
        if(BLISSOS_ICON_MAP.fileOverrides[file]) return BLISSOS_ICON_MAP.fileOverrides[file];
        const lower = file.toLowerCase();
        const matched = Object.keys(BLISSOS_ICON_MAP.fileOverrides).find(key => key.toLowerCase() === lower);
        return matched ? BLISSOS_ICON_MAP.fileOverrides[matched] : file;
      }

      function getReverseMappedFile(file){
        if(!file) return file;
        if(BLISSOS_ICON_REVERSE_MAP[file]) return BLISSOS_ICON_REVERSE_MAP[file];
        const lower = file.toLowerCase();
        const matched = Object.keys(BLISSOS_ICON_REVERSE_MAP).find(key => key.toLowerCase() === lower);
        return matched ? BLISSOS_ICON_REVERSE_MAP[matched] : file;
      }

      function getBlissOSAssetPath(src){
        if(!src || typeof src !== 'string') return null;
        const { path, query } = splitAssetQuery(src);
        if(path.startsWith(BLISSOS_ICON_MAP.base)) return path + query;
        const normalized = decodeAssetPath(path);
        const iconSourceMatch =
          normalized.startsWith(BLISSOS_ICON_MAP.sourceBase) ||
          normalized.startsWith('/assets/icons/') ||
          normalized.includes('/assets/icons/');
        if(iconSourceMatch){
          const file = getAssetFileName(normalized);
          const mapped = getOverrideMappedFile(file);
          return `${BLISSOS_ICON_MAP.base}${mapped}${query}`;
        }
        return src;
      }

      function getBlissOSFallbackPath(src){
        if(!src || typeof src !== 'string') return null;
        const { path, query } = splitAssetQuery(src);
        const normalized = decodeAssetPath(path);
        const blissMatch =
          normalized.startsWith(BLISSOS_ICON_MAP.base) ||
          normalized.startsWith('/assets/BlissOS/') ||
          normalized.includes('/assets/BlissOS/');
        if(blissMatch){
          const file = getAssetFileName(normalized);
          const mapped = getReverseMappedFile(file);
          return `${BLISSOS_ICON_MAP.sourceBase}${mapped}${query}`;
        }
        return src;
      }

      function setImageWithFallback(img, primary, fallback){
        if(!img) return;
        if(primary) img.src = primary;
        if(fallback) img.dataset.fallbackSrc = fallback;
        img.dataset.failed = '';
      }

      function applySettingsIcons(winEl){
        const win = winEl || document.getElementById('win_settings');
        if(!win) return;
        const themed = state.settings.theme === 'blissos';
        win.querySelectorAll('img[data-settings-icon]').forEach(img => {
          const name = img.dataset.settingsIcon;
          if(!name) return;
          const base = `./assets/icons/${name}`;
          if(themed){
            const themedIcon = getIconFor(base, 'blissos');
            const fallback = isAquaIconThemeActive('blissos') ? base : getBlissOSFallbackPath(themedIcon);
            setImageWithFallback(img, themedIcon, fallback || base);
          } else {
            const bliss = getBlissOSAssetPath(base);
            setImageWithFallback(img, base, bliss);
          }
        });
      }

      function iconSVG(type, theme){
        const activeTheme = theme || document.body.dataset.theme || 'bliss98';
        if(activeTheme === 'blissos'){
          const common = `viewBox="0 0 18 18" class="pixel" aria-hidden="true"`;
          switch(type){
            case 'folder':
              return `<svg ${common}><rect width="18" height="18" fill="none"/><path d="M2 5h6l2 2h6v8H2z" fill="#f6d37a" stroke="#6f5a2a"/><path d="M2 5h6l2 2H2z" fill="#ffdfa0" stroke="#6f5a2a"/></svg>`;
            case 'music':
              return `<svg ${common}><rect x="2" y="2" width="14" height="14" rx="3" fill="#f2f2ef" stroke="#7f7f79"/><path d="M10 5v6.4a2 2 0 1 1-1-1.7V6h-3V5z" fill="#3a3a3a"/></svg>`;
            case 'art':
              return `<svg ${common}><rect x="2" y="2" width="14" height="14" rx="3" fill="#f2f2ef" stroke="#7f7f79"/><rect x="4" y="4" width="10" height="10" fill="#d6d4cd" stroke="#7f7f79"/><path d="M5 12l2-2 2 2 2-3 3 3" stroke="#5a6a7a" stroke-width="1" fill="none"/></svg>`;
            case 'game':
              return `<svg ${common}><rect x="2" y="4" width="14" height="10" rx="3" fill="#d9d5cc" stroke="#7f7f79"/><rect x="6" y="7" width="1" height="4" fill="#2b2b2b"/><rect x="5" y="8" width="3" height="1" fill="#2b2b2b"/><circle cx="12.5" cy="8" r="1.2" fill="#d05a6c"/><circle cx="13.8" cy="10" r="1.2" fill="#5a8fd0"/></svg>`;
            case 'video':
              return `<svg ${common}><rect x="2" y="4" width="12" height="10" rx="2" fill="#f2f2ef" stroke="#7f7f79"/><path d="M14 7l2-1v6l-2-1z" fill="#4a4a4a"/></svg>`;
            case 'info':
              return `<svg ${common}><rect x="2" y="2" width="14" height="14" rx="3" fill="#f2f2ef" stroke="#7f7f79"/><circle cx="9" cy="6" r="1.4" fill="#4a4a4a"/><rect x="8" y="8" width="2" height="6" fill="#4a4a4a"/></svg>`;
            case 'mail':
              return `<svg ${common}><rect x="2" y="4" width="14" height="10" rx="2" fill="#f2f2ef" stroke="#7f7f79"/><path d="M2 5l7 5 7-5" fill="none" stroke="#6a6a64"/></svg>`;
            case 'user':
              return `<svg ${common}><rect x="2" y="2" width="14" height="14" rx="3" fill="#f2f2ef" stroke="#7f7f79"/><circle cx="9" cy="7" r="2.2" fill="#4a4a4a"/><path d="M4.5 14c1.5-2.4 7.5-2.4 9 0" stroke="#4a4a4a" fill="none"/></svg>`;
            case 'settings':
              return `<svg ${common}><rect x="2" y="2" width="14" height="14" rx="3" fill="#f2f2ef" stroke="#7f7f79"/><circle cx="9" cy="9" r="3" fill="#cfcfc8" stroke="#7f7f79"/><path d="M9 4v2M9 12v2M4 9h2M12 9h2" stroke="#5a5a54"/></svg>`;
            case 'trash':
              return `<svg ${common}><rect x="3" y="5" width="12" height="10" rx="1" fill="#f2f2ef" stroke="#7f7f79"/><rect x="5" y="3" width="8" height="2" fill="#cfcfc8" stroke="#7f7f79"/><path d="M6 7v6M9 7v6M12 7v6" stroke="#6a6a64"/></svg>`;
            default:
              return `<svg ${common}><rect x="2" y="2" width="14" height="14" rx="3" fill="#f2f2ef" stroke="#7f7f79"/><rect x="5" y="5" width="8" height="8" fill="#6a7a8a"/></svg>`;
          }
        }
        const common = `viewBox="0 0 16 16" class="pixel" aria-hidden="true"`;
        switch(type){
          case 'folder':
            return `<svg ${common}><rect width="16" height="16" fill="none"/><path d="M1 4h6l1 2h7v8H1z" fill="#ffcc66" stroke="#000" stroke-width="1"/><path d="M1 4h6l1 2H1z" fill="#ffd88a" stroke="#000" stroke-width="1"/></svg>`;
          case 'music':
            return `<svg ${common}><rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#000"/><path d="M10 3v7.5a2 2 0 1 1-1-1.7V5h-3V3z" fill="#000080"/></svg>`;
          case 'art':
            return `<svg ${common}><rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#000"/><rect x="3" y="3" width="10" height="10" fill="#c0c0c0" stroke="#000"/><path d="M4 11l2-2 2 2 2-3 3 3" stroke="#000080" stroke-width="1" fill="none"/></svg>`;
          case 'game':
            return `<svg ${common}><rect x="2" y="5" width="12" height="7" rx="2" fill="#c0c0c0" stroke="#000"/><rect x="5" y="7" width="1" height="3" fill="#000"/><rect x="4" y="8" width="3" height="1" fill="#000"/><circle cx="11" cy="8" r="1" fill="#ff3366"/><circle cx="12.8" cy="9.5" r="1" fill="#66ccff"/></svg>`;
          case 'video':
            return `<svg ${common}><rect x="1" y="3" width="12" height="10" fill="#fff" stroke="#000"/><path d="M13 6l2-1v6l-2-1z" fill="#000"/></svg>`;
          case 'info':
            return `<svg ${common}><rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#000"/><circle cx="8" cy="5" r="1" fill="#000"/><rect x="7" y="7" width="2" height="6" fill="#000080"/></svg>`;
          case 'mail':
            return `<svg ${common}><rect x="1" y="3" width="14" height="10" fill="#fff" stroke="#000"/><path d="M1 4l7 5 7-5" fill="none" stroke="#000080" stroke-width="1"/></svg>`;
          case 'user':
            return `<svg ${common}><rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#000"/><circle cx="8" cy="6" r="2" fill="#000080"/><path d="M4 13c1-2 7-2 8 0" stroke="#000080" fill="none"/></svg>`;
          case 'settings':
            return `<svg ${common}><rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#000"/><circle cx="8" cy="8" r="3" fill="#c0c0c0" stroke="#000"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M12.5 3.5l-1.4 1.4M4.9 11.1l-1.4 1.4" stroke="#000080"/></svg>`;
          case 'trash':
            return `<svg ${common}><rect x="1" y="3" width="14" height="12" fill="#fff" stroke="#000"/><rect x="4" y="1" width="8" height="2" fill="#c0c0c0" stroke="#000"/><path d="M5 5v8M8 5v8M11 5v8" stroke="#000080"/></svg>`;
          default:
            return `<svg ${common}><rect x="1" y="1" width="14" height="14" fill="#fff" stroke="#000"/><rect x="4" y="4" width="8" height="8" fill="#000080"/></svg>`;
        }
      }

/* ===== Module: 04-app-content.js ===== */
      const APPS = [
        { id:'trash', titleKey:'app.trash', icon:'trash', iconFile:getTrashIconFile, showInStart:false },
        { id:'seeker', titleKey:'app.seeker', icon:'folder', iconFile:'./assets/icons/seeker.png' },
        { id:'poetry', titleKey:'app.poetry', icon:'file', iconFile:'./assets/icons/poetry.png' },
        { id:'clothes', titleKey:'app.clothes', icon:'folder', iconFile:'./assets/icons/Clothes.png' },
        { id:'music', titleKey:'app.music', icon:'music', iconFile:'./assets/icons/Music.png' },
        { id:'mediaplayer', titleKey:'app.mediaplayer', icon:'music', iconFile:'./assets/icons/BLISS%20mediaplayer.png' },
        { id:'art', titleKey:'app.art', icon:'art', iconFile:'./assets/icons/Art.png' },
        { id:'games', titleKey:'app.games', icon:'game', iconFile:'./assets/icons/Games.png' },
        { id:'dope-skate', titleKey:'games.dopeSkate', icon:'game', iconFile:'./assets/icons/dope-skate.png', showOnDesktop:false, showInStart:false },
        { id:'videos', titleKey:'app.videos', icon:'video', iconFile:'./assets/icons/Videos.png' },
        { id:'about', titleKey:'app.about', icon:'info', iconFile:'./assets/icons/About.png' },
        { id:'contact', titleKey:'app.contact', icon:'mail', iconFile:'./assets/icons/Contact.png' },
        { id:'diev', titleKey:'app.diev', icon:'user', iconFile:'./assets/icons/DIEV.png' },
        { id:'settings', titleKey:'app.settings', icon:'settings', iconFile:'./assets/icons/Settings.png' },
      ];

      const MUSIC_LINKS = [
        {
          id: 'spotify',
          label: 'Spotify',
          url: 'https://open.spotify.com/artist/6bjnHKF2yjUlKyYD15cNGq',
          icon: './assets/icons/spotify.png'
        },
        {
          id: 'youtubemusic',
          label: 'YouTube Music',
          url: 'https://music.youtube.com/channel/UCSjAU7hceaYUQPZml7HUFgA',
          icon: './assets/icons/youtubemusic.png'
        },
        {
          id: 'applemusic',
          label: 'Apple Music',
          url: 'https://music.apple.com/us/artist/diev/1586153318',
          icon: './assets/icons/applemusic.png'
        },
        {
          id: 'amazonmusic',
          label: 'Amazon Music',
          url: 'https://music.amazon.com.br/artists/B00F5I7CC6/diev',
          icon: './assets/icons/amazonmusic.png'
        },
        {
          id: 'soundcloud',
          label: 'SoundCloud',
          url: 'https://soundcloud.com/die_v/tracks',
          icon: './assets/icons/soundcloud.png'
        },
        {
          id: 'deezer',
          label: 'Deezer',
          url: 'https://www.deezer.com/en/artist/5170963',
          icon: './assets/icons/deezer.png'
        }
      ];

      // Update the fallback list with real Instagram thumbnails when needed.
      const CLOTHES_FALLBACK = [
        { img: './assets/icons/Clothes.png', url: 'https://www.instagram.com/blissworldweb/' },
        { img: './assets/icons/Clothes.png', url: 'https://www.instagram.com/blissworldweb/' },
        { img: './assets/icons/Clothes.png', url: 'https://www.instagram.com/blissworldweb/' },
        { img: './assets/icons/Clothes.png', url: 'https://www.instagram.com/blissworldweb/' },
        { img: './assets/icons/Clothes.png', url: 'https://www.instagram.com/blissworldweb/' },
        { img: './assets/icons/Clothes.png', url: 'https://www.instagram.com/blissworldweb/' }
      ];

      const VIDEO_CHANNEL_URL = 'https://www.youtube.com/@DIEVBLISS';

      // Add new poems here. Always provide body_en and body_pt.
      const POEMS = [
        {
          id: 'evolve',
          title: 'Evolve',
          body_en: `To evolve is to change
More than it is to progress
The human race is in its teenager phase
We break everything
And apologize for nothing

And the ones closer to the truth
Are the ones who say, “I know nothing”

But it’s different when it comes from the temple
And when it comes from the streets
Because insanity is a common trait
Associated with unearned wisdom`,
          body_pt: `Evoluir é mudar
Mais do que é progredir
A raça humana vive sua fase adolescente
Quebramos tudo
E não pedimos desculpas por nada

E os que estão mais perto da verdade
São os que dizem: “Eu nada sei”

Mas é diferente quando vem do templo
E quando vem das ruas
Porque a insanidade é um traço comum
Associado à sabedoria não conquistada`
        },
        {
          id: 'tedio',
          title: 'Tedio',
          body_en: `Boredom

The walls bore me
The floor bores me
The blue sky with the bright sun bores me
Sometimes I think I understand
But the eternal boredom ends up taking me
I think about having a beer
Maybe that will cheer me up
The idea excites more than the act
After the first sip
I feel only boredom
They told me that growing old was good
Knowledge
Maturity
All of that brought me boredom
Now I sit doing nothing inside buildings
Waiting for the invitation that changes
The novelty that arrives
While I carry a cigarette
Around the boredom
In the idea I am happy
In the idea I am free and excited
In the act I find myself dull
In this eternal hell of boredom`,
          body_pt: `Tedio

As paredes me entediam
O chão me entedia
O céu azul com o sol brilhando me entedia
As vezes acho que entendo
Mas o tédio eterno acaba me tomando
Penso em tomar uma cerveja
Talvez isso me anime
A ideia anima mais que o ato
Depois do primeiro gole
Sinto apenas o tédio
Me disseram que envelhecer era bom
Conhecimento
Amadurecimento
Tudo isso me trouxe tédio
Agora fico sem fazer nada dentro de prédios
Esperando o convite que mude
A novidade que traga
Enquanto trago um cigarro
Em volta do tédio
Na ideia sou feliz
Na ideia sou livre e animado
No ato me encontro chato
Nesse inferno eterno tédio`
        },
        {
          id: 'la-vai-ela',
          title: 'La vai ela',
          body_en: `There she goes

There she goes to the phone
There I go to the music and a distant stare
There we go, arguing
There we go, hating and loving each other
She drinks from my sip
We share the same visions
We argue hard about the differences
We fight
We love
We look at ourselves
Who are we
Two lost children
Two angry children
In the end we love each other
As always, we love each other`,
          body_pt: `La vai ela

La vai ela pro celular
La vai eu pra musica e olhar distante
La vamos nos discutindo
La vamos nos se odiando e se amando
Ela bebe do meu gole
Dividimos mesmas visões
Discutimos forte as diferenças
Brigamos
Nos amamos
No olhamos
Quem somo nos
Duas crianças perdidas
Duas crianças bravas
No fim nos amamos
Como sempre nos amamos`
        },
        {
          id: 'falta-de-palavras',
          title: 'A falta de palavras',
          body_en: `The lack of words
Is the poet’s suicide
And she wanted me to try harder
To be with her
Cooking dinner
And I wanted to be far away`,
          body_pt: `A falta de palavras
É o suicido do poeta
E ela queria que eu me esforçasse mais
Pra estar com ela
Cozinhando a janta
E eu querendo estar longe`
        },
        {
          id: 'no-fim-foi-isso',
          title: 'No fim foi isso',
          body_en: `In the end, that was it
In the end, that was it
A balancing of egos
One had too much
Another had too little
But it is all right
The scale goes up and down
And in the end, maybe
It levels`,
          body_pt: `No fim foi isso
No fim foi isso
Um balanceamento de egos
Um tinha demais
Outro tinha de menos
Mas esta tudo bem
A balança sobe e desce
E no fim talvez
Nivele`
        },
        {
          id: 'sua-interpretacao',
          title: 'Sua interpretação',
          body_en: `Your interpretation

Why do I feel so much empathy
For the mad?

Me, who considers myself so sane

Did you read this in a sarcastic tone
Or not?`,
          body_pt: `Sua interpretação

Porque tenho tanta empatia
Pelos loucos?

Logo eu que me considero tão são

Você leu isso em tom de sarcasmo
Ou não?`
        },
        {
          id: 'um-sanduiche',
          title: 'Um sanduíche',
          body_en: `A sandwich

When I see lives at the edge of the limit
I realize my life
doesn’t have enough strength
to drive me insane
While I sit at the table
to make a sandwich
My father speaks arrogantly
that no one does anything in this house
except him
So I get up
I pour myself a glass of coke
I observe things
And as always
they remain the same
They seem to never change
But I
I did something
A sandwich`,
          body_pt: `Um sanduíche

Quando vejo vidas a beira do limite
Percebo que a minha vida
não tem forças o suficiente
Para me enlouquecer
Enquanto me sento a mesa
para fazer um sanduíche
Meu pai fala com arrogância
que ninguém faz nada nessa casa
a não ser ele
Ai então me levanto
Me sirvo um copo de coca
Observo as coisas
E como sempre
se mantém iguais
Parecem nunca mudar
Mas eu
Eu fiz algo
Um sanduíche`
        },
        {
          id: 'conversas',
          title: 'Conversas',
          body_en: `Conversations

Conversations are poems
That we throw against the wind
My life looks like yours
I did that to have this
I went through pains like yours
I smiled in some moments
I cried in others
I wish I had made more of these poems`,
          body_pt: `Conversas

Conversas são poesias
Que jogamos contra o vento
Minha vida parece com a sua
Eu fiz aquilo para ter isso
Eu passei por dores como a suas
Eu sorri em momentos
Eu chorei em outros
Queria ter feito mais dessas poesias`
        },
        {
          id: 'a-surpresa-em-sentir-se-livre',
          title: 'A surpresa em sentir-se livre',
          body_en: `The surprise of feeling free

That feeling that catches me by surprise
In a trivial activity
In the midst of total boredom
That feeling of freedom
That arrives between a deep sigh
Arrives unexpectedly
Like the visit
Of an old friend`,
          body_pt: `A surpresa em sentir-se livre

Essa sensação que me pega de surpresa
Em uma atividade banal
Em meio ao tédio total
Essa sensação de liberdade
Que chega entre o suspiro profundo
Chega de surpresa
Como a visita
De um velho amigo`
        },
        {
          id: 'morte-e-compromisso',
          title: 'Morte e compromisso',
          body_en: `Death and commitment

Sometimes I feel taken over
By an idea
An idea that I can die
At any moment
Maybe now...
And that creates a fear
At the same time it creates an excitement
Because it is all so mysterious
How will I die?
What is death like?
And what comes after?
Then time passes
And all of that goes away
And I go back to worrying about life
And about my living problems
And I forget
I forget that death
Death doesn’t care about my commitments`,
          body_pt: `Morte e compromisso

As vezes me sinto tomado
Por uma ideia
Uma ideia de que posso morrer
A qualquer momento
Talvez agora...
E isso gera um medo
ao mesmo tempo que gera uma excitação
Porque é tudo tão misterioso
Como será que vou morrer?
Como será que é a morte?
E oque vem depois?
Ai então o tempo passa
E tudo isso vai embora
E volto a me preocupar com a vida
E com meus problemas de vivo
E me esqueço
Me esqueço de que a morte
A morte não liga pro meus compromissos`
        },
        {
          id: 'quieto',
          title: 'Quieto',
          body_en: `Quiet

All my life I have always found myself
Quiet
In the middle of people always
Quiet
In the middle of family
Quiet
In the middle of friends
Quiet
In the middle of women
Quiet
All my life I have always been very quiet
What should I say?
What difference would it make?
I don’t know
Now I will be silent

2019`,
          body_pt: `Quieto

Minha vida inteira eu sempre me encontrei
Quieto
No meio das pessoas sempre
Quieto
No meio da família
Quieto
No meio dos amigos
Quieto
No meio das mulheres
Quieto
Minha vida inteira eu sempre fui muito quieto
Oque eu deveria dizer?
Que diferença faria?
Não sei
Agora vou me calar

2019`
        },
        {
          id: 'buffalo-branco-extinto',
          title: 'Buffalo branco extinto',
          body_en: `Extinct white buffalo

In the streets people look at me with strangeness
People who spend their whole lives seeing their own reflection
Wherever they go they always see the same
And when something like this appears, they find it strange
A figure so different
So rare
Strange
And interesting
Among the buffalo
I am the extinct white buffalo`,
          body_pt: `Buffalo branco extinto

Nas ruas pessoas me olham com estranheza
Pessoas que passam a vida toda vendo seu próprio reflexo
Aonde quer que vão veem sempre o mesmo
E quando algo assim aparece, estranham
Uma figura tão diferente
Tão rara
Estranha
E Interessante
Em meio aos buffalos
Eu sou o buffalo branco extinto`
        }
      ];

      const CONTENT = {
        seeker: () => `
          <div class="seeker-shell" data-seeker-shell="1">
            <div class="seeker-toolbar" data-seeker-toolbar="1">
              <div class="seeker-nav" role="group" aria-label="${escapeHTML(t('seeker.nav'))}">
                <button class="btn bevel seeker-btn" type="button" data-seeker-nav="back" aria-label="${escapeHTML(t('seeker.back'))}">&#9664;</button>
                <button class="btn bevel seeker-btn" type="button" data-seeker-nav="forward" aria-label="${escapeHTML(t('seeker.forward'))}">&#9654;</button>
              </div>
              <div class="seeker-view-modes" role="group" aria-label="${escapeHTML(t('seeker.view'))}">
                <button class="btn bevel seeker-btn" type="button" data-seeker-view="icons" aria-label="${escapeHTML(t('seeker.view.icons'))}">&#9638;</button>
                <button class="btn bevel seeker-btn" type="button" data-seeker-view="list" aria-label="${escapeHTML(t('seeker.view.list'))}">&#9776;</button>
              </div>
              <div class="seeker-location" data-seeker-location="1">
                <span class="seeker-location-icon" data-seeker-location-icon="1">${getThemedIconHtml({ id:'seeker-location', icon:'folder', iconFile:'./assets/icons/computer.png' }, t('seeker.section.desktop'), 16)}</span>
                <strong class="seeker-location-name" data-seeker-location-name="1">${t('seeker.section.desktop')}</strong>
              </div>
              <label class="seeker-search" aria-label="${escapeHTML(t('seeker.search'))}">
                <span class="seeker-search-icon" aria-hidden="true"></span>
                <input class="bevel-in" type="search" data-seeker-search="1" placeholder="${escapeHTML(t('seeker.search.placeholder'))}" />
              </label>
            </div>
            <div class="seeker-body">
              <aside class="seeker-sidebar">
                <section class="seeker-group">
                  <h3 class="seeker-group-title" data-i18n="seeker.group.devices">${t('seeker.group.devices')}</h3>
	                  <button class="seeker-side-item" type="button" data-seeker-open="device-macintosh" data-seeker-kind="device">
	                    <span class="seeker-side-icon">${getThemedIconHtml({ id:'seeker-device-mac', icon:'app', iconFile:'./assets/icons/computer.png' }, t('seeker.device.macintosh'), 16)}</span>
	                    <span data-seeker-device-mac-label="1">${escapeHTML(getSeekerComputerLabel())}</span>
	                  </button>
	                </section>
                <section class="seeker-group">
                  <h3 class="seeker-group-title" data-i18n="seeker.group.places">${t('seeker.group.places')}</h3>
	                  <button class="seeker-side-item" type="button" data-seeker-open="desktop">
	                    <span class="seeker-side-icon">${getThemedIconHtml({ id:'seeker-place-desktop', icon:'app', iconFile:'./assets/icons/desktop.png' }, t('seeker.section.desktop'), 16)}</span>
	                    <span data-i18n="seeker.section.desktop">${t('seeker.section.desktop')}</span>
	                  </button>
	                  <button class="seeker-side-item" type="button" data-seeker-open="applications">
	                    <span class="seeker-side-icon">${getThemedIconHtml({ id:'seeker-place-apps', icon:'app', iconFile:'./assets/icons/applications.png' }, t('seeker.section.applications'), 16)}</span>
	                    <span data-i18n="seeker.section.applications">${t('seeker.section.applications')}</span>
	                  </button>
	                  <button class="seeker-side-item" type="button" data-seeker-open="documents">
	                    <span class="seeker-side-icon">${getThemedIconHtml({ id:'seeker-place-docs', icon:'file', iconFile:'./assets/icons/documents.png' }, t('seeker.section.documents'), 16)}</span>
	                    <span data-i18n="seeker.section.documents">${t('seeker.section.documents')}</span>
	                  </button>
                  <button class="seeker-side-item" type="button" data-seeker-open="trash">
                    <span class="seeker-side-icon">${getThemedIconHtml({ id:'seeker-place-trash', icon:'trash', iconFile:getTrashIconFile }, t('seeker.section.trash'), 16)}</span>
                    <span data-i18n="seeker.section.trash">${t('seeker.section.trash')}</span>
                  </button>
                </section>
	                <section class="seeker-group">
	                  <h3 class="seeker-group-title" data-i18n="seeker.group.searchFor">${t('seeker.group.searchFor')}</h3>
	                  <button class="seeker-side-item" type="button" data-seeker-open="recent">
	                    <span class="seeker-side-icon">${getThemedIconHtml({ id:'seeker-place-recent', icon:'settings', iconFile:'./assets/icons/recents.png' }, t('seeker.section.recent'), 16)}</span>
	                    <span data-i18n="seeker.section.recent">${t('seeker.section.recent')}</span>
	                  </button>
	                </section>
              </aside>
              <section class="seeker-main">
                <div class="seeker-main-header">
                  <span data-seeker-main-title="1">${t('seeker.section.desktop')}</span>
                  <button class="seeker-trash-empty hidden" type="button" data-seeker-trash-empty="1">empty</button>
                </div>
                <div class="seeker-items seeker-items-icons" data-seeker-items="1"></div>
              </section>
            </div>
            <div class="seeker-footer">
              <span data-seeker-status="1">0 ${t('seeker.itemLabel')}</span>
            </div>
          </div>
        `,
        about: () => `
          <div class="about-panel">
            <div class="about-copy">
              <p>${t('about.p1')}</p>
              <p>${t('about.p2')}</p>
              <p>${t('about.p3')}</p>
              <p>${t('about.p4')}</p>
              <p>${t('about.p5')}</p>
              <p>${t('about.p6')}</p>
              <p>And we tell the truth... even when we lie!</p>
            </div>
            <div class="about-gif-wrap">
              <img class="pixel about-gif" src="./assets/gifs/3Drotate.gif" alt="BLISS 3D rotate" loading="lazy" />
            </div>
          </div>
        `,
        clothes: () => `
          <p class="tiny" data-i18n="clothes.subtitle">${t('clothes.subtitle')}</p>
          <div class="clothes-grid" id="clothesGrid"></div>
          <div class="tiny clothes-status" id="clothesStatus" data-i18n="clothes.loading">${t('clothes.loading')}</div>
        `,
        music: () => `
  <p style="margin:0 0 10px 0;">${t('music.subtitle')}</p>

  <div class="music-grid">
    ${MUSIC_LINKS.map(link => `
      <button class="music-item" type="button" data-music-id="${link.id}" data-music-link="${link.url}">
        <div class="music-icon pixel">
          <img class="pixel" src="${link.icon}" width="48" height="48" alt="${link.label}" style="display:block;" />
        </div>
        <span class="music-label" style="font-weight:700;">${link.label}</span>
      </button>
    `).join('')}
  </div>

  <div class="hr98"></div>
  <div class="tiny">${t('music.tip')}</div>
`,

        mediaplayer: () => `
          <div class="mp-app-shell">
            <div class="mp-app-titlebar" data-drag="1">
              <div class="title-controls">
                <div class="wctl bevel" title="${t('win.close')}" data-action="close">×</div>
                <div class="wctl bevel" title="${t('win.minimize')}" data-action="min">_</div>
                <div class="wctl bevel" title="${t('win.maximize')}" data-action="max">&#x25A1;</div>
              </div>
              <div class="title-left">
                <span class="win-title-icon" data-win-title-icon="1" style="width:16px;height:16px;display:inline-flex;">${getThemedIconHtml((APPS.find(app => app.id === 'mediaplayer') || { id:'mediaplayer', icon:'music', iconFile:'./assets/icons/BLISS%20mediaplayer.png' }), t('app.mediaplayer'), 16)}</span>
                <strong data-i18n="app.mediaplayer">${t('app.mediaplayer')}</strong>
              </div>
            </div>

            <div class="mp-app-main">
              <div class="mp-mini">
                <audio id="mpAudio" preload="metadata"></audio>

                <div class="mp-top-chrome">
                  <div class="mp-toolbar-row">
                    <div class="mp-transport-pack">
                      <div class="mp-pill-controls">
                        <button class="mp-round-btn" type="button" data-mp-action="prev" title="${t('player.prev')}">⏮</button>
                        <button class="mp-round-btn" type="button" data-mp-action="toggle" title="${t('player.play')}">▶</button>
                        <button class="mp-round-btn" type="button" data-mp-action="next" title="${t('player.next')}">⏭</button>
                      </div>
                      <div class="mp-vol-line">
                        <span class="mp-vol-icon" data-i18n="player.vol">${t('player.vol')}</span>
                        <input id="mpVol" class="retro-slider mp-vol-slider" type="range" min="0" max="1" step="0.01" value="0.1" />
                      </div>
                    </div>

                    <div class="mp-display-zone">
                      <div class="mp-display">
                        <div class="mp-display-top">
                          <span class="mp-display-title" id="mpNow">—</span>
                        </div>
                        <div class="mp-display-bottom">
                          <span class="mp-display-elapsed"><span data-mp-current>0:00</span> / <span data-mp-total>--:--</span></span>
                        </div>
                        <div class="mp-seek-row">
                          <span class="mp-seek-diamond">◆</span>
                          <input class="retro-slider" id="mpSeek" type="range" min="0" max="1000" step="1" value="0" />
                          <span class="mp-seek-dot">•</span>
                        </div>
                      </div>
                    </div>

                    <div class="mp-right-tools">
                      <div class="mp-search-top">
                        <label class="mp-search-wrap" for="mpSearch">
                          <span class="mp-search-icon" aria-hidden="true"></span>
                          <input id="mpSearch" type="search" placeholder="Search" />
                        </label>
                        <button class="mp-browse-btn" type="button" aria-label="Browse">
                          <span class="mp-eye-dot">◉</span>
                        </button>
                      </div>
                      <div class="mp-search-labels">
                        <span>Search</span>
                        <span>Browse</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mp-library-shell">
                  <div class="mp-source-panel">
                    <div class="mp-source-head">Source</div>
                    <div class="mp-source-list">
                      <button class="mp-source-item active" type="button">
                        <span class="mp-source-glyph icon-library"></span>
                        <span>Library</span>
                      </button>
                      <button class="mp-source-item" type="button">
                        <span class="mp-source-glyph icon-podcast"></span>
                        <span>Podcasts</span>
                      </button>
                      <button class="mp-source-item" type="button">
                        <span class="mp-source-glyph icon-party"></span>
                        <span>Party Shuffle</span>
                      </button>
                      <button class="mp-source-item" type="button">
                        <span class="mp-source-glyph icon-radio"></span>
                        <span>Radio</span>
                      </button>
                      <button class="mp-source-item" type="button">
                        <span class="mp-source-glyph icon-store"></span>
                        <span>Music Store</span>
                      </button>
                      <button class="mp-source-item" type="button">
                        <span class="mp-source-glyph icon-arrow"></span>
                        <span>Recently Played</span>
                      </button>
                      <button class="mp-source-item" type="button">
                        <span class="mp-source-glyph icon-arrow"></span>
                        <span>Top 25 Most Played</span>
                      </button>
                    </div>
                  </div>

                  <div class="mp-track-panel">
                    <div class="mp-track-head">
                      <span>Name</span>
                      <span></span>
                      <span>Time</span>
                      <span>Artist</span>
                      <span>Album</span>
                    </div>
                    <div class="mp-list" id="mpList"></div>
                  </div>
                </div>

                <div class="mp-footer-controls">
                  <div class="mp-toolbar-left">
                    <button class="mp-tool-btn" type="button" data-mp-action="add" title="${t('player.addSongs')}">+</button>
                    <button class="mp-tool-btn hidden" type="button" data-mp-action="reimport" title="${t('player.reimport')}">↻</button>
                    <button class="mp-tool-btn" type="button" data-mp-action="shuffle" data-mp-glyph="1" title="${t('player.shuffle')}">⤮</button>
                    <button class="mp-tool-btn" type="button" data-mp-action="repeat" data-mp-glyph="1" title="${t('player.repeat')}">↺</button>
                  </div>
                  <div class="mp-library-stats" id="mpStats">BLISS Library</div>
                  <div class="mp-status" id="mpMsg"></div>
                  <div class="mp-toolbar-right">
                    <button class="mp-tool-btn mp-tool-btn-mini" type="button" aria-label="View">▥</button>
                    <button class="mp-tool-btn mp-tool-btn-mini" type="button" aria-label="Star">*</button>
                    <button class="mp-tool-btn mp-tool-btn-mini" type="button" aria-label="More">▴</button>
                  </div>
                  <div class="mp-corner-grip">◢</div>
                </div>

                <div class="tiny mp-drop hidden" id="mpDropHint" data-i18n="player.drop">Drop audio files here</div>
                <input id="mpFileInput" class="hidden" type="file" multiple accept=".flac,.mp3,.wav,.ogg,audio/*" />
              </div>
            </div>
          </div>
        `,

        art: () => `
          <section class="artists-scene" aria-label="${t('app.art')}">
            <div class="artists-dim" aria-hidden="true"></div>
            <img class="artists-center-gif pixel" src="./assets/gifs/bliss.gif" alt="" />
            <div class="artists-content">
              <div class="artists-list">
                <a class="artists-item" href="https://www.instagram.com/die.verson/" target="_blank" rel="noopener noreferrer">
                  <span class="artists-name">DIEV</span>
                  <span class="artists-role">Music, Designer, Video</span>
                </a>
                <a class="artists-item" href="https://www.instagram.com/yasminsaccol/" target="_blank" rel="noopener noreferrer">
                  <span class="artists-name">Yasmin</span>
                  <span class="artists-role">Fashion, Video</span>
                </a>
                <a class="artists-item" href="https://www.instagram.com/rafacamponogara/" target="_blank" rel="noopener noreferrer">
                  <span class="artists-name">Rafa</span>
                  <span class="artists-role">Tattoo</span>
                </a>
                <a class="artists-item" href="https://www.instagram.com/raffzzz_mafu/" target="_blank" rel="noopener noreferrer">
                  <span class="artists-name">Raffz</span>
                  <span class="artists-role">Fashion</span>
                </a>
              </div>
            </div>
          </section>
        `,
        games: () => {
          if(state.games.view === 'dope-skate'){
            return `
              <div class="skate-shell">
                <div class="skate-topbar">
                  <button class="skate-btn ghost" type="button" data-games-action="back" data-i18n="games.back">Back</button>
                  <h2 class="skate-title" data-i18n="games.dopeSkate">Dope Skate</h2>
                  <div class="skate-topbar-actions">
                    <button class="skate-btn subtle" type="button" data-skate-action="menu" data-i18n="skate.action.menu">Menu</button>
                  </div>
                </div>
                <div class="skate-body">
                  <div class="skate-screen" id="skateScreen">
                    <div class="skate-canvas-wrap">
                      <canvas id="skateCanvas" class="pixel" width="640" height="360"></canvas>
                    </div>
                    <div class="skate-hud" id="skateHud">
                      <div class="skate-hud-zone skate-hud-tl">
                        <div class="skate-hud-card skate-hud-card-stats">
                          <div class="skate-hud-line">
                            <div><span data-i18n="skate.hud.score">Score</span>: <strong data-skate-score>0</strong></div>
                            <div><span data-i18n="skate.hud.combo">Combo</span>: <strong data-skate-combo>1x</strong></div>
                            <div><span data-i18n="skate.hud.best">Best</span>: <strong data-skate-best>0</strong></div>
                            <div><span data-i18n="skate.hud.cds">CDs</span>: <strong data-skate-cds>0</strong></div>
                          </div>
                        </div>
                      </div>
                      <div class="skate-hud-zone skate-hud-tc">
                        <div class="skate-hud-card skate-hud-card-combo">
                          <div class="skate-combo-list" data-skate-combo-list></div>
                        </div>
                      </div>
                      <div class="skate-hud-zone skate-hud-tr">
                        <div class="skate-hud-card skate-hud-card-bliss">
                          <div class="skate-bliss-strip" data-skate-bliss></div>
                        </div>
                        <div class="skate-balance hidden" id="skateBalance">
                          <span class="tiny" data-i18n="skate.grind.balance">Balance</span>
                          <div class="skate-balance-bar"><span class="skate-balance-indicator" data-skate-balance-indicator></span></div>
                        </div>
                      </div>
                      <div class="skate-hud-zone skate-hud-bl">
                        <div class="skate-mission-box skate-mission-box-primary" data-skate-mission-box>
                          <div class="skate-mission-head-row">
                            <span class="tiny skate-mission-head">Mission</span>
                            <span class="tiny skate-mission-tier" data-skate-mission-tier>EASY</span>
                          </div>
                          <div class="skate-mission-title-row">
                            <strong data-skate-mission-title>Hit 3 grinds</strong>
                            <span data-skate-mission-count>0/3</span>
                          </div>
                          <div class="tiny skate-mission-reward" data-skate-mission-reward>Reward +2 CD | +260 pts</div>
                          <div class="tiny skate-mission-streak" data-skate-mission-streak>Streak x0</div>
                          <div class="skate-mission-progress"><span data-skate-mission-meter></span></div>
                        </div>
                      </div>
                      <div class="skate-hud-zone skate-hud-bc">
                        <div class="skate-hud-card skate-hud-card-decay">
                          <div class="skate-combo-decay">
                            <span class="tiny">Combo decay</span>
                            <div class="skate-combo-meter"><span data-skate-combo-meter></span></div>
                          </div>
                        </div>
                      </div>
                      <div class="skate-hud-zone skate-hud-br">
                        <div class="skate-hud-card skate-hud-card-landing">
                          <div class="skate-landing-indicator" data-skate-landing-indicator>Landing: --</div>
                        </div>
                      </div>
                    </div>
                    <div class="skate-overlay" id="skateMenuOverlay">
                      <div class="skate-menu">
                        <div class="skate-menu-header">
                          <div class="skate-menu-title" data-i18n="games.dopeSkate">Dope Skate</div>
                          <div class="skate-menu-actions">
                            <button class="skate-btn ghost" type="button" data-skate-action="resume" data-i18n="skate.action.resume">Resume</button>
                          </div>
                        </div>
                        <div class="skate-tabs">
                          <button class="skate-tab" type="button" data-skate-tab="play" data-i18n="skate.menu.play">Play</button>
                          <button class="skate-tab" type="button" data-skate-tab="settings" data-i18n="skate.menu.settings">Settings</button>
                          <button class="skate-tab" type="button" data-skate-tab="shop" data-i18n="skate.menu.shop">Shop</button>
                          <button class="skate-tab" type="button" data-skate-tab="howto" data-i18n="skate.menu.howto">How to play</button>
                          <button class="skate-tab" type="button" data-skate-tab="leaderboard" data-i18n="skate.menu.leaderboard">Leaderboard</button>
                        </div>
                        <div class="skate-menu-panels">
                          <div class="skate-panel active" data-skate-panel="play">
                            <p class="skate-panel-text" data-i18n="skate.menu.playDesc">Endless run through the city. Jump obstacles, keep the combo alive.</p>
                            <div class="skate-panel-actions">
                              <button class="skate-btn primary" type="button" data-skate-action="start" data-i18n="skate.action.start">Start run</button>
                              <button class="skate-btn ghost" type="button" data-skate-action="resume" data-i18n="skate.action.resume">Resume</button>
                            </div>
                          </div>
                          <div class="skate-panel" data-skate-panel="settings">
                            <div class="skate-panel-title" data-i18n="skate.menu.settings">Settings</div>
                            <div class="skate-shop-grid">
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.settings.difficulty">Difficulty</strong>
                                <select class="skate-select" data-skate-setting="difficulty">
                                  <option value="easy" data-i18n="skate.settings.difficultyEasy">Easy</option>
                                  <option value="medium" data-i18n="skate.settings.difficultyMedium">Medium</option>
                                  <option value="hard" data-i18n="skate.settings.difficultyHard">Hard</option>
                                </select>
                              </div>
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.settings.sfx">Sound effects</strong>
                                <button class="skate-btn ghost" type="button" data-skate-setting="sfx" data-i18n="skate.settings.sfxOn">On</button>
                              </div>
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.settings.hitboxes">Hitboxes</strong>
                                <button class="skate-btn ghost" type="button" data-skate-setting="hitboxes" data-i18n="skate.settings.hitboxesOff">Off</button>
                              </div>
                            </div>
                            <div class="skate-panel-actions">
                              <button class="skate-btn ghost" type="button" data-skate-action="menu" data-i18n="skate.action.back">Back to menu</button>
                            </div>
                          </div>
                          <div class="skate-panel" data-skate-panel="shop">
                            <div class="skate-panel-title" data-i18n="skate.menu.shop">Shop</div>
                            <div class="skate-tabs skate-shop-tabs">
                              <button class="skate-tab" type="button" data-skate-shop-tab="skater" data-i18n="skate.shop.skater">Skater</button>
                              <button class="skate-tab" type="button" data-skate-shop-tab="hat" data-i18n="skate.shop.hat">Hat</button>
                              <button class="skate-tab" type="button" data-skate-shop-tab="board" data-i18n="skate.shop.board">Skate</button>
                              <button class="skate-tab" type="button" data-skate-shop-tab="wheels" data-i18n="skate.shop.wheels">Wheels</button>
                              <button class="skate-tab" type="button" data-skate-shop-tab="ground" data-i18n="skate.shop.ground">Ground</button>
                              <button class="skate-tab" type="button" data-skate-shop-tab="background" data-i18n="skate.shop.background">Background</button>
                              <button class="skate-tab" type="button" data-skate-shop-tab="sky" data-i18n="skate.shop.sky">Sky</button>
                            </div>
                            <div class="skate-shop-header">
                              <div class="tiny" data-i18n="skate.shop.wallet">Wallet</div>
                              <strong data-skate-wallet>0</strong>
                            </div>
                            <div class="skate-shop-layout">
                              <div class="skate-shop-shelves" data-skate-shop-list></div>
                              <div class="skate-shop-preview">
                                <div class="skate-preview-stage" data-skate-preview-stage></div>
                                <div class="tiny skate-preview-status" data-skate-preview-status></div>
                                <div class="tiny" data-i18n="skate.shop.equipped">Equipped</div>
                                <div class="tiny" data-skate-equipped-list></div>
                              </div>
                            </div>
                            <div class="skate-panel-actions">
                              <button class="skate-btn ghost hidden" type="button" data-skate-action="revert-preview" data-skate-preview-reset data-i18n="skate.shop.useEquipped">Use equipped</button>
                              <button class="skate-btn ghost" type="button" data-skate-action="menu" data-i18n="skate.action.back">Back to menu</button>
                            </div>
                          </div>
                          <div class="skate-panel" data-skate-panel="howto">
                            <div class="skate-panel-title" data-i18n="skate.menu.howto">How to play</div>
                            <p class="skate-panel-text" data-i18n="skate.howto.body">Jump, throw tricks in the air, and link combos before you land.</p>
                            <div class="skate-shop-grid">
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.howto.controls">Controls</strong>
                                <span class="tiny" data-i18n="skate.howto.controlsDesc">Jump: Space/Up/X. Tricks: Z/X/C or Square/Triangle/Circle.</span>
                              </div>
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.howto.trick1">Trick 1</strong>
                                <span class="tiny" data-i18n="skate.howto.trick1Desc">Kickflip in the air. Hold Left/Right for Heelflip.</span>
                              </div>
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.howto.trick2">Trick 2</strong>
                                <span class="tiny" data-i18n="skate.howto.trick2Desc">Shuv-it in the air. Hold Left/Right for Varial Kickflip.</span>
                              </div>
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.howto.trick3">Trick 3</strong>
                                <span class="tiny" data-i18n="skate.howto.trick3Desc">Hardflip in the air or on a grind.</span>
                              </div>
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.howto.combo">Combos</strong>
                                <span class="tiny" data-i18n="skate.howto.comboDesc">Tricks only count in air or grind. Chain tricks before landing to raise the multiplier.</span>
                              </div>
                              <div class="skate-shop-item">
                                <strong data-i18n="skate.howto.grind">Grinds</strong>
                                <span class="tiny" data-i18n="skate.howto.grindDesc">Jump onto a rail, balance with Left/Right, and press Jump to exit.</span>
                              </div>
                            </div>
                            <div class="skate-panel-actions">
                              <button class="skate-btn ghost" type="button" data-skate-action="menu" data-i18n="skate.action.back">Back to menu</button>
                            </div>
                          </div>
                          <div class="skate-panel" data-skate-panel="leaderboard">
                            <div class="skate-panel-title" data-i18n="skate.menu.leaderboard">Leaderboard</div>
                            <p class="skate-panel-text" data-i18n="skate.leaderboard.body">Local and global records will show here.</p>
                            <div class="skate-shop-item">
                              <strong data-i18n="skate.leaderboard.local">Local best</strong>
                              <span class="tiny" data-skate-local-best>0</span>
                            </div>
                            <div class="skate-shop-item">
                              <strong data-i18n="skate.leaderboard.global">Global best</strong>
                              <span class="tiny" data-skate-global-best>—</span>
                            </div>
                            <div class="skate-panel-actions">
                              <button class="skate-btn ghost" type="button" data-skate-action="menu" data-i18n="skate.action.back">Back to menu</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="skate-overlay hidden" id="skateOverOverlay">
                      <div class="skate-over-box">
                        <strong data-i18n="skate.gameOver">Game Over</strong>
                        <div class="tiny"><span data-i18n="skate.over.base">Base</span>: <span data-skate-over-base>0</span></div>
                        <div class="tiny"><span data-i18n="skate.over.combo">Combo bonus</span>: <span data-skate-over-combo>0</span></div>
                        <div class="tiny"><span data-i18n="skate.over.bliss">BLISS bonus</span>: <span data-skate-over-bliss>0</span></div>
                        <div class="tiny"><span data-i18n="skate.over.total">Total</span>: <span data-skate-over-score>0</span></div>
                        <div class="tiny"><span data-i18n="skate.over.cds">CDs</span>: <span data-skate-over-cds>0</span></div>
                        <div class="tiny"><span data-i18n="skate.hud.best">Best</span>: <span data-skate-over-best>0</span></div>
                        <button class="skate-btn primary" type="button" data-skate-action="retry" data-i18n="skate.action.retry">Retry</button>
                        <button class="skate-btn ghost" type="button" data-skate-action="menu" data-i18n="skate.action.menu">Menu</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }
          if(state.games.view === 'snake'){
            return `
              <div class="snake-layout">
                <div class="snake-main">
                  <div class="snake-header">
                    <div class="snake-topbar">
                      <button class="btn bevel" type="button" data-games-action="back" data-i18n="games.back">Back</button>
                    </div>
                    <h2 class="snake-title">${t('games.snake')}</h2>
                  </div>
                  <div class="bevel-in snake-board-stats">
                    <div class="tiny"><span data-i18n="snake.score">Score:</span> <strong data-snake-score>0</strong></div>
                    <div class="tiny"><span data-i18n="snake.highScore">High Score:</span> <strong data-snake-high>0</strong></div>
                    <div class="tiny"><span data-i18n="snake.length">Length:</span> <strong data-snake-length>3</strong></div>
                    <div class="tiny"><span data-i18n="snake.level">Level:</span> <strong data-snake-level>1</strong></div>
                    <div class="tiny snake-bonus-hidden" aria-hidden="true"><span data-i18n="snake.bonus">Bonus:</span> <strong data-snake-bonus>--</strong></div>
                  </div>
                  <div class="snake-board bevel-in" id="snakeBoard">
                    <canvas id="snakeCanvas" class="pixel" width="320" height="320"></canvas>
                    <div class="snake-overlay hidden" id="snakeOverlay">
                      <div class="snake-overlay-box bevel">
                        <strong data-snake-overlay-title data-i18n="snake.gameOver">Game Over</strong>
                        <div class="tiny" data-snake-overlay-meta><span data-i18n="snake.score">Score:</span> <span data-snake-over-score>0</span></div>
                        <button class="btn bevel" type="button" data-snake-action="playAgain" data-snake-overlay-btn data-i18n="snake.playAgain">Play again</button>
                      </div>
                    </div>
                  </div>
                  <div class="snake-action-row">
                    <button class="btn bevel" type="button" data-snake-action="primary" data-i18n="snake.start">Start</button>
                  </div>
                </div>
              </div>
            `;
          }
          if(state.games.view === 'leaderboard'){
            const lb = getGamesLeaderboard();
            const rows = lb.items.map(item => `
              <div class="games-leaderboard-row">
                <strong>${item.label}</strong>
                <span>${item.best}</span>
              </div>
            `).join('');
            return `
              <div class="games-shell">
                <div class="games-skin">
                  <div class="games-surface">
                    <div class="games-tabs">
                      <button class="games-tab${state.games.view === 'list' ? ' active' : ''}" type="button" data-games-tab="hub" data-i18n="games.tab.hub">Games</button>
                      <button class="games-tab${state.games.view === 'leaderboard' ? ' active' : ''}" type="button" data-games-tab="leaderboard" data-i18n="games.tab.leaderboard">Leaderboard</button>
                    </div>
                    <div class="games-leaderboard">
                      <div class="games-leaderboard-row">
                        <strong data-i18n="games.leaderboard.total">Total Score</strong>
                        <span>${lb.total}</span>
                      </div>
                      ${rows || `<div class="tiny" data-i18n="games.leaderboard.empty">No scores yet.</div>`}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }
          const items = (state.folders.games || []).map(id => {
            if(id === 'snake'){
              return `
                <button class="games-item games-card" type="button" data-game-id="snake">
                  <div class="games-icon pixel">
                    ${getThemedIconHtml({ icon:'game', id:'snake', iconFile:'./assets/icons/snake.png' }, t('games.snake'), 64)}
                  </div>
                  <span data-i18n="games.snake">Snake</span>
                </button>
              `;
            }
            if(id === 'dope-skate'){
              return `
                <button class="games-item games-card" type="button" data-game-id="dope-skate">
                  <div class="games-icon pixel">
                    ${getThemedIconHtml({ icon:'game', id:'dope-skate', iconFile:'./assets/icons/dope-skate.png' }, t('games.dopeSkate'), 64)}
                  </div>
                  <span data-i18n="games.dopeSkate">Dope Skate</span>
                </button>
              `;
            }
            const app = getAppById(id);
            if(!app) return '';
            const label = t(app.titleKey);
            const iconHtml = getThemedIconHtml(app, label, 32);
            return `
              <button class="games-item games-card" type="button" data-game-id="${id}">
                <div class="games-icon pixel">${iconHtml}</div>
                <span>${label}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="games-shell">
              <div class="games-skin">
                <div class="games-surface">
                  <div class="games-tabs">
                    <button class="games-tab${state.games.view === 'list' ? ' active' : ''}" type="button" data-games-tab="hub" data-i18n="games.tab.hub">Games</button>
                    <button class="games-tab${state.games.view === 'leaderboard' ? ' active' : ''}" type="button" data-games-tab="leaderboard" data-i18n="games.tab.leaderboard">Leaderboard</button>
                  </div>
                  <div id="gamesList" class="${state.games.layout === 'list' ? 'games-list' : `games-grid${state.games.bigIcons ? ' games-big' : ''}`}">
                    ${items || `<div class="tiny" data-i18n="games.empty">${t('games.empty')}</div>`}
                  </div>
                </div>
              </div>
            </div>
          `;
        },
        'dope-skate': () => {
          const prevView = state.games.view;
          state.games.view = 'dope-skate';
          const html = CONTENT.games();
          state.games.view = prevView;
          return html;
        },
        videos: () => `
          <div class="videos-shell">
            <div class="videos-header">
              <a class="btn bevel videos-link-btn" href="${VIDEO_CHANNEL_URL}" target="_blank" rel="noopener noreferrer" data-i18n="videos.channelLink">Watch on Youtube</a>
            </div>
            <div class="videos-list" id="videosList"></div>
          </div>
        `,
        poetry: () => {
          if(POEMS.length === 0){
            return `<p>${t('poetry.empty')}</p>`;
          }
          if(state.poetry.view === 'read' && state.poetry.currentId){
            const poem = getPoemById(state.poetry.currentId);
            if(!poem){
              state.poetry.view = 'list';
            } else {
              return `
                <div style="display:flex; gap:8px; align-items:center; margin-bottom:10px;">
                  <button class="btn bevel" type="button" data-poetry-action="back">${t('poetry.back')}</button>
                  <button class="btn bevel" type="button" data-poetry-action="toggleLang">${t('poetry.language')}</button>
                  <span class="kbd">${state.poetry.readLang.toUpperCase()}</span>
                </div>
                <h2>${poem.title}</h2>
                <div class="poem-body">${getPoemBody(poem, state.poetry.readLang)}</div>
              `;
            }
          }
          const grid = POEMS.map(poem => `
            <button class="poetry-item" type="button" data-poem-id="${poem.id}">
              <div class="pixel" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
                ${getThemedIconHtml({ icon: 'file', id: poem.id, iconFile: './assets/icons/poetry2.png' }, poem.title, 32)}
              </div>
              <span>${poem.title}</span>
            </button>
          `).join('');
          return `
            <div class="poetry-grid">${grid}</div>
          `;
        },
        trash: () => {
          const items = Array.from(state.trash);
          if(items.length === 0){
            return `<div class="trash-empty-msg">${t('dialog.trash.empty')}</div>`;
          }
          const grid = items.map(id => {
            const app = APPS.find(a => a.id === id);
            const fsItem = getFsItem(id);
            const label = app ? getIconLabel(app) : (fsItem ? getFsItemLabel(fsItem) : id);
            const iconHtml = app
              ? getThemedIconHtml(app, label, 32)
              : (fsItem ? getFsIconHtml(fsItem, label, 32) : iconSVG('file', state.settings.theme));
            return `
                  <button class="trash-item" type="button" data-trash-id="${id}">
                <div class="pixel" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;">${iconHtml}</div>
                <span>${escapeHTML(label)}</span>
              </button>
            `;
          }).join('');
          return `<div class="trash-grid">${grid}</div>`;
        },
        contact: () => `
          <div class="contact-list" style="display:flex; flex-direction:column; gap:8px;">
            <div><strong>${t('contact.label.instagramDIEV')}</strong> <a href="https://www.instagram.com/die.verson/" target="_blank" rel="noopener noreferrer">@die.verson</a></div>
            <div><strong>${t('contact.label.twitterDIEV')}</strong> <a href="https://x.com/DIE_VERSON" target="_blank" rel="noopener noreferrer">@die_verson</a></div>
            <div><strong>${t('contact.label.emailBusiness')}</strong> <a href="mailto:die.versonbusiness@gmail.com">die.versonbusiness@gmail.com</a></div>
            <div><strong>${t('contact.label.instagramBLISS')}</strong> <a href="https://www.instagram.com/blissworldweb/" target="_blank" rel="noopener noreferrer">@blissworldweb</a></div>
          </div>
          <div style="display:flex; justify-content:center; margin:10px 0 6px 0;">
            <img class="pixel" src="./assets/gifs/smilehue.gif" alt="smile hue gif" style="display:block; width:min(100%, 280px); height:auto;" loading="lazy" />
          </div>
        `,
        diev: () => `<p>${t('diev.p1')}</p>`,
        settings: () => `
          <div class="settings-shell">
            <div class="settings-tabs" role="tablist" aria-label="Settings">
              <button class="settings-tab" type="button" role="tab" data-tab="general" aria-controls="settingsPanel_general" data-i18n="settings.tab.general">General</button>
              <button class="settings-tab" type="button" role="tab" data-tab="language" aria-controls="settingsPanel_language" data-i18n="settings.tab.language">Language</button>
              <button class="settings-tab" type="button" role="tab" data-tab="appearance" aria-controls="settingsPanel_appearance" data-i18n="settings.tab.appearance">Appearance</button>
              ${isBlissOS() ? `<button class="settings-tab" type="button" role="tab" data-tab="dock" aria-controls="settingsPanel_dock" data-i18n="settings.tab.dock">Dock</button>` : ''}
              <button class="settings-tab" type="button" role="tab" data-tab="system" aria-controls="settingsPanel_system" data-i18n="settings.tab.system">System</button>
              <button class="settings-tab" type="button" role="tab" data-tab="sound" aria-controls="settingsPanel_sound" data-i18n="settings.tab.sound">Sounds</button>
              <button class="settings-tab" type="button" role="tab" data-tab="performance" aria-controls="settingsPanel_performance" data-i18n="settings.tab.performance">Performance</button>
            </div>
            <div class="settings-panels">
              <div class="settings-panel" role="tabpanel" data-tab="general" id="settingsPanel_general">
                <div class="settings-general">
                  <div class="settings-logo">
                    <img class="pixel" src="./assets/icons/computer.png" data-settings-icon="computer.png" width="48" height="48" alt="" />
                  </div>
                  <div class="settings-summary">
                    <strong data-i18n="settings.general.title">BLISS 98</strong>
                    <div class="tiny" data-i18n="settings.general.desc">System properties and preferences for BLISS 98.</div>
                    <div class="settings-block tiny">
                      <span data-i18n="settings.general.user">User:</span>
                      <strong>${state.user ? state.user : t('settings.general.guest')}</strong>
                    </div>
                    <div class="tiny">
                      <span data-i18n="settings.general.version">Version:</span>
                      <span>BLISS 98 — Build 98.0</span>
                    </div>
                    <div class="settings-block tiny">
                      <div data-i18n="settings.general.registeredTo">Registered to:</div>
                      <strong data-i18n="settings.general.registeredName">A Bad Motherfucker</strong>
                      <div data-i18n="settings.general.registeredCode">616-FTP-420-333</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="settings-panel" role="tabpanel" data-tab="language" id="settingsPanel_language">
                <div class="settings-panel-header">
                  <div class="settings-panel-icon">
                    <img class="pixel" src="./assets/icons/language.png" data-settings-icon="language.png" width="48" height="48" alt="" />
                  </div>
                  <div>
                    <strong data-i18n="settings.languageTab">Language</strong>
                    <div class="tiny" data-i18n="settings.languageDesc">Choose your language for BLISS 98.</div>
                  </div>
                </div>
                <div class="settings-actions">
                  <button class="btn bevel" type="button" data-set-lang="en"><span class="kbd" style="margin-right:6px;">EN</span><span data-i18n="settings.lang.en">English</span></button>
                  <button class="btn bevel" type="button" data-set-lang="pt"><span class="kbd" style="margin-right:6px;">PT</span><span data-i18n="settings.lang.pt">Português (BR)</span></button>
                </div>
              </div>
              <div class="settings-panel" role="tabpanel" data-tab="appearance" id="settingsPanel_appearance">
                <div class="settings-panel-header">
                  <div class="settings-panel-icon">
                    <img class="pixel" src="./assets/icons/appearance.png" data-settings-icon="appearance.png" width="48" height="48" alt="" />
                  </div>
                  <div>
                    <strong data-i18n="settings.appearanceTab">Appearance</strong>
                    <div class="tiny" data-i18n="settings.appearanceDesc">Customize how BLISS 98 looks.</div>
                  </div>
                </div>
                ${isBlissOS() ? `
                <div class="settings-block" id="settingsBlissosAccent">
                  <strong data-i18n="settings.blissosAccent.title">Accent Color</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.blissosAccent.desc">Choose your BlissOS accent color.</p>
                  <div class="settings-actions color-swatches">
                    <div class="accent-swatch" data-set-blissos-accent="multicolor">
                      <div class="color-circle multicolor"></div>
                      <span data-i18n="blissosAccent.multicolor">Multicolor</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="blue">
                      <div class="color-circle blue"></div>
                      <span data-i18n="blissosAccent.blue">Blue</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="teal">
                      <div class="color-circle teal"></div>
                      <span data-i18n="blissosAccent.teal">Teal</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="purple">
                      <div class="color-circle purple"></div>
                      <span data-i18n="blissosAccent.purple">Purple</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="pink">
                      <div class="color-circle pink"></div>
                      <span data-i18n="blissosAccent.pink">Pink</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="rose">
                      <div class="color-circle rose"></div>
                      <span data-i18n="blissosAccent.rose">Rose</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="red">
                      <div class="color-circle red"></div>
                      <span data-i18n="blissosAccent.red">Red</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="orange">
                      <div class="color-circle orange"></div>
                      <span data-i18n="blissosAccent.orange">Orange</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="yellow">
                      <div class="color-circle yellow"></div>
                      <span data-i18n="blissosAccent.yellow">Yellow</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="green">
                      <div class="color-circle green"></div>
                      <span data-i18n="blissosAccent.green">Green</span>
                    </div>
                    <div class="accent-swatch" data-set-blissos-accent="graphite">
                      <div class="color-circle graphite"></div>
                      <span data-i18n="blissosAccent.graphite">Graphite</span>
                    </div>
                  </div>
                </div>                ` : ''}

                ${isBliss98() ? `
                <div class="settings-block" id="settingsThemes">
                  <strong data-i18n="settings.themes.title">Themes</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.themes.desc">Select a theme to change wallpaper, title color, and dark mode.</p>
                  <div class="theme-grid">
                    <button class="theme-thumb bevel" type="button" data-set-theme="default" data-theme-thumb="default">
                      <div class="theme-preview theme-preview-default">
                        <div class="theme-preview-bar"></div>
                        <div class="theme-preview-body"></div>
                      </div>
                      <span data-i18n="theme.default">Default</span>
                    </button>
                    <button class="theme-thumb bevel" type="button" data-set-theme="totvers" data-theme-thumb="totvers">
                      <div class="theme-preview theme-preview-totvers">
                        <div class="theme-preview-bar"></div>
                        <div class="theme-preview-body"></div>
                      </div>
                      <span data-i18n="theme.totvers">Totvers</span>
                    </button>
                    <button class="theme-thumb bevel" type="button" data-set-theme="matrix" data-theme-thumb="matrix">
                      <div class="theme-preview theme-preview-matrix">
                        <div class="theme-preview-bar"></div>
                        <div class="theme-preview-body" style="background:linear-gradient(180deg, #000 0%, #0a1a0f 100%);"></div>
                      </div>
                      <span data-i18n="theme.matrix">Matrix</span>
                    </button>
                    <button class="theme-thumb bevel" type="button" data-set-theme="xp98" data-theme-thumb="xp98">
                      <div class="theme-preview theme-preview-xp98">
                        <div class="theme-preview-bar"></div>
                        <div class="theme-preview-body" style="background:url('./assets/wallpapers/BlissXP.png') center/cover no-repeat;"></div>
                      </div>
                      <span data-i18n="theme.xp98">XP98</span>
                    </button>
                    <button class="theme-thumb bevel" type="button" data-set-theme="scarbliss" data-theme-thumb="scarbliss">
                      <div class="theme-preview theme-preview-scarbliss">
                        <div class="theme-preview-bar"></div>
                        <div class="theme-preview-body" style="background:url('./assets/wallpapers/scarbliss.png') center/cover no-repeat;"></div>
                      </div>
                      <span data-i18n="theme.scarbliss">ScarBliss</span>
                    </button>
                    <button class="theme-thumb bevel" type="button" data-set-theme="blank" data-theme-thumb="blank">
                      <div class="theme-preview theme-preview-blank">
                        <div class="theme-preview-bar"></div>
                        <div class="theme-preview-body"></div>
                      </div>
                      <span data-i18n="theme.blank">Blank</span>
                    </button>
                    <button class="theme-thumb bevel" type="button" data-theme-custom="load" data-theme-thumb="custom">
                      <div class="theme-preview theme-preview-custom">
                        <div class="theme-preview-bar"></div>
                        <div class="theme-preview-body"></div>
                      </div>
                      <span data-theme-custom-label data-i18n="theme.custom">Custom</span>
                    </button>
                  </div>
                  <div style="display:flex; gap:8px; margin-top:8px; align-items:center; flex-wrap:wrap;">
                    <button class="btn bevel" type="button" data-theme-custom="save" data-i18n="theme.save">Save Custom</button>
                    <div class="tiny"><span data-i18n="settings.themes.current">Current theme:</span> <span data-theme-current></span></div>
                  </div>
                </div>
                ` : ''}
                ${isBliss98() ? `
                <div class="settings-block" id="settingsTitlebar">
                  <strong data-i18n="settings.titlebar.title">Window Title Color</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.titlebar.desc">Choose the color of the window title bars.</p>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-titlebar="defaultBlue">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#000080,#1084d0);"></span>
                      <span data-i18n="titlebar.defaultBlue">Blue</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="pinkLight">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#f6a6cf,#e46aa9);"></span>
                      <span data-i18n="titlebar.pinkLight">Pink</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="purple">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#7b2cbf,#5a189a);"></span>
                      <span data-i18n="titlebar.purple">Purple</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="red">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#cc2f2f,#9a1f1f);"></span>
                      <span data-i18n="titlebar.red">Red</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="orange">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#f08a24,#d16002);"></span>
                      <span data-i18n="titlebar.orange">Orange</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="yellow">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#f2d53c,#d4b118);"></span>
                      <span data-i18n="titlebar.yellow">Yellow</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="green">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#2fa44f,#1f7f39);"></span>
                      <span data-i18n="titlebar.green">Green</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="graphite">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#6b6f78,#4f545d);"></span>
                      <span data-i18n="titlebar.graphite">Graphite</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="purpleDark">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#3a1c5a,#1b0f30);"></span>
                      <span data-i18n="titlebar.purpleDark">Dark Purple</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="offWhite">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#e6e6e6,#cfcfcf);"></span>
                      <span data-i18n="titlebar.offWhite">Off-white</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="greenDark">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#1b4a2a,#0e2e1a);"></span>
                      <span data-i18n="titlebar.greenDark">Dark Green</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="redDark">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#5a1a1a,#2f0b0b);"></span>
                      <span data-i18n="titlebar.redDark">Dark Red</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="scarbliss">
                      <span class="titlebar-swatch" style="background:radial-gradient(circle at 22% 32%, rgba(190,18,18,0.95) 0 3px, transparent 4px),radial-gradient(circle at 54% 68%, rgba(164,8,8,0.86) 0 2px, transparent 3px),radial-gradient(circle at 84% 26%, rgba(150,8,8,0.82) 0 2px, transparent 3px),linear-gradient(90deg,#090909,#000000);"></span>
                      <span data-i18n="titlebar.scarbliss">ScarBliss</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="blank">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#b6b6b6,#c9c9c9);"></span>
                      <span data-i18n="titlebar.blank">Blank</span>
                    </button>
                    <button class="btn bevel" type="button" data-set-titlebar="xpBlue">
                      <span class="titlebar-swatch" style="background:linear-gradient(90deg,#0a246a,#3a6ea5);"></span>
                      <span data-i18n="titlebar.xpBlue">XP Blue</span>
                    </button>
                  </div>
                </div>
                ` : ''}
                ${isBliss98() ? `
                <div class="settings-block" id="settingsBliss98Accent">
                  <strong data-i18n="settings.bliss98Accent.title">Accent Color</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.bliss98Accent.desc">Choose the highlight color for menus and selections.</p>
                  <div class="settings-accent98-grid">
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="classic">
                      <span class="accent98-square classic"></span>
                      <span data-i18n="bliss98Accent.classic">Classic Blue</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="teal">
                      <span class="accent98-square teal"></span>
                      <span data-i18n="bliss98Accent.teal">Teal</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="green">
                      <span class="accent98-square green"></span>
                      <span data-i18n="bliss98Accent.green">Green</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="purple">
                      <span class="accent98-square purple"></span>
                      <span data-i18n="bliss98Accent.purple">Purple</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="pink">
                      <span class="accent98-square pink"></span>
                      <span data-i18n="bliss98Accent.pink">Pink</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="rose">
                      <span class="accent98-square rose"></span>
                      <span data-i18n="bliss98Accent.rose">Rose</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="red">
                      <span class="accent98-square red"></span>
                      <span data-i18n="bliss98Accent.red">Red</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="orange">
                      <span class="accent98-square orange"></span>
                      <span data-i18n="bliss98Accent.orange">Orange</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="yellow">
                      <span class="accent98-square yellow"></span>
                      <span data-i18n="bliss98Accent.yellow">Yellow</span>
                    </button>
                    <button class="btn bevel accent98-swatch" type="button" data-set-bliss98-accent="graphite">
                      <span class="accent98-square graphite"></span>
                      <span data-i18n="bliss98Accent.graphite">Graphite</span>
                    </button>
                  </div>
                </div>
                ` : ''}
                <div class="settings-block bliss98-only" id="settingsDarkMode">
                  <strong data-i18n="settings.darkMode.title">Dark Mode</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.darkMode.desc">Makes BLISS 98 darker and easier on the eyes.</p>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-darkmode="on"><span data-i18n="settings.darkMode.on">On</span></button>
                    <button class="btn bevel" type="button" data-set-darkmode="off"><span data-i18n="settings.darkMode.off">Off</span></button>
                  </div>
                </div>
                <div class="settings-block blissos-only settings-appearance-quick" id="settingsBlissOSDarkMode">
                  <label class="settings-appearance-toggle settings-aqua-check">
                    <input type="checkbox" data-toggle-blissos-darkmode />
                    <span>Dark Mode</span>
                  </label>
                </div>
                <div class="settings-block" id="settingsWallpaper">
                  <strong data-i18n="settings.wallpaperTab">Wallpaper</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.wallpaperDesc">Choose a wallpaper for your desktop.</p>
                  <div class="wallpaper-slider-shell" data-wallpaper-slider>
                    <button class="btn bevel wallpaper-nav" type="button" data-wallpaper-nav="-1" aria-label="Previous wallpapers">◀</button>
                    <div class="wallpaper-strip-viewport bevel-in">
                      <div class="wallpaper-strip" data-wallpaper-strip>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="classic">
                          <span class="wallpaper-card-thumb" style="background:#008080;"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.classic">Classic Teal</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="blissos">
                          <span class="wallpaper-card-thumb" style="background:url('./assets/wallpapers/BlissOS.png') center/cover no-repeat;"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.blissos">BlissOS</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="aqua">
                          <span class="wallpaper-card-thumb" style="background:url('./assets/wallpapers/Aqua.png') center/cover no-repeat;"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.aqua">Aqua</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="bliss">
                          <span class="wallpaper-card-thumb" style="background:radial-gradient(circle at 20% 20%, #fff2c4 0%, #ffb77a 30%, #7fc7ff 65%, #1d5b9e 100%);"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.bliss">Sunrise</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="clouds">
                          <span class="wallpaper-card-thumb" style="background:url('./assets/wallpapers/clouds.png') center/cover no-repeat;"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.clouds">Clouds</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="galaxy">
                          <span class="wallpaper-card-thumb" style="background:url('./assets/wallpapers/galaxy.png') center/cover no-repeat;"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.galaxy">Galaxy</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="diev">
                          <span class="wallpaper-card-thumb" style="background:repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 1px, transparent 1px 6px), linear-gradient(135deg, #0a2333, #114b6a);"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.diev">Grid</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="tot">
                          <span class="wallpaper-card-thumb" style="background:radial-gradient(circle at 20% 20%, #ffd1e6 0%, #ff9fcb 45%, #ff7fb7 100%);"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.tot">Tot (Pink)</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="matrix">
                          <span class="wallpaper-card-thumb" style="background:repeating-linear-gradient(90deg, rgba(0,255,90,0.6) 0 2px, transparent 2px 5px), linear-gradient(180deg, #000 0%, #0a1a0f 100%);"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.matrix">Matrix</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="blissxp">
                          <span class="wallpaper-card-thumb" style="background:url('./assets/wallpapers/BlissXP.png') center/cover no-repeat;"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.blissxp">BlissXP</span>
                        </button>
                        <button class="btn bevel wallpaper-card" type="button" data-set-wallpaper="scarbliss">
                          <span class="wallpaper-card-thumb" style="background:url('./assets/wallpapers/scarbliss.png') center/cover no-repeat;"></span>
                          <span class="wallpaper-card-label" data-i18n="wallpaper.scarbliss">ScarBliss</span>
                        </button>
                      </div>
                    </div>
                    <button class="btn bevel wallpaper-nav" type="button" data-wallpaper-nav="1" aria-label="Next wallpapers">▶</button>
                  </div>
                </div>
              </div>
              ${isBlissOS() ? `
              <div class="settings-panel" role="tabpanel" data-tab="dock" id="settingsPanel_dock">
                <div class="settings-panel-header">
                  <div class="settings-panel-icon">
                    <img class="pixel" src="./assets/BlissOS/dock.png" data-settings-icon="dock.png" width="48" height="48" alt="" />
                  </div>
                  <div>
                    <strong data-i18n="settings.tab.dock">Dock</strong>
                    <div class="tiny" data-i18n="settings.dock.desc">Adjust Dock size, magnification, and visibility.</div>
                  </div>
                </div>
                <div class="settings-dock-layout">
                  <div class="settings-block settings-dock-block">
                    <div class="settings-dock-row">
                      <label class="settings-dock-label" for="settingsDockSize" data-i18n="settings.dock.size">Size:</label>
                      <input id="settingsDockSize" class="retro-slider settings-dock-slider" type="range" min="0" max="100" step="1" data-dock-slider="size" />
                    </div>
                    <div class="settings-dock-scale tiny">
                      <span data-i18n="settings.dock.small">Small</span>
                      <span data-i18n="settings.dock.large">Large</span>
                    </div>
                  </div>
                  <div class="settings-block settings-dock-block">
                    <div class="settings-dock-row settings-dock-row-toggle">
                      <label class="settings-dock-check">
                        <input type="checkbox" data-dock-toggle="magnification" />
                        <span data-i18n="settings.dock.magnification">Magnification:</span>
                      </label>
                      <input class="retro-slider settings-dock-slider" type="range" min="0" max="100" step="1" data-dock-slider="magnification" />
                    </div>
                    <div class="settings-dock-scale tiny">
                      <span data-i18n="settings.dock.min">Min</span>
                      <span data-i18n="settings.dock.max">Max</span>
                    </div>
                  </div>
                  <div class="settings-block settings-dock-block">
                    <div class="settings-dock-row">
                      <label class="settings-dock-label" for="settingsDockOpacity" data-i18n="settings.dock.opacity">Opacity:</label>
                      <input id="settingsDockOpacity" class="retro-slider settings-dock-slider" type="range" min="0" max="100" step="1" data-dock-slider="opacity" />
                    </div>
                    <div class="settings-dock-scale tiny">
                      <span data-i18n="settings.dock.min">Min</span>
                      <span data-i18n="settings.dock.max">Max</span>
                    </div>
                  </div>
                  <div class="settings-block settings-dock-block">
                    <label class="settings-dock-check settings-dock-autohide">
                      <input type="checkbox" data-dock-toggle="autohide" />
                      <span data-i18n="settings.dock.autohide">Automatically hide and show the Dock</span>
                    </label>
                  </div>
                </div>
              </div>
              ` : ''}
              <div class="settings-panel" role="tabpanel" data-tab="sound" id="settingsPanel_sound">
                <div class="settings-panel-header">
                  <div class="settings-panel-icon">
                    <img class="pixel" src="./assets/icons/Sound.png" data-settings-icon="Sound.png" width="48" height="48" alt="" />
                  </div>
                  <div>
                    <strong data-i18n="settings.soundTab">Sounds</strong>
                    <div class="tiny" data-i18n="settings.soundDesc">Control music and system volume levels.</div>
                  </div>
                </div>
                <div class="settings-block">
                  <strong data-i18n="settings.sound.master">Master Volume</strong>
                  <div style="display:flex; align-items:center; gap:10px; margin-top:6px;">
                    <input class="retro-slider" type="range" min="0" max="100" step="1" data-sound-slider="master" />
                    <span class="tiny" data-sound-value="master">80%</span>
                  </div>
                </div>
                <div class="settings-block">
                  <strong data-i18n="settings.sound.music">Music</strong>
                  <div style="display:flex; align-items:center; gap:10px; margin-top:6px;">
                    <input class="retro-slider" type="range" min="0" max="100" step="1" data-sound-slider="music" />
                    <span class="tiny" data-sound-value="music">10%</span>
                  </div>
                </div>
                <div class="settings-block">
                  <strong data-i18n="settings.sound.system">System Sounds</strong>
                  <div style="display:flex; align-items:center; gap:10px; margin-top:6px;">
                    <input class="retro-slider" type="range" min="0" max="100" step="1" data-sound-slider="system" />
                    <span class="tiny" data-sound-value="system">80%</span>
                    <button class="btn bevel" type="button" data-toggle-system-sounds aria-pressed="true" data-i18n="settings.sound.toggleOn">On</button>
                  </div>
                </div>
              </div>
              <div class="settings-panel" role="tabpanel" data-tab="system" id="settingsPanel_system">
                <div class="settings-panel-header">
                  <div class="settings-panel-icon">
                    <img class="pixel" src="./assets/icons/system.png" data-settings-icon="system.png" width="48" height="48" alt="" />
                  </div>
                  <div>
                    <strong data-i18n="settings.systemTab">System</strong>
                    <div class="tiny" data-i18n="settings.systemDesc">System clock and visual effects.</div>
                  </div>
                </div>
                <div class="settings-block" id="settingsOsTheme">
                  <strong data-i18n="settings.osTheme.title">Choose your OS</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.osTheme.desc">Switch between Bliss98 and BlissOS.</p>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-os-theme="bliss98" data-i18n="settings.osTheme.bliss98">Bliss 98</button>
                    <button class="btn bevel" type="button" data-set-os-theme="blissos" data-i18n="settings.osTheme.blissos">BlissOS</button>
                    <button class="btn bevel" type="button" data-set-os-theme="blissaqua" data-i18n="settings.osTheme.blissaqua">Bliss Aqua</button>
                  </div>
                </div>
                <div class="settings-block" id="settingsFullscreen">
                  <strong data-i18n="settings.fullscreen.title">Fullscreen</strong>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-fullscreen="on"><span data-i18n="settings.fullscreen.on">On</span></button>
                    <button class="btn bevel" type="button" data-set-fullscreen="off"><span data-i18n="settings.fullscreen.off">Off</span></button>
                  </div>
                </div>
                <div class="settings-block" id="settingsClock">
                  <strong data-i18n="settings.clock.title">Clock Format</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.clock.desc">Choose 24-hour or 12-hour time.</p>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-clock="24"><span data-i18n="settings.clock.24">24-hour</span></button>
                    <button class="btn bevel" type="button" data-set-clock="12"><span data-i18n="settings.clock.12">12-hour</span></button>
                  </div>
                </div>
                <div class="settings-block" id="settingsRetro">
                  <strong data-i18n="settings.retro.title">Glow</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.retro.desc">Add glow to windows and icons.</p>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-retro="on"><span data-i18n="settings.retro.on">On</span></button>
                    <button class="btn bevel" type="button" data-set-retro="off"><span data-i18n="settings.retro.off">Off</span></button>
                  </div>
                </div>
                <div class="settings-block">
                  <strong data-i18n="settings.scanlinesTab">Scanlines</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.scanlinesDesc">Add scanline effect to the display.</p>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-scanlines="on"><span data-i18n="settings.scanlines.on">On</span></button>
                    <button class="btn bevel" type="button" data-set-scanlines="off"><span data-i18n="settings.scanlines.off">Off</span></button>
                  </div>
                </div>
                <div class="settings-block" id="settingsOldCrt">
                  <strong data-i18n="settings.oldcrt.title">Old CRT Effect</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.oldcrt.desc">Add CRT curvature, phosphor texture, and screen sweep.</p>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-oldcrt="on"><span data-i18n="settings.oldcrt.on">On</span></button>
                    <button class="btn bevel" type="button" data-set-oldcrt="off"><span data-i18n="settings.oldcrt.off">Off</span></button>
                  </div>
                </div>
              </div>
              <div class="settings-panel" role="tabpanel" data-tab="performance" id="settingsPanel_performance">
                <div class="settings-panel-header">
                  <div class="settings-panel-icon">
                    <img class="pixel" src="./assets/icons/performance.png" data-settings-icon="performance.png" width="48" height="48" alt="" />
                  </div>
                  <div>
                    <strong data-i18n="settings.animationsTab">Animations</strong>
                    <div class="tiny" data-i18n="settings.animationsDesc">Toggle window animations.</div>
                  </div>
                </div>
                <div class="settings-actions">
                  <button class="btn bevel" type="button" data-set-animations="on"><span data-i18n="settings.animations.on">On</span></button>
                  <button class="btn bevel" type="button" data-set-animations="off"><span data-i18n="settings.animations.off">Off</span></button>
                </div>
                <div class="settings-block" id="settingsAppOpenAnim">
                  <strong data-i18n="settings.appOpenAnim.title">App open animation</strong>
                  <p style="margin:6px 0 10px 0;" data-i18n="settings.appOpenAnim.desc">Animate a dotted selection box from the icon to the window.</p>
                  <div class="settings-actions">
                    <button class="btn bevel" type="button" data-set-appopenanim="on"><span data-i18n="settings.appOpenAnim.on">On</span></button>
                    <button class="btn bevel" type="button" data-set-appopenanim="off"><span data-i18n="settings.appOpenAnim.off">Off</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `,
      };


function getEffectiveClock24(){
  // On mobile we always show 24h time to keep the menubar compact (setting remains for desktop).
  return state.isMobile ? true : state.settings.clock24;
}

function getDisplayTime(){
  const d = new Date();
  const mm = String(d.getMinutes()).padStart(2,'0');
  if(getEffectiveClock24()){
    const hh = String(d.getHours()).padStart(2,'0');
    return `${hh}:${mm}`;
  }
  const raw = d.getHours();
  const h = raw % 12 || 12;
  const suffix = raw >= 12 ? 'PM' : 'AM';
  return `${h}:${mm} ${suffix}`;
}
      function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

/* ===== Module: 05-media-player.js ===== */
      // --- BLISS Media Player ---
      // NOTE: Browsers cannot scan/list a folder on static hosting (GitHub Pages). We use a manifest file.
      // Create: /assets/music/manifest.json or /assets/audio/tracks.json  Example: ["WOW.mp3","People Change.mp3"]
      const MP_MANIFEST_URL = './assets/audio/tracks.json';
      const MP_LIBRARY_URLS = ['./assets/music/manifest.json', MP_MANIFEST_URL];
      const MP_STATE_KEY = 'bliss98_mp_state';
      const MP_IMPORT_KEY = 'bliss98_mp_imports';

      let mp = {
        tracks: [],
        manifestTracks: [],
        imported: [],
        importedNames: [],
        shuffleBag: [],
        shuffleHistory: [],
        loadingPromise: null,
        idx: 0,
        playing: false,
        vol: 0.1,
        loaded: false,
        seeking: false,
        supportsFlac: true,
        durationCache: new Map(),
        durationPending: new Set(),
        durationFailed: new Set(),
        durationHydrating: false,
      };
      const MP_FALLBACK_TRACKS = [
        '6 Years.flac',
        'Hard Enough.flac',
        'Sorry For My Rage.flac',
        'Talking About.flac',
        'WOW.flac'
      ];

      function mpSafeTitleFromFilename(name){
        try{
          const base = String(name).split('/').pop();
          const noExt = base.replace(/\.[^/.]+$/,'');
          return decodeURIComponent(noExt);
        } catch {
          return String(name).replace(/\.[^/.]+$/,'');
        }
      }

      function mpLoadState(){
        try{
          const raw = localStorage.getItem(MP_STATE_KEY);
          if(raw){
            const s = JSON.parse(raw);
            if(typeof s.idx === 'number') mp.idx = s.idx;
            if(typeof s.vol === 'number') mp.vol = clamp(s.vol, 0, 1);
          }
        } catch {}
        try{
          const rawImports = localStorage.getItem(MP_IMPORT_KEY);
          mp.importedNames = rawImports ? JSON.parse(rawImports) : [];
          state.mediaplayer.needsReimport = Array.isArray(mp.importedNames) && mp.importedNames.length > 0;
        } catch {
          mp.importedNames = [];
          state.mediaplayer.needsReimport = false;
        }
      }

      function mpSaveState(){
        try{ localStorage.setItem(MP_STATE_KEY, JSON.stringify({ idx: mp.idx, vol: mp.vol })); } catch {}
      }

      function mpResolveTitleFromSrc(src){
        return mpSafeTitleFromFilename(src);
      }

      function mpParseDuration(raw){
        if(Number.isFinite(raw)){
          const val = Number(raw);
          return val >= 0 ? val : null;
        }
        if(typeof raw !== 'string') return null;
        const text = raw.trim();
        if(!text) return null;
        if(/^\d+(\.\d+)?$/.test(text)){
          const sec = Number(text);
          return sec >= 0 ? sec : null;
        }
        const parts = text.split(':').map(p => p.trim());
        if(parts.some(p => !/^\d+$/.test(p))) return null;
        if(parts.length === 2){
          return Number(parts[0]) * 60 + Number(parts[1]);
        }
        if(parts.length === 3){
          return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
        }
        return null;
      }

      function mpNormalizeManifest(data, baseDir){
        if(!Array.isArray(data)) return [];
        return data.map(item => {
          if(typeof item === 'string'){
            const file = item.trim();
            const isAbs = /^(https?:)?\//.test(file);
            const src = (isAbs || file.startsWith('.')) ? file : (baseDir + file);
            return { src, title: mpResolveTitleFromSrc(file), kind: 'manifest' };
          }
          if(item && typeof item === 'object' && (item.src || item.file)){
            const raw = String(item.src || item.file);
            const isAbs = /^(https?:)?\//.test(raw);
            const src = (isAbs || raw.startsWith('.')) ? raw : (baseDir + raw);
            const duration = mpParseDuration(item.duration ?? item.time);
            return {
              src,
              title: item.title ? String(item.title) : mpResolveTitleFromSrc(raw),
              kind: 'manifest',
              duration,
              time: Number.isFinite(duration) ? mpFormatTime(duration) : undefined,
              artist: item.artist ? String(item.artist) : undefined,
              album: item.album ? String(item.album) : undefined,
            };
          }
          return null;
        }).filter(Boolean);
      }

      function mpTrackDurationKey(track){
        if(!track) return '';
        if(track.kind === 'local' && track.fileKey){
          return `local:${track.fileKey}`;
        }
        const src = String(track.src || '').trim();
        if(src) return `src:${src}`;
        const title = String(track.title || '').trim();
        return title ? `title:${title}` : '';
      }

      function mpApplyKnownTrackDurations(){
        mp.tracks.forEach(track => {
          if(!track) return;
          if(Number.isFinite(track.duration) && !track.time){
            track.time = mpFormatTime(track.duration);
          }
          const key = mpTrackDurationKey(track);
          if(!key || !mp.durationCache.has(key)) return;
          const cached = mp.durationCache.get(key);
          if(!Number.isFinite(cached)) return;
          track.duration = cached;
          track.time = mpFormatTime(cached);
        });
      }

      function mpRebuildTracks(){
        mp.tracks = [...mp.manifestTracks, ...mp.imported];
        mpApplyKnownTrackDurations();
      }

      function mpTrackFileKey(file){
        if(!file) return '';
        const name = String(file.name || '').toLowerCase();
        const size = Number.isFinite(file.size) ? file.size : 0;
        const mod = Number.isFinite(file.lastModified) ? file.lastModified : 0;
        return `${name}::${size}::${mod}`;
      }

      function mpTrackHasBlobUrl(track){
        if(!track || track.kind !== 'local') return false;
        const src = String(track.src || '');
        return src.startsWith('blob:');
      }

      function mpGetCurrentAudioSrc(){
        const els = mpEls();
        const src = els && els.audio ? els.audio.getAttribute('src') : '';
        return src ? String(src) : '';
      }

      function mpRevokeTrackUrl(track, opts = {}){
        if(!mpTrackHasBlobUrl(track)) return;
        const preserveSrc = opts.preserveSrc ? String(opts.preserveSrc) : '';
        if(preserveSrc && String(track.src || '') === preserveSrc) return;
        try{ URL.revokeObjectURL(track.src); } catch {}
      }

      function mpDisposeImportedTracks(){
        mp.imported.forEach(tr => mpRevokeTrackUrl(tr));
        mp.imported = [];
      }

      function mpBuildShuffleBag(excludeIdx){
        const bag = [];
        for(let i=0;i<mp.tracks.length;i += 1){
          if(i !== excludeIdx) bag.push(i);
        }
        for(let i=bag.length - 1;i>0;i -= 1){
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = bag[i];
          bag[i] = bag[j];
          bag[j] = tmp;
        }
        return bag;
      }

      function mpResetShuffleRuntime(){
        mp.shuffleBag = [];
        mp.shuffleHistory = (mp.tracks.length > 0) ? [mp.idx] : [];
      }

      function mpSetShuffle(enabled){
        state.mediaplayer.shuffle = !!enabled;
        if(state.mediaplayer.shuffle){
          mpResetShuffleRuntime();
        } else {
          mp.shuffleBag = [];
          mp.shuffleHistory = [];
        }
        mpRender();
      }

      function mpEnsureShuffleSeed(){
        if(mp.tracks.length === 0) return;
        if(mp.shuffleHistory.length === 0){
          mp.shuffleHistory = [mp.idx];
          return;
        }
        const last = mp.shuffleHistory[mp.shuffleHistory.length - 1];
        if(last !== mp.idx){
          mp.shuffleHistory.push(mp.idx);
        }
      }

      function mpGetShuffleNextIndex(){
        if(mp.tracks.length <= 1) return mp.idx;
        mpEnsureShuffleSeed();
        if(mp.shuffleBag.length === 0){
          mp.shuffleBag = mpBuildShuffleBag(mp.idx);
        }
        const next = mp.shuffleBag.pop();
        if(!Number.isInteger(next)) return mp.idx;
        if(mp.shuffleHistory[mp.shuffleHistory.length - 1] !== next){
          mp.shuffleHistory.push(next);
        }
        if(mp.shuffleHistory.length > (mp.tracks.length * 4)){
          mp.shuffleHistory = mp.shuffleHistory.slice(-Math.max(mp.tracks.length * 2, 8));
        }
        return next;
      }

      function mpGetShufflePrevIndex(){
        if(mp.tracks.length <= 1) return mp.idx;
        mpEnsureShuffleSeed();
        if(mp.shuffleHistory.length <= 1) return mp.idx;
        const current = mp.shuffleHistory.pop();
        const prev = mp.shuffleHistory[mp.shuffleHistory.length - 1];
        if(Number.isInteger(current) && current !== prev && !mp.shuffleBag.includes(current)){
          mp.shuffleBag.push(current);
        }
        return Number.isInteger(prev) ? prev : mp.idx;
      }

      function mpAddFiles(fileList, opts = {}){
        const files = Array.from(fileList || []);
        if(files.length === 0) return;
        const accepted = files.filter(f => {
          const name = String(f.name || '').toLowerCase();
          const ext = name.split('.').pop();
          return ['flac','mp3','wav','ogg'].includes(ext) || (f.type && f.type.startsWith('audio/'));
        });
        if(accepted.length === 0) return;
        if(opts.replaceImported){
          mpDisposeImportedTracks();
        }
        const currentSrc = mpGetCurrentAudioSrc();

        const added = [];
        accepted.forEach(file => {
          const name = String(file.name || '');
          const ext = name.toLowerCase().split('.').pop();
          const fileKey = mpTrackFileKey(file);
          const existingIdx = mp.imported.findIndex(tr => tr.fileKey && tr.fileKey === fileKey);
          if(existingIdx >= 0){
            const existing = mp.imported[existingIdx];
            if(String(existing.src || '') === currentSrc){
              return;
            }
            mpRevokeTrackUrl(existing, { preserveSrc: currentSrc });
            mp.imported.splice(existingIdx, 1);
          }
          const src = URL.createObjectURL(file);
          const durationKey = fileKey ? `local:${fileKey}` : '';
          if(durationKey){
            mp.durationFailed.delete(durationKey);
          }
          added.push({
            src,
            title: mpSafeTitleFromFilename(name),
            kind: 'local',
            ext,
            file,
            fileKey,
          });
        });

        mp.imported = [...mp.imported, ...added];
        mp.importedNames = mp.imported.map(tr => tr.title);
        state.mediaplayer.needsReimport = false;
        try{ localStorage.setItem(MP_IMPORT_KEY, JSON.stringify(mp.importedNames)); } catch {}

        mpRebuildTracks();
        if(state.mediaplayer.shuffle) mpResetShuffleRuntime();
        if(mp.tracks.length > 0){
          mp.idx = clamp(mp.idx, 0, mp.tracks.length - 1);
          mpSetTrack(mp.idx);
        } else {
          mpRender();
        }
      }

      function mpEls(){
        const win = document.getElementById('win_mediaplayer');
        if(!win) return null;
        return {
          win,
          audio: win.querySelector('#mpAudio'),
          now: win.querySelector('#mpNow'),
          msg: win.querySelector('#mpMsg'),
          seek: win.querySelector('#mpSeek'),
          current: win.querySelector('[data-mp-current]'),
          total: win.querySelector('[data-mp-total]'),
          vol: win.querySelector('#mpVol'),
          toggleBtn: win.querySelector('[data-mp-action="toggle"]'),
          shuffleBtn: win.querySelector('[data-mp-action="shuffle"]'),
          repeatBtn: win.querySelector('[data-mp-action="repeat"]'),
          addBtn: win.querySelector('[data-mp-action="add"]'),
          reimportBtn: win.querySelector('[data-mp-action="reimport"]'),
          dropHint: win.querySelector('#mpDropHint'),
          fileInput: win.querySelector('#mpFileInput'),
          list: win.querySelector('#mpList'),
        };
      }

      function mpRenderList(els){
        const list = els && els.list;
        if(!list) return;
        if(mp.tracks.length === 0){
          list.innerHTML = `<div class="tiny mp-empty">${escapeHTML(t('player.notfound'))}</div>`;
          return;
        }
        list.innerHTML = mp.tracks.map((tr, i) => {
          const selected = state.mediaplayer.selected.has(i);
          const active = i === mp.idx;
          const cls = `mp-item${selected ? ' selected' : ''}${active ? ' active' : ''}`;
          const marker = active ? '&#9654;' : '&nbsp;';
          const title = escapeHTML(String(tr.title || ''));
          const timeLabel = escapeHTML(String(tr.time || '--:--'));
          const artist = escapeHTML(String(tr.artist || 'DIEV'));
          const album = escapeHTML(String(tr.album || 'Unknown'));
          return `
            <button class="${cls}" type="button" data-mp-pick="${i}" title="${title}">
              <span class="mp-item-col mp-item-name">
                <span class="mp-item-check">&#9744;</span>
                <span class="mp-item-mark">${marker}</span>
                <span class="mp-item-title">${title}</span>
              </span>
              <span class="mp-item-col mp-item-go-col"><span class="mp-item-go">◉</span></span>
              <span class="mp-item-col mp-item-time">${timeLabel}</span>
              <span class="mp-item-col mp-item-artist">${artist}</span>
              <span class="mp-item-col mp-item-album">${album}</span>
            </button>
          `;
        }).join('');
      }

      function mpUpdateStats(els){
        const stats = els && els.win ? els.win.querySelector('#mpStats') : null;
        if(!stats) return;
        const count = mp.tracks.length;
        const countLabel = `${count} ${count === 1 ? 'song' : 'songs'}`;
        const totalSeconds = mp.tracks.reduce((acc, track)=>{
          if(track && Number.isFinite(track.duration) && track.duration > 0){
            return acc + track.duration;
          }
          return acc;
        }, 0);
        if(totalSeconds > 0){
          stats.textContent = `${countLabel}, ${mpFormatTime(totalSeconds)}`;
          return;
        }
        stats.textContent = countLabel;
      }

      function mpRender(){
        const els = mpEls();
        if(!els) return;
        const { now, msg, vol, toggleBtn, audio, shuffleBtn, repeatBtn, reimportBtn } = els;

        if(vol){
          vol.value = String(mp.vol);
        }
        if(audio){
          audio.volume = mp.vol;
        }

        if(msg){
          const hasFlac = mp.tracks.some(tr => {
            const src = String(tr.src || '').toLowerCase();
            return src.endsWith('.flac') || tr.ext === 'flac';
          });
          if(!mp.loaded){
            msg.textContent = t('player.loading');
          } else if(state.mediaplayer.needsReimport){
            msg.textContent = t('player.reimportHint');
          } else if(mp.tracks.length === 0){
            msg.textContent = t('player.notfound');
          } else if(!mp.supportsFlac && hasFlac){
            msg.textContent = t('player.flacUnsupported');
          } else {
            msg.textContent = '';
          }
        }

        const cur = mp.tracks[mp.idx];
        if(now) now.textContent = cur ? cur.title : '—';
        if(toggleBtn){
          if(toggleBtn.classList.contains('mp-round-btn')){
            toggleBtn.textContent = mp.playing ? '⏸' : '▶';
            toggleBtn.title = mp.playing ? t('player.pause') : t('player.play');
          } else {
            toggleBtn.innerHTML = mp.playing ? `⏸ ${t('player.pause')}` : `▶ ${t('player.play')}`;
          }
        }
        if(shuffleBtn){
          if(shuffleBtn.dataset.mpGlyph === '1'){
            shuffleBtn.textContent = '⤮';
            shuffleBtn.title = t('player.shuffle');
          } else {
            shuffleBtn.textContent = t('player.shuffle');
          }
          shuffleBtn.classList.toggle('pressed', state.mediaplayer.shuffle);
        }
        if(repeatBtn){
          const repeatKey = `player.repeat.${state.mediaplayer.repeat}`;
          if(repeatBtn.dataset.mpGlyph === '1'){
            repeatBtn.textContent = state.mediaplayer.repeat === 'one'
              ? '1↺'
              : (state.mediaplayer.repeat === 'all' ? '∞↺' : '↺');
            repeatBtn.title = `${t('player.repeat')} ${t(repeatKey)}`;
          } else {
            repeatBtn.textContent = `${t('player.repeat')} ${t(repeatKey)}`;
          }
          repeatBtn.classList.toggle('pressed', state.mediaplayer.repeat !== 'off');
        }
        if(reimportBtn){
          reimportBtn.classList.toggle('hidden', !state.mediaplayer.needsReimport);
        }
        mpUpdateStats(els);
        mpRenderList(els);
        mpUpdateTime();
        if(mp.loaded && mp.tracks.length > 0){
          mpHydrateTrackDurations();
        }
      }

      function mpApplyVolume(els){
        if(!els || !els.audio) return;
        if(els.vol){
          els.vol.value = String(mp.vol);
        }
        els.audio.volume = mp.vol;
      }

      function mpBindAudioEventsOnce(audio){
        if(!audio || audio.dataset.mpBound === '1') return;
        audio.dataset.mpBound = '1';
        audio.addEventListener('ended', ()=> mpNext());
        audio.addEventListener('timeupdate', mpUpdateTime);
        audio.addEventListener('loadedmetadata', mpUpdateTime);
        audio.addEventListener('durationchange', mpUpdateTime);
        audio.addEventListener('canplay', mpUpdateTime);
      }

      function mpBindUiEventsOnce(win, els){
        if(!win || win.dataset.mpUiBound === '1') return;
        win.dataset.mpUiBound = '1';

        if(els.vol){
          els.vol.addEventListener('input', ()=>{
            mp.vol = Number(els.vol.value);
            if(els.audio) els.audio.volume = mp.vol;
            debounceVolumeSave(()=> mpSaveState());
            updateSoundUI();
          });
        }

        if(els.seek){
          els.seek.addEventListener('input', ()=>{
            mp.seeking = true;
            mpSeekTo(els.seek.value);
          });
          els.seek.addEventListener('change', ()=>{
            mp.seeking = false;
            mpSeekTo(els.seek.value);
          });
          els.seek.addEventListener('pointerdown', ()=>{
            mp.seeking = true;
          });
          els.seek.addEventListener('pointerup', ()=>{
            mp.seeking = false;
          });
          els.seek.addEventListener('pointercancel', ()=>{
            mp.seeking = false;
          });
        }

        if(els.fileInput){
          els.fileInput.addEventListener('change', ()=>{
            const replaceImported = (els.fileInput.dataset.mpMode === 'reimport');
            mpAddFiles(els.fileInput.files, { replaceImported });
            els.fileInput.dataset.mpMode = 'add';
            mpRender();
          });
        }

        const dropTarget = win.querySelector('.mp-mini');
        if(dropTarget && !dropTarget.dataset.mpDrop){
          dropTarget.dataset.mpDrop = '1';
          const showDrop = (on)=>{
            if(!els.dropHint) return;
            els.dropHint.classList.toggle('hidden', !on);
            els.dropHint.classList.toggle('active', !!on);
          };
          dropTarget.addEventListener('dragover', (e)=>{
            e.preventDefault();
            showDrop(true);
          });
          dropTarget.addEventListener('dragleave', ()=>{
            showDrop(false);
          });
          dropTarget.addEventListener('drop', (e)=>{
            e.preventDefault();
            showDrop(false);
            if(e.dataTransfer && e.dataTransfer.files){
              mpAddFiles(e.dataTransfer.files, { replaceImported: false });
              mpRender();
            }
          });
        }
      }

      function mpFormatTime(raw){
        if(!Number.isFinite(raw)) return '--:--';
        const total = Math.max(0, Math.floor(raw));
        const hours = Math.floor(total / 3600);
        const mins = Math.floor((total % 3600) / 60);
        const secs = total % 60;
        if(hours > 0){
          return `${hours}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        }
        return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
      }

      function mpUpdateTrackTimeCell(idx){
        const els = mpEls();
        if(!els || !els.list) return;
        const cell = els.list.querySelector(`[data-mp-pick="${idx}"] .mp-item-time`);
        if(!cell) return;
        const track = mp.tracks[idx];
        cell.textContent = (track && track.time) ? track.time : '--:--';
      }

      function mpProbeTrackDuration(track){
        return new Promise(resolve => {
          if(!track || !track.src){
            resolve(null);
            return;
          }
          const probe = new Audio();
          let settled = false;
          const done = (value)=>{
            if(settled) return;
            settled = true;
            try{
              probe.pause();
              probe.removeAttribute('src');
              probe.load();
            } catch {}
            resolve(value);
          };
          const onMeta = ()=>{
            const duration = Number(probe.duration);
            if(Number.isFinite(duration) && duration > 0){
              done(duration);
            } else {
              done(null);
            }
          };
          const onError = ()=> done(null);
          probe.preload = 'metadata';
          probe.addEventListener('loadedmetadata', onMeta, { once: true });
          probe.addEventListener('error', onError, { once: true });
          try{
            probe.src = track.src;
          } catch {
            done(null);
          }
        });
      }

      async function mpHydrateTrackDurations(){
        if(mp.durationHydrating) return;
        if(!mp.tracks || mp.tracks.length === 0) return;
        const unresolved = mp.tracks
          .map((track, idx) => ({ track, idx }))
          .filter(({ track }) => track && track.src && !Number.isFinite(track.duration));
        if(unresolved.length === 0) return;

        mp.durationHydrating = true;
        let changed = false;
        try{
          for(const entry of unresolved){
            const { track, idx } = entry;
            const key = mpTrackDurationKey(track);
            if(!key) continue;
            if(mp.durationFailed.has(key) || mp.durationPending.has(key)) continue;

            if(mp.durationCache.has(key)){
              const cached = mp.durationCache.get(key);
              if(Number.isFinite(cached)){
                track.duration = cached;
                track.time = mpFormatTime(cached);
                mpUpdateTrackTimeCell(idx);
                changed = true;
                continue;
              }
            }

            mp.durationPending.add(key);
            const duration = await mpProbeTrackDuration(track);
            mp.durationPending.delete(key);
            if(Number.isFinite(duration) && duration > 0){
              mp.durationCache.set(key, duration);
              mp.durationFailed.delete(key);
              track.duration = duration;
              track.time = mpFormatTime(duration);
              mpUpdateTrackTimeCell(idx);
              changed = true;
            } else {
              mp.durationFailed.add(key);
            }
          }
        } finally {
          mp.durationHydrating = false;
        }
        if(changed) mpRender();
      }

      function mpUpdateTime(){
        const els = mpEls();
        if(!els) return;
        const { audio, seek, current, total } = els;
        const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
        const cur = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;

        if(seek){
          seek.disabled = !dur;
          if(!dur){
            seek.value = '0';
          } else if(!mp.seeking){
            const ratio = cur / dur;
            seek.value = String(Math.round(ratio * 1000));
          }
        }
        if(current) current.textContent = mpFormatTime(cur);
        if(total) total.textContent = dur ? mpFormatTime(dur) : '--:--';

        const activeTrack = mp.tracks[mp.idx];
        if(activeTrack && dur > 0 && (!Number.isFinite(activeTrack.duration) || Math.abs(activeTrack.duration - dur) > 0.5)){
          activeTrack.duration = dur;
          activeTrack.time = mpFormatTime(dur);
          const key = mpTrackDurationKey(activeTrack);
          if(key){
            mp.durationCache.set(key, dur);
            mp.durationFailed.delete(key);
          }
          mpUpdateTrackTimeCell(mp.idx);
          mpUpdateStats(els);
        }
      }

      function mpSeekTo(value){
        const els = mpEls();
        if(!els) return;
        const { audio } = els;
        const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
        if(!dur) return;
        const ratio = clamp(Number(value) / 1000, 0, 1);
        audio.currentTime = ratio * dur;
        mpUpdateTime();
      }

      function mpOpenFilePicker(mode = 'add'){
        const els = mpEls();
        if(!els || !els.fileInput) return;
        els.fileInput.value = '';
        els.fileInput.dataset.mpMode = (mode === 'reimport') ? 'reimport' : 'add';
        els.fileInput.click();
      }

      function schedulePlayerAutoplay(){
        if(state.didAutoPlayThisSession) return;
        if(state.autoPlayTimer) clearTimeout(state.autoPlayTimer);
        state.autoPlayTimer = setTimeout(async ()=>{
          if(state.didAutoPlayThisSession) return;
          if(mp.playing) return;
          if(!state.windows.has('mediaplayer')) openApp('mediaplayer');

          const tryPlay = async () => {
            if(mp.tracks.length === 0){
              await mpLoadTracks();
            }
            if(mp.tracks.length === 0) return false;
            if(mp.idx < 0 || mp.idx >= mp.tracks.length){
              mp.idx = 0;
              mpSetTrack(0);
            }
            await mpPlay();
            return mp.playing;
          };

          let ok = await tryPlay();
          if(!ok){
            for(let i=0;i<3;i++){
              await new Promise(r => setTimeout(r, 500));
              ok = await tryPlay();
              if(ok) break;
            }
          }
          if(ok) state.didAutoPlayThisSession = true;
        }, 1000);
      }

      function mpSetTrack(i, opts = {}){
        const els = mpEls();
        if(!els) return;
        const { audio } = els;
        if(mp.tracks.length === 0) return;
        mp.idx = clamp(i, 0, mp.tracks.length - 1);
        const cur = mp.tracks[mp.idx];
        audio.src = cur.src;
        audio.volume = mp.vol;
        audio.currentTime = 0;
        if(opts.syncSelection !== false){
          state.mediaplayer.selected = new Set([mp.idx]);
        }
        if(opts.syncShuffle !== false){
          if(state.mediaplayer.shuffle){
            mpResetShuffleRuntime();
          } else {
            mp.shuffleBag = [];
            mp.shuffleHistory = [];
          }
        }
        mpSaveState();
        mpRender();
      }

      async function mpPlay(){
        const els = mpEls();
        if(!els) return;
        const { audio } = els;
        if(mp.tracks.length === 0) return;
        try{
          await audio.play();
          mp.playing = true;
        } catch {
          mp.playing = false;
        }
        mpRender();
      }

      function mpPause(){
        const els = mpEls();
        if(!els) return;
        els.audio.pause();
        mp.playing = false;
        mpRender();
      }

      function mpNext(manual=false){
        if(mp.tracks.length === 0) return;
        if(state.mediaplayer.shuffle){
          const next = mpGetShuffleNextIndex();
          mpSetTrack(next, { syncShuffle: false });
          mpPlay();
          return;
        }
        if(!manual && state.mediaplayer.repeat === 'one'){
          mpSetTrack(mp.idx);
          mpPlay();
          return;
        }
        const atEnd = (mp.idx === mp.tracks.length - 1);
        if(atEnd && !manual && state.mediaplayer.repeat === 'off'){
          mpPause();
          return;
        }
        const nextIdx = atEnd ? 0 : mp.idx + 1;
        mpSetTrack(nextIdx);
        mpPlay();
      }

      function mpPrev(manual=false){
        if(mp.tracks.length === 0) return;
        if(state.mediaplayer.shuffle){
          const prev = mpGetShufflePrevIndex();
          if(prev === mp.idx) return;
          mpSetTrack(prev, { syncShuffle: false });
          mpPlay();
          return;
        }
        const prevIdx = (mp.idx - 1 + mp.tracks.length) % mp.tracks.length;
        mpSetTrack(prevIdx);
        mpPlay();
      }

      async function mpLoadTracks(force=false){
        if(mp.loadingPromise) return mp.loadingPromise;
        if(force){
          mp.durationFailed.clear();
        }
        if(mp.loaded && !force){
          mpRebuildTracks();
          if(mp.tracks.length > 0){
            mp.idx = clamp(mp.idx, 0, mp.tracks.length - 1);
            const els = mpEls();
            const hasSrc = !!(els && els.audio && els.audio.getAttribute('src'));
            if(!hasSrc){
              mpSetTrack(mp.idx, { syncSelection: false });
            } else {
              mpRender();
            }
          } else {
            mpRender();
          }
          return;
        }

        mp.loadingPromise = (async ()=>{
          mp.loaded = false;
          mp.manifestTracks = [];
          mpRebuildTracks();
          mpRender();

          try{
            let loaded = false;
            for(const url of MP_LIBRARY_URLS){
              const res = await fetch(url, { cache: 'no-store' });
              if(!res.ok) continue;
              const data = await res.json();
              if(Array.isArray(data) || Array.isArray(data.tracks)){
                const baseDir = url.includes('./assets/music/') ? './assets/music/' : './assets/audio/';
                const list = Array.isArray(data) ? data : data.tracks;
                mp.manifestTracks = mpNormalizeManifest(list, baseDir);
                loaded = true;
                break;
              }
            }
            if(!loaded){
              mp.manifestTracks = mpNormalizeManifest(MP_FALLBACK_TRACKS, './assets/music/');
            }
          } catch {
            mp.manifestTracks = mpNormalizeManifest(MP_FALLBACK_TRACKS, './assets/music/');
          }

          mp.loaded = true;
          mpLoadState();
          mpRebuildTracks();
          if(mp.tracks.length > 0){
            mp.idx = clamp(mp.idx, 0, mp.tracks.length - 1);
            mpSetTrack(mp.idx);
          }
          mpRender();
        })();

        try{
          await mp.loadingPromise;
        } finally {
          mp.loadingPromise = null;
        }
      }

      function mpInitInWindow(){
        const els = mpEls();
        if(!els) return;
        const { audio, win } = els;
        mpBindAudioEventsOnce(audio);
        mpBindUiEventsOnce(win, els);
        mp.supportsFlac = !!audio.canPlayType('audio/flac');
        mpApplyVolume(els);
        mpUpdateTime();
        // Ensure tracks are available; redundant calls are deduplicated.
        mpLoadTracks();
      }

      window.addEventListener('beforeunload', ()=>{
        mpDisposeImportedTracks();
      });

      // Delegate Media Player button clicks
      document.addEventListener('click', (e)=>{
        const target = getEventTargetEl(e);
        const actBtn = target && target.closest ? target.closest('[data-mp-action]') : null;
        if(actBtn){
          const action = actBtn.dataset.mpAction;
          if(action === 'toggle'){
            if(mp.playing) mpPause(); else mpPlay();
          }
          if(action === 'next') mpNext(true);
          if(action === 'prev') mpPrev(true);
          if(action === 'shuffle'){
            mpSetShuffle(!state.mediaplayer.shuffle);
          }
          if(action === 'repeat'){
            const order = ['off', 'one', 'all'];
            const idx = order.indexOf(state.mediaplayer.repeat);
            state.mediaplayer.repeat = order[(idx + 1) % order.length];
            mpRender();
          }
          if(action === 'add'){
            mpOpenFilePicker('add');
          }
          if(action === 'reimport'){
            mpOpenFilePicker('reimport');
          }
        }

        const pickBtn = target && target.closest ? target.closest('[data-mp-pick]') : null;
        if(pickBtn){
          const idx = Number(pickBtn.dataset.mpPick);
          state.mediaplayer.selected = new Set([idx]);
          mpSetTrack(idx);
          mpPlay();
        }
      });

      document.addEventListener('dblclick', (e)=>{
        const target = getEventTargetEl(e);
        if(!target || !target.closest) return;
        const card = target.closest('[data-music-id]');
        if(card && card.dataset && card.dataset.musicLink){
          e.preventDefault();
          openLink(card.dataset.musicLink, 'music');
        }
        const poemItem = target.closest('[data-poem-id]');
        if(poemItem && poemItem.dataset && poemItem.dataset.poemId){
          e.preventDefault();
          state.poetry.view = 'read';
          state.poetry.currentId = poemItem.dataset.poemId;
          state.poetry.readLang = state.lang;
          renderPoetryWindow();
        }
        const trashItem = target.closest('[data-trash-id]');
        if(trashItem && trashItem.dataset && trashItem.dataset.trashId){
          e.preventDefault();
          restoreFromTrash([trashItem.dataset.trashId]);
        }
      });

      let lastPoetryTap = { id: null, time: 0 };
        document.addEventListener('pointerdown', (e)=>{
        if(e.pointerType !== 'touch') return;
        const target = getEventTargetEl(e);
        if(!target || !target.closest) return;
        const musicCard = target.closest('[data-music-id]');
        if(musicCard && musicCard.dataset && musicCard.dataset.musicLink){
          const id = musicCard.dataset.musicId;
          state.music.selected = new Set([id]);
          applyMusicState();
          musicCard.dataset.touchOpened = '1';
          openLink(musicCard.dataset.musicLink, 'music');
          return;
        }
        const poemItem = target.closest('[data-poem-id]');
        if(!poemItem || !poemItem.dataset) return;
        const id = poemItem.dataset.poemId;
        const now = Date.now();
        if(lastPoetryTap.id === id && (now - lastPoetryTap.time) < 320){
          state.poetry.view = 'read';
          state.poetry.currentId = id;
          state.poetry.readLang = state.lang;
          renderPoetryWindow();
          lastPoetryTap = { id: null, time: 0 };
        } else {
          lastPoetryTap = { id, time: now };
        }
      });

      document.addEventListener('mouseover', (e)=>{
        if(!state.menuOpen) return;
        const target = getEventTargetEl(e);
        if(!target || !target.closest) return;
        const menuToggle = target.closest('.menubar span[data-menu]');
        if(menuToggle){
          const winEl = menuToggle.closest('.window');
          const menuKey = menuToggle.dataset.menu;
          openWindowMenu(winEl, menuKey, menuToggle);
        }
      });

      // Prevent browser text selection on desktop drags (keep selection inside .content and inputs)
      document.addEventListener('selectstart', (e)=>{
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if(tag === 'input' || tag === 'textarea') return;
        const target = getEventTargetEl(e);
        if(target && target.closest && target.closest('.content')) return;
        e.preventDefault();
      });

/* ===== Module: 06-shell-and-windowing.js ===== */

      function setUser(name){
        state.user = name;
        localStorage.setItem('bliss98_user', name);
        $('#who').textContent = name ? name : '';
      }

      function showDesktop(){
        $('#login').classList.add('hidden');
        $('#desktop').classList.remove('hidden');
        $('#username').blur();
        themeApplying = true;
        applyWallpaper(state.wallpaper);
        themeApplying = false;
        renderIcons();
        renderStartMenu();
        tickClock();
      }
      let logoffInProgress = false;

      function showLogin(playBoot = false){
        $('#desktop').classList.add('hidden');
        $('#login').classList.remove('hidden');
        closeTaskbarCalendar();
        updateMatrixEffect();
        syncLoginOsButtons();
        $('#username').focus();
        if(playBoot && areSystemSoundsEnabled() && SFX.boot && !SFX.boot.played){
          playSfxOnce('boot', { allowPending: true }).then((ok)=>{
            if(!ok && !SFX.boot.played) armBootUnlock();
          });
        }
      }

      function doLogoff(){
        if(logoffInProgress) return;
        logoffInProgress = true;
        if(state.autoPlayTimer){
          clearTimeout(state.autoPlayTimer);
          state.autoPlayTimer = null;
        }
        state.didAutoPlayThisSession = false;
        closeStartMenu();
        closeCtxMenu();
        closeWindowMenu();
        closeTaskbarCalendar();
        closeModal();
        playSfxAndWait('logoff').finally(()=>{
          showLogin(false);
          logoffInProgress = false;
        });
      }

function renderIcons(){
  const grid = $('#iconGrid');
  if(!grid) return;
  while(grid.firstChild) grid.removeChild(grid.firstChild);

  APPS.filter(app => app.showOnDesktop !== false).forEach(app => ensureFsItemForApp(app.id, { save: false }));
  VIRTUAL_ICONS.forEach(v => ensureFsItemForApp(v.id, { save: false }));

  const areaEl = $('#desktopArea');
  const areaRect = areaEl ? areaEl.getBoundingClientRect() : { width: 0, height: 0 };
  const canLayoutDesktop =
    areaRect.width > (ICON_SIZE.w + 6) &&
    areaRect.height > (ICON_SIZE.h + 6);
  const metrics = canLayoutDesktop
    ? getGridMetrics()
    : getGridMetricsForSize(
      Math.max(ICON_SIZE.w + 6, window.innerWidth || 0),
      Math.max(ICON_SIZE.h + 6, (window.innerHeight || 0) - 36)
    );
  const occupied = new Map();
  const iconPosCache = loadIconPositions();
  const defaultLayout = getDefaultIconLayout();
  let fsDirty = false;
  let iconPosDirty = false;

  const orderedIds = APPS.filter(app => app.showOnDesktop !== false).map(app => app.id)
    .concat(VIRTUAL_ICONS.map(v => v.id));
  const orderIndex = new Map(orderedIds.map((id, idx) => [id, idx]));

  const rootItems = Object.values(state.fs.items || {}).filter(isDesktopVisibleItem).sort((a, b) => {
    const ia = orderIndex.has(a.id) ? orderIndex.get(a.id) : 1e6;
    const ib = orderIndex.has(b.id) ? orderIndex.get(b.id) : 1e6;
    if(ia !== ib) return ia - ib;
    const ca = a.createdAt || 0;
    const cb = b.createdAt || 0;
    if(ca !== cb) return ca - cb;
    return getFsItemLabel(a).localeCompare(getFsItemLabel(b));
  });

  const fragment = document.createDocumentFragment();

  rootItems.forEach((item, idx) => {
    const id = item.id;
    const el = document.createElement('div');
    el.className = 'icon';
    el.dataset.appId = id;
    el.dataset.itemType = item.type || 'app';
    if(item.type === 'folder') el.dataset.folderId = id;

    const hasStoredPos = Number.isFinite(item.x) && Number.isFinite(item.y);
    const basePos = hasStoredPos
      ? { x: item.x, y: item.y }
      : (defaultLayout[id] || legacyDefaultIconPos(idx));
    let placed;
    if(!canLayoutDesktop && hasStoredPos){
      placed = {
        x: Math.floor(basePos.x),
        y: Math.floor(basePos.y),
        changed: false
      };
    } else if(state.gridSnap || !hasStoredPos){
      placed = placeOnFreeCell(basePos.x, basePos.y, occupied, metrics);
    } else {
      const clamped = clampIconPos(basePos.x, basePos.y);
      placed = {
        x: clamped.x,
        y: clamped.y,
        changed: clamped.x !== Math.floor(basePos.x) || clamped.y !== Math.floor(basePos.y)
      };
    }
    el.style.left = placed.x + 'px';
    el.style.top = placed.y + 'px';

    if(canLayoutDesktop && (placed.changed || !hasStoredPos) && item.parentId == null){
      upsertFsItem({ id, parentId: null, x: placed.x, y: placed.y }, { save: false, syncIconPos: true, iconPosCache });
      fsDirty = true;
      if(isAppLikeItem(item)) iconPosDirty = true;
    } else if(isAppLikeItem(item) && item.parentId == null && !iconPosCache[id] && Number.isFinite(item.x) && Number.isFinite(item.y)){
      iconPosCache[id] = { x: item.x, y: item.y };
      iconPosDirty = true;
    }

    const label = getFsItemLabel(item);
    const iconHtml = getFsIconHtml(item, label, 32);
    el.innerHTML = `
      <div class="pixel" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;">${iconHtml}</div>
      <span>${label}</span>
    `;

    if(state.trash.has(id)) el.classList.add('trashed');

    el.addEventListener('click', (e)=>{
      e.stopPropagation();
      if(el.dataset.dragged === '1'){
        el.dataset.dragged = '0';
        return;
      }
      selectIcon(id);
    });

    el.addEventListener('dblclick', (e)=>{
      e.stopPropagation();
      if(item.type === 'folder'){
        openFolderWindow(id, { sourceEl: el, fromDesktop: true });
        return;
      }
      if(item.type === 'txt'){
        openTxtFileWindow(id, { sourceEl: el, fromDesktop: true });
        return;
      }
      openIconById(id, { sourceEl: el, fromDesktop: true });
    });

    makeIconDraggable(el);
    el.addEventListener('contextmenu', (ev)=>{
      ev.preventDefault();
      ev.stopPropagation();
      openCtxMenu(ev.clientX, ev.clientY, 'icon', id, { itemType: item.type, parentId: null });
    });
    installLongPress(el, ()=>({ target:'icon', appId: id, itemType: item.type, parentId: null }));
    fragment.appendChild(el);
  });

  grid.appendChild(fragment);
  applyDesktopIconsVisibility();
  if(iconPosDirty) saveIconPositions(iconPosCache);
  if(fsDirty) saveDesktopFs();
}
      function clearIconSelectionExcept(containerEl){
        $$('.icon.selected').forEach(el => {
          if(!containerEl || !containerEl.contains(el)){
            el.classList.remove('selected');
          }
        });
      }

      function clearAllIconSelection(){
        state.selectedIconId = null;
        $$('.icon.selected').forEach(el => el.classList.remove('selected'));
      }

      function selectIcon(id, containerEl){
        if(containerEl) clearIconSelectionExcept(containerEl);
        state.selectedIconId = id;
        $$('.icon').forEach(i => {
          const inScope = !containerEl || containerEl.contains(i);
          i.classList.toggle('selected', inScope && i.dataset.appId === id);
        });
      }

      function makeIconDraggable(iconEl){
        let down = false;
        let dragging = false;
        let pointerId = null;
        let movedToLayer = false;
        let lastEvent = null;

        let startX = 0, startY = 0;
        let group = [];
        let startPositions = []; // { el, id, x, y }

        // group bounds + allowed delta range
        let dxMin = 0, dxMax = 0, dyMin = 0, dyMax = 0;

        const dragLayer = $('#dragLayer');
        const onWindowBlur = ()=>{
          endDrag(lastEvent, true);
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

	          if(dragging && !cancel && e){
	            const ids = startPositions.map(p => p.id);
	            const dragEls = startPositions.map(p => p.el);
	            const iconPosCache = loadIconPositions();
	            ids.forEach(id => { ensureFsItemForApp(id, { save: false }); });

            if(isOverTrashWindow(e.clientX, e.clientY) || isOverTrash(e.clientX, e.clientY)){
              restoreGroupLayer();
              moveIconsToTrash(ids);
	            } else if(isOverGamesWindow(e.clientX, e.clientY)){
	              addToFolder('games', ids);
	              ids.forEach(id => { delete iconPosCache[id]; });
	              debounceIconSave(()=> saveIconPositions(iconPosCache));
	              restoreGroupLayer();
	              renderIcons();
	              renderGamesWindow();
	            } else {
	              const dockTarget = getDockDropTargetAt(e.clientX, e.clientY);
	              if(dockTarget){
	                restoreGroupLayer();
	                const entries = ids.map(id => {
	                  if(id === 'trash') return { type:'trash', refId:'trash' };
	                  const fsItem = getFsItem(id);
	                  if(fsItem && (fsItem.type === 'folder' || fsItem.type === 'txt')) return { type: fsItem.type, refId: id };
	                  return { type:'app', refId: id };
	                });
	                addDockItemsAt(entries, dockTarget.index);
	              } else {
	                const seekerTarget = getSeekerDropTargetAt(e.clientX, e.clientY, dragEls, ids);
	                if(seekerTarget){
	                  restoreGroupLayer();
	                  if(seekerTarget.kind === 'trash'){
	                    moveIconsToTrash(ids);
	                  } else if(seekerTarget.kind === 'folder'){
	                    moveDraggedItemsToFolderTarget(ids, seekerTarget.folderId, {
	                      iconPosCache,
	                      preferredPos: { x: 20, y: 20 },
	                    });
	                  }
	                } else {
	                  const folderTarget = getFolderDropTargetAt(e.clientX, e.clientY, dragEls, ids);
	                  if(folderTarget){
	                    restoreGroupLayer();
	                    let moved = false;
	                    ids.forEach(id => {
	                      if(moveItemToFolder(id, folderTarget.id, { save: false, iconPosCache, preferredPos: { x: 0, y: 0 } })){
	                        moved = true;
	                      }
	                    });
	                    saveIconPositions(iconPosCache);
	                    saveDesktopFs();
	                    renderIcons();
	                    if(moved) refreshOpenFolderWindows();
	                  } else {
	                    restoreGroupLayer();
	                    const metrics = getGridMetrics();
	                    const occupied = state.gridSnap
	                      ? buildOccupiedFromFs(null, ids, metrics, { visibleOnly: true })
	                      : null;
	                    let fsDirty = false;
	                    let iconPosDirty = false;

	                    startPositions.forEach(p => {
	                      const dx = e.clientX - startX;
	                      const dy = e.clientY - startY;
	                      let x = p.x + dx;
	                      let y = p.y + dy;
	                      let placed;
	                      if(state.gridSnap){
	                        placed = placeOnFreeCell(x, y, occupied, metrics);
	                      } else {
	                        const clamped = clampIconPos(x, y);
	                        placed = { x: clamped.x, y: clamped.y };
	                      }
	                      p.el.style.left = placed.x + 'px';
	                      p.el.style.top = placed.y + 'px';
	                      p.el.style.transform = '';
	                      const current = getFsItem(p.id);
	                      const changed = !current || current.parentId != null || current.x !== placed.x || current.y !== placed.y;
	                      if(changed){
	                        upsertFsItem({ id: p.id, parentId: null, x: placed.x, y: placed.y }, { save: false, syncIconPos: true, iconPosCache });
	                        fsDirty = true;
	                        if(isAppLikeItem(current || { type: p.el.dataset.itemType })) iconPosDirty = true;
	                      }
	                      p.el.dataset.dragged = '1';
	                    });

	                    if(iconPosDirty) debounceIconSave(()=> saveIconPositions(iconPosCache));
	                    if(fsDirty) saveDesktopFs();
	                  }
	                }
	              }
	            }
	          } else if(dragging){
	            restoreGroupLayer();
	          }

          if(dragging){
            startPositions.forEach(p => {
              p.el.style.transform = '';
              p.el.dataset.dragged = '1';
            });
          }
	          clearDockDropPreview();
	          setDockDropHighlight(false);
	          clearSeekerDropPreview();

	          dragging = false;
	          pointerId = null;
	        };
        const onPointerDown = (e)=>{
          if($('#desktop').classList.contains('hidden')) return;
          if(e.pointerType === 'mouse' && e.button !== 0) return;

          e.stopPropagation();
          closeStartMenu();
          closeCtxMenu();

          // If multiple icons are selected and the one we grabbed is selected, drag the whole group.
          const gridEl = $('#iconGrid');
          clearIconSelectionExcept(gridEl);
          const selectedEls = gridEl ? Array.from(gridEl.querySelectorAll('.icon.selected')) : [];
          const isSelected = iconEl.classList.contains('selected');
          if(selectedEls.length > 1 && isSelected){
            group = selectedEls;
          } else {
            // Otherwise, single-select the grabbed icon
            selectIcon(iconEl.dataset.appId, gridEl);
            group = [iconEl];
          }

          down = true;
          dragging = false;
          pointerId = e.pointerId;
          try{ iconEl.setPointerCapture(pointerId); } catch {}
          startX = e.clientX;
          startY = e.clientY;
          movedToLayer = false;

          // Snapshot starting positions
          startPositions = group.map(el => ({
            el,
            id: el.dataset.appId,
            x: parseInt(el.style.left || '0', 10),
            y: parseInt(el.style.top || '0', 10)
          }));

          // Compute bounds in desktop coordinates (relative to desktopArea)
          const area = $('#desktopArea').getBoundingClientRect();
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          startPositions.forEach(p => {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x + ICON_SIZE.w);
            maxY = Math.max(maxY, p.y + ICON_SIZE.h);
          });

          // Right/bottom limits match `clampIconPos` behavior (icon right edge <= area.width - 6)
          dxMin = -minX;
          dxMax = (Math.floor(area.width - 6) - maxX);
          dyMin = -minY;
          dyMax = (Math.floor(area.height - 6) - maxY);

          // Prevent accidental post-drag clicks
          group.forEach(el => (el.dataset.dragged = '0'));

          document.body.classList.add('dragging');
          document.addEventListener('pointermove', onPointerMove);
          document.addEventListener('pointerup', onPointerUp);
          document.addEventListener('pointercancel', onPointerUp);
          window.addEventListener('blur', onWindowBlur);

          e.preventDefault();
        };

        const moveGroupToLayer = ()=>{
          if(movedToLayer || !dragLayer) return;
          dragLayer.classList.add('active');
          group.forEach(el => {
            dragLayer.appendChild(el);
            el.style.zIndex = '9999';
          });
          movedToLayer = true;
        };

        const restoreGroupLayer = ()=>{
          if(!movedToLayer) return;
          const grid = $('#iconGrid');
          group.forEach(el => {
            grid.appendChild(el);
            el.style.zIndex = '';
          });
          if(dragLayer) dragLayer.classList.remove('active');
          movedToLayer = false;
        };

        const onPointerMove = (e)=>{
          if(!down) return;
          if(pointerId !== null && e.pointerId !== pointerId) return;
          lastEvent = e;

          const dxRaw = e.clientX - startX;
          const dyRaw = e.clientY - startY;

          if(!dragging && (Math.abs(dxRaw) + Math.abs(dyRaw) > 4)){
            dragging = true;
            moveGroupToLayer();
          }
          if(!dragging) return;

          // Clamp movement so the whole group stays within the desktop
          const dx = clamp(dxRaw, dxMin, dxMax);
          const dy = clamp(dyRaw, dyMin, dyMax);

          // Use transform for smooth GPU-accelerated movement during drag
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
	          const seekerTarget = getSeekerDropTargetAt(e.clientX, e.clientY, group, startPositions.map(p => p.id));
	          setSeekerDropPreview(seekerTarget);

	          e.preventDefault();
	        };

        const onPointerUp = (e)=>{
          endDrag(e, false);
        };

        // Pointer events handle mouse + touch + pen
        iconEl.addEventListener('pointerdown', onPointerDown);
      }

      $('#desktopArea').addEventListener('click', (e)=>{
        // If a selection drag just happened, do not treat it as a click
        if($('#desktopArea').dataset.selDragged === '1'){
          $('#desktopArea').dataset.selDragged = '0';
          return;
        }
        const target = getEventTargetEl(e);
        if(target && target.closest && target.closest('.window')) return;
        state.selectedIconId = null;
        $$('.icon').forEach(i=>i.classList.remove('selected'));
        closeStartMenu();
        closeCtxMenu();
        state.activeWindowId = null;
        $$('.window').forEach(winEl=>{
          winEl.dataset.active = '0';
          const tb = winEl.querySelector('.titlebar');
          if(tb) tb.style.filter = 'grayscale(0.35) brightness(0.9)';
        });
        state.activeAppId = 'bliss';
        updateBlissOSActiveApp();
      });

      // Right-click / two-finger click on desktop
      $('#desktopArea').addEventListener('contextmenu', (e)=>{
        if($('#desktop').classList.contains('hidden')) return;
        const target = getEventTargetEl(e);
        if(target && target.closest && target.closest('.icon')) return;
        if(target && target.closest && target.closest('.window')) return;
        e.preventDefault();
        openCtxMenu(e.clientX, e.clientY, 'desktop', null);
      });

      // Long-press on desktop (mobile/touch)
      installLongPress($('#desktopArea'), ()=>({ target:'desktop', appId:null }));

      // Rubber-band selection (Windows 98 style)
      (function installRubberbandSelection(){
        const areaEl = $('#desktopArea');
        const rb = $('#rubberband');
        if(!areaEl || !rb) return;

        let down = false;
        let active = false;
        let pointerId = null;
        let startX = 0, startY = 0;
        let lastRect = null;

        function rectFrom(aX, aY, bX, bY){
          const x1 = Math.min(aX, bX);
          const y1 = Math.min(aY, bY);
          const x2 = Math.max(aX, bX);
          const y2 = Math.max(aY, bY);
          return { x:x1, y:y1, w:(x2-x1), h:(y2-y1) };
        }

        function intersects(r, elRect){
          return !(elRect.right < r.x || elRect.left > (r.x + r.w) || elRect.bottom < r.y || elRect.top > (r.y + r.h));
        }

        function updateRubberband(r){
          rb.style.left = r.x + 'px';
          rb.style.top = r.y + 'px';
          rb.style.width = r.w + 'px';
          rb.style.height = r.h + 'px';
        }

        function clearRubberband(){
          rb.classList.add('hidden');
          rb.style.width = '0px';
          rb.style.height = '0px';
          lastRect = null;
          document.body.classList.remove('dragging');
        }

        function selectByRect(r){
          // Select icons whose bounding boxes intersect with the rubberband rect
          const icons = $$('.icon');
          icons.forEach(icon => {
            const rect = icon.getBoundingClientRect();
            const area = areaEl.getBoundingClientRect();
            const rel = {
              left: rect.left - area.left,
              right: rect.right - area.left,
              top: rect.top - area.top,
              bottom: rect.bottom - area.top,
            };
            const hit = intersects(r, rel);
            icon.classList.toggle('selected', hit);
          });
        }

        const onPointerDown = (e)=>{
          if($('#desktop').classList.contains('hidden')) return;
          if(e.pointerType === 'mouse' && e.button !== 0) return;
          const tgt = getEventTargetEl(e);
          // Don't start a box if user is interacting with icons/windows/menus
          if(tgt && tgt.closest && (tgt.closest('.icon') || tgt.closest('.window') || tgt.closest('#startMenu') || tgt.closest('#ctxMenu'))){
            return;
          }

          down = true;
          active = false;
          pointerId = e.pointerId;

          const area = areaEl.getBoundingClientRect();
          startX = e.clientX - area.left;
          startY = e.clientY - area.top;

          try{ areaEl.setPointerCapture(pointerId); } catch {}
        };

        const onPointerMove = (e)=>{
          if(!down) return;
          if(pointerId !== null && e.pointerId !== pointerId) return;

          const area = areaEl.getBoundingClientRect();
          const curX = e.clientX - area.left;
          const curY = e.clientY - area.top;

          const dx = curX - startX;
          const dy = curY - startY;

          // Activate after small movement threshold
          if(!active && (Math.abs(dx) + Math.abs(dy) > 6)){
            active = true;
            rb.classList.remove('hidden');
            document.body.classList.add('dragging');
            // Close menus
            closeStartMenu();
            closeCtxMenu();
            // Clear single selection
            state.selectedIconId = null;
          }
          if(!active) return;

          e.preventDefault();

          const r = rectFrom(startX, startY, curX, curY);
          lastRect = r;
          updateRubberband(r);
          selectByRect(r);
        };

        const onPointerUp = (e)=>{
          if(!down) return;
          if(pointerId !== null && e.pointerId !== pointerId) return;

          down = false;
          try{ areaEl.releasePointerCapture(e.pointerId); } catch {}

          if(active){
            // Prevent click clear right after box select
            areaEl.dataset.selDragged = '1';
            active = false;
            clearRubberband();
          }
          pointerId = null;
        };

        areaEl.addEventListener('pointerdown', onPointerDown);
        areaEl.addEventListener('pointermove', onPointerMove);
        areaEl.addEventListener('pointerup', onPointerUp);
        areaEl.addEventListener('pointercancel', onPointerUp);
      })();

      function renderStartMenu(){
        const list = $('#startList');
        if(!list) return;
        list.textContent = '';
        const fragment = document.createDocumentFragment();

        const settingsTabsAll = [
          { id:'general', icon:'./assets/icons/computer.png', labelKey:'settings.tab.general' },
          { id:'language', icon:'./assets/icons/language.png', labelKey:'settings.tab.language' },
          { id:'appearance', icon:'./assets/icons/appearance.png', labelKey:'settings.tab.appearance' },
          { id:'dock', icon:'./assets/icons/dock.png', labelKey:'settings.tab.dock' },
          { id:'sound', icon:'./assets/icons/Sound.png', labelKey:'settings.tab.sound' },
          { id:'system', icon:'./assets/icons/system.png', labelKey:'settings.tab.system' },
          { id:'performance', icon:'./assets/icons/performance.png', labelKey:'settings.tab.performance' },
        ];
        const settingsTabs = (state.settings.theme === 'blissos')
          ? settingsTabsAll
          : settingsTabsAll.filter(tab => tab.id !== 'dock');

        const makeAppItem = (appId)=>{
          const app = getAppById(appId);
          if(!app) return null;
          const label = getIconLabel(app);
          const item = document.createElement('div');
          item.className = 'menu-item';
          item.innerHTML = `
            <div style="width:18px;height:18px;display:flex;align-items:center;justify-content:center;">${getThemedIconHtml(app, label, 16)}</div>
            <div>${escapeHTML(label)}</div>
          `;
          item.addEventListener('click', ()=>{
            openApp(app.id);
            closeStartMenu();
          });
          return item;
        };

        const makeSeparator = ()=>{
          const sep = document.createElement('div');
          sep.className = 'menu-sep';
          return sep;
        };

        const makeSettingsItem = ()=>{
          const settingsApp = getAppById('settings') || { id:'settings', icon:'settings', iconFile:'./assets/icons/Settings.png' };
          const settingsLabel = getIconLabel(settingsApp) || t('app.settings');
          const settingsItem = document.createElement('div');
          settingsItem.className = 'menu-item has-sub start-menu-has-sub';
          const settingsSubmenu = settingsTabs.map(tab => {
            const tabLabel = t(tab.labelKey);
            return `
              <div class="menu-item start-sub-item" data-start-settings-tab="${tab.id}" role="menuitem" tabindex="-1">
                <span style="width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;">${getThemedIconHtml({ icon:'settings', id:`start-settings-${tab.id}`, iconFile:tab.icon }, tabLabel, 16)}</span>
                <span>${escapeHTML(tabLabel)}</span>
              </div>
            `;
          }).join('');
          settingsItem.innerHTML = `
            <span style="width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;">${getThemedIconHtml(settingsApp, settingsLabel, 16)}</span>
            <span>${escapeHTML(settingsLabel)}</span>
            <span class="menu-arrow" aria-hidden="true">▶</span>
            <div class="menu-sub start-submenu" role="menu" aria-label="${escapeHTML(settingsLabel)}">
              ${settingsSubmenu}
            </div>
          `;
          settingsItem.addEventListener('click', (e)=>{
            const subItem = e.target && e.target.closest ? e.target.closest('[data-start-settings-tab]') : null;
            if(subItem && subItem.dataset && subItem.dataset.startSettingsTab){
              e.stopPropagation();
              openSettingsAndTab(subItem.dataset.startSettingsTab);
              closeStartMenu();
              return;
            }
            e.stopPropagation();
          });
          return settingsItem;
        };

        const makeDocumentsItem = ()=>{
          const docsLabel = t('seeker.section.documents');
          const docsIcon = getThemedIconHtml(
            { id:'start-docs-menu', icon:'folder', iconFile:'./assets/icons/documents.png' },
            docsLabel,
            16
          );
          const txtDocs = Object.values(state.fs.items || {})
            .filter(item => item && item.type === 'txt' && !state.trash.has(item.id))
            .map(item => {
              const label = getFsItemLabel(item);
              return {
                kind: 'txt',
                id: item.id,
                label,
                iconHtml: getThemedIconHtml(
                  { id:`start-txt-${item.id}`, icon:'file', iconFile:getTxtIconPath },
                  label,
                  16
                ),
              };
            });
          const poemDocs = POEMS.map(poem => ({
            kind: 'poem',
            id: poem.id,
            label: poem.title,
            iconHtml: getThemedIconHtml(
              { id:`start-poem-${poem.id}`, icon:'file', iconFile:'./assets/icons/poetry2.png' },
              poem.title,
              16
            ),
          }));
          const entries = txtDocs
            .concat(poemDocs)
            .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity:'base' }));
          const docsSubmenu = entries.length
            ? entries.map(entry => `
                <div class="menu-item start-sub-item" data-start-doc-kind="${entry.kind}" data-start-doc-id="${entry.id}" role="menuitem" tabindex="-1">
                  <span style="width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;">${entry.iconHtml}</span>
                  <span>${escapeHTML(entry.label)}</span>
                </div>
              `).join('')
            : `<div class="menu-item start-sub-item disabled" role="menuitem" tabindex="-1"><span>${escapeHTML(t('seeker.empty'))}</span></div>`;
          const docsItem = document.createElement('div');
          docsItem.className = 'menu-item has-sub start-menu-has-sub';
          docsItem.innerHTML = `
            <span style="width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;">${docsIcon}</span>
            <span>${escapeHTML(docsLabel)}</span>
            <span class="menu-arrow" aria-hidden="true">▶</span>
            <div class="menu-sub start-submenu" role="menu" aria-label="${escapeHTML(docsLabel)}">
              ${docsSubmenu}
            </div>
          `;
          docsItem.addEventListener('click', (e)=>{
            const subItem = e.target && e.target.closest ? e.target.closest('[data-start-doc-kind]') : null;
            if(!subItem || !subItem.dataset) return;
            const kind = subItem.dataset.startDocKind;
            const id = subItem.dataset.startDocId;
            if(kind === 'txt' && id){
              openIconById(id);
              closeStartMenu();
              return;
            }
            if(kind === 'poem' && id){
              const poem = getPoemById(id);
              if(!poem) return;
              state.poetry.view = 'read';
              state.poetry.currentId = id;
              state.poetry.readLang = state.lang;
              if(typeof rememberSeekerRecent === 'function'){
                rememberSeekerRecent({ kind:'poem', id }, { refresh:false });
              }
              if(!state.windows.has('poetry')){
                openApp('poetry');
              }
              renderPoetryWindow();
              closeStartMenu();
              return;
            }
          });
          return docsItem;
        };

        const orderedEntries = [
          { type:'app', id:'about' },
          { type:'app', id:'contact' },
          { type:'sep' },
          { type:'app', id:'seeker' },
          { type:'documents' },
          { type:'settings' },
          { type:'app', id:'mediaplayer' },
          { type:'app', id:'music' },
          { type:'app', id:'videos' },
          { type:'app', id:'clothes' },
          { type:'app', id:'poetry' },
          { type:'app', id:'art' },
          { type:'app', id:'games' },
          { type:'app', id:'diev' },
          { type:'sep' },
          { type:'logoff' },
        ];

        orderedEntries.forEach(entry => {
          if(entry.type === 'sep'){
            fragment.appendChild(makeSeparator());
            return;
          }
          if(entry.type === 'documents'){
            fragment.appendChild(makeDocumentsItem());
            return;
          }
          if(entry.type === 'settings'){
            fragment.appendChild(makeSettingsItem());
            return;
          }
          if(entry.type === 'logoff'){
            const logout = document.createElement('div');
            logout.className = 'menu-item';
            logout.innerHTML = `<div style="width:18px;height:18px;display:flex;align-items:center;justify-content:center;">${getThemedIconHtml({ icon: 'user', id: 'logout', iconFile: './assets/icons/logout.png' }, t('menu.logoff'), 16)}</div><div>${escapeHTML(t('menu.logoff'))}</div>`;
            logout.addEventListener('click', ()=>{ closeStartMenu(); doLogoff(); });
            fragment.appendChild(logout);
            return;
          }
          if(entry.type === 'app' && entry.id){
            const item = makeAppItem(entry.id);
            if(item) fragment.appendChild(item);
          }
        });
        list.appendChild(fragment);
      }

      function openStartMenu(){
        const menu = $('#startMenu');
        const btn = $('#startBtn');
        if(!menu || !btn) return;
        if(!menu.classList.contains('hidden')) return;
        menu.classList.remove('hidden');
        menu.classList.remove('closing');
        menu.classList.add('opening');
        btn.classList.add('pressed');
        if(!state.animations || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          menu.classList.remove('opening');
          return;
        }
        requestAnimationFrame(()=>{
          requestAnimationFrame(()=>{
            menu.classList.remove('opening');
          });
        });
      }

      function closeStartMenu(force = false){
        const menu = $('#startMenu');
        const btn = $('#startBtn');
        if(!menu || !btn) return;
        btn.classList.remove('pressed');
        if(menu.classList.contains('hidden')) return;
        if(force || !state.animations || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          menu.classList.add('hidden');
          menu.classList.remove('opening', 'closing');
          return;
        }
        if(menu.classList.contains('closing')) return;
        menu.classList.add('closing');
        menu.classList.remove('opening');
        const done = ()=>{
          menu.classList.add('hidden');
          menu.classList.remove('closing');
        };
        const onEnd = (e)=>{
          if(e && e.target !== menu) return;
          menu.removeEventListener('transitionend', onEnd);
          done();
        };
        menu.addEventListener('transitionend', onEnd);
        setTimeout(()=>{
          if(menu.classList.contains('closing')){
            menu.removeEventListener('transitionend', onEnd);
            done();
          }
        }, 200);
      }

      function toggleStartMenu(){
        const menu = $('#startMenu');
        if(!menu) return;
        const isOpen = !menu.classList.contains('hidden');
        if(isOpen) closeStartMenu();
        else openStartMenu();
      }
      $('#startBtn').addEventListener('click', (e)=>{
        e.stopPropagation();
        closeTaskbarCalendar();
        toggleStartMenu();
      });

      let taskbarCalendarAnchorId = 'clock';

      function getTaskbarCalendarAnchor(){
        if(taskbarCalendarAnchorId){
          const byId = document.getElementById(taskbarCalendarAnchorId);
          if(byId) return byId;
        }
        return document.getElementById('clock') || document.getElementById('blissosClock') || null;
      }

      function clearTaskbarCalendarClockState(){
        const clock = $('#clock');
        if(clock) clock.classList.remove('calendar-open');
        const blissClock = $('#blissosClock');
        if(blissClock) blissClock.classList.remove('calendar-open');
      }

      function ensureTaskbarCalendar(){
        const calendar = $('#taskbarCalendar');
        if(!calendar) return null;
        if(calendar.dataset.ready === '1') return calendar;
        calendar.innerHTML = `
          <div class="taskbar-calendar-shell">
            <div class="taskbar-calendar-header">
              <div class="taskbar-calendar-month" data-calendar-month></div>
              <div class="taskbar-calendar-date" data-calendar-date></div>
            </div>
            <div class="taskbar-calendar-weekdays" data-calendar-weekdays></div>
            <div class="taskbar-calendar-days" data-calendar-days></div>
          </div>
        `;
        calendar.dataset.ready = '1';
        return calendar;
      }

      function getTaskbarCalendarLocale(){
        const locale = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : '';
        if(locale && locale.trim()) return locale;
        return state.lang === 'pt' ? 'pt-BR' : 'en-US';
      }

      function isTaskbarCalendarOpen(){
        const calendar = $('#taskbarCalendar');
        return !!calendar && !calendar.classList.contains('hidden');
      }

      function renderTaskbarCalendar(){
        const calendar = ensureTaskbarCalendar();
        if(!calendar) return;
        const monthEl = calendar.querySelector('[data-calendar-month]');
        const dateEl = calendar.querySelector('[data-calendar-date]');
        const weekdaysEl = calendar.querySelector('[data-calendar-weekdays]');
        const daysEl = calendar.querySelector('[data-calendar-days]');
        if(!monthEl || !dateEl || !weekdaysEl || !daysEl) return;

        const locale = getTaskbarCalendarLocale();
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const firstWeekday = firstOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        monthEl.textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(firstOfMonth);
        dateEl.textContent = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(today);

        weekdaysEl.textContent = '';
        const weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
        for(let i = 0; i < 7; i++){
          const weekday = document.createElement('div');
          weekday.className = 'taskbar-calendar-weekday';
          weekday.textContent = weekdayFmt.format(new Date(2024, 0, 7 + i, 12)).replace(/\.$/, '');
          weekdaysEl.appendChild(weekday);
        }

        daysEl.textContent = '';
        for(let i = 0; i < 42; i++){
          const day = document.createElement('div');
          day.className = 'taskbar-calendar-day';

          const current = i - firstWeekday + 1;
          let cellDay = current;
          let cellMonth = month;
          let cellYear = year;

          if(current < 1){
            cellDay = daysInPrevMonth + current;
            cellMonth = month - 1;
            if(cellMonth < 0){
              cellMonth = 11;
              cellYear -= 1;
            }
            day.classList.add('is-muted');
          } else if(current > daysInMonth){
            cellDay = current - daysInMonth;
            cellMonth = month + 1;
            if(cellMonth > 11){
              cellMonth = 0;
              cellYear += 1;
            }
            day.classList.add('is-muted');
          }

          if(cellDay === today.getDate() && cellMonth === today.getMonth() && cellYear === today.getFullYear()){
            day.classList.add('is-today');
          }
          day.textContent = String(cellDay);
          daysEl.appendChild(day);
        }
      }

      function positionTaskbarCalendar(anchorEl = null){
        const calendar = ensureTaskbarCalendar();
        if(!calendar || calendar.classList.contains('hidden')) return;
        const anchor = anchorEl || getTaskbarCalendarAnchor();
        if(!anchor || !anchor.getBoundingClientRect){
          const fallbackWidth = calendar.offsetWidth || 304;
          const fallbackHeight = calendar.offsetHeight || 320;
          const fallbackLeft = Math.max(8, window.innerWidth - fallbackWidth - 8);
          const fallbackTop = Math.max(8, window.innerHeight - fallbackHeight - 44);
          calendar.style.left = `${fallbackLeft}px`;
          calendar.style.top = `${fallbackTop}px`;
          return;
        }
        const rect = anchor.getBoundingClientRect();
        const width = calendar.offsetWidth || 304;
        const height = calendar.offsetHeight || 320;
        const pad = 8;
        let left = Math.round(rect.right - width);
        left = clamp(left, pad, Math.max(pad, window.innerWidth - width - pad));
        let top = Math.round(rect.top - height - 8);
        if(top < pad){
          const below = Math.round(rect.bottom + 8);
          top = clamp(below, pad, Math.max(pad, window.innerHeight - height - pad));
        }
        calendar.style.left = `${left}px`;
        calendar.style.top = `${top}px`;
      }

      function closeTaskbarCalendar(){
        const calendar = $('#taskbarCalendar');
        if(!calendar) return;
        calendar.classList.add('hidden');
        clearTaskbarCalendarClockState();
      }

      function openTaskbarCalendar(anchorEl = null){
        const calendar = ensureTaskbarCalendar();
        if(!calendar) return;
        if(anchorEl && anchorEl.id) taskbarCalendarAnchorId = anchorEl.id;
        closeStartMenu();
        closeCtxMenu();
        closeWindowMenu();
        closeBlissOSMenu();
        closeBlissOSAppMenu();
        renderTaskbarCalendar();
        calendar.classList.remove('hidden');
        clearTaskbarCalendarClockState();
        const activeAnchor = getTaskbarCalendarAnchor();
        if(activeAnchor) activeAnchor.classList.add('calendar-open');
        positionTaskbarCalendar(activeAnchor);
      }

      function toggleTaskbarCalendar(anchorEl = null){
        const calendar = ensureTaskbarCalendar();
        if(!calendar) return;
        if(anchorEl && anchorEl.id) taskbarCalendarAnchorId = anchorEl.id;
        const activeAnchor = getTaskbarCalendarAnchor();
        const clickingActiveAnchor = !!anchorEl && !!activeAnchor && anchorEl.id === activeAnchor.id;
        if(isTaskbarCalendarOpen() && clickingActiveAnchor){
          closeTaskbarCalendar();
          return;
        }
        openTaskbarCalendar(anchorEl || activeAnchor);
      }

      function refreshTaskbarCalendarLayout(){
        if(!isTaskbarCalendarOpen()) return;
        positionTaskbarCalendar();
      }

      window.addEventListener('resize', refreshTaskbarCalendarLayout, { passive:true });
      window.addEventListener('orientationchange', refreshTaskbarCalendarLayout, { passive:true });
      if(window.visualViewport){
        window.visualViewport.addEventListener('resize', refreshTaskbarCalendarLayout, { passive:true });
      }

      function defaultWindowRect(){
        const area = $('#desktopArea').getBoundingClientRect();
        const side = clamp(Math.round(Math.min(area.width, area.height) * 0.58), 320, 680);
        const width = side;
        const height = side;
        const left = Math.round((area.width - width) / 2 + (Math.random() - 0.5) * 40);
        const top = Math.round((area.height - height) / 2 + (Math.random() - 0.5) * 40);
        return { left, top, width, height };
      }

      function getSavedWindowRect(appId){
        try{
          const raw = localStorage.getItem(`bliss98_window_${appId}`);
          if(!raw) return null;
          const parsed = JSON.parse(raw);
          if(!parsed) return null;
          const { left, top, width, height } = parsed;
          if(!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(width) || !Number.isFinite(height)) return null;
          return { left, top, width, height };
        } catch {
          return null;
        }
      }

      function normalizeWindowRect(rect, area, margin = 16){
        const maxW = Math.max(120, Math.floor(area.width - margin * 2));
        const maxH = Math.max(110, Math.floor(area.height - margin * 2));
        const minW = Math.min(240, maxW);
        const minH = Math.min(200, maxH);
        const width = clamp(rect.width, minW, maxW);
        const height = clamp(rect.height, minH, maxH);
        const left = clamp(rect.left, margin, Math.max(margin, area.width - width - margin));
        const top = clamp(rect.top, margin, Math.max(margin, area.height - height - margin));
        return { left, top, width, height };
      }

      function getContentOverflow(contentEl){
  if(!contentEl){
    return { x: 0, y: 0, hasOverflow: false };
  }
  const overflowX = Math.max(0, Math.ceil(contentEl.scrollWidth - contentEl.clientWidth));
  const overflowY = Math.max(0, Math.ceil(contentEl.scrollHeight - contentEl.clientHeight));
  return {
    x: overflowX,
    y: overflowY,
    hasOverflow: overflowX > 1 || overflowY > 1,
  };
}

function smartFitWindowIfOverflow(winEl, mode = 'tabChange'){
  if(!winEl || winEl.classList.contains('hidden') || winEl.classList.contains('mobile-game')){
    return Promise.resolve(null);
  }
  const appId = getWindowId(winEl);
  const w = appId ? state.windows.get(appId) : null;
  if(!appId || !w){
    return Promise.resolve(null);
  }
  const content = winEl.querySelector('.content');
  const overflow = getContentOverflow(content);
  if(!overflow.hasOverflow){
    return Promise.resolve(getWindowRectFromState(w));
  }
  return smartFitWindow(winEl, mode).catch(()=> getWindowRectFromState(w));
}

function scheduleOverflowFitPasses(winEl, mode = 'tabChange', delays = [0]){
  const runPass = (delayMs)=>{
    return new Promise(resolve => {
      if(delayMs > 0){
        setTimeout(resolve, delayMs);
        return;
      }
      resolve();
    }).then(()=> smartFitWindowIfOverflow(winEl, mode));
  };
  return new Promise(resolve => {
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        let chain = Promise.resolve();
        delays.forEach(delayMs => {
          chain = chain.then(()=> runPass(delayMs));
        });
        chain.finally(()=>{
          const appId = getWindowId(winEl);
          const w = appId ? state.windows.get(appId) : null;
          resolve(getWindowRectFromState(w));
        });
      });
    });
  });
}

      // Auto-fit windows only when the content actually overflows.
function installAutoFitObserver(winEl, appId){
  if(!winEl || winEl.dataset.autoFitObserver) return;
  const content = winEl.querySelector('.content');
  if(!content) return;
  const w = state.windows.get(appId);
  const observer = new MutationObserver(()=>{
    if(winEl.classList.contains('mobile-game')) return;
    smartFitWindowIfOverflow(winEl, 'tabChange');
  });
  observer.observe(content, { childList: true, subtree: true, characterData: true });
  winEl.dataset.autoFitObserver = '1';
  if(w) w.autoFitObserver = observer;
}

const SMART_WINDOW = {
  minWidth: 260,
  minHeight: 220,
  ratio: 1.25,
  margin: 16,
  threshold: 6,
};

function getSmartFitBounds(){
  const area = $('#desktopArea').getBoundingClientRect();
  const margin = Math.max(SMART_WINDOW.margin, Math.min(32, Math.floor(Math.min(area.width, area.height) * 0.05)));
  const maxWidth = Math.max(120, area.width - margin * 2);
  const maxHeight = Math.max(110, area.height - margin * 2);
  return { area, maxWidth, maxHeight, margin };
}

function assignWindowRect(winEl, wstate, rect){
  wstate.left = rect.left;
  wstate.top = rect.top;
  wstate.width = rect.width;
  wstate.height = rect.height;
  winEl.style.left = rect.left + 'px';
  winEl.style.top = rect.top + 'px';
  winEl.style.width = rect.width + 'px';
  winEl.style.height = rect.height + 'px';
}

function getWindowRectFromState(wstate){
  if(!wstate) return null;
  return { left: wstate.left, top: wstate.top, width: wstate.width, height: wstate.height };
}

function getMobileMaximizedRect(){
  const area = $('#desktopArea').getBoundingClientRect();
  const topInset = 0;
  let bottomLimit = area.height;

  if(state.settings.theme === 'blissos'){
    const dock = $('#blissosDock');
    if(dock && !dock.classList.contains('hidden')){
      const dockRect = dock.getBoundingClientRect();
      const dockTop = dockRect.top - area.top;
      if(Number.isFinite(dockTop)){
        bottomLimit = Math.min(bottomLimit, Math.floor(dockTop));
      }
    }
  } else {
    const taskbar = $('#taskbar');
    if(taskbar){
      const taskbarRect = taskbar.getBoundingClientRect();
      const taskbarTop = taskbarRect.top - area.top;
      if(Number.isFinite(taskbarTop)){
        bottomLimit = Math.min(bottomLimit, Math.floor(taskbarTop));
      }
    }
  }

  const bottomPadding = (state.settings.theme === 'blissos') ? 2 : 4;
  bottomLimit = Math.max(0, bottomLimit - bottomPadding);
  const safeHeight = Math.max(110, Math.floor(bottomLimit - topInset));
  return {
    left: 0,
    top: topInset,
    width: Math.max(120, Math.floor(area.width)),
    height: safeHeight,
  };
}

function resolveScrollOverflowForDesktopMaximize(winEl, content, rect, bounds, minW, minH){
  if(!winEl || !content || !rect) return rect;
  let candidate = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  for(let pass = 0; pass < 4; pass++){
    winEl.style.left = candidate.left + 'px';
    winEl.style.top = candidate.top + 'px';
    winEl.style.width = candidate.width + 'px';
    winEl.style.height = candidate.height + 'px';
    const overflowX = Math.max(0, Math.ceil(content.scrollWidth - content.clientWidth));
    const overflowY = Math.max(0, Math.ceil(content.scrollHeight - content.clientHeight));
    if(overflowX <= 1 && overflowY <= 1) break;
    const nextWidth = clamp(candidate.width + overflowX + 2, minW, bounds.maxWidth);
    const nextHeight = clamp(candidate.height + overflowY + 2, minH, bounds.maxHeight);
    const next = normalizeWindowRect({
      left: candidate.left,
      top: candidate.top,
      width: nextWidth,
      height: nextHeight,
    }, bounds.area, bounds.margin);
    if(next.width === candidate.width && next.height === candidate.height) break;
    candidate = next;
  }
  return candidate;
}

function smartFitWindow(winEl, mode = 'auto', opts = {}){
  const appId = winEl ? getWindowId(winEl) : null;
  const w = appId ? state.windows.get(appId) : null;
  const onDone = (typeof opts.onDone === 'function') ? opts.onDone : null;
  const finish = (rect)=>{
    const out = rect || getWindowRectFromState(w);
    if(onDone && out) onDone(out, { appId, wstate: w, mode });
    return out;
  };

  if(!winEl || winEl.classList.contains('hidden') || !appId || !w || appId === 'mediaplayer'){
    return Promise.resolve(finish(getWindowRectFromState(w)));
  }
  if(w.userSized && !['maximize','restore'].includes(mode)){
    return Promise.resolve(finish(getWindowRectFromState(w)));
  }
  if(state.isMobile && w.fit && mode !== 'restore'){
    return Promise.resolve(finish(getWindowRectFromState(w)));
  }
  if(winEl.classList.contains('mobile-game')){
    return Promise.resolve(finish(getWindowRectFromState(w)));
  }
  if(winEl.dataset.smartFitLock === '1' && w.smartFitPromise){
    return w.smartFitPromise.then(rect => finish(rect)).catch(()=> finish(getWindowRectFromState(w)));
  }
  const content = winEl.querySelector('.content');
  if(!content){
    return Promise.resolve(finish(getWindowRectFromState(w)));
  }

  const promise = new Promise(resolve => {
    winEl.dataset.smartFitLock = '1';
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const bounds = getSmartFitBounds();
        const desktopMaximizeMode = (mode === 'maximize' && !state.isMobile);
        const softMinW = Math.min(SMART_WINDOW.minWidth, bounds.maxWidth);
        const softMinH = Math.min(SMART_WINDOW.minHeight, bounds.maxHeight);
        const dataMinW = parseInt(content.dataset.fitMinW || '0', 10) || softMinW;
        const dataMinH = parseInt(content.dataset.fitMinH || '0', 10) || softMinH;
        const fitMinW = clamp(dataMinW, softMinW, bounds.maxWidth);
        const fitMinH = clamp(dataMinH, softMinH, bounds.maxHeight);
        let { targetW, targetH } = getWindowContentTargetSize(winEl, appId);
        if(!desktopMaximizeMode){
          ({ targetW, targetH } = applyNiceSquareish(targetW, targetH));
        }
        let width = Math.max(targetW, fitMinW);
        let height = Math.max(targetH, fitMinH);

        width = clamp(width, fitMinW, bounds.maxWidth);
        height = clamp(height, fitMinH, bounds.maxHeight);
        if(!desktopMaximizeMode){
          const ratio = width / Math.max(1, height);
          const inverse = 1 / SMART_WINDOW.ratio;
          if(ratio > SMART_WINDOW.ratio){
            width = Math.min(width, height * SMART_WINDOW.ratio);
          } else if(ratio < inverse){
            height = Math.min(height, width * SMART_WINDOW.ratio);
          }
        }
        width = clamp(width, fitMinW, bounds.maxWidth);
        height = clamp(height, fitMinH, bounds.maxHeight);

        let normalized = normalizeWindowRect({ left: w.left, top: w.top, width, height }, bounds.area, bounds.margin);
        const fitKey = content.dataset.fitKey || '';
        if(fitKey){
          if(!w.fitCache) w.fitCache = {};
          const cached = w.fitCache[fitKey];
          if(cached){
            normalized.width = Math.max(normalized.width, cached.width);
            normalized.height = Math.max(normalized.height, cached.height);
          }
          w.fitCache[fitKey] = { width: normalized.width, height: normalized.height };
          normalized = normalizeWindowRect({ left: normalized.left, top: normalized.top, width: normalized.width, height: normalized.height }, bounds.area, bounds.margin);
        }
        if(desktopMaximizeMode){
          normalized = resolveScrollOverflowForDesktopMaximize(winEl, content, normalized, bounds, fitMinW, fitMinH);
        }
        const widthDiff = Math.abs((w.width || 0) - normalized.width);
        const heightDiff = Math.abs((w.height || 0) - normalized.height);
        const leftDiff = Math.abs((w.left || 0) - normalized.left);
        const topDiff = Math.abs((w.top || 0) - normalized.top);
        if(widthDiff < SMART_WINDOW.threshold && heightDiff < SMART_WINDOW.threshold && leftDiff < SMART_WINDOW.threshold && topDiff < SMART_WINDOW.threshold){
          delete winEl.dataset.smartFitLock;
          resolve(finish(normalized));
          return;
        }
        assignWindowRect(winEl, w, normalized);
        w.lastSmartFit = { width: normalized.width, height: normalized.height, mode };
        delete winEl.dataset.smartFitLock;
        resolve(finish(normalized));
      });
    });
  });

  w.smartFitPromise = promise;
  return promise;
}

function getMediaPlayerRect(){
  const area = $('#desktopArea').getBoundingClientRect();
  const margin = state.isMobile ? 10 : 24;
  const maxWidth = Math.max(260, area.width - margin * 2);
  const maxHeight = Math.max(220, area.height - margin * 2);
  const targetWidth = state.isMobile
    ? Math.max(260, area.width - 12)
    : Math.max(860, Math.floor(area.width * 0.62));
  const targetHeight = state.isMobile
    ? Math.max(240, area.height - 18)
    : Math.max(520, Math.floor(area.height * 0.68));
  const width = clamp(targetWidth, state.isMobile ? 260 : 820, Math.min(maxWidth, state.isMobile ? maxWidth : 1150));
  const height = clamp(targetHeight, state.isMobile ? 240 : 480, Math.min(maxHeight, state.isMobile ? maxHeight : 640));
  const left = Math.round(clamp((area.width - width) / 2, 0, Math.max(0, area.width - width)));
  const top = Math.round(clamp((area.height - height) / 2, 0, Math.max(0, area.height - height)));
  return { left, top, width, height };
}

function getSeekerRect(areaRect = null){
  const area = areaRect || $('#desktopArea').getBoundingClientRect();
  const margin = state.isMobile ? 10 : 18;
  const maxWidth = Math.max(320, area.width - margin * 2);
  const maxHeight = Math.max(260, area.height - margin * 2);
  const targetWidth = state.isMobile
    ? Math.max(230, Math.floor(area.width * 0.82))
    : Math.max(980, Math.floor(area.width * 0.58));
  const targetHeight = state.isMobile
    ? Math.max(220, Math.floor(area.height * 0.50))
    : Math.max(700, Math.floor(area.height * 0.70));
  const width = clamp(
    targetWidth,
    state.isMobile ? 220 : 860,
    Math.min(maxWidth, state.isMobile ? maxWidth : 1380)
  );
  const height = clamp(
    targetHeight,
    state.isMobile ? 210 : 560,
    Math.min(maxHeight, state.isMobile ? maxHeight : 920)
  );
  const left = Math.round(clamp((area.width - width) / 2, margin, Math.max(margin, area.width - width - margin)));
  const topSeed = state.isMobile ? ((area.height - height) / 2) : ((area.height - height) / 2 - 10);
  const top = Math.round(clamp(topSeed, margin, Math.max(margin, area.height - height - margin)));
  return { left, top, width, height };
}

function applySeekerMinimumRect(rect, areaRect = null){
  if(!rect) return rect;
  const area = areaRect || $('#desktopArea').getBoundingClientRect();
  const preferred = getSeekerRect(area);
  const minWidth = Math.min(preferred.width, Math.max(760, Math.floor(area.width * 0.46)));
  const minHeight = Math.min(preferred.height, Math.max(500, Math.floor(area.height * 0.50)));
  return {
    ...rect,
    width: Math.max(rect.width, minWidth),
    height: Math.max(rect.height, minHeight),
  };
}

function getViewportRectForWindow(appId){
  const w = state.windows.get(appId);
  if(!w) return null;
  const area = $('#desktopArea').getBoundingClientRect();
  return {
    left: area.left + w.left,
    top: area.top + w.top,
    width: w.width,
    height: w.height,
  };
}

function waitForSmartFitCompletion(appId){
  const w = state.windows.get(appId);
  if(!w) return Promise.resolve(null);
  const fallback = getViewportRectForWindow(appId);
  return new Promise(resolve => {
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const latest = w.smartFitPromise || Promise.resolve(getWindowRectFromState(w));
        Promise.resolve(latest)
          .then(()=> resolve(getViewportRectForWindow(appId) || fallback))
          .catch(()=> resolve(fallback));
      });
    });
  });
}

let windowRelayoutRaf = null;
function relayoutWindowsToViewport(){
  const area = $('#desktopArea');
  if(!area) return;
  const bounds = getSmartFitBounds();
  state.windows.forEach((w, appId) => {
    if(!w) return;
    const winEl = document.getElementById(`win_${appId}`);
    if(!winEl || winEl.classList.contains('mobile-game')) return;

    if(w.fit && !w.minimized && !winEl.classList.contains('hidden')){
      if(state.isMobile){
        assignWindowRect(winEl, w, getMobileMaximizedRect());
      } else {
        smartFitWindow(winEl, 'maximize').catch(()=>{});
      }
      return;
    }

    const normalized = normalizeWindowRect({
      left: w.left,
      top: w.top,
      width: w.width,
      height: w.height,
    }, bounds.area, bounds.margin);
    w.left = normalized.left;
    w.top = normalized.top;
    w.width = normalized.width;
    w.height = normalized.height;
    if(!winEl.classList.contains('hidden')){
      winEl.style.left = normalized.left + 'px';
      winEl.style.top = normalized.top + 'px';
      winEl.style.width = normalized.width + 'px';
      winEl.style.height = normalized.height + 'px';
    }
  });
}

function scheduleWindowRelayout(){
  if(windowRelayoutRaf) return;
  windowRelayoutRaf = requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      windowRelayoutRaf = null;
      relayoutWindowsToViewport();
    });
  });
}

function revealWindowElement(winEl, wstate, opts = {}){
  if(!winEl || !wstate) return;
  const skipAnim = !!opts.skipAnim || !!wstate.skipAnimOpen || !state.animations || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  wstate.deferReveal = false;
  winEl.style.visibility = 'visible';
  if(skipAnim){
    winEl.classList.remove('anim-open');
    return;
  }
  winEl.addEventListener('animationend', ()=>{ winEl.classList.remove('anim-open'); }, { once:true });
}

function revealWindow(appId, opts = {}){
  const winEl = document.getElementById(`win_${appId}`);
  const wstate = state.windows.get(appId);
  if(!winEl || !wstate) return;
  revealWindowElement(winEl, wstate, opts);
  if(opts.renderTasks) renderTaskButtons();
  if(opts.focus) focusWindow(appId);
}

const appOpenAnimState = {
  overlay: null,
  animation: null,
  token: 0,
  appId: null,
};

function cancelAppOpenAnimation(opts = {}){
  const pendingAppId = appOpenAnimState.appId;
  if(appOpenAnimState.animation){
    try{ appOpenAnimState.animation.cancel(); } catch {}
  }
  if(appOpenAnimState.overlay){
    appOpenAnimState.overlay.remove();
  }
  appOpenAnimState.overlay = null;
  appOpenAnimState.animation = null;
  appOpenAnimState.appId = null;
  if(opts.revealPending && pendingAppId && state.windows.has(pendingAppId)){
    revealWindow(pendingAppId, { skipAnim: true, renderTasks: true });
  }
}

function animateAppOpenFromIcon(iconEl, targetRect, onDone, appId){
  if(!iconEl || !targetRect){
    if(typeof onDone === 'function') onDone();
    return;
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion){
    if(typeof onDone === 'function') onDone();
    return;
  }
  cancelAppOpenAnimation({ revealPending: true });
  const startRect = iconEl.getBoundingClientRect();
  if(!startRect.width || !startRect.height){
    if(typeof onDone === 'function') onDone();
    return;
  }

  const overlay = document.createElement('div');
  overlay.className = 'app-open-selection';
  overlay.style.left = `${startRect.left}px`;
  overlay.style.top = `${startRect.top}px`;
  overlay.style.width = `${startRect.width}px`;
  overlay.style.height = `${startRect.height}px`;
  document.body.appendChild(overlay);

  const token = ++appOpenAnimState.token;
  appOpenAnimState.overlay = overlay;
  appOpenAnimState.appId = appId || null;

  const duration = state.isMobile ? 240 : 210;
  const easing = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  let animation = null;
  try{
    animation = overlay.animate([
      { left: `${startRect.left}px`, top: `${startRect.top}px`, width: `${startRect.width}px`, height: `${startRect.height}px`, opacity: 0.95 },
      { left: `${targetRect.left}px`, top: `${targetRect.top}px`, width: `${targetRect.width}px`, height: `${targetRect.height}px`, opacity: 1 }
    ], { duration, easing, fill: 'forwards' });
  } catch {}

  const finish = ()=>{
    if(token !== appOpenAnimState.token) return;
    cancelAppOpenAnimation();
    if(typeof onDone === 'function') onDone();
  };

  if(animation){
    appOpenAnimState.animation = animation;
    animation.addEventListener('finish', finish, { once: true });
    animation.addEventListener('cancel', finish, { once: true });
  } else {
    overlay.style.transition = `all ${duration}ms ${easing}`;
    requestAnimationFrame(()=>{
      overlay.style.left = `${targetRect.left}px`;
      overlay.style.top = `${targetRect.top}px`;
      overlay.style.width = `${targetRect.width}px`;
      overlay.style.height = `${targetRect.height}px`;
    });
    window.setTimeout(finish, duration + 30);
  }
}

      function animateAppLaunch(iconEl, winEl){
        if (!iconEl || !winEl) return;
        // Capture the final geometry before hiding the window
        const finalRect = winEl.getBoundingClientRect();
        // Hide the real window until the animation finishes
        const prevVisibility = winEl.style.visibility;
        winEl.style.visibility = 'hidden';
        // Starting geometry from the icon
        const startRect = iconEl.getBoundingClientRect();
        const ghost = document.createElement('div');
        ghost.className = 'dock-genie-ghost';
        const winStyle = window.getComputedStyle(winEl);
        // Use the window's background colour for the ghost or fall back to the panel background
        ghost.style.background = winStyle.backgroundColor || getComputedStyle(document.documentElement).getPropertyValue('--panel-bg') || '#fff';
        ghost.style.borderRadius = winStyle.borderRadius || '4px';
        ghost.style.left = `${startRect.left}px`;
        ghost.style.top = `${startRect.top}px`;
        ghost.style.width = `${startRect.width}px`;
        ghost.style.height = `${startRect.height}px`;
        ghost.style.transformOrigin = 'top left';
        document.body.appendChild(ghost);
        const dx = finalRect.left - startRect.left;
        const dy = finalRect.top - startRect.top;
        const scaleX = finalRect.width / startRect.width;
        const scaleY = finalRect.height / startRect.height;
        const duration = 280; // Snappy duration for a quick feel
        const keyframes = [
          { transform:'translate(0px,0px) scale(1,1)', clipPath:'inset(0% 0% 0% 0%)' },
          { transform:`translate(${dx*0.5}px,${dy*0.5}px) scale(${(1+scaleX)/2},${(1+scaleY)/2})`, clipPath:'inset(10% 10% 10% 10%)' },
          { transform:`translate(${dx}px,${dy}px) scale(${scaleX},${scaleY})`, clipPath:'inset(0% 0% 0% 0%)' }
        ];
        const anim = ghost.animate(keyframes,{ duration: duration, easing:'ease-in-out', fill:'forwards' });
        anim.addEventListener('finish', () => {
          ghost.remove();
          winEl.style.visibility = prevVisibility || '';
        });
      }

      function openApp(appId, opts = {}){
        const app = APPS.find(a=>a.id===appId);
        if(!app) return null;
        if(appId === 'trash'){
          if(state.windows.has('trash')) closeApp('trash');
          if(typeof openSeekerSection === 'function'){
            return openSeekerSection('trash', opts);
          }
          return openApp('seeker', opts);
        }
        if(appId !== 'seeker' && typeof rememberSeekerRecent === 'function'){
          rememberSeekerRecent({ kind:'app', id:appId });
        }
        const deferReveal = !!opts.deferReveal;

        if(state.windows.has(appId)){
          const w = state.windows.get(appId);
          w.minimized = false;
          const el = document.getElementById(`win_${appId}`);
          if(el){
            el.classList.remove('hidden');
            if(el.style.visibility === 'hidden') revealWindow(appId, { skipAnim: true });
          }
          focusWindowAndRefreshTaskbar(appId);
          return el;
        }

        playSfx('fileOpen');

        let rect = defaultWindowRect();
        const area = $('#desktopArea').getBoundingClientRect();
        const mobileDopeSkate = appId === 'dope-skate' && typeof isMobileGameMode === 'function' && isMobileGameMode();
        const savedRectRaw = (appId === 'about' || appId === 'dope-skate') ? null : getSavedWindowRect(appId);
        const savedRect = (appId === 'seeker' && savedRectRaw)
          ? applySeekerMinimumRect(savedRectRaw, area)
          : savedRectRaw;
        if(mobileDopeSkate){
          rect = normalizeWindowRect({
            left: 0,
            top: 0,
            width: Math.max(240, Math.floor(area.width)),
            height: Math.max(200, Math.floor(area.height)),
          }, area, 0);
        } else if(appId === 'mediaplayer'){
          rect = normalizeWindowRect(getMediaPlayerRect(), area, 16);
        } else if(appId === 'seeker' && !savedRect){
          rect = normalizeWindowRect(getSeekerRect(area), area, 16);
        } else if(savedRect){
          rect = normalizeWindowRect(savedRect, area, 16);
        } else {
          rect = normalizeWindowRect(rect, area, 16);
        }
        const iconFile = typeof app.iconFile === 'function' ? app.iconFile() : app.iconFile;
        const wstate = {
          id: appId,
          title: getIconLabel(app),
          titleKey: app.titleKey,
          icon: app.icon,
          iconFile: iconFile || null,
          minimized: false,
          fit: false,
          prevRect: null,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          z: ++state.zTop,
          savedRect: Boolean(savedRect),
          userSized: appId === 'mediaplayer',
          autoFitObserver: null,
          lastFitKey: '',
          lastFitW: 0,
          lastFitH: 0,
          fitCache: null,
          lastSmartFit: null,
          mediaplayerFixed: appId === 'mediaplayer',
          deferReveal,
          skipAnimOpen: !!opts.skipAnimOpen,
          smartFitPromise: Promise.resolve(getWindowRectFromState({ left: rect.left, top: rect.top, width: rect.width, height: rect.height })),
        };
        state.windows.set(appId, wstate);
        createWindowElement(wstate);
        const winEl = document.getElementById(`win_${appId}`);
        if(!deferReveal){
          focusWindowAndRefreshTaskbar(appId);
        }
        
        // Apply launch animation if enabled
        if(!deferReveal && winEl && state.animations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          const iconEl = document.querySelector(`[data-app-id="${appId}"]`) || document.querySelector(`[data-blissos-open-app="${appId}"]`);
          animateAppLaunch(iconEl, winEl);
        }
        return winEl;
      }

      function closeApp(appId){
        const w = state.windows.get(appId);
        if(!w) return;
        playSfx('windowClose');
        
        // Cleanup: wrap in try...catch to ensure window closes even if cleanup fails
        try {
          if(appId === 'games'){
            snakeStop();
            if(state.games.view === 'dope-skate'){
              DopeSkateGame.unmount();
            }
            state.games.view = 'list';
            state.games.selectedId = null;
          } else if(appId === 'dope-skate'){
            DopeSkateGame.unmount();
          }
        } catch(err){
          console.error('Error during game cleanup:', err);
        }
        if(w.txtSaveTimer){
          clearTimeout(w.txtSaveTimer);
          w.txtSaveTimer = null;
        }
        
        state.windows.delete(appId);
        const el = document.getElementById(`win_${appId}`);
        
        try {
          if(w.autoFitObserver) w.autoFitObserver.disconnect();
        } catch(err){
          console.error('Error disconnecting autoFitObserver:', err);
        }
        try{
          if(w.txtResizeObserver) w.txtResizeObserver.disconnect();
        } catch(err){
          console.error('Error disconnecting txtResizeObserver:', err);
        }
        
        if(state.activeWindowId === appId) state.activeWindowId = null;
        if(state.activeAppId === appId) state.activeAppId = 'bliss';
        renderTaskButtons();
        
        if(el){
          if(state.animations){
            el.classList.add('anim-close');
            el.addEventListener('animationend', ()=>{ el.remove(); }, { once:true });
          } else {
            el.remove();
          }
        }
        updateBlissOSActiveApp();
      }
      function minimizeApp(appId){
        const w = state.windows.get(appId);
        if(!w) return;
        playSfx('windowMinimize');
        // BlissOS specific minimise: use genie animation to dock
        // Use state.settings.theme rather than checking the DOM attribute, as
        // the body may not yet have the data-theme attribute applied when
        // this function runs. The BlissOS theme is stored in state.settings.theme.
        if(state && state.settings && state.settings.theme === 'blissos'){
          minimizeToDock(appId);
          return;
        }
        w.minimized = true;
        const el = document.getElementById(`win_${appId}`);
        if(el){
          if(shouldReduceMotion()){
            el.classList.add('hidden');
          } else {
            animateWindowToTaskbar(el, appId).then(()=>{
              if(w.minimized) el.classList.add('hidden');
            });
          }
        }
        if(state.activeWindowId === appId) state.activeWindowId = null;
        if(state.activeAppId === appId) state.activeAppId = 'bliss';
        renderTaskButtons();
        updateBlissOSActiveApp();
      }

      function getWindowContentTargetSize(winEl, appId){
  if(!winEl) return { targetW: 500, targetH: 500 };

  const content = winEl.querySelector('.content');
  if(!content) return { targetW: 500, targetH: 500 };

  const frameRect = winEl.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  
  const extraW = frameRect.width - contentRect.width;
  const extraH = frameRect.height - contentRect.height;

  let intrinsicW = 0;
  let intrinsicH = 0;

  // Check for direct child with explicit size
  if (content.firstElementChild) {
    const child = content.firstElementChild;
    const style = getComputedStyle(child);
    if (style.width !== 'auto' && style.width.endsWith('px')) {
      intrinsicW = Math.max(intrinsicW, child.scrollWidth);
    }
     if (style.height !== 'auto' && style.height.endsWith('px')) {
      intrinsicH = Math.max(intrinsicH, child.scrollHeight);
    }
  }

  intrinsicW = Math.max(intrinsicW, content.scrollWidth);
  intrinsicH = Math.max(intrinsicH, content.scrollHeight);

  // Respect minimum dimensions from data attributes
  const minW = parseInt(content.dataset.fitMinW || '0', 10);
  const minH = parseInt(content.dataset.fitMinH || '0', 10);
  
  let targetW = Math.max(intrinsicW, minW) + extraW;
  let targetH = Math.max(intrinsicH, minH) + extraH;

  return { targetW, targetH };
}

function applyNiceSquareish(targetW, targetH, opts = {}){
  const { maxAspect = 1.3, maxGrowth = 1.25 } = opts;
  const aspect = targetW / targetH;

  if(aspect > maxAspect){
    const newH = Math.ceil(targetW / maxAspect);
    if(newH <= targetH * maxGrowth){
      targetH = newH;
    }
  } else if((1/aspect) > maxAspect){
    const newW = Math.ceil(targetH / maxAspect);
    if(newW <= targetW * maxGrowth){
      targetW = newW;
    }
  }
  return { targetW, targetH };
}

function suppressNextSyntheticClick(){
  let cleaned = false;
  let timerId = null;
  const cleanup = ()=>{
    if(cleaned) return;
    cleaned = true;
    document.removeEventListener('click', onClickCapture, true);
    if(timerId){
      clearTimeout(timerId);
      timerId = null;
    }
  };
  const onClickCapture = (e)=>{
    cleanup();
    e.preventDefault();
    e.stopPropagation();
    if(typeof e.stopImmediatePropagation === 'function'){
      e.stopImmediatePropagation();
    }
  };
  document.addEventListener('click', onClickCapture, true);
  timerId = setTimeout(cleanup, 450);
}

function toggleFitWindow(appId) {
  const w = state.windows.get(appId);
  if(!w) return;
  const winEl = document.getElementById(`win_${appId}`);
  if(!winEl) return;
  const btn = winEl.querySelector('.wctl[data-action="max"]');
  const fromRect = winEl.getBoundingClientRect();
  const allowGenie = state.settings.theme !== 'blissos' && !shouldReduceMotion();
  const fitDuration = state.isMobile ? Math.round(TASKBAR_GENIE.duration * 0.85) : TASKBAR_GENIE.duration;

  // Desktop maximize is idempotent: repeated clicks keep fitting to content and never restore old rect.
  if(!state.isMobile){
    w.fit = true;
    w.prevRect = null;
    winEl.classList.add('fit');
    if(btn) btn.textContent = '❐';
    smartFitWindow(winEl, 'maximize').then(()=>{
      if(!allowGenie) return;
      const toRect = winEl.getBoundingClientRect();
      if(Math.abs(toRect.width - fromRect.width) > 1 || Math.abs(toRect.height - fromRect.height) > 1 || Math.abs(toRect.left - fromRect.left) > 1 || Math.abs(toRect.top - fromRect.top) > 1){
        animateWindowRectTransition(winEl, fromRect, toRect, { duration: fitDuration });
      }
    });
    return;
  }

  if(w.fit){
    w.fit = false;
    winEl.classList.remove('fit');
    if(btn) btn.textContent = '□';
    let restorePromise = null;
    if(w.prevRect){
      const area = $('#desktopArea').getBoundingClientRect();
      const restored = normalizeWindowRect(w.prevRect, area, 16);
      assignWindowRect(winEl, w, restored);
      w.prevRect = null;
      restorePromise = Promise.resolve(restored);
    } else {
      restorePromise = smartFitWindow(winEl, 'restore');
    }
    restorePromise.then(()=>{
      if(!allowGenie) return;
      const toRect = winEl.getBoundingClientRect();
      if(Math.abs(toRect.width - fromRect.width) > 1 || Math.abs(toRect.height - fromRect.height) > 1 || Math.abs(toRect.left - fromRect.left) > 1 || Math.abs(toRect.top - fromRect.top) > 1){
        animateWindowRectTransition(winEl, fromRect, toRect, { duration: fitDuration });
      }
    });
    return;
  }

  w.prevRect = { left: w.left, top: w.top, width: w.width, height: w.height };
  w.fit = true;
  winEl.classList.add('fit');
  if(btn) btn.textContent = '❐';
  Promise.resolve().then(()=>{
    const rect = getMobileMaximizedRect();
    assignWindowRect(winEl, w, rect);
    return rect;
  }).then(()=>{
    if(!allowGenie) return;
    const toRect = winEl.getBoundingClientRect();
    if(Math.abs(toRect.width - fromRect.width) > 1 || Math.abs(toRect.height - fromRect.height) > 1 || Math.abs(toRect.left - fromRect.left) > 1 || Math.abs(toRect.top - fromRect.top) > 1){
      animateWindowRectTransition(winEl, fromRect, toRect, { duration: fitDuration });
    }
  });
}


      function focusWindow(appId) {
        if (!state.windows.has(appId)) return;
        const w = state.windows.get(appId);
        const winEl = document.getElementById('win_' + appId);
        
        if (!winEl) return;

        // CORREÇÃO DO BUG MOBILE:
        // Só move o elemento no DOM se ele NÃO for o último.
        // Isso impede que o navegador cancele o evento de 'click' no primeiro toque.
        if (winEl.nextElementSibling) {
            winEl.parentNode.appendChild(winEl);
        }

        w.z = ++state.zTop;
        winEl.style.zIndex = w.z;

        const prevActiveId = state.activeWindowId;
        if(prevActiveId && prevActiveId !== appId){
          const prevWin = document.getElementById('win_' + prevActiveId);
          if(prevWin) prevWin.classList.remove('active');
          const prevTask = document.getElementById('task_' + prevActiveId) || document.querySelector(`[data-task-id="${prevActiveId}"]`);
          if(prevTask) prevTask.classList.remove('pressed', 'active');
        }
        document.querySelectorAll('.window.active').forEach(el => {
          if(el !== winEl) el.classList.remove('active');
        });
        document.querySelectorAll('.task-item.active').forEach(t => t.classList.remove('active'));
        winEl.classList.add('active');
        
        // Atualiza Taskbar
        const taskItem = document.getElementById('task_' + appId) || document.querySelector(`[data-task-id="${appId}"]`);
        document.querySelectorAll('.task-item.pressed').forEach(t => {
          if(t !== taskItem) t.classList.remove('pressed');
        });
        if (taskItem) taskItem.classList.add('pressed');

        state.activeWindowId = appId;
        
        // BlissOS: atualizar app ativo no menu bar
        updateBlissOSActiveApp();
        closeBlissOSAppMenu();
      }

      function focusWindowAndRefreshTaskbar(appId){
        focusWindow(appId);
        renderTaskButtons();
      }

      function createWindowElement(wstate){
        const appId = wstate.id;
        const el = document.createElement('div');
        el.className = 'window';
        if(wstate.kind) el.classList.add(`win-${wstate.kind}`);
        el.id = `win_${appId}`;
        el.style.left = wstate.left + 'px';
        el.style.top = wstate.top + 'px';
        el.style.width = wstate.width + 'px';
        el.style.height = wstate.height + 'px';
        el.style.zIndex = String(wstate.z);
        el.style.visibility = 'hidden';
        if(state.animations && !wstate.skipAnimOpen) el.classList.add('anim-open');

        const bodyHTML = typeof wstate.contentHTML === 'function'
          ? wstate.contentHTML()
          : (CONTENT[appId] ? CONTENT[appId]() : `<h2>${wstate.title}</h2><p>Sem conteúdo.</p>`);

        el.innerHTML = `
          <div class="frame bevel">
            <div class="titlebar" data-drag="1">
              <div class="title-left">
                <span class="win-title-icon" data-win-title-icon="1" style="width:16px;height:16px;display:inline-flex;">${getThemedIconHtml(wstate, wstate.title, 16)}</span>
                <strong>${wstate.title}</strong>
              </div>
              <div class="title-controls">
                <div class="wctl bevel" title="${t('win.minimize')}" data-action="min">_</div>
                <div class="wctl bevel" title="${t('win.maximize')}" data-action="max">&#x25A1;</div>
                <div class="wctl bevel" title="${t('win.close')}" data-action="close">×</div>
              </div>
            </div>
            ${appId === 'trash'
              ? `<div class="trash-actions">
                  <button class="btn bevel" type="button" data-trash-action="empty">${t('dialog.trash.emptyAction')}</button>
                </div>`
              : `<div class="menubar">
                  <span data-menu="file" data-i18n="menubar.file">${t('menubar.file')}</span>
                  <span data-menu="edit" data-i18n="menubar.edit">${t('menubar.edit')}</span>
                  <span data-menu="view" data-i18n="menubar.view">${t('menubar.view')}</span>
                  <span data-menu="help" data-i18n="menubar.help">${t('menubar.help')}</span>
                </div>
                <div class="menu-drop hidden"></div>`}
            <div class="content">${bodyHTML}</div>
            <div class="statusbar">
              <span data-i18n="status.ready">${t('status.ready')}</span>
              <span class="status-center" data-i18n="about.footer">${t('about.footer')}</span>
              <span>BLISS 98</span>
            </div>
          </div>
          <div class="resize" title="${t('win.resize')}"></div>
        `;

        if(appId === 'about'){
          const aboutContent = el.querySelector('.content');
          if(aboutContent){
            aboutContent.dataset.fitMinW = state.isMobile ? '280' : '360';
            aboutContent.dataset.fitMinH = state.isMobile ? '340' : '420';
            aboutContent.dataset.fitKey = `about-${state.isMobile ? 'mobile' : 'desktop'}`;
          }
        }
        if(appId === 'seeker'){
          const seekerContent = el.querySelector('.content');
          if(seekerContent){
            seekerContent.dataset.fitMinW = state.isMobile ? '220' : '980';
            seekerContent.dataset.fitMinH = state.isMobile ? '210' : '700';
            seekerContent.dataset.fitKey = `seeker-${state.isMobile ? 'mobile' : 'desktop'}`;
          }
        }
        if(wstate.kind === 'txt'){
          const txtContent = el.querySelector('.content');
          if(txtContent){
            txtContent.dataset.fitMinW = state.isMobile ? '320' : '580';
            txtContent.dataset.fitMinH = state.isMobile ? '240' : '390';
            txtContent.dataset.fitKey = `txt-${state.isMobile ? 'mobile' : 'desktop'}`;
          }
        }
        if(appId === 'mediaplayer'){
          const nativeTitlebar = el.querySelector('.frame > .titlebar[data-drag="1"]');
          if(nativeTitlebar) nativeTitlebar.removeAttribute('data-drag');
        }

        // Make windows focus on mousedown except when clicking on a control button (min/max/close).
        // On touch devices the first tap should trigger the action without requiring a second tap.
        el.addEventListener('pointerdown', (e)=>{
          const actTarget = getEventTargetEl(e);
          // If the target element has a data-action (control buttons), defer focusing until the click handler.
          if(actTarget && actTarget.dataset && actTarget.dataset.action) return;
          e.stopPropagation();
          focusWindow(appId);
          closeStartMenu();
        });
        el.addEventListener('contextmenu', (e)=>{
          e.preventDefault();
          e.stopPropagation();
        });
        el.addEventListener('click', (e)=>{
          const actTarget = getEventTargetEl(e);
          const act = actTarget ? actTarget.dataset?.action : null;
          if(!act) return;
          if(el.dataset.touchActionHandled === '1'){
            delete el.dataset.touchActionHandled;
            return;
          }
          e.stopPropagation();
          // Always bring the window to the front when clicking a control.
          focusWindow(appId);
          closeStartMenu();
          if(act==='close') closeApp(appId);
          if(act==='min') minimizeApp(appId);
          if(act==='max') toggleFitWindow(appId);
        });
        el.addEventListener('pointerup', (e)=>{
          if(e.pointerType !== 'touch') return;
          const actTarget = getEventTargetEl(e);
          const act = actTarget ? actTarget.dataset?.action : null;
          if(!act) return;
          e.preventDefault();
          e.stopPropagation();
          suppressNextSyntheticClick();
          el.dataset.touchActionHandled = '1';
          focusWindow(appId);
          closeStartMenu();
          if(act==='close') closeApp(appId);
          if(act==='min') minimizeApp(appId);
          if(act==='max') toggleFitWindow(appId);
        });

        makeDraggable(el, appId);
        if(appId !== 'mediaplayer'){
          makeResizable(el, appId);
        } else {
          const resizeHandle = el.querySelector('.resize');
          if(resizeHandle) resizeHandle.style.display = 'none';
        }

        if(appId === 'mediaplayer') { setTimeout(mpInitInWindow, 0); }
        if(appId === 'trash') { updateTrashIconUI(); }
        if(appId === 'clothes') { setTimeout(()=>initClothesWindow(el), 0); }
        if(appId === 'settings') {
          setTimeout(()=>{
            initSettingsTabs(el);
            applySettingsIcons(el);
          }, 0);
        }
        if(appId === 'games') { setTimeout(()=>initGamesWindow(el), 0); }
        if(appId === 'dope-skate') { setTimeout(()=>initDopeSkateWindow(el), 0); }
        if(appId === 'videos') { setTimeout(()=>initVideosWindow(el), 0); }
        if(appId === 'seeker') { setTimeout(()=>initSeekerWindow(el), 0); }
        if(wstate.kind === 'txt') { setTimeout(()=>renderTxtFileWindow(appId), 0); }

        $('#windows').appendChild(el);
        applyI18nTo(el);
        applyWindowState(el, appId);
        if(wstate.kind === 'txt'){
          const txtShell = el.querySelector('[data-txt-shell="1"]');
          if(txtShell) updateTxtShellResponsive(txtShell);
        }
        
        // Auto-fit after content + i18n and keep correcting only when overflow appears.
        const skipOpenAutoFit = appId === 'dope-skate' && typeof isMobileGameMode === 'function' && isMobileGameMode();
        const preferOverflowOnlyOpenFit = wstate.kind === 'txt';
        if(!skipOpenAutoFit){
          installAutoFitObserver(el, appId);
        }
        let fitPromise = Promise.resolve(getWindowRectFromState(wstate));
        if(!wstate.savedRect && !skipOpenAutoFit && !preferOverflowOnlyOpenFit){
          fitPromise = smartFitWindow(el, 'open');
        } else {
          // Saved rects can become stale after UI changes (new bars/buttons/text scale).
          fitPromise = skipOpenAutoFit
            ? Promise.resolve(getWindowRectFromState(wstate))
            : scheduleOverflowFitPasses(el, 'tabChange', [0, 180, 260]);
        }
        wstate.smartFitPromise = fitPromise.catch(()=> getWindowRectFromState(wstate));
        
        if(!wstate.deferReveal){
          revealWindowElement(el, wstate);
        }
        if(appId === 'trash') updateTrashIconUI();
      }

      function makeDraggable(winEl, appId){
        const titlebar = winEl.querySelector('[data-drag="1"]');
        if(!titlebar) return;

        let dragging = false;
        let pointerId = null;
        let startX = 0, startY = 0, startL = 0, startT = 0;

        const onPointerDown = (e)=>{
          // Ignore non-primary mouse buttons
          if(e.pointerType === 'mouse' && e.button !== 0) return;
          const dragTarget = getEventTargetEl(e);
          // Ignore clicks on window control buttons
          if(dragTarget && dragTarget.dataset && dragTarget.dataset.action) return;

          e.preventDefault();
          dragging = true;
          document.body.classList.add('dragging');
          pointerId = e.pointerId;

          // Focus window when starting drag
          try{ focusWindow(appId); } catch {}

          const rect = winEl.getBoundingClientRect();
          startX = e.clientX;
          startY = e.clientY;
          startL = rect.left;
          startT = rect.top;

          // Capture pointer so drag continues even if the finger leaves the titlebar
          try{ titlebar.setPointerCapture(pointerId); } catch {}

          titlebar.addEventListener('pointermove', onPointerMove);
          titlebar.addEventListener('pointerup', onPointerUp);
          titlebar.addEventListener('pointercancel', onPointerUp);
        };

        const onPointerMove = (e)=>{
          if(!dragging) return;
          if(pointerId !== null && e.pointerId !== pointerId) return;

          e.preventDefault();

          const area = $('#desktopArea').getBoundingClientRect();
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          const newL = clamp(startL + dx - area.left, 0, area.width - 80);
          const newT = clamp(startT + dy - area.top, 0, area.height - 60);

          winEl.style.left = newL + 'px';
          winEl.style.top = newT + 'px';

          const w = state.windows.get(appId);
          if(w){ w.left = newL; w.top = newT; }
        };

        const onPointerUp = (e)=>{
          if(pointerId !== null && e.pointerId !== pointerId) return;

          dragging = false;
          pointerId = null;
          document.body.classList.remove('dragging');

          try{ titlebar.releasePointerCapture(e.pointerId); } catch {}

          titlebar.removeEventListener('pointermove', onPointerMove);
          titlebar.removeEventListener('pointerup', onPointerUp);
          titlebar.removeEventListener('pointercancel', onPointerUp);
        };

        // Pointer events handle mouse + touch + pen
        titlebar.addEventListener('pointerdown', onPointerDown);
      }

      function makeResizable(winEl, appId){
        const handle = winEl.querySelector('.resize');
        const EDGE = 6; // px
        const TOUCH_EDGE = 12; // px

        let resizing = false;
        let pointerId = null;
        let startX = 0, startY = 0;
        let startW = 0, startH = 0;
        let startL = 0, startT = 0;
        let dir = '';

        function getDir(clientX, clientY, edge = EDGE){
          const r = winEl.getBoundingClientRect();
          const left = (clientX - r.left) <= edge;
          const right = (r.right - clientX) <= edge;
          const top = (clientY - r.top) <= edge;
          const bottom = (r.bottom - clientY) <= edge;

          let d = '';
          if(top) d += 'n';
          else if(bottom) d += 's';
          if(left) d += 'w';
          else if(right) d += 'e';
          return d;
        }

        function cursorFor(d){
          if(d === 'n' || d === 's') return 'ns-resize';
          if(d === 'e' || d === 'w') return 'ew-resize';
          if(d === 'ne' || d === 'sw') return 'nesw-resize';
          if(d === 'nw' || d === 'se') return 'nwse-resize';
          return '';
        }

        function beginResize(e, resizeDir){
          if(e.pointerType === 'mouse' && e.button !== 0) return;
          e.preventDefault();

          resizing = true;
          pointerId = e.pointerId;
          dir = resizeDir;
          document.body.classList.add('dragging');
          const w = state.windows.get(appId);
          if(w && w.fit){
            w.fit = false;
            w.prevRect = null;
            winEl.classList.remove('fit');
            const btn = winEl.querySelector('.wctl[data-action="max"]');
            if(btn) btn.textContent = '□';
          }

          const rect = winEl.getBoundingClientRect();
          startX = e.clientX;
          startY = e.clientY;
          startW = rect.width;
          startH = rect.height;
          startL = rect.left;
          startT = rect.top;

          try{ winEl.setPointerCapture(pointerId); } catch {}

          winEl.addEventListener('pointermove', onPointerMove);
          winEl.addEventListener('pointerup', onPointerUp);
          winEl.addEventListener('pointercancel', onPointerUp);
        }

        function onPointerMove(e){
          if(!resizing) return;
          if(pointerId !== null && e.pointerId !== pointerId) return;
          e.preventDefault();

          const area = $('#desktopArea').getBoundingClientRect();
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;

          const winState = state.windows.get(appId);
          const isTxtWindow = !!winState && winState.kind === 'txt';
          const MIN_W = state.isMobile ? 240 : (isTxtWindow ? 540 : 280);
          const MIN_H = state.isMobile ? 180 : (isTxtWindow ? 220 : 200);
          const areaW = Math.max(0, area.width);
          const areaH = Math.max(0, area.height);
          const startLRel = startL - area.left;
          const startTRel = startT - area.top;
          const minW = Math.max(120, Math.min(MIN_W, areaW));
          const minH = Math.max(110, Math.min(MIN_H, areaH));

          let newW = startW;
          let newH = startH;
          let newL = startLRel;
          let newT = startTRel;

          if(dir.includes('e')){
            const maxW = Math.max(minW, areaW - newL);
            newW = clamp(startW + dx, minW, maxW);
          }
          if(dir.includes('s')){
            const maxH = Math.max(minH, areaH - newT);
            newH = clamp(startH + dy, minH, maxH);
          }

          if(dir.includes('w')){
            const maxL = Math.max(0, startLRel + startW - minW);
            newL = clamp(startLRel + dx, 0, maxL);
            newW = startW + (startLRel - newL);
          }
          if(dir.includes('n')){
            const maxT = Math.max(0, startTRel + startH - minH);
            newT = clamp(startTRel + dy, 0, maxT);
            newH = startH + (startTRel - newT);
          }

          newL = clamp(newL, 0, Math.max(0, areaW - minW));
          newT = clamp(newT, 0, Math.max(0, areaH - minH));
          newW = clamp(newW, minW, Math.max(minW, areaW - newL));
          newH = clamp(newH, minH, Math.max(minH, areaH - newT));

          winEl.style.width = newW + 'px';
          winEl.style.height = newH + 'px';
          winEl.style.left = newL + 'px';
          winEl.style.top = newT + 'px';

          const w = state.windows.get(appId);
          if(w){
            w.width = newW;
            w.height = newH;
            w.left = newL;
            w.top = newT;
          }
        }

        function onPointerUp(e){
          if(pointerId !== null && e.pointerId !== pointerId) return;
          resizing = false;
          pointerId = null;
          dir = '';
          document.body.classList.remove('dragging');

          try{ winEl.releasePointerCapture(e.pointerId); } catch {}

          winEl.removeEventListener('pointermove', onPointerMove);
          winEl.removeEventListener('pointerup', onPointerUp);
          winEl.removeEventListener('pointercancel', onPointerUp);
          const w = state.windows.get(appId);
          if(w) w.userSized = true;
        }

        // Mouse hover cursor change near edges
        winEl.addEventListener('mousemove', (e)=>{
          if(resizing) return;
          // don't override cursor on controls/titlebar
          const cursorTarget = getEventTargetEl(e);
          if(cursorTarget && cursorTarget.closest && (cursorTarget.closest('.titlebar') || cursorTarget.closest('.wctl'))) return;
          const d = getDir(e.clientX, e.clientY);
          const c = cursorFor(d);
          winEl.style.cursor = c || '';
        });
        winEl.addEventListener('mouseleave', ()=>{
          if(!resizing) winEl.style.cursor = '';
        });

        // Edge/corner resize start
        winEl.addEventListener('pointerdown', (e)=>{
          if(resizing) return;
          // ignore titlebar drag and window control clicks
          const cursorTarget = getEventTargetEl(e);
          if(cursorTarget && cursorTarget.closest && (cursorTarget.closest('.titlebar') || cursorTarget.closest('.wctl'))) return;
          const edge = e.pointerType === 'touch' ? TOUCH_EDGE : EDGE;
          const d = getDir(e.clientX, e.clientY, edge);
          if(!d) return;
          beginResize(e, d);
        });

        // Keep the existing bottom-right handle resize too
        if(handle){
          handle.addEventListener('pointerdown', (e)=>{
            // If we already started edge resize, ignore
            if(resizing) return;
            beginResize(e, 'se');
          });
        }
      }

      let taskButtonsRenderSignature = '';
      let taskQuickLaunchSignature = '';
      let blissosDockRenderSignature = '';
      const LEOPARD_DOCK_RADIUS = 132;
      const LEOPARD_DOCK_MAX_SCALE = 0.42;
      const LEOPARD_DOCK_MAX_LIFT = 9;
      const DOCK_DEFAULT_SIZE = 58;
      const DOCK_DEFAULT_MAGNIFICATION = 60;
      const DOCK_AUTOHIDE_EDGE = 36;
      const DOCK_AUTOHIDE_HIDE_DELAY = 520;
      let dockAutoHideFxBound = false;
      let dockAutoHideHideTimer = 0;
      let dockAutoHideVisible = true;

      function getDockRenderSizePercent(){
        const raw = Number(state.settings.dockSize);
        if(!Number.isFinite(raw)) return DOCK_DEFAULT_SIZE;
        return clamp(Math.round(raw), 0, 100);
      }

      function getAquaDockScaleForSize(sizePercent){
        const pct = clamp(Math.round(Number(sizePercent) || 0), 0, 100);
        const pivot = DOCK_DEFAULT_SIZE;
        if(pct <= pivot){
          const t = pivot > 0 ? (pct / pivot) : 1;
          return 0.62 + (0.38 * t);
        }
        const t = (pct - pivot) / Math.max(1, 100 - pivot);
        return 1 + (0.42 * t);
      }

      function isDockRenderMagnificationEnabled(){
        return state.settings.dockMagnification !== false;
      }

      function getDockRenderMagnificationStrength(){
        const raw = Number(state.settings.dockMagnificationStrength);
        if(!Number.isFinite(raw)) return DOCK_DEFAULT_MAGNIFICATION;
        return clamp(Math.round(raw), 0, 100);
      }

      function getDockRenderOpacityPercent(){
        const raw = Number(state.settings.dockOpacity);
        if(!Number.isFinite(raw)) return 100;
        return clamp(Math.round(raw), 0, 100);
      }

      function isDockRenderAutoHideEnabled(){
        return !!state.settings.dockAutoHide && !isMobileDock() && state.settings.theme === 'blissos';
      }

      function clearDockAutoHideTimer(){
        if(dockAutoHideHideTimer){
          clearTimeout(dockAutoHideHideTimer);
          dockAutoHideHideTimer = 0;
        }
      }

      function setDockAutoHideVisible(dock, visible){
        if(!dock) return;
        dockAutoHideVisible = !!visible;
        const autoHideOn = dock.classList.contains('dock-autohide');
        dock.classList.toggle('dock-visible', !autoHideOn || dockAutoHideVisible);
      }

      function scheduleDockAutoHide(dock, delay = DOCK_AUTOHIDE_HIDE_DELAY){
        if(!dock || !dock.classList.contains('dock-autohide')) return;
        clearDockAutoHideTimer();
        dockAutoHideHideTimer = setTimeout(() => {
          if(!dock.classList.contains('dock-autohide')) return;
          setDockAutoHideVisible(dock, false);
        }, Math.max(0, delay));
      }

      function revealDockAutoHide(dock, opts = {}){
        if(!dock || !dock.classList.contains('dock-autohide')) return;
        clearDockAutoHideTimer();
        setDockAutoHideVisible(dock, true);
        if(opts.hold) return;
        scheduleDockAutoHide(dock, DOCK_AUTOHIDE_HIDE_DELAY + 160);
      }

      function bindDockAutoHideFx(dock){
        if(!dock || dock.dataset.dockAutoHideBound === '1') return;
        dock.dataset.dockAutoHideBound = '1';
        dock.addEventListener('pointerenter', ()=>{
          revealDockAutoHide(dock, { hold: true });
        });
        dock.addEventListener('pointerleave', ()=>{
          scheduleDockAutoHide(dock, 300);
        });
        if(dockAutoHideFxBound) return;
        dockAutoHideFxBound = true;
        document.addEventListener('pointermove', (e)=>{
          const activeDock = $('#blissosDock');
          if(!activeDock || activeDock.classList.contains('hidden') || !activeDock.classList.contains('dock-autohide')){
            return;
          }
          const target = getEventTargetEl(e);
          const overDock = !!(target && target.closest && target.closest('#blissosDock'));
          if(overDock){
            revealDockAutoHide(activeDock, { hold: true });
            return;
          }
          const nearBottom = (window.innerHeight - e.clientY) <= DOCK_AUTOHIDE_EDGE;
          if(nearBottom){
            revealDockAutoHide(activeDock);
          } else if(dockAutoHideVisible){
            scheduleDockAutoHide(activeDock, 260);
          }
        }, { passive:true });
      }

      function isLeopardDockActive(){
        return state.settings.theme === 'blissos' && !!state.settings.blissosAqua && !isMobileDock() && isDockRenderMagnificationEnabled();
      }

      function getLeopardDockItems(inner){
        if(!inner) return [];
        return Array.from(inner.querySelectorAll('.blissos-dock-item')).filter(item =>
          !item.classList.contains('dock-preview-slot') &&
          !item.classList.contains('dock-dragging') &&
          !item.classList.contains('dock-removing')
        );
      }

      function resetLeopardDockMagnification(inner){
        getLeopardDockItems(inner).forEach(item => {
          item.style.removeProperty('--dock-scale');
          item.style.removeProperty('--dock-lift');
          item.style.removeProperty('--dock-bright');
          item.style.removeProperty('--dock-reflect');
        });
      }

      function applyLeopardDockMagnification(inner, clientX){
        if(!inner || typeof clientX !== 'number') return;
        if(!isDockRenderMagnificationEnabled()){
          resetLeopardDockMagnification(inner);
          return;
        }
        if(inner.classList.contains('dock-reorder-active') || inner.classList.contains('dock-drop-preview')){
          resetLeopardDockMagnification(inner);
          return;
        }
        const intensity = getDockRenderMagnificationStrength() / 100;
        // Boost only the top-end of the slider so MAX magnification feels stronger.
        const maxBoost = 1 + (0.5 * intensity * intensity);
        const liftBoost = 1 + (0.35 * intensity * intensity);
        const radiusBoost = 1 + (0.12 * intensity * intensity);
        const maxScale = LEOPARD_DOCK_MAX_SCALE * (0.05 + (0.95 * intensity)) * maxBoost;
        const maxLift = LEOPARD_DOCK_MAX_LIFT * (0.05 + (0.95 * intensity)) * liftBoost;
        const radius = LEOPARD_DOCK_RADIUS * (0.6 + (0.8 * intensity)) * radiusBoost;
        const items = getLeopardDockItems(inner);
        items.forEach(item => {
          const rect = item.getBoundingClientRect();
          const center = rect.left + (rect.width / 2);
          const distance = Math.abs(clientX - center);
          const t = Math.max(0, 1 - (distance / radius));
          const eased = t * t * (3 - (2 * t));
          const scale = 1 + (maxScale * eased);
          const lift = maxLift * eased;
          const bright = 1 + ((0.08 + (0.16 * intensity)) * eased);
          const reflect = (0.06 + (0.08 * intensity)) + ((0.14 + (0.24 * intensity)) * eased);
          item.style.setProperty('--dock-scale', scale.toFixed(3));
          item.style.setProperty('--dock-lift', `${lift.toFixed(2)}px`);
          item.style.setProperty('--dock-bright', bright.toFixed(3));
          item.style.setProperty('--dock-reflect', reflect.toFixed(3));
        });
      }

      function bindLeopardDockFx(inner){
        if(!inner || inner.dataset.leopardDockFxBound === '1') return;
        inner.dataset.leopardDockFxBound = '1';
        const handleMove = (e)=>{
          if(!isLeopardDockActive()){
            resetLeopardDockMagnification(inner);
            return;
          }
          applyLeopardDockMagnification(inner, e.clientX);
        };
        const handleLeave = ()=>{
          resetLeopardDockMagnification(inner);
        };
        inner.addEventListener('pointermove', handleMove);
        inner.addEventListener('pointerdown', handleMove);
        inner.addEventListener('pointerleave', handleLeave);
        inner.addEventListener('pointercancel', handleLeave);
      }

      function triggerLeopardDockBounce(btn){
        if(!btn || !isLeopardDockActive()) return;
        btn.classList.remove('dock-launching');
        void btn.offsetWidth;
        btn.classList.add('dock-launching');
        setTimeout(() => {
          btn.classList.remove('dock-launching');
        }, 760);
      }

      function buildTaskButtonsSignature(wins){
        const parts = wins.map(w => {
          const active = (state.activeWindowId === w.id && !w.minimized) ? 1 : 0;
          return `${w.id}~${w.title}~${active}~${w.minimized ? 1 : 0}~${w.icon || ''}~${w.iconFile || ''}`;
        });
        return `${state.settings.theme}|${state.lang}|${parts.join('||')}`;
      }

      function buildTaskQuickLaunchSignature(){
        return `${state.settings.theme}|${state.lang}|${state.settings.blissosAqua ? 1 : 0}|${state.settings.blissosDarkMode ? 1 : 0}`;
      }

      function renderTaskQuickLaunch(){
        const host = $('#taskQuickLaunch');
        if(!host) return;
        if(state.isMobile && state.settings.theme === 'bliss98'){
          if(host.childElementCount){
            host.innerHTML = '';
          }
          taskQuickLaunchSignature = 'mobile-hidden';
          return;
        }
        const quickApps = ['mediaplayer', 'music', 'clothes', 'videos']
          .map(id => getAppById(id))
          .filter(Boolean);
        const signature = buildTaskQuickLaunchSignature();
        if(signature === taskQuickLaunchSignature && host.childElementCount === quickApps.length){
          return;
        }
        taskQuickLaunchSignature = signature;
        host.innerHTML = '';
        quickApps.forEach(app => {
          const label = getIconLabel(app);
          const btn = document.createElement('button');
          btn.className = 'btn bevel task-quick-btn';
          btn.type = 'button';
          btn.title = label;
          btn.setAttribute('aria-label', label);
          btn.innerHTML = `<span style="width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;">${getThemedIconHtml(app, label, 16)}</span>`;
          btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            closeStartMenu();
            openIconById(app.id);
          });
          host.appendChild(btn);
        });
      }

      function renderTaskButtons(){
        const host = $('#taskButtons');
        if(!host) return;
        renderTaskQuickLaunch();
        const wins = Array.from(state.windows.values()).sort((a,b)=>a.title.localeCompare(b.title));
        const signature = buildTaskButtonsSignature(wins);
        if(signature === taskButtonsRenderSignature && host.childElementCount === wins.length){
          renderBlissOSDock();
          return;
        }
        taskButtonsRenderSignature = signature;
        host.innerHTML = '';
        wins.forEach(w => {
          const b = document.createElement('div');
          b.className = 'btn bevel task-item';
          b.id = `task_${w.id}`;
          b.dataset.taskId = w.id;
          const isActive = (state.activeWindowId === w.id && !w.minimized);
          if(isActive) b.classList.add('pressed');
          b.style.maxWidth = '240px';
          b.style.overflow = 'hidden';
          b.style.whiteSpace = 'nowrap';
          b.style.textOverflow = 'ellipsis';
          b.innerHTML = `
            <span style="width:16px;height:16px;display:inline-flex;">${getThemedIconHtml(w, w.title, 16)}</span>
            <span>${w.title}</span>
          `;
          b.addEventListener('click', (e)=>{
            e.stopPropagation();
            closeStartMenu();
            if(w.minimized){
              restoreWindow(w.id);
              focusWindow(w.id);
            } else if(state.activeWindowId === w.id){
              minimizeApp(w.id);
            } else {
              focusWindow(w.id);
            }
          });
          host.appendChild(b);
        });
        renderBlissOSDock();
      }

function renderBlissOSDock(){
  const dock = $('#blissosDock');
  if(!dock) return;
  const clearAquaMobileDockVars = ()=>{
    dock.style.removeProperty('--aqua-mobile-inner-h');
    dock.style.removeProperty('--aqua-mobile-inner-pad-x');
    dock.style.removeProperty('--aqua-mobile-tray-plate-h');
    dock.style.removeProperty('--aqua-mobile-item-w');
    dock.style.removeProperty('--aqua-mobile-item-h');
    dock.style.removeProperty('--aqua-mobile-icon-box');
    dock.style.removeProperty('--aqua-mobile-icon-base-y');
    dock.style.removeProperty('--aqua-mobile-reflection-bottom');
    dock.style.removeProperty('--aqua-mobile-separator-h');
    dock.style.removeProperty('--aqua-mobile-separator-shift');
  };
  const clearClassicMobileDockVars = ()=>{
    dock.style.removeProperty('--classic-mobile-inner-h');
    dock.style.removeProperty('--classic-mobile-pad-y');
    dock.style.removeProperty('--classic-mobile-pad-x');
    dock.style.removeProperty('--classic-mobile-gap');
    dock.style.removeProperty('--classic-mobile-cap-h');
    dock.style.removeProperty('--classic-mobile-separator-h');
    dock.style.removeProperty('--classic-mobile-item');
  };
  const clearMobileDesktopInset = ()=>{
    if(document.body){
      document.body.style.removeProperty('--mobile-desktop-bottom-inset');
    }
  };
  const blissos = state.settings.theme === 'blissos';
  dock.classList.toggle('hidden', !blissos);
  if(!blissos){
    dock.style.removeProperty('--blissos-dock-scale');
    dock.style.removeProperty('--blissos-dock-opacity');
    clearAquaMobileDockVars();
    clearClassicMobileDockVars();
    clearMobileDesktopInset();
    clearDockAutoHideTimer();
    dock.classList.remove('dock-autohide');
    dock.classList.remove('dock-visible');
    dockAutoHideVisible = true;
    if(blissosDockRenderSignature !== 'hidden'){
      dock.innerHTML = '';
      blissosDockRenderSignature = 'hidden';
    }
    return;
  }
        const isAquaDock = !!state.settings.blissosAqua;
        const mobileDock = isMobileDock();
        const dockSize = getDockRenderSizePercent();
        const sizeT = dockSize / 100;
        const dockOpacity = getDockRenderOpacityPercent();
        const dockAutoHide = isDockRenderAutoHideEnabled();
        dock.style.setProperty('--blissos-dock-opacity', String(clamp(dockOpacity / 100, 0, 1)));
        const wasAutoHide = dock.classList.contains('dock-autohide');
        dock.classList.toggle('dock-autohide', dockAutoHide);
        if(dockAutoHide){
          bindDockAutoHideFx(dock);
          if(!wasAutoHide){
            setDockAutoHideVisible(dock, false);
            scheduleDockAutoHide(dock, 240);
          } else {
            setDockAutoHideVisible(dock, dockAutoHideVisible);
          }
        } else {
          clearDockAutoHideTimer();
          setDockAutoHideVisible(dock, true);
        }
        const buildDockItemMarkup = (iconHtml, dockIconBox) => {
          const iconSpan = `<span class="dock-icon pixel" style="width:${dockIconBox}px;height:${dockIconBox}px;display:flex;align-items:center;justify-content:center;">${iconHtml}</span>`;
          if(!isAquaDock){
            return `${iconSpan}<span class="dock-indicator"></span>`;
          }
          return `
            ${iconSpan}
            <span class="dock-reflection pixel" aria-hidden="true" style="width:${dockIconBox}px;height:${dockIconBox}px;display:flex;align-items:center;justify-content:center;">${iconHtml}</span>
            <span class="dock-tooltip" aria-hidden="true"></span>
            <span class="dock-indicator"></span>
          `;
        };
        const openIds = new Set(Array.from(state.windows.values()).map(w => w.id));
        const normalized = normalizeDockItems(state.dockItems || []);
        const dockChanged = normalized.length !== state.dockItems.length || normalized.some((item, idx) => {
          const cur = state.dockItems[idx];
          return !cur || cur.id !== item.id || cur.iconPath !== item.iconPath;
        });
        if(dockChanged){
          state.dockItems = normalized;
          saveDockItems();
        }
        const inner = document.createElement('div');
        inner.className = 'blissos-dock-inner';
        inner.innerHTML = `
          <span class="blissos-dock-cap left" aria-hidden="true"></span>
          <span class="blissos-dock-mid"></span>
          <span class="blissos-dock-right"></span>
          <span class="blissos-dock-cap right" aria-hidden="true"></span>
        `;
        const mid = inner.querySelector('.blissos-dock-mid');
        const right = inner.querySelector('.blissos-dock-right');
        let normalItems = normalized.filter(item => !isTrashDockItem(item));
        if(mobileDock && normalItems.length > DOCK_MOBILE_MAX_NORMAL){
          normalItems = normalItems.slice(0, DOCK_MOBILE_MAX_NORMAL);
        }
        const trashItem = normalized.find(isTrashDockItem);
        const renderItems = trashItem ? normalItems.concat(trashItem) : normalItems.slice();
        const dockStateSig = renderItems.map(item => {
          const winId = getDockWindowIdForItem(item);
          const win = winId ? state.windows.get(winId) : null;
          const label = getDockItemLabel(item);
          return `${item.id}|${item.type}|${item.refId}|${item.iconPath || ''}|${label}|${winId}|${openIds.has(winId) ? 1 : 0}|${win && win.minimized ? 1 : 0}|${state.activeWindowId === winId ? 1 : 0}`;
        }).join('||');
        const dockSignature = `${state.settings.theme}|${state.settings.blissosAqua ? 'aqua' : 'classic'}|${state.settings.blissosDarkMode ? 'dark' : 'light'}|${state.lang}|${mobileDock ? 'mobile' : 'desktop'}|size:${dockSize}|mag:${isDockRenderMagnificationEnabled() ? 1 : 0}|magp:${getDockRenderMagnificationStrength()}|op:${dockOpacity}|autoh:${dockAutoHide ? 1 : 0}|${dockStateSig}`;
        if(dockSignature === blissosDockRenderSignature && dock.firstElementChild){
          return;
        }
        const isAquaDesktopDock = isAquaDock && !mobileDock;
        if(isAquaDesktopDock){
          const aquaScale = getAquaDockScaleForSize(dockSize);
          dock.style.setProperty('--blissos-dock-scale', aquaScale.toFixed(3));
        } else {
          dock.style.removeProperty('--blissos-dock-scale');
        }
        let dockIconSize = 28;
        let dockIconBox = 32;
        let dockItemWidth = 40;
        let dockItemHeight = 40;
        if(isAquaDock){
          if(mobileDock){
            dockIconSize = Math.round(24 + (8 * sizeT));
            dockIconBox = Math.round(dockIconSize + 6);
            dockItemWidth = dockIconBox + 5;
            dockItemHeight = dockIconBox + 2;
          } else {
            dockIconSize = 48;
            dockIconBox = 56;
            dockItemWidth = 58;
            dockItemHeight = 54;
          }
        } else {
          const minIcon = mobileDock ? 20 : 20;
          const maxIcon = mobileDock ? 30 : 34;
          dockIconSize = Math.round(minIcon + ((maxIcon - minIcon) * sizeT));
          dockIconBox = Math.round(dockIconSize + (mobileDock ? 2 : 4));
          dockItemWidth = dockIconBox + (mobileDock ? 4 : 8);
          dockItemHeight = dockItemWidth;
        }
        let aquaMobileIconBaseY = null;
        let aquaMobileReflectionBottom = null;
        if(isAquaDock && mobileDock){
          const innerHeight = dockItemHeight + 16;
          const innerPadX = Math.round(10 + (4 * sizeT));
          const trayPlateHeight = Math.round(dockItemHeight + 8);
          const separatorHeight = Math.round(dockItemHeight + 10);
          const separatorShift = Math.round(1 + (1.5 * sizeT));
          aquaMobileIconBaseY = -Math.round(dockIconBox * 0.26);
          aquaMobileReflectionBottom = -Math.round(dockIconBox + 13);
          dock.style.setProperty('--aqua-mobile-inner-h', `${innerHeight}px`);
          dock.style.setProperty('--aqua-mobile-inner-pad-x', `${innerPadX}px`);
          dock.style.setProperty('--aqua-mobile-tray-plate-h', `${trayPlateHeight}px`);
          dock.style.setProperty('--aqua-mobile-item-w', `${dockItemWidth}px`);
          dock.style.setProperty('--aqua-mobile-item-h', `${dockItemHeight}px`);
          dock.style.setProperty('--aqua-mobile-icon-box', `${dockIconBox}px`);
          dock.style.setProperty('--aqua-mobile-icon-base-y', `${aquaMobileIconBaseY}px`);
          dock.style.setProperty('--aqua-mobile-reflection-bottom', `${aquaMobileReflectionBottom}px`);
          dock.style.setProperty('--aqua-mobile-separator-h', `${separatorHeight}px`);
          dock.style.setProperty('--aqua-mobile-separator-shift', `${separatorShift}px`);
        } else {
          clearAquaMobileDockVars();
        }
        if(!isAquaDock && mobileDock){
          const innerHeight = dockItemHeight + 4;
          const padY = Math.max(2, Math.round(2 + sizeT));
          const padX = Math.max(4, Math.round(4 + (2 * sizeT)));
          const itemGap = Math.max(3, Math.round(3 + (2 * sizeT)));
          const separatorHeight = Math.max(20, dockItemHeight - 8);
          dock.style.setProperty('--classic-mobile-inner-h', `${innerHeight}px`);
          dock.style.setProperty('--classic-mobile-pad-y', `${padY}px`);
          dock.style.setProperty('--classic-mobile-pad-x', `${padX}px`);
          dock.style.setProperty('--classic-mobile-gap', `${itemGap}px`);
          dock.style.setProperty('--classic-mobile-cap-h', `${dockItemHeight}px`);
          dock.style.setProperty('--classic-mobile-separator-h', `${separatorHeight}px`);
          dock.style.setProperty('--classic-mobile-item', `${dockItemWidth}px`);
        } else {
          clearClassicMobileDockVars();
        }
        if(mobileDock && document.body){
          const mobileBottomInset = isAquaDock
            ? Math.round((dockItemHeight + 16) + 22)
            : Math.round((dockItemHeight + 4) + 14);
          document.body.style.setProperty('--mobile-desktop-bottom-inset', `${mobileBottomInset}px`);
        } else {
          clearMobileDesktopInset();
        }
        blissosDockRenderSignature = dockSignature;
        normalItems.forEach(item => {
          const winId = getDockWindowIdForItem(item);
          const win = winId ? state.windows.get(winId) : null;
          const btn = document.createElement('button');
          btn.className = 'blissos-dock-item';
          btn.style.width = `${dockItemWidth}px`;
          btn.style.height = `${dockItemHeight}px`;
          btn.type = 'button';
          btn.dataset.dockWinId = winId || '';
          btn.dataset.dockType = item.type;
          btn.dataset.refId = item.refId;
          if(openIds.has(winId)) btn.classList.add('open');
          if(win && win.minimized) btn.classList.add('minimized');
          const label = getDockItemLabel(item);
          btn.title = label;
          const iconHtml = getDockItemIconHtml(item, dockIconSize);
          btn.innerHTML = buildDockItemMarkup(iconHtml, dockIconBox);
          if(aquaMobileIconBaseY !== null && aquaMobileReflectionBottom !== null){
            btn.style.setProperty('--dock-icon-base-y', `${aquaMobileIconBaseY}px`);
            btn.style.setProperty('--dock-reflection-bottom', `${aquaMobileReflectionBottom}px`);
          }
          const tooltip = btn.querySelector('.dock-tooltip');
          if(tooltip) tooltip.textContent = label;
          btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            if(btn.dataset.dragged === '1'){
              btn.dataset.dragged = '0';
              return;
            }
            if(win){
              if(win.minimized){
                triggerLeopardDockBounce(btn);
                restoreWindow(winId);
              } else if(state.activeWindowId === winId){
                minimizeApp(winId);
              } else {
                triggerLeopardDockBounce(btn);
                focusWindow(winId);
              }
            } else if(item.refId){
              triggerLeopardDockBounce(btn);
              openIconById(item.refId);
            }
          });
          btn.addEventListener('contextmenu', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            openCtxMenu(e.clientX, e.clientY, 'dock', item.refId, { itemType: item.type, dockId: item.id });
          });
          bindDockDrag(btn, item, mid, inner);
          mid.appendChild(btn);
        });
        if(trashItem && right){
          if(mid && mid.childElementCount > 0){
            const separator = document.createElement('span');
            separator.className = 'blissos-dock-separator';
            separator.setAttribute('aria-hidden', 'true');
            right.appendChild(separator);
          }
          const winId = getDockWindowIdForItem(trashItem);
          const win = winId ? state.windows.get(winId) : null;
          const btn = document.createElement('button');
          btn.className = 'blissos-dock-item';
          btn.style.width = `${dockItemWidth}px`;
          btn.style.height = `${dockItemHeight}px`;
          btn.type = 'button';
          btn.dataset.dockWinId = winId || '';
          btn.dataset.dockType = 'trash';
          btn.dataset.refId = 'trash';
          if(openIds.has(winId)) btn.classList.add('open');
          if(win && win.minimized) btn.classList.add('minimized');
          const label = getDockItemLabel(trashItem);
          btn.title = label;
          const trashIconHtml = getDockItemIconHtml(trashItem, dockIconSize);
          btn.innerHTML = buildDockItemMarkup(trashIconHtml, dockIconBox);
          if(aquaMobileIconBaseY !== null && aquaMobileReflectionBottom !== null){
            btn.style.setProperty('--dock-icon-base-y', `${aquaMobileIconBaseY - 4}px`);
            btn.style.setProperty('--dock-reflection-bottom', `${aquaMobileReflectionBottom}px`);
          }
          const trashTooltip = btn.querySelector('.dock-tooltip');
          if(trashTooltip) trashTooltip.textContent = label;
          btn.addEventListener('click', (e)=>{
            e.stopPropagation();
            if(btn.dataset.dragged === '1'){
              btn.dataset.dragged = '0';
              return;
            }
            triggerLeopardDockBounce(btn);
            openIconById('trash');
          });
          btn.addEventListener('contextmenu', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            openCtxMenu(e.clientX, e.clientY, 'dock', 'trash', { itemType: 'trash', dockId: trashItem.id });
          });
          right.appendChild(btn);
        }
        dock.innerHTML = '';
        dock.appendChild(inner);
        bindLeopardDockFx(inner);
        bindDockAutoHideFx(dock);
      }

function closeBlissOSMenu(){
  const menu = $('#blissosAppleMenu');
  const brand = document.querySelector('.blissos-menu-brand');
  if(menu) menu.classList.add('hidden');
  if(brand) brand.classList.remove('active');
}

function toggleBlissOSMenu(forceOpen){
  const menu = $('#blissosAppleMenu');
  const brand = document.querySelector('.blissos-menu-brand');
  if(!menu) return;
  const willOpen = typeof forceOpen === 'boolean' ? forceOpen : menu.classList.contains('hidden');
  closeBlissOSAppMenu();
  if(willOpen) renderBlissOSAppleMenu();
  menu.classList.toggle('hidden', !willOpen);
  if(brand) brand.classList.toggle('active', willOpen);
}

function renderBlissOSAppleMenu(){
  const menu = $('#blissosAppleMenu');
  if(!menu) return;
  const apps = APPS.filter(app => app.id !== 'trash' && app.id !== 'settings' && app.showOnDesktop !== false);
  const settingsTabs = [
    { id:'general', icon:'./assets/icons/computer.png', labelKey:'settings.tab.general' },
    { id:'language', icon:'./assets/icons/language.png', labelKey:'settings.tab.language' },
    { id:'appearance', icon:'./assets/icons/appearance.png', labelKey:'settings.tab.appearance' },
    { id:'dock', icon:'./assets/icons/dock.png', labelKey:'settings.tab.dock' },
    { id:'sound', icon:'./assets/icons/Sound.png', labelKey:'settings.tab.sound' },
    { id:'system', icon:'./assets/icons/computer.png', labelKey:'settings.tab.system' },
    { id:'performance', icon:'./assets/icons/performance.png', labelKey:'settings.tab.performance' },
  ];
  const settingsLabel = t('blissos.menu.settings');
  const settingsIcon = getThemedIconHtml({ icon:'settings', id:'settings', iconFile:'./assets/icons/Settings.png' }, settingsLabel, 16);
  const settingsItems = settingsTabs.map(tab => `
    <button class="menu-item" type="button" data-blissos-settings-tab="${tab.id}">
      <span class="menu-icon">${getThemedIconHtml({ icon:'settings', id:`settings-${tab.id}`, iconFile:tab.icon }, t(tab.labelKey), 16)}</span>
      <span class="menu-label">${t(tab.labelKey)}</span>
    </button>
  `).join('');

  const appItems = apps.map(app => {
    const label = getIconLabel(app);
    const icon = getThemedIconHtml(app, label, 16);
    return `
      <button class="menu-item" type="button" data-blissos-open-app="${app.id}">
        <span class="menu-icon">${icon}</span>
        <span class="menu-label">${label}</span>
      </button>
    `;
  }).join('');

  menu.innerHTML = `
    <button class="menu-item" type="button" data-blissos-action="about">
      <span class="menu-icon">${getThemedIconHtml({ icon:'info', id:'about', iconFile:'./assets/icons/About.png' }, t('blissos.menu.about'), 16)}</span>
      <span class="menu-label" data-i18n="blissos.menu.about">${t('blissos.menu.about')}</span>
    </button>
    <div class="menu-sep" role="separator"></div>
    <div class="menu-item has-submenu" tabindex="-1">
      <span class="menu-icon">${settingsIcon}</span>
      <span class="menu-label">${settingsLabel}</span>
      <span class="menu-arrow">▶</span>
      <div class="submenu" role="menu" aria-label="${settingsLabel}">
        ${settingsItems}
      </div>
    </div>
    <div class="menu-sep" role="separator"></div>
    ${appItems}
    <div class="menu-sep" role="separator"></div>
    <button class="menu-item" type="button" data-blissos-action="logoff">
      <span class="menu-icon">${getThemedIconHtml({ icon:'user', id:'logoff', iconFile:'./assets/icons/logout.png' }, t('menu.logoff'), 16)}</span>
      <span class="menu-label" data-i18n="menu.logoff">${t('menu.logoff')}</span>
    </button>
  `;
}

function getActiveAppId(){
  const winId = state.activeWindowId;
  if(winId && state.windows.has(winId)){
    const w = state.windows.get(winId);
    if(!w.minimized) return winId;
  }
  return 'bliss';
}

function getAppDisplay(appId){
  if(appId === 'bliss'){
    const iconHtml = getThemedIconHtml({ icon:'app', id:'bliss', iconFile:'./assets/icons/bliss.png' }, 'Bliss', 16);
    return { label:'Bliss', iconHtml };
  }
  const app = getAppById(appId);
  if(!app){
    return { label: appId, iconHtml: iconSVG('file', state.settings.theme) };
  }
  const label = getIconLabel(app);
  const iconHtml = getThemedIconHtml(app, label, 16);
  return { label, iconHtml };
}

function updateBlissOSActiveApp(){
  if(state.settings.theme !== 'blissos') return;
  const brandIconEl = document.querySelector('.blissos-menu-brand img');
  if(brandIconEl){
    const brandSrc = getIconFor('./assets/icons/bliss.png', 'blissos');
    if(typeof brandSrc === 'string' && !brandSrc.trim().startsWith('<svg')){
      brandIconEl.src = brandSrc;
    }
  }
  const appId = getActiveAppId();
  const iconEl = $('#blissosAppMenuIcon');
  const labelEl = $('#blissosAppMenuLabel');
  const specialBtn = $('#blissosSpecialBtn');
  if(!iconEl || !labelEl) return;
  const { label, iconHtml } = getAppDisplay(appId);
  iconEl.innerHTML = iconHtml;
  labelEl.textContent = label;
  if(specialBtn) specialBtn.style.display = (appId === 'bliss') ? 'inline-flex' : 'none';
}

function closeBlissOSAppMenu(){
  const menu = $('#blissosAppMenuDrop');
  if(menu) menu.classList.add('hidden');
  const btn = $('#blissosAppMenu');
  if(btn) btn.classList.remove('active');
}

function toggleBlissOSAppMenu(forceOpen){
  const menu = $('#blissosAppMenuDrop');
  const btn = $('#blissosAppMenu');
  if(!menu || !btn) return;
  const willOpen = typeof forceOpen === 'boolean' ? forceOpen : menu.classList.contains('hidden');
  closeBlissOSMenu();
  closeWindowMenu();
  if(willOpen){
    renderBlissOSAppMenu();
    const first = menu.querySelector('.menu-item');
    if(first) first.focus();
  }
  menu.classList.toggle('hidden', !willOpen);
  btn.classList.toggle('active', willOpen);
}

function restoreWindow(appId){
  const w = state.windows.get(appId);
  if(!w || !w.minimized) return;
  playSfx('windowRestore');
  // BlissOS specific restore: use genie animation from dock
  // Check state.settings.theme instead of DOM attribute for reliability
  if(state && state.settings && state.settings.theme === 'blissos'){
    restoreFromDock(appId);
    return;
  }
  w.minimized = false;
  const el = document.getElementById(`win_${appId}`);
  if(el){
    el.classList.remove('hidden');
    animateWindowFromTaskbar(el, appId);
  }
  state.hiddenApps.delete(appId);
}

// ---------------------------------------------------------------------
// Bliss98 genie helpers for taskbar minimise/restore/maximize

const TASKBAR_GENIE = {
  duration: 480,
  easing: 'cubic-bezier(0.16, 0.74, 0.2, 1)',
};
const TASKBAR_MINIMIZE_GENIE = {
  duration: 760,
  easing: 'cubic-bezier(0.12, 0.78, 0.18, 1)',
};

function shouldReduceMotion(){
  return !state.animations || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getTaskbarButtonRect(appId){
  const btn = document.getElementById(`task_${appId}`) || document.querySelector(`[data-task-id="${appId}"]`);
  if(btn) return btn.getBoundingClientRect();
  const taskbar = document.getElementById('taskbar');
  if(taskbar){
    const rect = taskbar.getBoundingClientRect();
    return { left: rect.left + 10, top: rect.top + 6, width: 28, height: 20 };
  }
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  return { left: 10, top: Math.max(0, vh - 30), width: 28, height: 20 };
}

function getGenieParams(fromRect, toRect){
  const fromCx = fromRect.left + fromRect.width / 2;
  const fromCy = fromRect.top + fromRect.height / 2;
  const toCx = toRect.left + toRect.width / 2;
  const toCy = toRect.top + toRect.height / 2;
  const dx = toCx - fromCx;
  const dy = toCy - fromCy;
  const scaleX = clamp(toRect.width / Math.max(1, fromRect.width), 0.08, 0.4);
  const scaleY = clamp(toRect.height / Math.max(1, fromRect.height), 0.06, 0.35);
  const skew = clamp(dx / Math.max(1, fromRect.width) * 10, -10, 10);
  const origin = dx < 0 ? 'bottom left' : 'bottom right';
  return { dx, dy, scaleX, scaleY, skew, origin };
}

function buildGenieTransform(params){
  return `translate(${params.dx}px, ${params.dy}px) scale(${params.scaleX}, ${params.scaleY}) skewY(${params.skew}deg)`;
}

function cancelWindowGenie(winEl){
  if(winEl && typeof winEl._genieCancel === 'function'){
    winEl._genieCancel(true);
  }
}

function runWindowGenieTransition(winEl, opts = {}){
  if(!winEl) return Promise.resolve();
  cancelWindowGenie(winEl);
  const duration = opts.duration || TASKBAR_GENIE.duration;
  const easing = opts.easing || TASKBAR_GENIE.easing;
  return new Promise(resolve => {
    let done = false;
    const finish = ()=>{
      if(done) return;
      done = true;
      winEl.removeEventListener('transitionend', onEnd);
      if(winEl._genieTimer){
        clearTimeout(winEl._genieTimer);
        winEl._genieTimer = null;
      }
      winEl._genieCancel = null;
      winEl.style.transition = '';
      winEl.style.transform = '';
      winEl.style.transformOrigin = '';
      winEl.style.opacity = '';
      winEl.style.pointerEvents = '';
      winEl.style.willChange = '';
      winEl.classList.remove('genie-animating');
      if(typeof opts.onDone === 'function') opts.onDone();
      resolve();
    };
    const onEnd = (e)=>{
      if(e && e.target !== winEl) return;
      finish();
    };
    winEl._genieCancel = finish;
    winEl.addEventListener('transitionend', onEnd);
    winEl._genieTimer = setTimeout(finish, duration + 80);

    winEl.classList.add('genie-animating');
    winEl.style.pointerEvents = 'none';
    winEl.style.willChange = 'transform, opacity';
    winEl.style.transformOrigin = opts.origin || 'bottom left';
    winEl.style.transition = 'none';
    if(opts.from) winEl.style.transform = opts.from;
    if(typeof opts.fromOpacity === 'number') winEl.style.opacity = String(opts.fromOpacity);
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        winEl.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
        if(opts.to) winEl.style.transform = opts.to;
        if(typeof opts.toOpacity === 'number') winEl.style.opacity = String(opts.toOpacity);
      });
    });
  });
}

function animateWindowToTaskbar(winEl, appId){
  if(shouldReduceMotion()) return Promise.resolve();
  const fromRect = winEl.getBoundingClientRect();
  const targetRect = getTaskbarButtonRect(appId);
  const params = getGenieParams(fromRect, targetRect);
  const transform = buildGenieTransform(params);
  const duration = state.isMobile
    ? Math.round(TASKBAR_MINIMIZE_GENIE.duration * 0.9)
    : TASKBAR_MINIMIZE_GENIE.duration;
  return runWindowGenieTransition(winEl, {
    from: 'translate(0px, 0px) scale(1) skewY(0deg)',
    to: transform,
    fromOpacity: 1,
    toOpacity: 0.15,
    origin: params.origin,
    duration,
    easing: TASKBAR_MINIMIZE_GENIE.easing,
  });
}

function animateWindowFromTaskbar(winEl, appId){
  if(shouldReduceMotion()) return Promise.resolve();
  const fromRect = winEl.getBoundingClientRect();
  const targetRect = getTaskbarButtonRect(appId);
  const params = getGenieParams(fromRect, targetRect);
  const transform = buildGenieTransform(params);
  return runWindowGenieTransition(winEl, {
    from: transform,
    to: 'translate(0px, 0px) scale(1) skewY(0deg)',
    fromOpacity: 0.15,
    toOpacity: 1,
    origin: params.origin,
  });
}

function animateWindowRectTransition(winEl, fromRect, toRect, opts = {}){
  if(shouldReduceMotion() || !fromRect || !toRect) return Promise.resolve();
  if(!toRect.width || !toRect.height) return Promise.resolve();
  const dx = fromRect.left - toRect.left;
  const dy = fromRect.top - toRect.top;
  const scaleX = fromRect.width / toRect.width;
  const scaleY = fromRect.height / toRect.height;
  if(!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) return Promise.resolve();
  const skew = clamp(dx / Math.max(1, toRect.width) * 6, -6, 6);
  const transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY}) skewY(${skew}deg)`;
  return runWindowGenieTransition(winEl, {
    from: transform,
    to: 'translate(0px, 0px) scale(1) skewY(0deg)',
    fromOpacity: 0.96,
    toOpacity: 1,
    origin: 'top left',
    duration: opts.duration || TASKBAR_GENIE.duration,
  });
}

// ---------------------------------------------------------------------
// Genie animation helpers for BlissOS minimise/restore
// These functions implement Mac-like "genie" animations to send windows
// into the BlissOS dock and back. They are only invoked when the
// current theme is BlissOS.

function getDockItemEl(appId){
  return document.querySelector(`#blissosDock [data-dock-win-id="${appId}"]`);
}

const DEFAULT_DOCK_ORDER = ['seeker','clothes','music','art','games','videos','about','contact','diev','settings','trash'];

function isTrashDockItem(item){
  return !!item && (item.type === 'trash' || (item.type === 'app' && item.refId === 'trash'));
}

function isSeekerDockItem(item){
  return !!item && item.type === 'app' && item.refId === 'seeker';
}

function isDockItemLocked(item){
  return !!item && (
    isTrashDockItem(item) ||
    isSeekerDockItem(item) ||
    item.nonRemovable === true ||
    item.nonReorderable === true ||
    item.pinned === 'left' ||
    item.pinned === 'right'
  );
}

function getDockMinInsertIndex(items){
  const list = Array.isArray(items) ? items : [];
  return (list.length > 0 && isSeekerDockItem(list[0])) ? 1 : 0;
}

function createSeekerDockItem(){
  return {
    id: getDockItemKey('app', 'seeker'),
    type: 'app',
    refId: 'seeker',
    pinned: 'left',
    nonRemovable: true,
    nonReorderable: true,
    iconPath: getDockItemIconPath('app', 'seeker'),
  };
}

function createTrashDockItem(){
  return {
    id: getDockItemKey('trash', 'trash'),
    type: 'trash',
    refId: 'trash',
    pinned: 'right',
    nonRemovable: true,
    nonReorderable: true,
    iconPath: getDockItemIconPath('trash', 'trash'),
  };
}

function ensureTrashDockItem(items){
  const source = Array.isArray(items) ? items : [];
  const list = source.filter(it => !isTrashDockItem(it) && !isSeekerDockItem(it));
  let seeker = source.find(isSeekerDockItem);
  if(getAppById('seeker')){
    if(!seeker) seeker = createSeekerDockItem();
    seeker = {
      ...seeker,
      id: getDockItemKey('app', 'seeker'),
      type: 'app',
      refId: 'seeker',
      pinned: 'left',
      nonRemovable: true,
      nonReorderable: true,
      iconPath: getDockItemIconPath('app', 'seeker'),
    };
    list.unshift(seeker);
  }
  let trash = source.find(isTrashDockItem);
  if(!trash) trash = createTrashDockItem();
  trash = {
    ...trash,
    id: trash.id || getDockItemKey('trash', 'trash'),
    type: 'trash',
    refId: 'trash',
    pinned: 'right',
    nonRemovable: true,
    nonReorderable: true,
    iconPath: getDockItemIconPath('trash', 'trash'),
  };
  return list.concat(trash);
}

function getDefaultDockItems(){
  const base = DEFAULT_DOCK_ORDER
    .filter(id => !!getAppById(id))
    .map(id => ({
      id: getDockItemKey('app', id),
      type: 'app',
      refId: id,
      iconPath: getDockItemIconPath('app', id),
    }));
  return ensureTrashDockItem(base);
}

function getDockWindowIdForItem(item){
  if(!item) return '';
  if(isTrashDockItem(item)) return 'seeker';
  if(item.type === 'folder') return 'seeker';
  if(item.type === 'txt') return getTxtWindowId(item.refId);
  return item.refId || '';
}

function getDockItemKey(type, refId){
  return `${type}:${refId}`;
}

function getDockItemIconPath(type, refId){
  if(type === 'trash' || refId === 'trash') return getTrashIconFile();
  if(type === 'folder') return getFolderIconPath();
  if(type === 'txt') return getTxtIconPath();
  const app = getAppById(refId);
  if(!app || !app.iconFile) return '';
  const iconFile = typeof app.iconFile === 'function' ? app.iconFile() : app.iconFile;
  return getIconFor(iconFile, state.settings.theme);
}

function getDockItemLabel(item){
  if(!item) return '';
  if(isTrashDockItem(item)){
    const app = getAppById('trash');
    return app ? getIconLabel(app) : 'Trash';
  }
  if(item.type === 'folder' || item.type === 'txt'){
    const fsItem = getFsItem(item.refId);
    return fsItem ? getFsItemLabel(fsItem) : '';
  }
  const app = getAppById(item.refId);
  return app ? getIconLabel(app) : item.refId;
}

function getDockItemIconHtml(item, size = 28){
  if(!item) return iconSVG('file', state.settings.theme);
  if(isTrashDockItem(item)){
    const label = getDockItemLabel(item);
    const src = getTrashIconFile();
    const fallback = isBlissOS() ? getBlissOSFallbackPath(src) : '';
    const fbAttr = fallback ? ` data-fallback-src="${fallback}"` : '';
    return `<img class="pixel" src="${src}"${fbAttr} width="${size}" height="${size}" alt="${label}" style="display:block;" />`;
  }
  if(item.type === 'folder' || item.type === 'txt'){
    const fsItem = getFsItem(item.refId);
    const label = getDockItemLabel(item);
    return fsItem ? getFsIconHtml(fsItem, label, size) : iconSVG('file', state.settings.theme);
  }
  const app = getAppById(item.refId);
  if(!app) return iconSVG('file', state.settings.theme);
  const label = getDockItemLabel(item);
  return getThemedIconHtml(app, label, size);
}

function normalizeDockItems(items){
  const source = Array.isArray(items) ? items : [];
  const out = [];
  const seen = new Set();
  let trash = null;
  source.forEach(raw => {
    if(!raw || !raw.type || !raw.refId) return;
    const type = raw.type === 'trash' ? 'trash' : raw.type;
    const refId = raw.refId || '';
    if(type === 'trash' || refId === 'trash'){
      if(trash) return;
      trash = createTrashDockItem();
      return;
    }
    const key = getDockItemKey(type, refId);
    if(seen.has(key)) return;
    if(type === 'app' && !getAppById(refId)) return;
    if((type === 'folder' || type === 'txt')){
      const fsItem = getFsItem(refId);
      if(!fsItem || fsItem.type !== type || state.trash.has(refId)) return;
    }
    seen.add(key);
    out.push({
      id: raw.id || key,
      type,
      refId,
      iconPath: getDockItemIconPath(type, refId),
    });
  });
  return ensureTrashDockItem(trash ? out.concat(trash) : out);
}

function isDockableItem(type, refId){
  if(type === 'trash' || refId === 'trash') return true;
  if(type === 'folder' || type === 'txt') return true;
  if(type === 'app') return !!getAppById(refId);
  return false;
}

function isDockItemPresent(type, refId){
  const key = getDockItemKey(type === 'trash' || refId === 'trash' ? 'trash' : type, refId === 'trash' ? 'trash' : refId);
  return (state.dockItems || []).some(item => (item.id || getDockItemKey(item.type, item.refId)) === key);
}

function getDockItemsWithoutTrash(){
  return (state.dockItems || []).filter(item => !isTrashDockItem(item));
}

function isMobileDock(){
  return !!state.isMobile;
}

function showDockFullMessage(){
  showMessage('dialog.dockFull.title', 'dialog.dockFull.body');
}

function addDockItem(type, refId){
  const targetType = (type === 'trash' || refId === 'trash') ? 'trash' : type;
  const targetRef = (refId === 'trash') ? 'trash' : refId;
  if(!isDockableItem(targetType, targetRef)) return false;
  if(!Array.isArray(state.dockItems)) state.dockItems = [];
  if(isDockItemPresent(targetType, targetRef)) return false;
  if(targetType !== 'trash' && isMobileDock()){
    const normal = getDockItemsWithoutTrash();
    if(normal.length >= DOCK_MOBILE_MAX_NORMAL){
      showDockFullMessage();
      return false;
    }
  }
  if(targetType === 'trash'){
    state.dockItems = ensureTrashDockItem(state.dockItems);
  } else {
    const normal = getDockItemsWithoutTrash();
    const item = {
      id: getDockItemKey(targetType, targetRef),
      type: targetType,
      refId: targetRef,
      iconPath: getDockItemIconPath(targetType, targetRef),
    };
    normal.push(item);
    state.dockItems = ensureTrashDockItem(normal);
  }
  saveDockItems();
  renderBlissOSDock();
  return true;
}

function removeDockItem(type, refId){
  if(type === 'app' && refId === 'seeker') return false;
  if(type === 'trash' || refId === 'trash') return false;
  const key = getDockItemKey(type, refId);
  const before = state.dockItems.length;
  state.dockItems = state.dockItems.filter(item => (item.id || getDockItemKey(item.type, item.refId)) !== key);
  if(state.dockItems.length !== before){
    state.dockItems = ensureTrashDockItem(state.dockItems);
    saveDockItems();
    renderBlissOSDock();
    return true;
  }
  return false;
}

function getDockInnerEl(){
  const dock = $('#blissosDock');
  return dock ? dock.querySelector('.blissos-dock-inner') : null;
}

function getDockMidEl(){
  const inner = getDockInnerEl();
  return inner ? inner.querySelector('.blissos-dock-mid') : null;
}

function isPointInRect(x, y, rect){
  if(!rect) return false;
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

let dockDropPreviewEl = null;

function setDockDropHighlight(active){
  const inner = getDockInnerEl();
  if(!inner) return;
  inner.classList.toggle('dock-drop-active', !!active);
  if(!active) inner.classList.remove('dock-drop-preview');
}

function clearDockDropPreview(){
  if(dockDropPreviewEl && dockDropPreviewEl.parentNode){
    dockDropPreviewEl.parentNode.removeChild(dockDropPreviewEl);
  }
  dockDropPreviewEl = null;
  const inner = getDockInnerEl();
  if(inner) inner.classList.remove('dock-drop-preview');
}

function setDockDropPreview(index){
  const inner = getDockInnerEl();
  const mid = getDockMidEl();
  if(!inner || !mid) return;
  if(!dockDropPreviewEl){
    dockDropPreviewEl = document.createElement('span');
    dockDropPreviewEl.className = 'blissos-dock-item dock-preview-slot';
    dockDropPreviewEl.setAttribute('aria-hidden', 'true');
  }
  const items = Array.from(mid.querySelectorAll('.blissos-dock-item'))
    .filter(el =>
      el !== dockDropPreviewEl &&
      el.dataset.dockType !== 'trash' &&
      !el.classList.contains('dock-dragging') &&
      !el.classList.contains('dock-removing') &&
      !el.classList.contains('dock-preview-slot')
    );
  const insertAt = clamp(index, 0, items.length);
  if(insertAt >= items.length){
    mid.appendChild(dockDropPreviewEl);
  } else {
    mid.insertBefore(dockDropPreviewEl, items[insertAt]);
  }
  inner.classList.add('dock-drop-preview');
}

function getDockInsertIndexFromClientX(clientX, excludeEl){
  const mid = getDockMidEl();
  if(!mid) return 0;
  const items = Array.from(mid.querySelectorAll('.blissos-dock-item'))
    .filter(el =>
      el !== excludeEl &&
      el.dataset.dockType !== 'trash' &&
      !el.classList.contains('dock-preview-slot') &&
      !el.classList.contains('dock-removing')
    );
  const minInsertIndex = getDockMinInsertIndex(items.map(el => ({ type: el.dataset.dockType, refId: el.dataset.refId })));
  for(let i = 0; i < items.length; i++){
    const rect = items[i].getBoundingClientRect();
    if(clientX < rect.left + rect.width / 2){
      return clamp(i, minInsertIndex, items.length);
    }
  }
  return clamp(items.length, minInsertIndex, items.length);
}

function getDockDropTargetAt(x, y){
  if(!isBlissOS()) return null;
  const inner = getDockInnerEl();
  if(!inner) return null;
  const rect = inner.getBoundingClientRect();
  if(!isPointInRect(x, y, rect)) return null;
  const index = getDockInsertIndexFromClientX(x, null);
  return { index, inner };
}

function addDockItemsAt(entries, index){
  if(!Array.isArray(entries) || entries.length === 0) return false;
  let changed = false;
  let normal = getDockItemsWithoutTrash();
  const minInsertIndex = getDockMinInsertIndex(normal);
  if(isMobileDock()){
    const pendingKeys = new Set();
    let pendingAdds = 0;
    entries.forEach(entry => {
      if(!entry) return;
      const type = entry.type === 'trash' || entry.refId === 'trash' ? 'trash' : entry.type;
      const refId = entry.refId === 'trash' ? 'trash' : entry.refId;
      if(type === 'trash') return;
      if(!isDockableItem(type, refId)) return;
      const key = getDockItemKey(type, refId);
      if(pendingKeys.has(key)) return;
      if(isDockItemPresent(type, refId)) return;
      pendingKeys.add(key);
      pendingAdds += 1;
    });
    if(pendingAdds > 0 && (normal.length >= DOCK_MOBILE_MAX_NORMAL || (normal.length + pendingAdds) > DOCK_MOBILE_MAX_NORMAL)){
      showDockFullMessage();
      return false;
    }
  }
  let insertAt = clamp(index, minInsertIndex, normal.length);
  entries.forEach(entry => {
    if(!entry) return;
    const type = entry.type === 'trash' || entry.refId === 'trash' ? 'trash' : entry.type;
    const refId = entry.refId === 'trash' ? 'trash' : entry.refId;
    if(type === 'trash'){
      if(!isDockItemPresent('trash', 'trash')){
        state.dockItems = ensureTrashDockItem(normal);
        changed = true;
      }
      return;
    }
    if(type === 'app' && refId === 'seeker') return;
    if(isDockItemPresent(type, refId)) return;
    if(!isDockableItem(type, refId)) return;
    const item = {
      id: getDockItemKey(type, refId),
      type,
      refId,
      iconPath: getDockItemIconPath(type, refId),
    };
    normal.splice(insertAt, 0, item);
    insertAt += 1;
    changed = true;
  });
  if(changed){
    clearDockDropPreview();
    setDockDropHighlight(false);
    state.dockItems = ensureTrashDockItem(normal);
    saveDockItems();
    renderBlissOSDock();
  }
  return changed;
}

function bindDockDrag(btn, item, midEl, innerEl){
  if(!btn || !midEl || !innerEl) return;
  let down = false;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let targetIndex = -1;
  let ghostEl = null;

  const cleanup = ()=>{
    if(ghostEl && ghostEl.parentNode) ghostEl.remove();
    ghostEl = null;
    if(btn) btn.classList.remove('dock-dragging', 'dock-removing');
    if(innerEl) innerEl.classList.remove('dock-reorder-active');
    resetLeopardDockMagnification(innerEl);
    clearDockDropPreview();
    setDockDropHighlight(false);
  };

  const updateGhostPos = (clientX, clientY)=>{
    if(!ghostEl) return;
    ghostEl.style.left = clientX + 'px';
    ghostEl.style.top = clientY + 'px';
  };

  const beginDrag = (e)=>{
    dragging = true;
    btn.classList.add('dock-dragging');
    innerEl.classList.add('dock-reorder-active');
    resetLeopardDockMagnification(innerEl);
    btn.dataset.dragged = '1';
    const visible = Array.from(midEl.querySelectorAll('.blissos-dock-item'))
      .filter(el => el.dataset.dockType !== 'trash' && !el.classList.contains('dock-preview-slot'));
    const currentIndex = visible.indexOf(btn);
    targetIndex = currentIndex >= 0 ? currentIndex : getDockInsertIndexFromClientX(e.clientX, btn);
    setDockDropPreview(targetIndex);
    setDockDropHighlight(true);

    const rect = btn.getBoundingClientRect();
    ghostEl = btn.cloneNode(true);
    ghostEl.classList.add('dock-drag-ghost');
    ghostEl.classList.remove('dock-dragging', 'dock-removing', 'open', 'minimized');
    ghostEl.style.width = rect.width + 'px';
    ghostEl.style.height = rect.height + 'px';
    document.body.appendChild(ghostEl);
    updateGhostPos(e.clientX, e.clientY);
  };

  const onPointerMove = (e)=>{
    if(!down || (pointerId !== null && e.pointerId !== pointerId)) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if(!dragging && (Math.abs(dx) + Math.abs(dy)) > 4){
      beginDrag(e);
    }
    if(!dragging) return;
    updateGhostPos(e.clientX, e.clientY);
    const inDock = isPointInRect(e.clientX, e.clientY, innerEl.getBoundingClientRect());
    if(inDock){
      btn.classList.remove('dock-removing');
      targetIndex = getDockInsertIndexFromClientX(e.clientX, btn);
      setDockDropPreview(targetIndex);
      setDockDropHighlight(true);
    } else {
      btn.classList.add('dock-removing');
      clearDockDropPreview();
      setDockDropHighlight(false);
    }
    e.preventDefault();
  };

  const onPointerUp = (e)=>{
    if(!down || (pointerId !== null && e.pointerId !== pointerId)) return;
    down = false;
    try{ btn.releasePointerCapture(pointerId); } catch {}
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
    if(!dragging){
      cleanup();
      pointerId = null;
      return;
    }
    const dockRect = innerEl.getBoundingClientRect();
    const inDock = isPointInRect(e.clientX, e.clientY, dockRect);
    if(!inDock){
      cleanup();
      removeDockItem(item.type, item.refId);
      pointerId = null;
      return;
    }
    const key = getDockItemKey(item.type, item.refId);
    const normal = getDockItemsWithoutTrash();
    const hasOverflow = isMobileDock() && normal.length > DOCK_MOBILE_MAX_NORMAL;
    const visible = hasOverflow ? normal.slice(0, DOCK_MOBILE_MAX_NORMAL) : normal.slice();
    const hidden = hasOverflow ? normal.slice(DOCK_MOBILE_MAX_NORMAL) : [];
    const minInsertIndex = getDockMinInsertIndex(visible);
    const fromIndex = visible.findIndex(it => (it.id || getDockItemKey(it.type, it.refId)) === key);
    if(fromIndex !== -1){
      const moved = visible.splice(fromIndex, 1)[0];
      const insertAt = clamp(targetIndex >= 0 ? targetIndex : fromIndex, minInsertIndex, visible.length);
      visible.splice(insertAt, 0, moved);
      state.dockItems = ensureTrashDockItem(visible.concat(hidden));
      saveDockItems();
      cleanup();
      renderBlissOSDock();
    } else {
      cleanup();
    }
    pointerId = null;
  };

  btn.addEventListener('pointerdown', (e)=>{
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    if(isDockItemLocked(item)) return;
    down = true;
    dragging = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    targetIndex = -1;
    try{ btn.setPointerCapture(pointerId); } catch {}
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
  });
}

function animateGenie(ghost, fromRect, toRect, opts = {}){
  const dx = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2);
  const dy = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);
  const duration = opts.duration || 450;
  const easing = opts.easing || 'cubic-bezier(0.45, 0.03, 0.52, 0.96)';

  const forwardKeyframes = [
    {
      transform: 'translate(0px,0px) scale(1)',
      clipPath: 'inset(0% 0% 0% 0% round 6px)',
      opacity: 1
    },
    {
      transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) scale(0.5)`,
      clipPath: 'polygon(0% 0%, 100% 0%, 90% 60%, 10% 60%)',
      opacity: 0.7
    },
    {
      transform: `translate(${dx}px, ${dy}px) scale(0.1)`,
      clipPath: 'inset(45% 45% 45% 45% round 12px)',
      opacity: 0.2
    }
  ];

  const reverseKeyframes = [
    {
      transform: 'translate(0px,0px) scale(0.1)',
      clipPath: 'inset(45% 45% 45% 45% round 12px)',
      opacity: 0.2
    },
    {
      transform: `translate(${dx * 0.5}px, ${dy * 0.5}px) scale(0.5)`,
      clipPath: 'polygon(0% 0%, 100% 0%, 90% 60%, 10% 60%)',
      opacity: 0.7
    },
    {
      transform: `translate(${dx}px, ${dy}px) scale(1)`,
      clipPath: 'inset(0% 0% 0% 0% round 6px)',
      opacity: 1
    }
  ];

  const finalKeyframes = opts.direction === 'reverse' ? reverseKeyframes : forwardKeyframes;
  return ghost.animate(finalKeyframes, { duration, easing, fill: 'forwards' });
}

function cancelDockAnimation(appId){
  if(!state || !state.dockAnimations) return;
  const entry = state.dockAnimations.get(appId);
  if(!entry) return;
  try{ entry.anim.cancel(); } catch {}
  if(entry.ghost && entry.ghost.remove) entry.ghost.remove();
  state.dockAnimations.delete(appId);
}

function minimizeToDock(appId){
  const w = state.windows.get(appId);
  if (!w) return;
  const el = document.getElementById(`win_${appId}`);
  if (!el) return;
  cancelDockAnimation(appId);
  // Record last rect for restore
  w.lastRect = { left: w.left, top: w.top, width: w.width, height: w.height };
  // Determine if motion should be reduced
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !state.animations;
  // Mark minimized
  w.minimized = true;
  // Update active states
  if (state.activeWindowId === appId) state.activeWindowId = null;
  if (state.activeAppId === appId) state.activeAppId = 'bliss';
  renderTaskButtons();
  updateBlissOSActiveApp();
  const dockItem = getDockItemEl(appId);
  if (dockItem) dockItem.classList.add('minimized');
  if (reduceMotion) {
    el.classList.add('hidden');
    return;
  }
  const fromRect = el.getBoundingClientRect();
  let toRect;
  if (dockItem) {
    const iconRect = dockItem.getBoundingClientRect();
    toRect = {
      left: iconRect.left + (iconRect.width / 2) - (fromRect.width / 2),
      top: iconRect.top + (iconRect.height / 2) - (fromRect.height / 2),
      width: fromRect.width,
      height: fromRect.height
    };
  } else {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    toRect = {
      left: 10,
      top: vh - fromRect.height - 10,
      width: fromRect.width,
      height: fromRect.height
    };
  }
  const ghost = el.cloneNode(true);
  ghost.classList.add('dock-genie-ghost');
  ghost.style.left = fromRect.left + 'px';
  ghost.style.top = fromRect.top + 'px';
  ghost.style.width = fromRect.width + 'px';
  ghost.style.height = fromRect.height + 'px';
  ghost.style.opacity = '1';
  document.body.appendChild(ghost);
  el.classList.add('hidden');
  animateGenie(ghost, fromRect, toRect).onfinish = () => {
    ghost.remove();
  };
}

function restoreFromDock(appId){
  const w = state.windows.get(appId);
  if (!w) return;
  if (!w.minimized) {
    focusWindow(appId);
    return;
  }
  const el = document.getElementById(`win_${appId}`);
  if (!el) return;
  cancelDockAnimation(appId);
  const dockItem = getDockItemEl(appId);
  if (dockItem) dockItem.classList.remove('minimized');
  const last = w.lastRect || { left: w.left, top: w.top, width: w.width, height: w.height };
  w.minimized = false;
  w.left = last.left;
  w.top = last.top;
  w.width = last.width;
  w.height = last.height;
  el.style.left = w.left + 'px';
  el.style.top = w.top + 'px';
  el.style.width = w.width + 'px';
  el.style.height = w.height + 'px';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !state.animations;
  el.classList.remove('hidden');
  if (reduceMotion) {
    if (state && state.hiddenApps) state.hiddenApps.delete(appId);
    focusWindow(appId);
    return;
  }
  const toRect = { left: w.left, top: w.top, width: w.width, height: w.height };
  if(!dockItem){
    if (state && state.hiddenApps) state.hiddenApps.delete(appId);
    focusWindow(appId);
    return;
  }
  const iconRect = dockItem.getBoundingClientRect();
  const dockCx = iconRect.left + iconRect.width / 2;
  const dockCy = iconRect.top + iconRect.height / 2;
  const winCx = toRect.left + toRect.width / 2;
  const winCy = toRect.top + toRect.height / 2;
  const dx = dockCx - winCx;
  const dy = dockCy - winCy;
  const scaleRaw = Math.min(iconRect.width / toRect.width, iconRect.height / toRect.height);
  const startScale = clamp(scaleRaw, 0.08, 0.35);
  const ghost = el.cloneNode(true);
  ghost.classList.add('dock-genie-ghost');
  ghost.style.left = toRect.left + 'px';
  ghost.style.top = toRect.top + 'px';
  ghost.style.width = toRect.width + 'px';
  ghost.style.height = toRect.height + 'px';
  ghost.style.opacity = '0.9';
  ghost.style.transformOrigin = 'center center';
  document.body.appendChild(ghost);
  el.style.opacity = '0';
  const anim = ghost.animate([
    { transform: `translate(${dx}px, ${dy}px) scale(${startScale})`, opacity: 0.35 },
    { transform: 'translate(0px, 0px) scale(1)', opacity: 1 }
  ], {
    duration: 320,
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
    fill: 'forwards'
  });
  state.dockAnimations.set(appId, { anim, ghost });
  anim.onfinish = () => {
    ghost.remove();
    el.style.opacity = '';
    state.dockAnimations.delete(appId);
    if (state && state.hiddenApps) state.hiddenApps.delete(appId);
    focusWindow(appId);
  };
  anim.oncancel = () => {
    if(ghost.parentNode) ghost.remove();
    el.style.opacity = '';
    state.dockAnimations.delete(appId);
  };
}

function hideAppWindows(appId){
  const w = state.windows.get(appId);
  if(!w || w.minimized) return;
  state.hiddenApps.add(appId);
  minimizeApp(appId);
}

function hideOtherApps(activeAppId){
  state.windows.forEach((w, id)=>{
    if(id === activeAppId) return;
    if(!w.minimized){
      state.hiddenApps.add(id);
      minimizeApp(id);
    }
  });
}

function showHiddenApps(){
  Array.from(state.windows.keys()).forEach(appId => {
    restoreWindow(appId);
  });
  state.hiddenApps.clear();
}

function renderBlissOSAppMenu(){
  const menu = $('#blissosAppMenuDrop');
  if(!menu) return;
  const activeId = getActiveAppId();
  const activeDisplay = getAppDisplay(activeId);
  const openApps = Array.from(state.windows.values())
    .sort((a,b)=>b.z - a.z)
    .map(w => w.id);
  if(!openApps.includes('bliss')) openApps.push('bliss');
  const uniqueApps = Array.from(new Set(openApps));
  const hasMinimized = Array.from(state.windows.values()).some(w => w.minimized);
  const hideDisabled = activeId === 'bliss' || !state.windows.has(activeId);
  const hideOthersDisabled = uniqueApps.filter(id => id !== activeId && id !== 'bliss').length === 0;
  const showAllDisabled = !hasMinimized;

  const actionHtml = `
    <button class="menu-item ${hideDisabled ? 'disabled' : ''}" type="button" data-blissos-appmenu-action="hide-app" ${hideDisabled ? 'disabled' : ''}>
      <span class="menu-check"></span>
      <span class="menu-icon"></span>
      <span class="menu-label">Hide ${activeDisplay.label}</span>
    </button>
    <button class="menu-item ${hideOthersDisabled ? 'disabled' : ''}" type="button" data-blissos-appmenu-action="hide-others" ${hideOthersDisabled ? 'disabled' : ''}>
      <span class="menu-check"></span>
      <span class="menu-icon"></span>
      <span class="menu-label">Hide Others</span>
    </button>
    <button class="menu-item ${showAllDisabled ? 'disabled' : ''}" type="button" data-blissos-appmenu-action="show-all" ${showAllDisabled ? 'disabled' : ''}>
      <span class="menu-check"></span>
      <span class="menu-icon"></span>
      <span class="menu-label">Show All</span>
    </button>
  `;

  const appItems = uniqueApps.map(appId => {
    const { label, iconHtml } = getAppDisplay(appId);
    const check = (appId === activeId) ? '✓' : '';
    return `
      <button class="menu-item" type="button" data-blissos-appmenu-app="${appId}">
        <span class="menu-check">${check}</span>
        <span class="menu-icon">${iconHtml}</span>
        <span class="menu-label">${label}</span>
      </button>
    `;
  }).join('');

  menu.innerHTML = `
    ${actionHtml}
    <div class="menu-sep" role="separator"></div>
    ${appItems}
  `;
  const btn = $('#blissosAppMenu');
  if(btn){
    const rect = btn.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.style.left = 'auto';
  }
}

      function tickClock(){
        const displayTime = getDisplayTime();
        const clock = $('#clock');
        if(clock) clock.textContent = displayTime;
        const blissClock = $('#blissosClock');
        if(blissClock) blissClock.textContent = displayTime;
        if(isTaskbarCalendarOpen()){
          renderTaskbarCalendar();
          positionTaskbarCalendar();
        }
        setTimeout(tickClock, 1000);
      }

      function syncLoginOsButtons(){
        const current = getCurrentOsThemeChoice();
        $$('[data-login-os]').forEach(btn => {
          const btnOs = normalizeOsThemeChoice(btn.dataset.loginOs || 'bliss98');
          btn.classList.toggle('pressed', btnOs === current);
        });
      }

      function selectLoginOs(theme){
        const selectedTheme = normalizeOsThemeChoice(theme);
        setOsTheme(selectedTheme);
        syncLoginOsButtons();
      }

      function enter(){
        const name = $('#username').value.trim();
        if(!name){
          showMessage('dialog.loginEmpty.title', 'dialog.loginEmpty.body');
          $('#username').focus();
          return;
        }
        state.didAutoPlayThisSession = false;
        setUser(name);
        showDesktop();
        if(!state.windows.has('mediaplayer')) openApp('mediaplayer');
        if(!state.windows.has('music')) openApp('music');
        schedulePlayerAutoplay();
      }

      $('#enter').addEventListener('click', enter);
      $('#username').addEventListener('keydown', (e)=>{ if(e.key==='Enter') enter(); });
      $('#langBtn').addEventListener('click', (e)=>{ e.preventDefault(); toggleLang(); });
      $$('[data-login-os]').forEach(btn => {
        btn.addEventListener('click', ()=>selectLoginOs(btn.dataset.loginOs || 'bliss98'));
      });
      syncLoginOsButtons();

      $('#clearProfile').addEventListener('click', ()=>{
        localStorage.removeItem('bliss98_user');
        $('#username').value = '';
        $('#username').focus();
      });

      document.addEventListener('keydown', (e)=>{
        if(e.key==='Escape'){
          closeStartMenu();
          closeCtxMenu();
          closeWindowMenu();
          closeModal();
          closeBlissOSMenu();
          closeBlissOSAppMenu();
          closeTaskbarCalendar();
        }
        if(snakeHandleKey(e)) return;
        if(dopeSkateHandleKey(e)) return;
        const activeEl = document.activeElement;
        if((e.key === 'Enter' || e.key === ' ') && activeEl && (activeEl.id === 'clock' || activeEl.id === 'blissosClock')){
          e.preventDefault();
          toggleTaskbarCalendar(activeEl);
          return;
        }
        if(e.key === 'Enter' && state.activeWindowId === 'poetry' && state.poetry.view === 'list' && state.poetry.selectedId){
          state.poetry.view = 'read';
          state.poetry.currentId = state.poetry.selectedId;
          state.poetry.readLang = state.lang;
          renderPoetryWindow();
        }
        if(e.key === 'Enter' && state.activeWindowId === 'games' && state.games.view === 'list' && state.games.selectedId){
          openGameFromHub(state.games.selectedId);
        }

        // Keyboard context menu (Shift+F10)
        if(e.shiftKey && e.key === 'F10'){
          if($('#desktop').classList.contains('hidden')) return;
          e.preventDefault();
          const area = $('#desktopArea').getBoundingClientRect();
          openCtxMenu(area.left + area.width/2, area.top + area.height/2, 'desktop', null);
        }

        // Basic keyboard navigation inside context menu
        const menu = $('#ctxMenu');
        if(menu && !menu.classList.contains('hidden')){
          const items = Array.from(menu.querySelectorAll('.ctx-item'));
          const idx = items.indexOf(document.activeElement);
          if(e.key === 'ArrowDown'){
            e.preventDefault();
            const next = items[Math.min(items.length-1, Math.max(0, idx+1))] || items[0];
            if(next) next.focus();
          }
          if(e.key === 'ArrowUp'){
            e.preventDefault();
            const prev = items[Math.max(0, idx-1)] || items[items.length-1];
            if(prev) prev.focus();
          }
        }

        const appMenu = $('#blissosAppMenuDrop');
        if(appMenu && !appMenu.classList.contains('hidden')){
          const items = Array.from(appMenu.querySelectorAll('.menu-item:not(.disabled)'));
          const idx = items.indexOf(document.activeElement);
          if(e.key === 'ArrowDown'){
            e.preventDefault();
            const next = items[Math.min(items.length-1, Math.max(0, idx+1))] || items[0];
            if(next) next.focus();
          }
          if(e.key === 'ArrowUp'){
            e.preventDefault();
            const prev = items[Math.max(0, idx-1)] || items[items.length-1];
            if(prev) prev.focus();
          }
          if(e.key === 'Enter' && idx >= 0){
            e.preventDefault();
            items[idx].click();
          }
        }
      });
      document.addEventListener('keyup', (e)=>{
        if(dopeSkateHandleKeyUp(e)) return;
      });
      document.addEventListener('input', (e)=>{
        const target = getEventTargetEl(e);
        const soundSlider = target && target.closest ? target.closest('[data-sound-slider]') : null;
        if(soundSlider && soundSlider.dataset && soundSlider.dataset.soundSlider){
          const val = clamp(parseFloat(soundSlider.value) / 100, 0, 1);
          if(soundSlider.dataset.soundSlider === 'master') setMasterVolume(val);
          if(soundSlider.dataset.soundSlider === 'system') setSystemVolume(val);
          if(soundSlider.dataset.soundSlider === 'music') setMusicVolume(val);
        }
        const dockSlider = target && target.closest ? target.closest('[data-dock-slider]') : null;
        if(dockSlider && dockSlider.dataset && dockSlider.dataset.dockSlider){
          const val = clamp(parseFloat(dockSlider.value), 0, 100);
          if(dockSlider.dataset.dockSlider === 'size') setDockSize(val);
          if(dockSlider.dataset.dockSlider === 'magnification') setDockMagnificationStrength(val);
          if(dockSlider.dataset.dockSlider === 'opacity') setDockOpacity(val);
        }
      });
      document.addEventListener('change', (e)=>{
        const target = getEventTargetEl(e);
        const dockToggle = target && target.closest ? target.closest('[data-dock-toggle]') : null;
        if(dockToggle && dockToggle.dataset){
          if(dockToggle.dataset.dockToggle === 'magnification'){
            setDockMagnification(!!dockToggle.checked);
            return;
          }
          if(dockToggle.dataset.dockToggle === 'autohide'){
            setDockAutoHide(!!dockToggle.checked);
            return;
          }
        }
        const blissOsDarkToggle = target && target.closest ? target.closest('[data-toggle-blissos-darkmode]') : null;
        if(blissOsDarkToggle){
          setBlissOSDarkMode(!!blissOsDarkToggle.checked);
          return;
        }
        const blissOsAquaToggle = target && target.closest ? target.closest('[data-toggle-blissos-aqua]') : null;
        if(blissOsAquaToggle){
          setBlissOSAqua(!!blissOsAquaToggle.checked);
          return;
        }
        const fullscreenToggle = target && target.closest ? target.closest('[data-toggle-fullscreen]') : null;
        if(fullscreenToggle){
          setFullscreen(!!fullscreenToggle.checked);
        }
      });
      document.addEventListener('fullscreenchange', ()=>{
        updateFullscreenButtons();
      });

      function slideStripBy(strip, delta){
        if(!strip || !Number.isFinite(delta) || delta === 0) return;
        const max = Math.max(0, strip.scrollWidth - strip.clientWidth);
        const start = strip.scrollLeft;
        const target = clamp(start + delta, 0, max);
        if(Math.abs(target - start) < 1) return;
        const animate = state.animations && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if(!animate){
          strip.scrollLeft = target;
          return;
        }
        const duration = 220;
        const t0 = performance.now();
        const step = (now)=>{
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          strip.scrollLeft = Math.round(start + (target - start) * eased);
          if(p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }

      document.addEventListener('click', (e)=>{
        const target = getEventTargetEl(e);
        if(!target || !target.closest){
          closeStartMenu();
          closeCtxMenu();
          closeBlissOSMenu();
          closeBlissOSAppMenu();
          closeTaskbarCalendar();
          return;
        }
        const calendarClock = target.closest('#clock') || target.closest('#blissosClock');
        if(calendarClock){
          e.preventDefault();
          e.stopPropagation();
          toggleTaskbarCalendar(calendarClock);
          return;
        }
        const inTaskbarCalendar = target.closest('#taskbarCalendar');
        if(!inTaskbarCalendar) closeTaskbarCalendar();
        const startArea = target.closest('#startMenu') || target.closest('#startBtn');
        if(!startArea) closeStartMenu();
        const ctxArea = target.closest('#ctxMenu');
        if(!ctxArea) closeCtxMenu();
        const inAppleMenu = target.closest('#blissosAppleMenu') || target.closest('[data-blissos-menu="apple"]');
        if(!inAppleMenu) closeBlissOSMenu();
        const inAppMenu = target.closest('#blissosAppMenuDrop') || target.closest('#blissosAppMenu');
        if(!inAppMenu) closeBlissOSAppMenu();
        const poemItem = target.closest('[data-poem-id]');
        if(poemItem){
          const id = poemItem.dataset.poemId;
          if(e.detail > 1) return;
          selectPoetryItem(id);
          return;
        }
        const poemAction = target.closest('[data-poetry-action]');
        if(poemAction && poemAction.dataset && poemAction.dataset.poetryAction){
          if(poemAction.dataset.poetryAction === 'back'){
            state.poetry.view = 'list';
            state.poetry.currentId = null;
            renderPoetryWindow();
          }
          if(poemAction.dataset.poetryAction === 'toggleLang'){
            state.poetry.readLang = (state.poetry.readLang === 'en') ? 'pt' : 'en';
            renderPoetryWindow();
          }
          return;
        }

        const trashBtn = target.closest('[data-trash-action]');
        if(trashBtn && trashBtn.dataset){
          const action = trashBtn.dataset.trashAction;
          if(action === 'empty'){
            emptyTrash();
            state.trashSelection = new Set();
          }
          return;
        }

        const modalAction = target.closest('[data-modal-action]');
        if(modalAction && modalAction.dataset && modalAction.dataset.modalAction){
          const act = modalAction.dataset.modalAction;
          if(act === 'confirm' && typeof modalState.onConfirm === 'function'){
            const select = $('#modalSelect');
            const input = $('#modalInput');
            const value = input ? input.value : (select ? select.value : null);
            modalState.onConfirm(value);
          }
          closeModal();
          return;
        }
        if(e.target && e.target.id === 'modal'){
          closeModal();
          return;
        }
        if(e.target && e.target.id === 'modalClose'){
          closeModal();
          return;
        }

        const menuItem = target.closest('[data-menu-action]');
        if(menuItem && menuItem.dataset && menuItem.dataset.menuAction){
          e.preventDefault();
          e.stopPropagation();
          handleMenuAction(menuItem.dataset.menuAction);
          closeWindowMenu();
          return;
        }
        const blissItem = target.closest('[data-blissos-action]');
        if(blissItem && blissItem.dataset && blissItem.dataset.blissosAction){
          e.preventDefault();
          e.stopPropagation();
          if(blissItem.dataset.blissosAction === 'about') openApp('about');
          if(blissItem.dataset.blissosAction === 'logoff') doLogoff();
          closeBlissOSMenu();
          return;
        }
        const blissOpenApp = target.closest('[data-blissos-open-app]');
        if(blissOpenApp && blissOpenApp.dataset && blissOpenApp.dataset.blissosOpenApp){
          e.preventDefault();
          e.stopPropagation();
          openApp(blissOpenApp.dataset.blissosOpenApp);
          closeBlissOSMenu();
          return;
        }
        const blissSettingsTab = target.closest('[data-blissos-settings-tab]');
        if(blissSettingsTab && blissSettingsTab.dataset && blissSettingsTab.dataset.blissosSettingsTab){
          e.preventDefault();
          e.stopPropagation();
          openSettingsAndTab(blissSettingsTab.dataset.blissosSettingsTab);
          closeBlissOSMenu();
          return;
        }
        const blissAppMenuBtn = target.closest('#blissosAppMenu');
        if(blissAppMenuBtn){
          e.preventDefault();
          e.stopPropagation();
          playSfx('tabChange');
          toggleBlissOSAppMenu();
          return;
        }
        const blissAppMenuAction = target.closest('[data-blissos-appmenu-action]');
        if(blissAppMenuAction && blissAppMenuAction.dataset && blissAppMenuAction.dataset.blissosAppmenuAction){
          e.preventDefault();
          e.stopPropagation();
          const action = blissAppMenuAction.dataset.blissosAppmenuAction;
          const activeId = getActiveAppId();
          if(action === 'hide-app') hideAppWindows(activeId);
          if(action === 'hide-others') hideOtherApps(activeId);
          if(action === 'show-all') showHiddenApps();
          closeBlissOSAppMenu();
          return;
        }
        const blissAppMenuApp = target.closest('[data-blissos-appmenu-app]');
        if(blissAppMenuApp && blissAppMenuApp.dataset && blissAppMenuApp.dataset.blissosAppmenuApp){
          e.preventDefault();
          e.stopPropagation();
          const appId = blissAppMenuApp.dataset.blissosAppmenuApp;
          if(state.windows.has(appId)){
            restoreWindow(appId);
            focusWindow(appId);
          } else if(appId === 'bliss'){
            state.activeWindowId = null;
            state.activeAppId = 'bliss';
            $$('.window').forEach(winEl=>{
              winEl.dataset.active = '0';
              const tb = winEl.querySelector('.titlebar');
              if(tb) tb.style.filter = 'grayscale(0.35) brightness(0.9)';
            });
            updateBlissOSActiveApp();
          } else {
            openApp(appId);
          }
          closeBlissOSAppMenu();
          return;
        }
        const blissBrand = target.closest('[data-blissos-menu="apple"]');
        if(blissBrand){
          e.preventDefault();
          e.stopPropagation();
          playSfx('tabChange');
          toggleBlissOSMenu();
          return;
        }
        const blissMenuItem = target.closest('.blissos-menu-item[data-blissos-menu]');
        if(blissMenuItem && state.settings.theme === 'blissos'){
          e.preventDefault();
          e.stopPropagation();
          playSfx('tabChange');
          const winEl = state.activeWindowId ? document.getElementById(`win_${state.activeWindowId}`) : null;
          const menuKey = blissMenuItem.dataset.blissosMenu;
          closeBlissOSAppMenu();
          if(state.menuOpen && state.menuOpen.winId === getWindowId(winEl) && state.menuOpen.menuKey === menuKey){
            closeWindowMenu();
          } else {
            openWindowMenu(winEl, menuKey, blissMenuItem);
          }
          return;
        }
        const menuToggle = target.closest('.menubar span[data-menu]');
        if(menuToggle){
          e.preventDefault();
          e.stopPropagation();
          const winEl = menuToggle.closest('.window');
          const menuKey = menuToggle.dataset.menu;
          if(state.menuOpen && state.menuOpen.winId === getWindowId(winEl) && state.menuOpen.menuKey === menuKey){
            closeWindowMenu();
          } else {
            openWindowMenu(winEl, menuKey, menuToggle);
          }
          return;
        }

        const btn = target.closest('[data-set-lang]');
        if(btn && btn.dataset && btn.dataset.setLang){
          setLang(btn.dataset.setLang);
        }
        const wallpaperNav = target.closest('[data-wallpaper-nav]');
        if(wallpaperNav && wallpaperNav.dataset){
          const dir = Number(wallpaperNav.dataset.wallpaperNav);
          const shell = wallpaperNav.closest('[data-wallpaper-slider]');
          const strip = shell ? shell.querySelector('[data-wallpaper-strip]') : null;
          if(strip){
            const firstCard = strip.querySelector('.wallpaper-card');
            let distance = Math.max(120, Math.floor(strip.clientWidth * 0.75));
            if(firstCard){
              const stripStyles = window.getComputedStyle(strip);
              const gapRaw = parseFloat(stripStyles.columnGap || stripStyles.gap || '0');
              const gap = Number.isFinite(gapRaw) ? gapRaw : 0;
              const cardW = Math.max(0, Math.round(firstCard.getBoundingClientRect().width + gap));
              if(cardW > 0){
                distance = cardW * 2;
              }
            }
            slideStripBy(strip, (dir < 0 ? -1 : 1) * distance);
          }
        }
        const wpBtn = target.closest('[data-set-wallpaper]');
        if(wpBtn && wpBtn.dataset && wpBtn.dataset.setWallpaper){
          applyWallpaper(wpBtn.dataset.setWallpaper);
        }
        const animBtn = target.closest('[data-set-animations]');
        if(animBtn && animBtn.dataset && animBtn.dataset.setAnimations){
          setAnimations(animBtn.dataset.setAnimations === 'on');
        }
        const openAnimBtn = target.closest('[data-set-appopenanim]');
        if(openAnimBtn && openAnimBtn.dataset && openAnimBtn.dataset.setAppopenanim){
          setAppOpenAnim(openAnimBtn.dataset.setAppopenanim === 'on');
        }
        const scanBtn = target.closest('[data-set-scanlines]');
        if(scanBtn && scanBtn.dataset && scanBtn.dataset.setScanlines){
          setScanlines(scanBtn.dataset.setScanlines === 'on');
        }
        const darkBtn = target.closest('[data-set-darkmode]');
        if(darkBtn && darkBtn.dataset && darkBtn.dataset.setDarkmode){
          setDarkMode(darkBtn.dataset.setDarkmode === 'on');
        }
        const fullscreenBtn = target.closest('[data-set-fullscreen]');
        if(fullscreenBtn && fullscreenBtn.dataset && fullscreenBtn.dataset.setFullscreen){
          setFullscreen(fullscreenBtn.dataset.setFullscreen === 'on');
        }
        const blissosDarkBtn = target.closest('[data-set-blissos-darkmode]');
        if(blissosDarkBtn && blissosDarkBtn.dataset && blissosDarkBtn.dataset.setBlissosDarkmode){
          setBlissOSDarkMode(blissosDarkBtn.dataset.setBlissosDarkmode === 'on');
        }
        const blissosAquaBtn = target.closest('[data-set-blissos-aqua]');
        if(blissosAquaBtn && blissosAquaBtn.dataset && blissosAquaBtn.dataset.setBlissosAqua){
          setBlissOSAqua(blissosAquaBtn.dataset.setBlissosAqua === 'on');
        }
        const bliss98AccentBtn = target.closest('[data-set-bliss98-accent]');
        if(bliss98AccentBtn && bliss98AccentBtn.dataset && bliss98AccentBtn.dataset.setBliss98Accent){
          setBliss98Accent(bliss98AccentBtn.dataset.setBliss98Accent);
        }
        const retroBtn = target.closest('[data-set-retro]');
        if(retroBtn && retroBtn.dataset && retroBtn.dataset.setRetro){
          setRetroGlow(retroBtn.dataset.setRetro === 'on');
        }
        const soundSlider = target.closest('[data-sound-slider]');
        if(soundSlider && soundSlider.dataset && soundSlider.dataset.soundSlider){
          const val = clamp(parseFloat(soundSlider.value) / 100, 0, 1);
          if(soundSlider.dataset.soundSlider === 'master') setMasterVolume(val);
          if(soundSlider.dataset.soundSlider === 'system') setSystemVolume(val);
          if(soundSlider.dataset.soundSlider === 'music') setMusicVolume(val);
        }
        const systemSoundsToggle = target.closest('[data-toggle-system-sounds]');
        if(systemSoundsToggle){
          setSystemSoundsEnabled(!areSystemSoundsEnabled());
        }
        const clockBtn = target.closest('[data-set-clock]');
        if(clockBtn && clockBtn.dataset && clockBtn.dataset.setClock){
          setClockFormat(clockBtn.dataset.setClock === '24');
        }
        const crtBtn = target.closest('[data-set-oldcrt]');
        if(crtBtn && crtBtn.dataset && crtBtn.dataset.setOldcrt){
          setOldCrt(crtBtn.dataset.setOldcrt === 'on');
        }
        const osThemeBtn = target.closest('[data-set-os-theme]');
        if(osThemeBtn && osThemeBtn.dataset && osThemeBtn.dataset.setOsTheme){
          setOsTheme(osThemeBtn.dataset.setOsTheme);
        }
        const titleBtn = target.closest('[data-set-titlebar]');
        if(titleBtn && titleBtn.dataset && titleBtn.dataset.setTitlebar){
          setTitlebarTheme(titleBtn.dataset.setTitlebar);
        }
        const themeBtn = target.closest('[data-set-theme]');
        if(themeBtn && themeBtn.dataset && themeBtn.dataset.setTheme){
          setThemePreset(themeBtn.dataset.setTheme);
        }
        const themeCustomBtn = target.closest('[data-theme-custom]');
        if(themeCustomBtn && themeCustomBtn.dataset && themeCustomBtn.dataset.themeCustom){
          const act = themeCustomBtn.dataset.themeCustom;
          if(act === 'save'){
            saveCustomThemeFromState();
          }
          if(act === 'load'){
            if(!themeCustomBtn.classList.contains('disabled')) applyCustomTheme();
          }
        }
        const gamesTabBtn = target.closest('[data-games-tab]');
        if(gamesTabBtn && gamesTabBtn.dataset && gamesTabBtn.dataset.gamesTab){
          const tab = gamesTabBtn.dataset.gamesTab;
          const nextView = (tab === 'leaderboard') ? 'leaderboard' : 'list';
          if(state.games.view !== nextView){
            playSfx('tabChange');
          }
          state.games.view = nextView;
          renderGamesWindow();
        }
        const videosAction = target.closest('[data-videos-action]');
        if(videosAction && videosAction.dataset && videosAction.dataset.videosAction){
          const act = videosAction.dataset.videosAction;
          if(act === 'openChannel'){
            openLink(VIDEO_CHANNEL_URL, 'videos');
          }
        }
        const musicCard = target.closest('[data-music-id]');
        if(musicCard){
          if(musicCard.dataset && musicCard.dataset.touchOpened === '1'){
            delete musicCard.dataset.touchOpened;
            return;
          }
          const id = musicCard.dataset.musicId;
          if(e.ctrlKey || e.metaKey){
            if(state.music.selected.has(id)) state.music.selected.delete(id);
            else state.music.selected.add(id);
          } else {
            state.music.selected = new Set([id]);
          }
          applyMusicState();
          return;
        }

        const ctxBtn = target.closest('[data-ctx-action]');
        if(ctxBtn && ctxBtn.dataset && ctxBtn.dataset.ctxAction){
          if(ctxBtn.disabled || ctxBtn.classList.contains('disabled')) return;
          e.preventDefault();
          e.stopPropagation();
          handleCtxAction(ctxBtn.dataset.ctxAction);
          closeCtxMenu();
        }
        if(!target.closest('.menu-drop') && !target.closest('.menubar') && !target.closest('#blissosMenuDrop') && !target.closest('#blissosMenubar')){
          closeWindowMenu();
        }
      });

      document.addEventListener('error', (e)=>{
        const img = e.target;
        if(!img || img.tagName !== 'IMG') return;
        const fallback = img.dataset ? img.dataset.fallbackSrc : null;
        if(!fallback) return;
        if(img.dataset.failed === '1') return;
        img.dataset.failed = '1';
        img.src = fallback;
      }, true);

/* ===== Module: 07-init.js ===== */
      function maybeAutoLaunchGameFromQuery(){
        let params = null;
        try{
          params = new URLSearchParams(window.location.search);
        } catch {
          return;
        }
        if(!params) return;
        const autoGame = (params.get('autogame') || '').trim().toLowerCase();
        if(autoGame !== 'snake') return;
        const rawUser = (params.get('user') || localStorage.getItem('bliss98_user') || 'PLAYER').trim();
        const user = rawUser || 'PLAYER';
        setUser(user);
        if($('#username')) $('#username').value = user;
        showDesktop();
        if(!state.windows.has('games')) openApp('games');
        state.games.view = 'snake';
        state.games.selectedId = 'snake';
        renderGamesWindow();
        focusWindow('games');
      }

      (function init(){
        const savedLang = localStorage.getItem('bliss98_lang') || 'en';
        state.lang = (savedLang === 'pt') ? 'pt' : 'en';

        const saved = localStorage.getItem('bliss98_user');
        if(saved){ setUser(saved); $('#username').value = saved; }

        let osThemeChoice = getSavedOsTheme();
        if(!osThemeChoice){
          const autoOsTheme = detectDefaultOSForFirstVisit();
          if(autoOsTheme){
            osThemeChoice = autoOsTheme;
          } else {
            osThemeChoice = loadOsTheme();
          }
        }
        state.settings.osProfiles = loadOsProfiles();
        state.settings.bliss98Accent = loadBliss98Accent();
        state.settings.blissosAccent = loadBlissosAccent();
        mpLoadState();
        
        applyOsProfile(osThemeChoice);
        saveOsTheme();
        initMatrixEffect();

        state.gridSnap = loadGridSnap();
        state.animations = loadAnimations();
        state.settings.appOpenAnim = loadAppOpenAnim();
        
        state.games.layout = loadGamesLayout();
        state.games.bigIcons = loadGamesBigIcons();
        state.folders = loadFolders();
        if(!Array.isArray(state.folders.games)) state.folders.games = [];
        if(!state.folders.games.includes('snake')) state.folders.games.unshift('snake');
        if(!state.folders.games.includes('dope-skate')) state.folders.games.push('dope-skate');
        state.snake.highScore = loadSnakeHighScore();
        state.dopeSkate.highScore = loadDopeSkateHighScore();
        recordGameScore('snake', state.snake.highScore);
        recordGameScore('dopeSkate', state.dopeSkate.highScore);
        state.trash = new Set(loadTrash());
        state.iconLabels = loadIconLabels();
        state.trashSelection = new Set();
        initDesktopFs();
        const savedDock = loadDockItems();
        state.dockItems = normalizeDockItems(savedDock == null ? getDefaultDockItems() : savedDock);
        saveDockItems();

        // Apply translations immediately (default is English)
        // Apply initial BlissOS accent color
        if (isBlissOS()) {
          applyBlissosAccent(state.settings.blissosAccent);
        }
        applyI18n();
        applyOsTheme();
        if(typeof syncLoginOsButtons === 'function') syncLoginOsButtons();
        updateTrashIconUI();
        initSfx();
        showLogin(true);
        maybeAutoLaunchGameFromQuery();
        window.addEventListener('resize', scheduleWindowRelayout, { passive:true });
        window.addEventListener('orientationchange', scheduleWindowRelayout, { passive:true });
        if(window.visualViewport){
          window.visualViewport.addEventListener('resize', scheduleWindowRelayout, { passive:true });
        }
        document.addEventListener('pointerdown', (e)=>{
          const target = getEventTargetEl(e);
          const winEl = target && target.closest ? target.closest('.window') : null;
          if(!winEl) return;
          const appId = winEl.id ? winEl.id.replace('win_','') : null;
          if(appId && state.windows.has(appId)) focusWindow(appId);
        }, true);
        const cm = $('#ctxMenu');
        if(cm){
          cm.addEventListener('click', (ev)=>{
            const target = getEventTargetEl(ev);
            const btn = target && target.closest ? target.closest('[data-ctx-action]') : null;
            if(btn && btn.dataset && btn.dataset.ctxAction){
              if(btn.disabled || btn.classList.contains('disabled')) return;
              ev.preventDefault();
              ev.stopPropagation();
              handleCtxAction(btn.dataset.ctxAction);
              closeCtxMenu();
              return;
            }
            // Prevent clicks inside the menu from bubbling to the document closer
            ev.stopPropagation();
          });
        }

        // Mobile optimization: Native Pointer Events and Click handlers now work without suppression
        // IS_COARSE removed - all events handled via standard Pointer Events API
      })();
