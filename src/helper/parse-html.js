/**
 * Create html element from string
 *
 * @param {string} htmlString
 * @returns
 */
const parseHtml = (htmlString) => {
    const dom = new DOMParser().parseFromString(htmlString, 'text/html');

    return dom.body.firstChild;
}

export {
    parseHtml,
    // parse,
};
