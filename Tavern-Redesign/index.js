const HOME_ID = 'tr-home';
const PAGE_BAR_ID = 'tr-page-bar';
const HOME_OPEN_CLASS = 'tr-home-open';
const PAGE_OPEN_CLASS = 'tr-page-open';
const TITLE_LATIN = 'SILLY TAVERN';
const TITLE_CYRILLIC = 'СИЛЛИ ТАВЕРН';
const GLITCH_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789/\\—+·';

const SITE_PAGES = [
    { id: 'rightNavHolder', code: '01', label: 'ПЕРСОНАЖИ', short: 'ПЕРСОНАЖИ', subtitle: 'CHARACTER ARCHIVE // DATABASE' },
    { id: 'backgrounds-button', code: '02', label: 'ФОНЫ И СЦЕНЫ', short: 'ФОНЫ', subtitle: 'ENVIRONMENT // STAGE BACKGROUNDS' },
    { id: 'WI-SP-button', code: '03', label: 'ЛОРБУКИ И МИРЫ', short: 'ЛОРБУКИ', subtitle: 'WORLD INFO // LORE ARCHIVE' },
    { id: 'persona-management-button', code: '04', label: 'ПЕРСОНЫ ИГРОКА', short: 'ПЕР��ОНЫ', subtitle: 'USER PERSONAS // IDENTITY' },
    { id: 'sys-settings-button', code: '05', label: 'API И ПОДКЛЮЧЕНИЕ', short: 'API', subtitle: 'CONNECTIONS // MODEL ENDPOINTS' },
    { id: 'user-settings-button', code: '06', label: 'ИНТЕРФЕЙС И ТЕМЫ', short: 'ИНТЕРФЕЙС', subtitle: 'INTERFACE // VISUAL SETTINGS' },
    { id: 'extensions-settings-button', code: '07', label: 'РАСШИРЕНИЯ', short: 'МОДУЛИ', subtitle: 'EXTENSIONS // INSTALLED MODULES' },
    { id: 'advanced-formatting-button', code: '08', label: 'ФОРМАТИРОВАНИЕ', short: 'ФОРМАТ', subtitle: 'CONTEXT & INSTRUCT // FORMATTING' },
];

function splitLetters(element) {
    const label = element.textContent.trim();
    element.textContent = '';
    element.setAttribute('aria-label', label);

    Array.from(label).forEach((character, index) => {
        const letter = document.createElement('span');
        letter.className = character === ' ' ? 'tr-menu-space' : 'tr-menu-letter';
        letter.style.setProperty('--tr-letter-index', index);
        letter.textContent = character === ' ' ? '\u00a0' : character;
        letter.setAttribute('aria-hidden', 'true');
        element.append(letter);
    });
}

function closeDrawers() {
    document.querySelectorAll('#top-settings-holder > .drawer > .drawer-content.openDrawer').forEach((drawer) => {
        drawer.classList.remove('openDrawer');
        drawer.classList.add('closedDrawer');
        const icon = drawer.closest('.drawer')?.querySelector('.drawer-icon');
        if (icon) {
            icon.classList.remove('openIcon');
            icon.classList.add('closedIcon');
        }
    });
    document.body.classList.remove(PAGE_OPEN_CLASS);
    delete document.body.dataset.trPage;
}

function setHomeOpen(open) {
    if (open) closeDrawers();
    document.body.classList.toggle(HOME_OPEN_CLASS, open);
    document.getElementById(HOME_ID)?.setAttribute('aria-hidden', String(!open));
}

function updatePageHeader(pageId) {
    const page = SITE_PAGES.find((item) => item.id === pageId);
    const bar = document.getElementById(PAGE_BAR_ID);
    if (!bar || !page) return;

    const codeEl = bar.querySelector('.tr-page-code');
    const titleEl = bar.querySelector('.tr-page-title');
    const subEl = bar.querySelector('.tr-page-sub');
    if (codeEl) codeEl.textContent = `PAGE // ${page.code}`;
    if (titleEl) titleEl.textContent = page.label;
    if (subEl) subEl.textContent = page.subtitle;

    bar.querySelectorAll('[data-page]').forEach((link) => {
        link.classList.toggle('is-active', link.dataset.page === pageId);
    });
}

