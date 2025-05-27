import { request, HTTP_GET } from '../connection/request.js';

export const cache = (cacheName) => {

    /**
     * @type {Map<string, string>}
     */
    const objectUrls = new Map();

    /**
     * @type {Map<string, Promise<string>>}
     */
    const inFlightRequests = new Map();

    /**
     * @type {caches|null}
     */
    let cacheObject = null;

    let ttl = 1000 * 60 * 60 * 6;

    /**
     * @returns {Promise<void>}
     */
    const open = async () => {
        if (!cacheObject && window.isSecureContext) {
            cacheObject = await window.caches.open(cacheName);
        }
    };

    /**
     * @param {string} url
     * @param {Promise<void>|null} [cancel=null]
     * @returns {Promise<string>}
     */
    const get = (url, cancel = null) => {
        if (objectUrls.has(url)) {
            return Promise.resolve(objectUrls.get(url));
        }

        if (inFlightRequests.has(url)) {
            return inFlightRequests.get(url);
        }

        const inflightPromise = open().then(() => {

            /**
             * @returns {Promise<Blob>}
             */
            const fetchPut = () => request(HTTP_GET, url)
                .withCancel(cancel)
                .withRetry()
                .default()
                .then((r) => r.blob().then((b) => {
                    if (!window.isSecureContext) {
                        return b;
                    }

                    const headers = new Headers(r.headers);
                    const expiresDate = new Date(Date.now() + ttl);

                    headers.set('Content-Length', String(b.size));
                    headers.set('Expires', expiresDate.toUTCString());

                    const cBlob = b.slice();
                    return cacheObject.put(url, new Response(b, { headers })).then(() => cBlob);
                }));

            /**
             * @param {Blob} b 
             * @returns {string}
             */
            const blobToUrl = (b) => {
                objectUrls.set(url, URL.createObjectURL(b));
                return objectUrls.get(url);
            };

            if (!window.isSecureContext) {
                return fetchPut().then((b) => blobToUrl(b));
            }

            return cacheObject.match(url).then((res) => {
                if (!res) {
                    return fetchPut();
                }

                const expiresHeader = res.headers.get('Expires');
                const expiresTime = expiresHeader ? (new Date(expiresHeader)).getTime() : 0;

                if (Date.now() > expiresTime) {
                    return cacheObject.delete(url).then((s) => s ? fetchPut() : res.blob());
                }

                return res.blob();
            }).then((b) => blobToUrl(b));
        }).finally(() => {
            inFlightRequests.delete(url);
        });

        inFlightRequests.set(url, inflightPromise);
        return inflightPromise;
    };

    /**
     * @param {object[]} items
     * @param {Promise<void>|null} cancel
     * @returns {Promise<void>}
     */
    const run = async (items, cancel = null) => {
        await open();
        const uniq = new Map();

        if (!window.isSecureContext) {
            console.warn('Cache is not supported in insecure context');
        }

        items.filter((val) => val !== null).forEach((val) => {
            const exist = uniq.get(val.url) ?? [];
            uniq.set(val.url, [...exist, [val.res, val?.rej]]);
        });

        return Promise.allSettled(Array.from(uniq).map(([k, v]) => get(k, cancel)
            .then((s) => {
                v.forEach((cb) => cb[0]?.(s));
                return s;
            })
            .catch((r) => {
                v.forEach((cb) => cb[1]?.(r));
                return r;
            })
        ));
    };

    return {
        run,
        get,
        open,
        /**
         * @param {number} v
         * @returns {this} 
         */
        setTtl(v) {
            ttl = Number(v);
            return this;
        },
    };
};