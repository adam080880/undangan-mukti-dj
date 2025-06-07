export const progress = (() => {

    /**
     * @type {HTMLElement|null}
     */
    let info = null;

    /**
     * @type {HTMLElement|null}
     */
    let bar = null;

    let total = 0;
    let loaded = 0;
    let valid = true;

    /**
     * @returns {void}
     */
    const add = () => {
        total += 1;
    };

    /**
     * @returns {string}
     */
    const showInformation = () => {
        let percentage = Math.min((loaded / total) * 100);
        if (percentage >= 100) {
            percentage = 100;
        }
        return `${percentage.toFixed(0)}`;
    };

    /**
     * @param {string} type
     * @param {boolean} [skip=false]
     * @returns {void}
     */
    const complete = (type, skip = false) => {
        if (!valid) {
            return;
        }

        loaded += 1;
        info.innerText = `Loading ${showInformation()}`;
        bar.style.width = Math.min((loaded / total) * 100, 100).toString() + '%';

        if (loaded === total) {
            document.dispatchEvent(new Event('progress.done'));
        }
    };

    /**
     * @param {string} type
     * @returns {void}
     */
    const invalid = (type) => {
        if (valid) {
            valid = false;
            bar.style.backgroundColor = 'red';
            info.innerText = `Error loading ${type} ${showInformation()}`;
            document.dispatchEvent(new Event('progress.invalid'));
        }
    };

    /**
     * @returns {void}
     */
    const init = () => {
        info = document.getElementById('progress-info');
        bar = document.getElementById('progress-bar');
        info.style.display = 'block';
    };

    return {
        init,
        add,
        invalid,
        complete,
    };
})();