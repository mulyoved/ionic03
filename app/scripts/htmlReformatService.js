/**
 * Created by Muly on 4/20/2014.
 */
angular.module('Ionic03.services')
.service('HTMLReformat', function($log) {
    var dbg = false;

    var reformat = function(input) {
        var results = "";

        HTMLParser(input, {
            start: function (tag, attrs, unary) {
                if (dbg) $log.log('start:', tag, attrs, unary);

                results += "<" + tag;

                for (var i = 0; i < attrs.length; i++) {
                    if (tag === 'a' && attrs[i].name === 'href') {
                    }
                    else if (tag === 'img' && attrs[i].name === 'height') {

                    }
                    else if (tag === 'img' && attrs[i].name === 'width') {

                    }
                    else {
                        results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
                    }
                }

                results += ">";
            },
            end: function (tag) {
                if (dbg) $log.log('end:', tag);
                results += "</" + tag + ">";
            },
            chars: function (text) {
                if (dbg) $log.log('chars:', text);
                results += text;
            },
            comment: function (text) {
                if (dbg) $log.log('comment:', text);
                results += "<!--" + text + "-->";
            }
        });

        if (dbg) $log.log('Result', results);

        return results;
    };

    return {
        reformat: reformat
    }
});
