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
    
