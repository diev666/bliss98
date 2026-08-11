
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
        const bootScreenWait = window.showBootScreen ? window.showBootScreen({ duration: 3000 }) : Promise.resolve();
        const logoffWait = playSfxAndWait('logoff');
        Promise.all([bootScreenWait, logoffWait]).finally(()=>{
          showLogin(false);
          if(window.hideBootScreen) window.hideBootScreen();
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

function isMobileKeyboardEditTarget(el){
  if(!el || !el.matches) return false;
  const selector = 'input, textarea, select, [data-txt-editor="1"], [contenteditable]:not([contenteditable="false"])';
  return !!(
    el.matches(selector) ||
    (el.closest && el.closest(selector))
  );
}

function isMobileKeyboardViewportOpen(){
  if(!state.isMobile || !window.visualViewport) return false;
  if(!isMobileKeyboardEditTarget(document.activeElement)) return false;
  const layoutHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  return (layoutHeight - window.visualViewport.height) > 120;
}

function lockMobileKeyboardScroll(){
  if(!state.isMobile) return;
  document.documentElement.classList.add('mobile-keyboard-lock');
  try{ window.scrollTo(0, 0); } catch {}
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function releaseMobileKeyboardScroll(){
  document.documentElement.classList.remove('mobile-keyboard-lock');
}

function handleViewportRelayout(){
  if(isMobileKeyboardViewportOpen()){
    lockMobileKeyboardScroll();
    return;
  }
  if(!isMobileKeyboardEditTarget(document.activeElement)){
    releaseMobileKeyboardScroll();
  }
  scheduleWindowRelayout();
  if(typeof renderBlissOSDock === 'function') renderBlissOSDock();
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
            minesweeperStop();
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
        
        // Auto-fit after content + i18n and keep correcting only when overflow appears.
        const skipOpenAutoFit = appId === 'dope-skate' && typeof isMobileGameMode === 'function' && isMobileGameMode();
        if(!skipOpenAutoFit){
          installAutoFitObserver(el, appId);
        }
        let fitPromise = Promise.resolve(getWindowRectFromState(wstate));
        if(!wstate.savedRect && !skipOpenAutoFit){
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

          const MIN_W = state.isMobile ? 240 : 280;
          const MIN_H = state.isMobile ? 180 : 200;
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
      const DOCK_MOBILE_RENDER_SCALE = 0.62;
      const DOCK_MOBILE_MAX_RENDER_SIZE = 62;
      const DOCK_DEFAULT_MAGNIFICATION = 60;
      const DOCK_AUTOHIDE_EDGE = 36;
      const DOCK_AUTOHIDE_HIDE_DELAY = 520;
      const dockBounceTimers = new WeakMap();
      const dockBounceHandlers = new WeakMap();
      let pendingDockBounceKey = '';
      let pendingDockBounceUntil = 0;
      let dockAutoHideFxBound = false;
      let dockAutoHideHideTimer = 0;
      let dockAutoHideVisible = true;

      function getDockRenderSizePercent(){
        const pct = getDockSizePercent();
        if(isMobileDock()){
          return clamp(Math.round(pct * DOCK_MOBILE_RENDER_SCALE), 0, DOCK_MOBILE_MAX_RENDER_SIZE);
        }
        return pct;
      }

      function getDockSizePercent(){
        const raw = Number(state.settings.dockSize);
        return Number.isFinite(raw) ? clamp(Math.round(raw), 0, 100) : DOCK_DEFAULT_SIZE;
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

      function getDockViewportWidth(){
        const vvWidth = window.visualViewport && Number(window.visualViewport.width);
        const viewportWidth = Number.isFinite(vvWidth) && vvWidth > 0
          ? vvWidth
          : (window.innerWidth || document.documentElement.clientWidth || 0);
        return Math.max(0, viewportWidth);
      }

      function getAquaMobileDockFitScale(metrics){
        if(!metrics) return 1;
        const availableWidth = Math.max(0, getDockViewportWidth() - 12);
        if(!availableWidth) return 1;
        const normalCount = Math.max(0, Number(metrics.normalCount) || 0);
        const hasTrash = !!metrics.hasTrash;
        const itemWidth = Math.max(0, Number(metrics.itemWidth) || 0);
        const itemGap = Math.max(0, Number(metrics.itemGap) || 0);
        const padX = Math.max(0, Number(metrics.padX) || 0);
        const rightGap = Math.max(0, Number(metrics.rightGap) || 0);
        const separatorWidth = Math.max(0, Number(metrics.separatorWidth) || 0);
        const trayOverhangX = Math.max(0, Number(metrics.trayOverhangX) || 0);
        const baseScale = Math.max(0.01, Number(metrics.baseScale) || 1);
        const midWidth = normalCount > 0
          ? (normalCount * itemWidth) + (Math.max(0, normalCount - 1) * itemGap)
          : 0;
        const rightWidth = hasTrash
          ? ((normalCount > 0 ? (separatorWidth + itemGap) : 0) + itemWidth)
          : 0;
        const neededWidth = (padX * 2) + midWidth + (hasTrash ? rightGap + rightWidth : 0) + trayOverhangX;
        const scaledNeededWidth = neededWidth * baseScale;
        if(neededWidth <= 0 || scaledNeededWidth <= availableWidth) return 1;
        return Math.min(1, availableWidth / scaledNeededWidth);
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

      function isAquaMobileDockBounceActive(){
        return state.settings.theme === 'blissos' && !!state.settings.blissosAqua && isMobileDock();
      }

      function getDockBounceKey(btn){
        if(!btn || !btn.dataset) return '';
        const type = btn.dataset.dockType || '';
        const ref = btn.dataset.refId || btn.dataset.dockWinId || '';
        return `${type}:${ref}`;
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

      function runLeopardDockBounce(btn){
        const prevTimer = dockBounceTimers.get(btn);
        if(prevTimer) clearTimeout(prevTimer);
        const prevHandler = dockBounceHandlers.get(btn);
        if(prevHandler) btn.removeEventListener('animationend', prevHandler);
        btn.classList.remove('dock-launching');
        void btn.offsetWidth;
        const cleanup = (event) => {
          if(event && event.animationName && event.animationName !== 'leopardDockBounce') return;
          btn.classList.remove('dock-launching');
          const timer = dockBounceTimers.get(btn);
          if(timer) clearTimeout(timer);
          btn.removeEventListener('animationend', cleanup);
          dockBounceTimers.delete(btn);
          dockBounceHandlers.delete(btn);
        };
        dockBounceHandlers.set(btn, cleanup);
        btn.addEventListener('animationend', cleanup);
        btn.classList.add('dock-launching');
        dockBounceTimers.set(btn, setTimeout(cleanup, 1300));
      }

      function replayPendingDockBounce(inner){
        if(!pendingDockBounceKey) return;
        if(Date.now() > pendingDockBounceUntil){
          pendingDockBounceKey = '';
          pendingDockBounceUntil = 0;
          return;
        }
        const btn = getLeopardDockItems(inner).find(item => getDockBounceKey(item) === pendingDockBounceKey);
        if(!btn) return;
        pendingDockBounceKey = '';
        pendingDockBounceUntil = 0;
        requestAnimationFrame(() => runLeopardDockBounce(btn));
      }

      function queueLeopardDockBounce(btn){
        if(!btn || (!isLeopardDockActive() && !isAquaMobileDockBounceActive())) return;
        pendingDockBounceKey = getDockBounceKey(btn);
        pendingDockBounceUntil = Date.now() + 1500;
      }

      function triggerLeopardDockBounce(btn){
        if(!btn || (!isLeopardDockActive() && !isAquaMobileDockBounceActive())) return;
        if(isAquaMobileDockBounceActive()){
          queueLeopardDockBounce(btn);
        }
        runLeopardDockBounce(btn);
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
        const dockSize = isAquaDock && mobileDock ? getDockSizePercent() : getDockRenderSizePercent();
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
        const trashItem = normalized.find(isTrashDockItem);
        const renderItems = trashItem ? normalItems.concat(trashItem) : normalItems.slice();
        const dockStateSig = renderItems.map(item => {
          const winId = getDockWindowIdForItem(item);
          const win = winId ? state.windows.get(winId) : null;
          const label = getDockItemLabel(item);
          return `${item.id}|${item.type}|${item.refId}|${item.iconPath || ''}|${label}|${winId}|${openIds.has(winId) ? 1 : 0}|${win && win.minimized ? 1 : 0}|${state.activeWindowId === winId ? 1 : 0}`;
        }).join('||');
        const dockViewportSig = mobileDock ? Math.round(getDockViewportWidth()) : 0;
        const dockSignature = `${state.settings.theme}|${state.settings.blissosAqua ? 'aqua' : 'classic'}|${state.settings.blissosDarkMode ? 'dark' : 'light'}|${state.lang}|${mobileDock ? 'mobile' : 'desktop'}|vw:${dockViewportSig}|size:${dockSize}|mag:${isDockRenderMagnificationEnabled() ? 1 : 0}|magp:${getDockRenderMagnificationStrength()}|op:${dockOpacity}|autoh:${dockAutoHide ? 1 : 0}|${dockStateSig}`;
        if(dockSignature === blissosDockRenderSignature && dock.firstElementChild){
          return;
        }
        let dockIconSize = 28;
        let dockIconBox = 32;
        let dockItemWidth = 40;
        let dockItemHeight = 40;
        if(isAquaDock){
          dockIconSize = 48;
          dockIconBox = 56;
          dockItemWidth = 58;
          dockItemHeight = 54;
        } else {
          if(mobileDock){
            const minIcon = 20;
            const maxIcon = 30;
            dockIconSize = Math.round(minIcon + ((maxIcon - minIcon) * sizeT));
            dockIconBox = Math.round(dockIconSize + 2);
            dockItemWidth = dockIconBox + 4;
            dockItemHeight = dockItemWidth;
          } else {
            const minIcon = 30;
            const maxIcon = 46;
            dockIconSize = Math.round(minIcon + ((maxIcon - minIcon) * sizeT));
            dockIconBox = Math.round(dockIconSize + 8);
            dockItemWidth = dockIconBox + 8;
            dockItemHeight = dockIconBox + 6;
          }
        }
        let aquaDockScale = 1;
        if(isAquaDock && mobileDock){
          const aquaSizeScale = getAquaDockScaleForSize(dockSize);
          const fitScale = getAquaMobileDockFitScale({
            normalCount: normalItems.length,
            hasTrash: !!trashItem,
            itemWidth: dockItemWidth,
            itemGap: 2,
            padX: 16,
            rightGap: 8,
            separatorWidth: 18,
            trayOverhangX: 40,
            baseScale: aquaSizeScale,
          });
          aquaDockScale = aquaSizeScale * fitScale;
          dock.style.setProperty('--blissos-dock-scale', aquaDockScale.toFixed(3));
        } else if(isAquaDock){
          aquaDockScale = getAquaDockScaleForSize(dockSize);
          dock.style.setProperty('--blissos-dock-scale', aquaDockScale.toFixed(3));
        } else {
          dock.style.removeProperty('--blissos-dock-scale');
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
            ? Math.round(((dockItemHeight + 16) * aquaDockScale) + 22)
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
                restoreWindow(winId);
              } else if(state.activeWindowId === winId){
                minimizeApp(winId);
              } else {
                focusWindow(winId);
              }
            } else if(item.refId){
              queueLeopardDockBounce(btn);
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
        replayPendingDockBounce(inner);
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
    const win = state.windows.get(appId);
    if(win){
      const label = (typeof win.title === 'string' && win.title.trim()) ? win.title.trim() : appId;
      return { label, iconHtml: getThemedIconHtml(win, label, 16) };
    }
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

const DEFAULT_DOCK_ORDER = ['seeker','music','clothes','videos','art','poetry','mediaplayer','diev','settings','trash'];

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

function addDockItem(type, refId){
  const targetType = (type === 'trash' || refId === 'trash') ? 'trash' : type;
  const targetRef = (refId === 'trash') ? 'trash' : refId;
  if(!isDockableItem(targetType, targetRef)) return false;
  if(!Array.isArray(state.dockItems)) state.dockItems = [];
  if(isDockItemPresent(targetType, targetRef)) return false;
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
    const minInsertIndex = getDockMinInsertIndex(normal);
    const fromIndex = normal.findIndex(it => (it.id || getDockItemKey(it.type, it.refId)) === key);
    if(fromIndex !== -1){
      const moved = normal.splice(fromIndex, 1)[0];
      const insertAt = clamp(targetIndex >= 0 ? targetIndex : fromIndex, minInsertIndex, normal.length);
      normal.splice(insertAt, 0, moved);
      state.dockItems = ensureTrashDockItem(normal);
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
          btn.classList.toggle('login-os-btn--dark', isLoginOsDarkModeEnabled(btnOs));
        });
        updateLoginDarkModeButton();
      }

      function isLoginOsDarkModeEnabled(osTheme){
        const normalized = normalizeOsThemeChoice(osTheme || getCurrentOsThemeChoice());
        if(normalized === getCurrentOsThemeChoice()){
          return normalized === 'bliss98' ? !!state.settings.darkMode : !!state.settings.blissosDarkMode;
        }
        const profiles = state.settings.osProfiles || {};
        const profile = profiles[normalized] || {};
        return normalized === 'bliss98' ? !!profile.darkMode : !!profile.blissosDarkMode;
      }

      function isLoginDarkModeEnabled(){
        return isLoginOsDarkModeEnabled(getCurrentOsThemeChoice());
      }

      function updateLoginDarkModeButton(){
        const btn = $('#loginDarkMode');
        if(!btn) return;
        const current = getCurrentOsThemeChoice();
        const enabled = isLoginDarkModeEnabled();
        btn.dataset.loginDarkOs = current;
        btn.textContent = `Dark: ${enabled ? 'ON' : 'OFF'}`;
        btn.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        btn.classList.toggle('pressed', enabled);
      }

      function toggleLoginDarkMode(){
        const enabled = !isLoginDarkModeEnabled();
        if(getCurrentOsThemeChoice() === 'bliss98'){
          setDarkMode(enabled);
        } else {
          setBlissOSDarkMode(enabled);
        }
        syncLoginOsButtons();
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
      $('#loginDarkMode').addEventListener('click', (e)=>{
        e.preventDefault();
        toggleLoginDarkMode();
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
        if(minesweeperHandleKey(e)) return;
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
        const systemEraseBtn = target.closest('[data-system-erase]');
        if(systemEraseBtn && systemEraseBtn.dataset && systemEraseBtn.dataset.systemErase){
          confirmSystemErase(systemEraseBtn.dataset.systemErase);
          return;
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
