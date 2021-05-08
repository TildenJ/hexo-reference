'use strict';

var marked = require("marked");


/**
 * Render markdown footnotes
 * @param {String} text
 * @returns {String} text
 */
function renderFootnotes(text) {
    var footnotes = [];
    var reFootnoteContent = /\[\^(\d+)\]: ?([\S\s]+?)(?=\[\^(?:\d+)\]|\n\n|$)/g;
    var reInlineFootnote = /\[\^(\d+)\]\((.+?)\)/g;
    var reFootnoteIndex = /\[\^(\d+)\]/g;
    var html = '';

    // threat all inline footnotes
    text = text.replace(reInlineFootnote, function (match, index, content) {
        footnotes.push({
            index: index,
            content: content
        });
        // remove content of inline footnote
        return '[^' + index + ']';
    });

    // threat all footnote contents
    text = text.replace(reFootnoteContent, function (match, index, content) {
        footnotes.push({
            index: index,
            content: content
        });
        // remove footnote content
        return '';
    });

    var indexMap = footnotes.reduce((map, cur) => {
        map[cur.index] = {
            content: cur.content,
            idx: 0
        }
        return map;
    }, {})

    // render (HTML) footnotes reference
    text = text.replace(reFootnoteIndex,
        function(match, index){
            const item = indexMap[index]
            item.idx++;
            var tooltip = marked.parseInline(item.content.trim());
            let postfix = ':'+String(item.idx);
            return '<span class="footnoteAnchorShift" id="fnref:' + index + postfix + '"></span><sup>' +
                '<button class="footnote-btn tippy-i" id="tippy-i-' + index + '"  ' +
                ' data-content="' + encodeURIComponent(tooltip) +
                '" onclick="location.href=\'#fn:' + index + '\'" type="button">[' +
                index + ']</button></sup>';
        });

    // sort footnotes by their index
    footnotes.sort(function (a, b) {
        return a.index - b.index;
    });

    // render footnotes (HTML)
    footnotes.forEach(function (footNote) {
        html += '<div class="footnoteAnchorShift" id="fn:' + footNote.index + '"></div>';
        html += '<div>';
        html += '<span class="fnIdx">[';
        html += footNote.index;
        html += ']</span>';
        html += '<span class="fnItem">';
        html += marked.parseInline(footNote.content.trim());


        const len = indexMap[footNote.index].idx;
        for (let i = 0; i < len; ++i) {
            html += '<a class="footnote-link footnote-icon" href="#fnref:' + footNote.index + ':' + String(i+1)
                + '" rev="footnote">↩</a>';
        }
        html += '</span></div>';
    });

    // add footnotes at the end of the content
    if (footnotes.length) {
        text += '<div id="footnotes">';
        text += '<hr>';
        text += '<h1>Reference</h1>'
        text += '<div id="footnotelist">';
        text += '<div class="footnotecontainer">' + html + '</div>';
        text += '</div></div>';
    }
    return text;
}
module.exports = renderFootnotes;
