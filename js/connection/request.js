import { dto } from './dto.js';

export const HTTP_GET = 'GET';
export const HTTP_PUT = 'PUT';
export const HTTP_POST = 'POST';
export const HTTP_PATCH = 'PATCH';
export const HTTP_DELETE = 'DELETE';

export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_CREATED = 201;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

export const ERROR_ABORT = 'AbortError';

export const defaultJSON = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

export const request = (method, path) => {

    const ac = new AbortController();
    const req = {
        signal: ac.signal,
        method: String(method).toUpperCase(),
        headers: new Headers(defaultJSON),
    };

    window.addEventListener('offline', () => ac.abort());
    window.addEventListener('popstate', () => ac.abort());

    let reqTtl = 0;
    let reqRetry = 0;
    let reqDelay = 0;
    let reqAttempts = 0;
    let url = document.body.getAttribute('data-url');

    if (url && url.slice(-1) === '/') {
        url = url.slice(0, -1);
    }

    /**
     * @param {string} input 
     * @returns {Promise<Response>}
     */
    const baseFetch = (input) => {

        /**
         * @returns {Promise<Response>}
         */
        const abstractFetch = () => {

            /**
             * @returns {Promise<Response>}
             */
            const wrapperFetch = () => window.fetch(input, req);

            if (reqTtl === 0 || !window.isSecureContext) {
                return wrapperFetch();
            }

            if (req.method !== HTTP_GET) {
                console.warn('Only method GET can be cached');
                return wrapperFetch();
            }

            /**
             * @param {Cache} c 
             * @returns {Promise<Response>}
             */
            const fetchPut = (c) => wrapperFetch().then((res) => {
                if (!res.ok) {
                    return res;
                }

                const cRes = res.clone();
                const headers = new Headers(res.headers);

                return res.clone().arrayBuffer().then((a) => {

                    if (!headers.has('Expires')) {
                        const exp = new Date(Date.now() + reqTtl);
                        headers.set('Expires', exp.toUTCString());
                    }

                    if (!headers.has('Content-Length')) {
                        headers.set('Content-Length', String(a.byteLength));
                    }

                    return c.put(input, new Response(res.body, { headers })).then(() => cRes);
                });
            });

            return window.caches.open('request').then((c) => c.match(input).then((res) => {
                if (!res) {
                    return fetchPut(c);
                }

                const exp = res.headers.get('Expires');
                const expTime = exp ? (new Date(exp)).getTime() : 0;

                if (Date.now() > expTime) {
                    return c.delete(input).then((s) => s ? fetchPut(c) : res);
                }

                return res;
            }));
        };

        if (reqRetry === 0 && reqDelay === 0) {
            return abstractFetch();
        }

        /**
         * @returns {Promise<Response>}
         */
        const attempt = async () => {
            try {
                return await abstractFetch();
            } catch (error) {
                if (error.name === ERROR_ABORT) {
                    throw error;
                }

                reqDelay *= 2;
                reqAttempts++;

                if (reqAttempts >= reqRetry) {
                    throw new Error(`Max retries reached: ${error}`);
                }

                console.warn(`Retrying fetch (${reqAttempts}/${reqRetry}): ${input}`);
                await new Promise((resolve) => window.setTimeout(resolve, reqDelay));

                return attempt();
            }
        };

        return attempt();
    };

    return {
        /**
         * @template T
         * @param {((data: any) => T)=} transform
         * @returns {Promise<ReturnType<typeof dto.baseResponse<T>>>}
         */
        send(transform = null) {
            return baseFetch(url + path)
                .then((res) => {
                    return res.json().then((json) => {
                        if (res.status >= HTTP_STATUS_INTERNAL_SERVER_ERROR && (json.message ?? json[0])) {
                            throw new Error(json.message ?? json[0]);
                        }

                        if (json.error) {
                            throw new Error(json.error[0]);
                        }

                        if (transform) {
                            json.data = transform(json.data);
                        }

                        return dto.baseResponse(json.code, json.data, json.error);
                    });
                })
                .catch((err) => {
                    if (err.name === ERROR_ABORT) {
                        console.warn('Fetch abort:', err);
                        return err;
                    }

                    alert(err);
                    throw new Error(err);
                });
        },
        /**
         * @param {number} [ttl=21600000]
         * @returns {ReturnType<typeof request>}
         */
        withCache(ttl = 1000 * 60 * 60 * 6) {
            reqTtl = ttl;

            return this;
        },
        /**
         * @param {number} [maxRetries=3]
         * @param {number} [delay=1000]
         * @returns {ReturnType<typeof request>}
         */
        withRetry(maxRetries = 3, delay = 1000) {
            reqRetry = maxRetries;
            reqDelay = delay;

            return this;
        },
        /**
         * @param {Promise<void>|null} cancel
         * @returns {ReturnType<typeof request>}
         */
        withCancel(cancel) {
            if (cancel === null || cancel === undefined) {
                return this;
            }

            (async () => {
                await cancel;
                ac.abort();
            })();

            return this;
        },
        /**
         * @param {object|null} header 
         * @returns {Promise<Response>}
         */
        default(header = null) {
            req.headers = new Headers(header ?? {});
            return baseFetch(path);
        },
        /**
         * @returns {Promise<boolean>}
         */
        download() {
            Object.keys(defaultJSON).forEach((k) => req.headers.delete(k));
            return baseFetch(url + path)
                .then((res) => {
                    if (res.status !== HTTP_STATUS_OK) {
                        return false;
                    }

                    const existingLink = document.querySelector('a[download]');
                    if (existingLink) {
                        document.body.removeChild(existingLink);
                    }

                    const filename = res.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] ?? 'download.csv';

                    return res.blob().then((blob) => {
                        const link = document.createElement('a');
                        const href = window.URL.createObjectURL(blob);

                        link.href = href;
                        link.download = filename;
                        document.body.appendChild(link);

                        link.click();

                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(href);

                        return true;
                    });
                })
                .catch((err) => {
                    if (err.name === ERROR_ABORT) {
                        console.warn('Fetch abort:', err);
                        return err;
                    }

                    alert(err);
                    throw new Error(err);
                });
        },
        /**
         * @param {string} token
         * @returns {ReturnType<typeof request>}
         */
        token(token) {
            if (token.split('.').length === 3) {
                req.headers.append('Authorization', 'Bearer ' + token);
                return this;
            }

            req.headers.append('x-access-key', token);
            return this;
        },
        /**
         * @param {object} body
         * @returns {ReturnType<typeof request>}
         */
        body(body) {
            req.body = JSON.stringify(body);
            return this;
        },
    };
};
