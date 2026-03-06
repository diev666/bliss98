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
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="classic">
                      <span class="accent98-square classic"></span>
                      <span data-i18n="bliss98Accent.classic">Classic Blue</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="teal">
                      <span class="accent98-square teal"></span>
                      <span data-i18n="bliss98Accent.teal">Teal</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="green">
                      <span class="accent98-square green"></span>
                      <span data-i18n="bliss98Accent.green">Green</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="purple">
                      <span class="accent98-square purple"></span>
                      <span data-i18n="bliss98Accent.purple">Purple</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="pink">
                      <span class="accent98-square pink"></span>
                      <span data-i18n="bliss98Accent.pink">Pink</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="rose">
                      <span class="accent98-square rose"></span>
                      <span data-i18n="bliss98Accent.rose">Rose</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="red">
                      <span class="accent98-square red"></span>
                      <span data-i18n="bliss98Accent.red">Red</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="orange">
                      <span class="accent98-square orange"></span>
                      <span data-i18n="bliss98Accent.orange">Orange</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="yellow">
                      <span class="accent98-square yellow"></span>
                      <span data-i18n="bliss98Accent.yellow">Yellow</span>
                    </button>
                    <button class="accent98-swatch" type="button" data-set-bliss98-accent="graphite">
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