function openSitePage(pageId) {
    const targetDrawer = document.getElementById(pageId);
    const targetContent = targetDrawer?.querySelector(':scope > .drawer-content') || targetDrawer?.querySelector('.drawer-content');
    const targetIcon = targetDrawer?.querySelector('.drawer-icon');
    if (!targetDrawer || !targetContent) return;

    // 1. Activate opaque page mode BEFORE closing #tr-home so the underlying chat never flashes!
    document.body.classList.add(PAGE_OPEN_CLASS);
    document.body.dataset.trPage = pageId;
    updatePageHeader(pageId);

    // 2. Synchronously close any other open top-level drawers without triggering ST's async animation delay
    document.querySelectorAll('#top-settings-holder > .drawer > .drawer-content.openDrawer').forEach((openContent) => {
        if (openContent === targetContent) return;
        openContent.classList.remove('openDrawer');
        openContent.classList.add('closedDrawer');
        const icon = openContent.closest('.drawer')?.querySelector('.drawer-icon');
        if (icon) {
            icon.classList.remove('openIcon');
            icon.classList.add('closedIcon');
        }
    });

    // 3. Synchronously open the requested page drawer
    if (targetContent.classList.contains('closedDrawer')) {
        targetContent.classList.remove('closedDrawer');
        targetContent.classList.add('openDrawer');
        if (targetIcon) {
            targetIcon.classList.remove('closedIcon');
            targetIcon.classList.add('openIcon');
        }
    }

    if (pageId === 'rightNavHolder') {
        document.getElementById('rm_button_characters')?.click();
        window.jQuery?.('#rm_print_characters_block').trigger('scroll');
    }

    // 4. Now hide the home screen smoothly over the already-rendered page
    document.body.classList.remove(HOME_OPEN_CLASS);
    document.getElementById(HOME_ID)?.setAttribute('aria-hidden', 'true');
}

function startTitleScramble(element) {
    let useCyrillic = false;
    let frame = 0;
    let target = TITLE_CYRILLIC;

    const render = () => {
        const progress = frame / 15;
        element.textContent = Array.from(target).map((character, index) => {
            if (character === ' ') return ' ';
            if (index / target.length < progress) return character;
            return GLITCH_CHARACTERS[Math.floor(Math.random() * GLITCH_CHARACTERS.length)];
        }).join('');

        frame += 1;
        if (frame <= 15) {
            window.setTimeout(render, 42);
            return;
        }

        element.textContent = target;
        window.setTimeout(() => {
            useCyrillic = !useCyrillic;
            target = useCyrillic ? TITLE_LATIN : TITLE_CYRILLIC;
            frame = 0;
            render();
        }, 900);
    };

    render();
}

function trackBackgroundReveal(home) {
    let animationFrame = 0;
    home.addEventListener('pointermove', (event) => {
        if (animationFrame) return;
        animationFrame = requestAnimationFrame(() => {
            const rect = home.getBoundingClientRect();
            home.style.setProperty('--tr-pointer-x', `${event.clientX - rect.left}px`);
            home.style.setProperty('--tr-pointer-y', `${event.clientY - rect.top}px`);
            animationFrame = 0;
        });
    });

    home.addEventListener('pointerleave', () => {
        home.style.removeProperty('--tr-pointer-x');
        home.style.removeProperty('--tr-pointer-y');
    });
}

function enhanceRecentChatRails(root = document) {
    root.querySelectorAll('.welcomeRecent').forEach((section) => {
        if (section.dataset.trHorizontal === 'true') return;
        const list = section.querySelector('.recentChatList');
        if (!list) return;

        section.dataset.trHorizontal = 'true';
        const previous = document.createElement('button');
        const next = document.createElement('button');
        previous.type = next.type = 'button';
        previous.className = 'tr-chat-rail-control tr-chat-rail-previous';
        next.className = 'tr-chat-rail-control tr-chat-rail-next';
        previous.setAttribute('aria-label', 'Предыдущие чаты');
        next.setAttribute('aria-label', 'Следующие чаты');
        previous.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        next.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';

        const scroll = (direction) => {
            const card = list.querySelector('.recentChat:not(.hidden)');
            const distance = card ? card.getBoundingClientRect().width + 14 : list.clientWidth * 0.75;
            list.scrollBy({ left: distance * direction, behavior: 'smooth' });
        };
        previous.addEventListener('click', () => scroll(-1));
        next.addEventListener('click', () => scroll(1));
        list.addEventListener('wheel', (event) => {
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            event.preventDefault();
            list.scrollBy({ left: event.deltaY, behavior: 'auto' });
        }, { passive: false });

        section.append(previous, next);
    });
}

