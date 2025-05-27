import { util } from './util.js';

export const offline = (() => {

    /**
     * @type {HTMLElement|null}
     */
    let alert = null;

    let online = true;

    const classes = [
        'input[data-offline-disabled]',
        'button[data-offline-disabled]',
        'select[data-offline-disabled]',
        'textarea[data-offline-disabled]',
    ];

    /**
     * @returns {boolean}
     */
    const isOnline = () => online;

    /**
     * @returns {void}
     */
    const setOffline = () => {
        const el = alert.firstElementChild.firstElementChild;
        el.classList.remove('bg-success');
        el.classList.add('bg-danger');
        el.firstElementChild.innerHTML = '<i class="fa-solid fa-ban me-2"></i>Koneksi tidak tersedia';
    };

    /**
     * @returns {void}
     */
    const setOnline = () => {
        const el = alert.firstElementChild.firstElementChild;
        el.classList.remove('bg-danger');
        el.classList.add('bg-success');
        el.firstElementChild.innerHTML = '<i class="fa-solid fa-cloud me-2"></i>Koneksi tersedia kembali';
    };

    /**
     * @returns {Promise<void>}
     */
    const setDefaultState = async () => {
        if (!online) {
            return;
        }

        await util.changeOpacity(alert, false);
        setOffline();
    };

    /**
     * @returns {void}
     */
    const changeState = () => {
        document.querySelectorAll(classes.join(', ')).forEach((e) => {

            e.dispatchEvent(new Event(isOnline() ? 'online' : 'offline'));
            e.setAttribute('data-offline-disabled', isOnline() ? 'false' : 'true');

            if (e.tagName === 'BUTTON') {
                isOnline() ? e.classList.remove('disabled') : e.classList.add('disabled');
            } else {
                isOnline() ? e.removeAttribute('disabled') : e.setAttribute('disabled', 'true');
            }
        });
    };

    /**
     * @returns {void}
     */
    const onOffline = () => {
        online = false;

        setOffline();
        util.changeOpacity(alert, true);
        changeState();
    };

    /**
     * @returns {void}
     */
    const onOnline = () => {
        online = true;

        setOnline();
        util.timeOut(setDefaultState, 3000);
        changeState();
    };

    /**
     * @returns {void}
     */
    const init = () => {
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        alert = document.createElement('div');
        alert.classList.add('fixed-top', 'pe-none');
        alert.style.cssText = 'opacity: 0; z-index: 1057;';
        alert.innerHTML = `
        <div class="d-flex justify-content-center mx-auto">
            <div class="d-flex justify-content-center align-items-center rounded-pill my-2 bg-danger shadow">
                <small class="text-center py-1 px-2 mx-1 mt-1 mb-0 text-white" style="font-size: 0.8rem;"></small>
            </div>
        </div>`;

        document.body.insertBefore(alert, document.body.lastChild);
    };

    return {
        init,
        isOnline,
    };
})();