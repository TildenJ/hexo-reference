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

    // create map for looking footnotes array
    function createLookMap(field) {
        var map = {}
        for (var i = 0; i < footnotes.length; i++) {
            var item = footnotes[i]
            var key = item[field]
            map[key] = item
        }
        return map
    }
    var indexMap = createLookMap("index")

    // render (HTML) footnotes reference
    text = text.replace(reFootnoteIndex,
        function(match, index){
            // var tooltip = indexMap[index].content;
            var tooltip = marked.parseInline(indexMap[index].content);
            return '<span class="footnoteAnchorShift" id="fnref:' + index + '"></span><sup>' +
                '<a class="footnote-link" href="#fn:'+ index +'" rel="footnote">' +
                '<span id="tippy-i-'+ index +'" class="tippy-i" data-content="'+ 
                encodeURIComponent(tooltip) +'">[' + index +']</span></a></sup>';
        });

    // sort footnotes by their index
    footnotes.sort(function (a, b) {
        return a.index - b.index;
    });

    // render footnotes (HTML)
    footnotes.forEach(function (footNote) {
        html += '<div class="footnoteAnchorShift" id="fn:' + footNote.index + '"></div>';
        html += '<div>';
        html += '<span style="display: inline-block; vertical-align: top; padding-right: 1em; margin-left: -2.5px">[';
        html += footNote.index;
        html += ']</span>';
        html += '<span style="display: inline-block; vertical-align: top;">';
        html += marked.parseInline(footNote.content.trim());
        html += ' <a class="footnote-link" href="#fnref:' + footNote.index + '" rev="footnote"> ↩</a></span></div>';
    });

    // add footnotes at the end of the content
    if (footnotes.length) {
        text += '<div id="footnotes">';
        text += '<hr style="margin-top: 3em; border-color: var(--default-text-color)">';
        text += '<h1>Reference</h1>'
        text += '<div id="footnotelist">';
        text += '<div style="margin-left: 0.5em">' + html + '</div>';
        text += '</div></div>';
    }
    return text;
}
module.exports = renderFootnotes;