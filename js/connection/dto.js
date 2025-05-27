export const dto = (() => {

    /**
     * @template T
     * @param {number} code
     * @param {T} data
     * @param {string[]|null} error
     * @returns {{code: number, data: T, error: string[]|null}}
     */
    const baseResponse = (code, data, error) => {
        return {
            code,
            data,
            error,
        };
    };

    /**
     * @param {number} love
     * @returns {{love: number}}
     */
    const likeCommentResponse = (love = 0) => {
        return {
            love,
        };
    };

    /**
     * @param {{ uuid: string, own: string, name: string, presence: boolean, comment: string|null, created_at: string, is_admin: boolean, is_parent: boolean, gif_url: string|null, ip: string|null, user_agent: string|null, comments: ReturnType<getCommentResponse>[], like: { love: number } }} data
     * @returns {{ uuid: string, own: string, name: string, presence: boolean, comment: string|null, created_at: string, is_admin: boolean, is_parent: boolean, gif_url: string|null, ip: string|null, user_agent: string|null, comments: ReturnType<getCommentResponse>[], like: ReturnType<likeCommentResponse> }}
     */
    const getCommentResponse = ({ uuid, own, name, presence, comment, created_at, is_admin, is_parent, gif_url, ip, user_agent, comments, like }) => {
        return {
            uuid,
            own,
            name,
            presence,
            comment,
            created_at,
            is_admin: is_admin ?? false,
            is_parent,
            gif_url,
            ip,
            user_agent,
            comments: comments?.map(getCommentResponse) ?? [],
            like: likeCommentResponse(like?.love ?? 0),
        };
    };

    /**
     * @param {{ uuid: string, own: string, name: string, presence: boolean, comment: string|null, created_at: string, is_admin: boolean, is_parent: boolean, gif_url: string|null, ip: string|null, user_agent: string|null, comments: ReturnType<getCommentResponse>[], like: { love: number } }[]} data
     * @returns {{ uuid: string, own: string, name: string, presence: boolean, comment: string|null, created_at: string, is_admin: boolean, is_parent: boolean, gif_url: string|null, ip: string|null, user_agent: string|null, comments: ReturnType<getCommentResponse>[], like: ReturnType<likeCommentResponse> }[]}
     */
    const getCommentsResponse = (data) => data.map(getCommentResponse);

    /**
     * @param {{ count: number, lists: { uuid: string, own: string, name: string, presence: boolean, comment: string|null, created_at: string, is_admin: boolean, is_parent: boolean, gif_url: string|null, ip: string|null, user_agent: string|null, comments: ReturnType<getCommentResponse>[], like: { love: number } }[] }} data
     * @returns {{ count: number, lists: { uuid: string, own: string, name: string, presence: boolean, comment: string|null, created_at: string, is_admin: boolean, is_parent: boolean, gif_url: string|null, ip: string|null, user_agent: string|null, comments: ReturnType<getCommentResponse>[], like: ReturnType<likeCommentResponse> }[] }}
     */
    const getCommentsResponseV2 = (data) => {
        return {
            count: data.count,
            lists: getCommentsResponse(data.lists),
        };
    };

    /**
     * @param {{status: boolean}} status
     * @returns {{status: boolean}}
     */
    const statusResponse = ({ status }) => {
        return {
            status,
        };
    };

    /**
     * @param {{token: string}} token
     * @returns {{token: string}}
     */
    const tokenResponse = ({ token }) => {
        return {
            token,
        };
    };

    /**
     * @param {{uuid: string}} uuid
     * @returns {{uuid: string}}
     */
    const uuidResponse = ({ uuid }) => {
        return {
            uuid,
        };
    };

    /**
     * @param {string} uuid
     * @param {boolean} show
     * @returns {{uuid: string, show: boolean}}
     */
    const commentShowMore = (uuid, show = false) => {
        return {
            uuid,
            show,
        };
    };

    /**
     * @param {string} id
     * @param {string} name
     * @param {boolean} presence
     * @param {string|null} comment
     * @param {string|null} gif_id
     * @returns {{id: string, name: string, presence: boolean, comment: string|null, gif_id: string|null}}
     */
    const postCommentRequest = (id, name, presence, comment, gif_id) => {
        return {
            id,
            name,
            presence,
            comment,
            gif_id,
        };
    };

    /**
     * @param {string} email
     * @param {string} password
     * @returns {{email: string, password: string}}
     */
    const postSessionRequest = (email, password) => {
        return {
            email: email,
            password: password,
        };
    };

    /**
     * @param {boolean|null} presence
     * @param {string|null} comment
     * @param {string|null} gif_id
     * @returns {{presence: boolean|null, comment: string|null, gif_id: string|null}}
     */
    const updateCommentRequest = (presence, comment, gif_id) => {
        return {
            presence: presence,
            comment: comment,
            gif_id: gif_id,
        };
    };

    return {
        uuidResponse,
        baseResponse,
        tokenResponse,
        statusResponse,
        likeCommentResponse,
        getCommentResponse,
        getCommentsResponse,
        getCommentsResponseV2,
        commentShowMore,
        postCommentRequest,
        postSessionRequest,
        updateCommentRequest,
    };
})();