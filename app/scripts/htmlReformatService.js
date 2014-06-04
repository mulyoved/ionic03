/**
 * Created by Muly on 4/20/2014.
 */
angular.module('Ionic03.services')
.service('HTMLReformat', function($log) {

    var reformat = function(input) {
        var results = "";
        var dbg = false;
        if (dbg) $log.log('input:', input);

        HTMLParser(input, {
            start: function (tag, attrs, unary) {
                if (dbg) $log.log('start:', tag, attrs, unary);

                results += "<" + tag;

                for (var i = 0; i < attrs.length; i++) {
                    if (tag === 'a' && attrs[i].name === 'href') {
                        //results += ' href="." onclick="clickURL(\'' + attrs[i].escaped + '\')"';
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

    var extractLocalImages = function(input) {
        var results = [];
        var dbg = false;

        HTMLParser(input, {
            start: function (tag, attrs, unary) {
                if (dbg) $log.log('start:', tag, attrs, unary);

                if (tag === 'img') {
                    for (var i = 0; i < attrs.length; i++) {
                        if (attrs[i].name === 'src') {
                            var uri = attrs[i].value;
                            if (uri.startsWith('file://')) {
                                results.push(attrs[i].value);
                            }
                        }
                    }
                }
            },
            end: function (tag) {
                if (dbg) $log.log('end:', tag);
            },
            chars: function (text) {
                if (dbg) $log.log('chars:', text);
            },
            comment: function (text) {
                if (dbg) $log.log('comment:', text);
            }
        });

        if (dbg) $log.log('Result', results);

        return results;
    };

    var replaceLocalImages = function(input, uriArray, urlArray) {
        var results = "";
        var dbg = false;

        HTMLParser(input, {
            start: function (tag, attrs, unary) {
                if (dbg) $log.log('start:', tag, attrs, unary);

                results += "<" + tag;

                for (var i = 0; i < attrs.length; i++) {
                    if ((tag === 'a' && attrs[i].name === 'href') ||
                        (tag === 'img' && attrs[i].name === 'src')){
                        var idx = uriArray.indexOf(attrs[i].value);
                        if (idx >=0) {
                            attrs[i].escaped = urlArray[idx];
                        }
                    }

                    results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
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
        reformat: reformat,
        extractLocalImages: extractLocalImages,
        replaceLocalImages: replaceLocalImages
    }
});
