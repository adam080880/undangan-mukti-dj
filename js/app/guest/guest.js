import { image } from './image.js';
import { audio } from './audio.js';
import { progress } from './progress.js';
import { util } from '../../common/util.js';
import { bs } from '../../libs/bootstrap.js';
import { theme } from '../../common/theme.js';
import { lang } from '../../common/language.js';
import { storage } from '../../common/storage.js';
import { session } from '../../common/session.js';
import { offline } from '../../common/offline.js';
import { comment } from '../component/comment.js';
import * as confetti from '../../libs/confetti.js';

export const guest = (() => {

    /**
     * @type {ReturnType<typeof storage>|null}
     */
    let information = null;

    /**
     * @returns {void}
     */
    const countDownDate = () => {
        const until = document.getElementById('count-down')?.getAttribute('data-time')?.replace(' ', 'T');
        if (!until) {
            alert('Invalid countdown date.');
            return;
        }

        const count = (new Date(until)).getTime();

        const updateCountdown = () => {
            const distance = Math.abs(count - Date.now());

            document.getElementById('day').innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString();
            document.getElementById('hour').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString();
            document.getElementById('minute').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString();
            document.getElementById('second').innerText = Math.floor((distance % (1000 * 60)) / 1000).toString();

            util.timeOut(updateCountdown, 1000 - (Date.now() % 1000));
        };

        requestAnimationFrame(updateCountdown);
    };

    /**
     * @returns {void}
     */
    const showGuestName = () => {
        /**
         * Make sure "to=" is the last query string.
         * Ex. ulems.my.id/?id=some-uuid-here&to=name
         */
        const raw = window.location.search.split('to=');
        let name = null;

        if (raw.length > 1 && raw[1].length >= 1) {
            name = window.decodeURIComponent(raw[1]);
        }

        if (name) {
            const guestName = document.getElementById('guest-name');
            const div = document.createElement('div');
            div.classList.add('m-2');

            const template = `<small class="mt-0 mb-1 mx-0 p-0">${util.escapeHtml(guestName?.getAttribute('data-message'))}</small><p class="m-0 p-0" style="font-size: 1.5rem">${util.escapeHtml(name)}</p>`;
            util.safeInnerHTML(div, template);

            guestName?.appendChild(div);
        }

        const form = document.getElementById('form-name');
        if (form) {
            form.value = information.get('name') ?? name;
        }
    };

    /**
     * @returns {Promise<void>}
     */
    const slide = async () => {
        let index = 0;
        let lastTime = 0;
        const interval = 6000;
        const slides = document.querySelectorAll('.slide-desktop');

        for (const [i, s] of slides.entries()) {
            if (i === index) {
                s.classList.add('slide-desktop-active');
                await util.changeOpacity(s, true);
                break;
            }
        }

        const nextSlide = async () => {
            await util.changeOpacity(slides[index], false);
            slides[index].classList.remove('slide-desktop-active');

            index = (index + 1) % slides.length;

            slides[index].classList.add('slide-desktop-active');
            await util.changeOpacity(slides[index], true);
        };

        const loop = async (time) => {
            if (time - lastTime >= interval) {
                lastTime = time;
                await nextSlide();
            }

            requestAnimationFrame(loop);
        };

        util.timeOut(loop, interval);
    };

    /**
     * @param {HTMLButtonElement} button
     * @returns {void}
     */
    const open = (button) => {
        button.disabled = true;
        document.body.scrollIntoView({ behavior: 'instant' });
        document.dispatchEvent(new Event('undangan.open'));

        if (theme.isAutoMode()) {
            document.getElementById('button-theme').style.display = 'block';
        }

        slide();
        audio.play();
        theme.spyTop();

        confetti.basicAnimation();
        util.timeOut(confetti.openAnimation, 1500);
        util.changeOpacity(document.getElementById('welcome'), false).then((el) => el.remove());
    };

    /**
     * @param {HTMLImageElement} img
     * @returns {void}
     */
    const modal = (img) => {
        const m = document.getElementById('show-modal-image');
        m.src = img.src;
        m.width = img.width;
        m.height = img.height;
        bs.modal('modal-image').show();
    };

    /**
     * @returns {void}
     */
    const closeInformation = () => information.set('info', true);

    /**
     * @returns {void}
     */
    const normalizeArabicFont = () => {
        document.querySelectorAll('.font-arabic').forEach((el) => {
            el.innerHTML = String(el.innerHTML).normalize('NFC');
        });
    };

    /**
     * @returns {void}
     */
    const animateSvg = () => {
        document.querySelectorAll('svg').forEach((el) => {
            util.timeOut(() => el.classList.add(el.getAttribute('data-class')), parseInt(el.getAttribute('data-time')));
        });
    };

    /**
     * @returns {void}
     */
    const buildGoogleCalendar = () => {
        /**
         * @param {string} d 
         * @returns {string}
         */
        const formatDate = (d) => (new Date(d + ':00Z')).toISOString().replace(/[-:]/g, '').split('.').shift();

        const url = new URL('https://calendar.google.com/calendar/render');
        const data = {
            action: 'TEMPLATE',
            text: 'The Wedding of Wahyu and Riski',
            dates: `${formatDate('2023-03-15 10:00')}/${formatDate('2023-03-15 11:00')}`,
            details: 'Tanpa mengurangi rasa hormat, kami mengundang Anda untuk berkenan menghadiri acara pernikahan kami. Terima kasih atas perhatian dan doa restu Anda, yang menjadi kebahagiaan serta kehormatan besar bagi kami.',
            location: 'https://goo.gl/maps/ALZR6FJZU3kxVwN86',
            ctz: 'Asia/Jakarta',
        };

        Object.entries(data).forEach(([k, v]) => url.searchParams.set(k, v));

        document.querySelector('#home button')?.addEventListener('click', () => window.open(url, '_blank'));
    };

    /**
     * @returns {Promise<void>}
     */
    const booting = async () => {
        animateSvg();
        countDownDate();
        showGuestName();
        normalizeArabicFont();
        buildGoogleCalendar();
        document.getElementById('root').style.opacity = '1';

        if (information.has('presence')) {
            document.getElementById('form-presence').value = information.get('presence') ? '1' : '2';
        }

        if (information.get('info')) {
            document.getElementById('information')?.remove();
        }

        window.AOS.init();
        document.body.scrollIntoView({ behavior: 'instant' });

        // wait until welcome screen is show.
        await util.changeOpacity(document.getElementById('welcome'), true);

        // remove loading screen and show welcome screen.
        await util.changeOpacity(document.getElementById('loading'), false).then((el) => el.remove());
    };

    /**
     * @returns {void}
     */
    const domLoaded = () => {
        lang.init();
        offline.init();
        progress.init();
        information = storage('information');
        const token = document.body.getAttribute('data-key');

        document.addEventListener('progress.done', () => booting());
        document.addEventListener('hide.bs.modal', () => document.activeElement?.blur());

        if (!token || token.length <= 0) {
            progress.add(); // for audio.
            progress.add(); // for confetti.
            image.init().load();
            audio.init();
            confetti.loadConfetti()
                .then(() => progress.complete('confetti'))
                .catch(() => progress.invalid('confetti'));

            document.getElementById('comment')?.remove();
            document.querySelector('a.nav-link[href="#comment"]')?.closest('li.nav-item')?.remove();
        }

        if (token && token.length > 0) {
            // add 4 progress for config, comment, audio, and confetti.
            // before img.load();
            progress.add();
            progress.add();
            progress.add();
            progress.add();

            const img = image.init();
            if (!img.hasDataSrc()) {
                img.load();
            }

            const params = new URLSearchParams(window.location.search);
            session.setToken(params.get('k') ?? token);

            // fetch after document is loaded.
            window.addEventListener('load', () => session.guest().then(() => {
                progress.complete('config');

                if (img.hasDataSrc()) {
                    img.load();
                }

                audio.init();
                comment.init();

                confetti.loadConfetti()
                    .then(() => progress.complete('confetti'))
                    .catch(() => progress.invalid('confetti'));

                comment.show()
                    .then(() => progress.complete('comment'))
                    .catch(() => progress.invalid('comment'));

            }).catch(() => progress.invalid('config')));
        }
    };

    /**
     * @returns {object}
     */
    const init = () => {
        theme.init();
        session.init();

        if (session.isAdmin()) {
            storage('user').clear();
            storage('owns').clear();
            storage('likes').clear();
            storage('session').clear();
            storage('comment').clear();
            storage('tracker').clear();
        }

        window.addEventListener('DOMContentLoaded', domLoaded);

        return {
            util,
            theme,
            comment,
            guest: {
                open,
                modal,
                closeInformation,
            },
        };
    };

    return {
        init,
    };
})();