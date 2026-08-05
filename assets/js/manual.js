(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const state = { galleryIndex: 0, lastFocused: null };
  const sidebar = $('#sidebar');
  const menuButton = $('#menu-toggle');
  const overlay = $('#sidebar-overlay');
  const progressBar = $('#reading-progress-bar');
  const progressLabel = $('#progress-label');
  const backToTop = $('#back-to-top');
  const searchable = $$('main h2, main h3, main h4, main p, main li, main td');
  const sections = $$('main section[id], main article[id]');
  const tocLinks = $$('.toc a');
  const galleryItems = $$('.image-button');
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  const lightboxCaption = $('#lightbox-caption');

  function setMenu(open) {
    sidebar.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    if (open) $('#manual-search').focus();
  }

  function updateReadingProgress() {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    const value = scrollable > 0 ? Math.min(100, Math.max(0, scrollY / scrollable * 100)) : 0;
    progressBar.style.width = `${value}%`;
    progressLabel.textContent = `${Math.round(value)}%`;
    backToTop.classList.toggle('visible', scrollY > 500);
  }

  function setActiveLink(entries) {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    tocLinks.forEach(link => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
  }

  function clearHighlights() {
    $$('mark.search-hit').forEach(mark => mark.replaceWith(document.createTextNode(mark.textContent)));
    $$('.search-hidden').forEach(element => element.classList.remove('search-hidden'));
  }

  function searchManual(query) {
    clearHighlights();
    const status = $('#search-status');
    $('#clear-search').style.display = query ? 'block' : 'none';
    if (!query) { status.textContent = ''; return; }
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalized) return;
    let count = 0;
    searchable.forEach(element => {
      const text = element.textContent;
      const lower = text.toLocaleLowerCase('pt-BR');
      const index = lower.indexOf(normalized);
      if (index < 0) return;
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        const nodeIndex = node.nodeValue.toLocaleLowerCase('pt-BR').indexOf(normalized);
        if (nodeIndex < 0) return;
        const range = document.createRange();
        range.setStart(node, nodeIndex); range.setEnd(node, nodeIndex + normalized.length);
        const mark = document.createElement('mark'); mark.className = 'search-hit';
        range.surroundContents(mark); count += 1;
      });
    });
    status.textContent = count ? `${count} resultado${count === 1 ? '' : 's'} encontrado${count === 1 ? '' : 's'}.` : 'Nenhum resultado encontrado.';
    const first = $('mark.search-hit'); if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function copyCommand(button) {
    const value = button.dataset.copy;
    try { await navigator.clipboard.writeText(value); }
    catch { const input = document.createElement('textarea'); input.value = value; document.body.append(input); input.select(); document.execCommand('copy'); input.remove(); }
    const original = button.textContent; button.textContent = 'Copiado'; button.classList.add('copied');
    setTimeout(() => { button.textContent = original; button.classList.remove('copied'); }, 1600);
  }

  function showGalleryImage(index) {
    state.galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const figure = galleryItems[state.galleryIndex].closest('figure');
    const source = $('img', figure); const caption = $('figcaption', figure);
    lightboxImage.src = source.src; lightboxImage.alt = source.alt;
    lightboxCaption.textContent = caption?.textContent || source.alt;
  }

  function openLightbox(index) {
    state.lastFocused = document.activeElement; showGalleryImage(index);
    lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; $('.lightbox__close').focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; state.lastFocused?.focus();
  }

  menuButton.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  overlay.addEventListener('click', () => setMenu(false));
  tocLinks.forEach(link => link.addEventListener('click', () => { if (innerWidth <= 768) setMenu(false); }));
  addEventListener('scroll', updateReadingProgress, { passive: true }); updateReadingProgress();
  backToTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  $('#manual-search').addEventListener('input', event => searchManual(event.target.value));
  $('#clear-search').addEventListener('click', () => { const input = $('#manual-search'); input.value = ''; searchManual(''); input.focus(); });
  $$('[data-copy]').forEach(button => button.addEventListener('click', () => copyCommand(button)));
  galleryItems.forEach((button, index) => button.addEventListener('click', () => openLightbox(index)));
  $('.lightbox__close').addEventListener('click', closeLightbox);
  $('.lightbox__prev').addEventListener('click', () => showGalleryImage(state.galleryIndex - 1));
  $('.lightbox__next').addEventListener('click', () => showGalleryImage(state.galleryIndex + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { if (lightbox.classList.contains('open')) closeLightbox(); else if (sidebar.classList.contains('open')) setMenu(false); }
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'ArrowLeft') showGalleryImage(state.galleryIndex - 1);
    if (event.key === 'ArrowRight') showGalleryImage(state.galleryIndex + 1);
    if (event.key === 'Tab') {
      const controls = $$('.lightbox button'); const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  new IntersectionObserver(setActiveLink, { rootMargin: '-18% 0px -68%', threshold: [0, .25, .75] }).observe;
  const observer = new IntersectionObserver(setActiveLink, { rootMargin: '-18% 0px -68%', threshold: [0, .25, .75] });
  sections.forEach(section => observer.observe(section));
})();
