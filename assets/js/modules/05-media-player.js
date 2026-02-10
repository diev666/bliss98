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
            return { src, title: item.title ? String(item.title) : mpResolveTitleFromSrc(raw), kind: 'manifest' };
          }
          return null;
        }).filter(Boolean);
      }

      function mpRebuildTracks(){
        mp.tracks = [...mp.manifestTracks, ...mp.imported];
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
          return `<button class="${cls}" type="button" data-mp-pick="${i}" title="${title}"><span class="mp-item-mark">${marker}</span><span class="mp-item-title">${title}</span></button>`;
        }).join('');
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
        if(toggleBtn) toggleBtn.innerHTML = mp.playing ? `⏸ ${t('player.pause')}` : `▶ ${t('player.play')}`;
        if(shuffleBtn){
          shuffleBtn.textContent = t('player.shuffle');
          shuffleBtn.classList.toggle('pressed', state.mediaplayer.shuffle);
        }
        if(repeatBtn){
          const repeatKey = `player.repeat.${state.mediaplayer.repeat}`;
          repeatBtn.textContent = `${t('player.repeat')} ${t(repeatKey)}`;
          repeatBtn.classList.toggle('pressed', state.mediaplayer.repeat !== 'off');
        }
        if(reimportBtn){
          reimportBtn.classList.toggle('hidden', !state.mediaplayer.needsReimport);
        }
        mpRenderList(els);
        mpUpdateTime();
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
