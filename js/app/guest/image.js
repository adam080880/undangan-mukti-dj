import { progress } from './progress.js';
import { cache } from '../../common/cache.js';

export const image = (() => {

    /**
     * @type {NodeListOf<HTMLImageElement>|null}
     */
    let images = null;

    let hasSrc = false;

    /**
     * @type {object[]}
     */
    const urlCache = [];

    /**
     * @param {HTMLImageElement} el 
     * @param {string} src 
     * @returns {Promise<void>}
     */
    const appendImage = (el, src) => new Promise((res) => {
        const img = new Image();

        img.onload = () => {
            el.src = img.src;
            el.width = img.naturalWidth;
            el.height = img.naturalHeight;
            progress.complete('image');
            img.remove();
            res();
        };

        img.src = src;
    });

    /**
     * @param {HTMLImageElement} el 
     * @returns {void}
     */
    const getByFetch = (el) => {
        urlCache.push({
            url: el.getAttribute('data-src'),
            res: (url) => appendImage(el, url),
            rej: () => progress.invalid('image'),
        });
    };

    /**
     * @param {HTMLImageElement} el 
     * @returns {void}
     */
    const getByDefault = (el) => {
        el.onerror = () => progress.invalid('image');
        el.onload = () => {
            el.width = el.naturalWidth;
            el.height = el.naturalHeight;
            progress.complete('image');
        };

        if (el.complete && el.naturalWidth !== 0 && el.naturalHeight !== 0) {
            progress.complete('image');
        } else if (el.complete) {
            progress.invalid('image');
        }
    };

    /**
     * @returns {boolean}
     */
    const hasDataSrc = () => hasSrc;

    /**
     * @returns {Promise<void>}
     */
    const load = async () => {
        const arrImages = Array.from(images);

        arrImages.filter((el) => el.getAttribute('data-fetch-img') !== 'high').forEach((el) => {
            el.hasAttribute('data-src') ? getByFetch(el) : getByDefault(el);
        });

        if (!hasSrc) {
            return;
        }

        const c = cache('images');
        const cancel = new Promise((res) => document.addEventListener('progress.invalid', res, { once: true }));

        await c.open();
        await Promise.allSettled(arrImages.filter((el) => el.getAttribute('data-fetch-img') === 'high').map((el) => {
            return c.get(el.getAttribute('data-src'), cancel)
                .then((i) => appendImage(el, i))
                .then(() => el.classList.remove('opacity-0'));
        }));
        await c.run(urlCache, cancel);
    };

    /**
     * @returns {object}
     */
    const init = () => {
        images = document.querySelectorAll('img');

        images.forEach(progress.add);
        hasSrc = Array.from(images).some((i) => i.hasAttribute('data-src'));

        return {
            load,
            hasDataSrc,
        };
    };

    return {
        init,
    };
})();