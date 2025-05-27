import { progress } from './progress.js';
import { cache } from '../../common/cache.js';

export const audio = (() => {

    /**
     * @type {HTMLButtonElement|null}
     */
    let music = null;

    /**
     * @type {HTMLAudioElement|null}
     */
    let audioEl = null;

    /**
     * @type {Promise<void>|null}
     */
    let canPlay = null;

    let isPlay = false;

    const statePlay = '<i class="fa-solid fa-circle-pause spin-button"></i>';
    const statePause = '<i class="fa-solid fa-circle-play"></i>';

    /**
     * @returns {Promise<void>}
     */
    const play = async () => {
        if (!navigator.onLine) {
            return;
        }

        music.disabled = true;
        try {
            await canPlay;
            await audioEl.play();
            isPlay = true;
            music.disabled = false;
            music.innerHTML = statePlay;
        } catch (err) {
            isPlay = false;
            alert(err);
        }
    };

    /**
     * @returns {void}
     */
    const pause = () => {
        isPlay = false;
        audioEl.pause();
        music.innerHTML = statePause;
    };

    /**
     * @returns {Promise<void>}
     */
    const init = async () => {
        music = document.getElementById('button-music');
        document.addEventListener('undangan.open', () => {
            music.style.display = 'block';
        });

        try {
            const cancel = new Promise((res) => document.addEventListener('progress.invalid', res, { once: true }));
            const url = await cache('audio').get(music.getAttribute('data-url'), cancel);

            audioEl = new Audio(url);
            audioEl.volume = 1;
            audioEl.loop = true;
            audioEl.muted = false;
            audioEl.currentTime = 0;
            audioEl.autoplay = false;
            audioEl.controls = false;

            canPlay = new Promise((res) => audioEl.addEventListener('canplay', res));
            progress.complete('audio');
        } catch {
            progress.invalid('audio');
        }

        music.addEventListener('offline', pause);
        music.addEventListener('click', () => isPlay ? pause() : play());
    };

    return {
        init,
        play,
    };
})();