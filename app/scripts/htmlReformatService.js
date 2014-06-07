/**
 * Created by Muly on 4/20/2014.
 */
angular.module('Ionic03.services')
.service('HTMLReformat', function($log) {

    var reformat = function(input, filetrByLinky) {
        var results = "";
        var dbg = false;
        if (dbg) $log.log('input:', input);

        var LINKY_URL_REGEXP = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/
        //var LINKY_URL_REGEXP = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/;

        var MAILTO_REGEXP = /^mailto:/;

        var linky = function(text, target) {
            if (!text) return text;
            var match;
            var raw = text;
            var html = [];
            var url;
            var i;
            while ((match = raw.match(LINKY_URL_REGEXP))) {
                // We can not end in these as they are sometimes found at the end of the sentence
                url = match[0];
                // if we did not match ftp/http/mailto then assume mailto
                if (match[2] == match[3]) url = 'mailto:' + url;
                i = match.index;
                addText(raw.substr(0, i));
                addLink(url, match[0].replace(MAILTO_REGEXP, ''));
                raw = raw.substring(i + match[0].length);
            }
            addText(raw);
            return html.join('');

            function addText(text) {
                if (!text) {
                    return;
                }
                html.push(text);
            }

            function addLink(url, text) {
                html.push('<a ');
                if (angular.isDefined(target)) {
                    html.push('target="');
                    html.push(target);
                    html.push('" ');
                }
                html.push('href="');
                html.push(url);
                html.push('">');
                addText(text);
                html.push('</a>');
            }
        };



        HTMLParser(input, {
            start: function (tag, attrs, unary) {
                if (dbg) $log.log('start:', tag, attrs, unary);

                results += "<" + tag;

                for (var i = 0; i < attrs.length; i++) {
                    //if (tag === 'a' && attrs[i].name === 'href') {
                        //results += ' href="." onclick="clickURL(\'' + attrs[i].escaped + '\')"';
                    //}
                    if (tag === 'img' && attrs[i].name === 'height') {

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
                if (filetrByLinky) {
                    text = linky(text);
                    if (dbg) $log.log('linky:', text);
                }
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
})

    //to open url in cordova external browser
.directive('a', function ($log, $rootScope) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            if ( !attrs.href ) {
                return;
            }
            var url = attrs.href;
            /*
            if ( url.lastIndexOf('http',0) < 0 ){
                url = 'http://' + url;
                $log.log('url does not start with http, add it', url);
            }
            */
            //if ( url.lastIndexOf('http',0) === 0 ) {
                element.on('click',function(e){
                    e.preventDefault();
                    $rootScope.$broadcast('event:url-click', url);

                    /*
                     if(attrs.ngClick){
                     scope.$eval(attrs.ngClick, encodeURI(url));
                     }
                     */

                    //Format the url better


                    //$log.log('open url in _system web browser', url);
                    //window.open(encodeURI(url), '_system');
                });
            //}
        }
    };
})

    .directive('compile', function ($compile, HTMLReformat) {
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    element.html(HTMLReformat.reformat(value, true));
                    $compile(element.contents())(scope);
                }
            )};

    });