function observeRecentChatRails() {
    enhanceRecentChatRails();
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (!(node instanceof Element)) continue;
                if (node.matches('.welcomeRecent')) enhanceRecentChatRails(node.parentElement || node);
                else if (node.querySelector('.welcomeRecent')) enhanceRecentChatRails(node);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function getFullAvatarSource(image) {
    const source = image?.getAttribute('src');
    if (!source) return '';

    try {
        const url = new URL(source, window.location.href);
        if (url.pathname === '/thumbnail' && url.searchParams.get('type') === 'avatar') {
            const file = url.searchParams.get('file');
            return file ? `/characters/${encodeURIComponent(file)}` : source;
        }
    } catch {
        return source;
    }

    return source;
}

function addMessagePortraits(root = document) {
    const messages = root.matches?.('.mes') ? [root] : root.querySelectorAll?.('.mes') || [];

    messages.forEach((message) => {
        if (message.getAttribute('is_user') !== 'false' || message.getAttribute('is_system') === 'true') return;

        const text = message.querySelector('.mes_text');
        if (!text || text.querySelector('.tr-message-portrait') || text.querySelector('.edit_textarea')) return;

        const source = getFullAvatarSource(message.querySelector('.mesAvatarWrapper .avatar img'));
        if (!source || source.endsWith('/img/ai4.png') || source.endsWith('/img/five.png')) return;

        const portrait = document.createElement('figure');
        portrait.className = 'tr-message-portrait';
        const image = document.createElement('img');
        image.src = source;
        image.alt = message.getAttribute('ch_name') || 'Персонаж';
        image.loading = 'lazy';
        image.addEventListener('error', () => portrait.remove(), { once: true });
        portrait.append(image);

        const firstParagraph = text.querySelector(':scope > p');
        if (firstParagraph) firstParagraph.after(portrait);
        else text.prepend(portrait);
    });
}

function observeMessagePortraits() {
    addMessagePortraits();
    let animationFrame = 0;
    const observer = new MutationObserver(() => {
        if (animationFrame) return;
        animationFrame = requestAnimationFrame(() => {
            addMessagePortraits(document.getElementById('chat') || document);
            animationFrame = 0;
        });
    });
    observer.observe(document.getElementById('chat') || document.body, { childList: true, subtree: true });
}

function installDrawerModalBackdrop() {
    if (document.getElementById(PAGE_BAR_ID)) return;

    const topNavLinks = SITE_PAGES.map((page) => `
        <button type="button" class="tr-page-nav-link" data-page="${page.id}">
            <small>${page.code}</small>
            <span>${page.short}</span>
        </button>
    `).join('');

    const pageBar = document.createElement('header');
    pageBar.id = PAGE_BAR_ID;
    pageBar.setAttribute('aria-label', 'Навигация страницы');
    pageBar.innerHTML = `
        <div class="tr-page-bar-left">
            <button type="button" class="tr-back-home-btn" data-page-action="home">
                <i class="fa-solid fa-arrow-left"></i>
                <span>BACK HOME</span>
            </button>
            <div class="tr-page-heading">
                <span class="tr-page-code">PAGE // 01</span>
                <strong class="tr-page-title">ПЕРСОНАЖИ</strong>
                <small class="tr-page-sub">CHARACTER ARCHIVE</small>
            </div>
        </div>
        <nav class="tr-page-bar-nav" aria-label="Страницы сайта">
            ${topNavLinks}
        </nav>
        <div class="tr-page-bar-right">
            <button type="button" class="tr-to-chat-btn" data-page-action="chat">
                <span>В ЧАТ</span>
                <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    `;

    pageBar.addEventListener('click', (event) => {
        // Prevent SillyTavern's global document click listener from auto-closing open drawers!
        event.stopPropagation();

        const pageBtn = event.target.closest('[data-page]');
        if (pageBtn) {
            openSitePage(pageBtn.dataset.page);
            return;
        }
        const actionBtn = event.target.closest('[data-page-action]');
        if (!actionBtn) return;

        if (actionBtn.dataset.pageAction === 'home') {
            setHomeOpen(true);
        }
        if (actionBtn.dataset.pageAction === 'chat') {
            closeDrawers();
            setHomeOpen(false);
        }
    });

    document.body.append(pageBar);
}

function continueLatestChat() {
    closeDrawers();
    setHomeOpen(false);

    const latestChat = document.querySelector('.welcomePanel .recentChat:not(.hidden)');
    if (latestChat instanceof HTMLElement) {
        latestChat.click();
    }
}

function buildHome() {
    if (document.getElementById(HOME_ID)) return;

    const topSiteLinks = SITE_PAGES.map((page) => `
        <button class="tr-site-link" type="button" data-page="${page.id}">
            <small>${page.code}</small>
            <span>${page.short}</span>
        </button>
    `).join('');

    const rightColumnLinks = SITE_PAGES.slice(0, 6).map((page) => `
        <button class="tr-node-link" type="button" data-page="${page.id}">
            <small>${page.code}</small>
            <span class="tr-node-label">${page.label}</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
        </button>
    `).join('');

    const home = document.createElement('section');
    home.id = HOME_ID;
    home.setAttribute('aria-label', 'Главное меню');
    home.innerHTML = `
        <div class="tr-backdrop" aria-hidden="true"></div>
        <div class="tr-figure-focus" aria-hidden="true"></div>
        <div class="tr-reveal" aria-hidden="true"></div>
        <div class="tr-atmosphere" aria-hidden="true"></div>
        <header class="tr-home-header">
            <span class="tr-kicker">SILLY TAVERN // HOST</span>
            <nav class="tr-site-topnav" aria-label="Разделы сайта">
                ${topSiteLinks}
            </nav>
            <span class="tr-index">01 / INDEX</span>
        </header>
        <div class="tr-home-rule" aria-hidden="true"></div>
        <main class="tr-home-content">
            <aside class="tr-wing tr-wing-left" aria-label="Основная навигация">
                <div class="tr-wing-rail" aria-hidden="true"></div>
                <div class="tr-wing-header">
                    <span class="tr-wing-dot"></span>
                    <span>STORY // ARCHIVE</span>
                </div>
                <nav class="tr-menu" aria-label="Навигация">
                    <button class="tr-menu-item tr-menu-item-primary" type="button" data-action="continue"><small>01</small><span class="tr-menu-label">ПРОДОЛЖИТЬ</span></button>
                    <button class="tr-menu-item" type="button" data-page="rightNavHolder"><small>02</small><span class="tr-menu-label">ПЕРСОНАЖИ</span></button>
                    <button class="tr-menu-item" type="button" data-action="main"><small>03</small><span class="tr-menu-label">ИСТОРИИ ЧАТОВ</span></button>
                </nav>
            </aside>
            <div class="tr-title-block">
                <p class="tr-eyebrow">SECTION — 01 // MAIN HOST</p>
                <h1 class="tr-scramble-title" aria-label="Silly Tavern">SILLY TAVERN</h1>
                <p class="tr-subtitle">Истории начинаются там, где заканчивается свет.</p>
                <div class="tr-hero-actions">
                    <button type="button" class="tr-hero-cta" data-action="continue">ENTER STORY</button>
                    <button type="button" class="tr-hero-cta tr-hero-cta-ghost" data-page="backgrounds-button">STAGE &amp; BACKGROUNDS</button>
                </div>
            </div>
            <aside class="tr-wing tr-wing-right" aria-label="Страницы настроек">
                <div class="tr-wing-rail tr-wing-rail-right" aria-hidden="true"></div>
                <div class="tr-wing-header tr-wing-header-right">
                    <span>SYSTEM PAGES // DIRECTORY</span>
                    <span class="tr-wing-dot"></span>
                </div>
                <nav class="tr-node-list" aria-label="Системные страницы">
                    ${rightColumnLinks}
                </nav>
            </aside>
        </main>
        <footer class="tr-home-footer">
            <span>HOST // MULTI-PAGE INTERFACE</span>
            <span class="tr-status"><i></i> ONLINE</span>
        </footer>`;

    home.querySelectorAll('.tr-menu-label').forEach(splitLetters);
    startTitleScramble(home.querySelector('.tr-scramble-title'));
    trackBackgroundReveal(home);
    home.addEventListener('click', (event) => {
        const pageTarget = event.target.closest('[data-page]');
        if (pageTarget) {
            event.stopPropagation();
            openSitePage(pageTarget.dataset.page);
            return;
        }

        const action = event.target.closest('[data-action]')?.dataset.action;
        if (!action) return;

        if (action === 'continue') continueLatestChat();
        if (action === 'main') {
            closeDrawers();
            setHomeOpen(false);
        }
    });

    const homeButton = document.createElement('button');
    homeButton.id = 'tr-home-button';
    homeButton.type = 'button';
    homeButton.title = 'Главное меню';
    homeButton.setAttribute('aria-label', 'Открыть главное меню');
    homeButton.innerHTML = `
        <svg class="tr-home-glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3.4L20 8.5V16.8C20 18.5 18.6 19.9 16.9 19.9H7.1C5.4 19.9 4 18.5 4 16.8V8.5L12 3.4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M9.2 14.8C10.1 15.6 11 16 12 16C13 16 13.9 15.6 14.8 14.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;
    homeButton.addEventListener('click', () => {
        setHomeOpen(true);
    });

    document.body.append(home, homeButton);
    setHomeOpen(true);
}

jQuery(buildHome);
jQuery(observeRecentChatRails);
jQuery(installDrawerModalBackdrop);
jQuery(observeMessagePortraits);
