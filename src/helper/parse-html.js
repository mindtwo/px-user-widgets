/**
 * Create html element from string
 *
 * @param {string} htmlString
 * @returns
 */
const parseHtml = (htmlString) => {

    const template = document.createElement('template');
    template.innerHTML = htmlString.trim();

    return template.content;
}

export {
    parseHtml,
};
