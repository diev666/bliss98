Original prompt: na opção "Sound" em settings vamos mudar para "Sounds"

Original prompt (continuação): e dentro dessa aba vamos adicionar o slider de "Music" que é pra ser o mesmo slider que tem dentro do Bliss Media Player, eles devem se comportarem juntos

Original prompt (continuação): e vamos adicionar um botão em system sounds escrito On quando ativado e Off quando desativado

Original prompt (continuação): e adicione sons pro sistema, por exemplo: quando fechar a janela, quando minimizar, quando restaurar uma janela, quando abrir um arquivo, quando mandar um arquivo pro lixo, quando devolver um arquivo do lixo para o desktop, quando deletar arquivos do lixo, quando mudar de aba dentro de apps

Original prompt (continuação): e crie esses sons dentro da pasta assets/sounds

## Progress log
- Mapeado `index.html`: aba de Settings, slider de som, Media Player (`mp.vol`/`#mpVol`) e pontos de eventos (janela, lixeira, tabs).
- Próximo passo: editar UI de Settings + sincronização de volume + toggle de system sounds.
- Implementado `Sound -> Sounds` no Settings (labels e conteúdo).
- Adicionado slider `Music` no painel de Sounds e sincronização bidirecional com o slider `#mpVol` do Bliss Media Player.
- Adicionado botão único On/Off para `System Sounds` com persistência (`bliss98_system_sounds_enabled`) e integração com perfil por OS.
- Criados e conectados os novos eventos de SFX: fechar/minimizar/restaurar janela, abrir arquivo, mover/restaurar/esvaziar lixeira e troca de abas.
- Gerados 8 arquivos de áudio em `assets/sounds/*.wav`.
- Validação automatizada concluída (Playwright local):
  - Aba aparece como `Sounds`.
  - Slider `Music` sincroniza nos dois sentidos com `#mpVol` do Media Player.
  - Botão `System Sounds` alterna `On/Off` corretamente.
  - Eventos de som disparam para: close/minimize/restore, open file, trash move/restore/empty e tab switch.
  - Sem erros de console durante o cenário de teste.
- Auditoria completa do projeto (estática + dinâmica) executada para o pedido de revisão geral.
- Correções aplicadas:
  - Corrigido erro de asset 404 no tema BlissOS adicionando `assets/BlissOS/dope-skate.png`.
  - Corrigida referência de wallpaper preview com case incorreto em Settings (`bliss98.png` -> `BlissXP.png`).
  - Adicionado fallback explícito `assets/audio/tracks.json` para reduzir tentativas de fetch ausente no Media Player.
  - Fortalecido `DopeSkateGame.mount`/`initDopeSkateInWindow` para evitar `TypeError` quando chamado sem parâmetro (usa `#win_games` como fallback e retorna boolean).
  - Ajustado `focusWindow` para atualizar estado visual da taskbar de forma consistente (`pressed` no item ativo e limpeza dos demais), evitando inconsistência ao alternar foco.
- Nova rodada de validação (Playwright + scripts de stress/fuzz):
  - Sem `pageerror`/`console.error` do app.
  - Sem respostas 4xx/5xx para assets e endpoints do app.
  - Fluxos de abrir/minimizar/restaurar/fechar janelas e alternar temas estáveis.
  - Snake e Dope Skate inicializam e desmontam sem erro via API interna.
- Refatoração estrutural para modularização concluída:
  - Script inline removido do `index.html`; app agora carrega `assets/js/bliss98.bundle.js`.
  - Código JS separado em módulos ordenados dentro de `assets/js/modules/` (7 arquivos).
  - Criado `assets/js/modules/order.json` para ordem explícita de montagem.
  - Criado build script `scripts/build-js-bundle.mjs` para gerar bundle único a partir dos módulos.
  - Documentado fluxo em `assets/js/modules/README.md`.
- Validação pós-modularização:
  - `node --check` em todos os módulos e bundle: OK.
  - Playwright (skill client + smoke funcional amplo): sem `console.error`, sem `pageerror`, sem respostas 4xx/5xx.
- Melhoria de UX no Settings > Appearance > Wallpaper implementada:
  - Troca da lista/botões por carrossel horizontal com thumbnails quadradas maiores.
  - Adicionados controles laterais `◀` / `▶` para navegar os wallpapers.
  - Mantida seleção por clique em qualquer thumbnail e persistência normal via `applyWallpaper`.
  - Cards agora refletem estado ativo com `aria-pressed` e estilo `pressed`.
  - Corrigido label do wallpaper clássico para chave i18n consistente (`wallpaper.classic`).
- Validação da nova UX:
  - Teste automatizado em browser confirmou deslocamento horizontal real (0 -> 460 -> 920).
  - Seleção de wallpaper (`matrix`) aplicada corretamente (`#desktop.wallpaper-matrix`).
  - Sem erros de console, pageerror ou respostas 4xx/5xx no fluxo validado.

## TODO / handoff
- Nenhum bloqueio pendente para este pedido.
- Ajuste adicional: todos os apps do `openApp` agora tocam `file-open` no momento da abertura (quando a janela ainda não existe).
- Ajuste adicional: clique nas opções do menu bar do BlissOS (Apple, app menu e itens File/Edit/View/...) agora toca `tab-change`.
- Ajuste adicional: opções de menu (`data-menu-action`) agora tocam `file-open` (ex.: `Language`), com exceções para ações que já têm SFX próprio ou fluxo de abrir/fechar janela para evitar som duplicado.
