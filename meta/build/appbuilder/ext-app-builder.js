(function() {

var fs = require('fs');

var defaultJsb3Object = {
    "projectName": "Project Name",
    "licenseText": "Copyright(c) 2011 Company Name",
    "builds": [
        {
            "name": "All Classes",
            "target": "all-classes.js",
            "options": {
                "debug": true
            },
            "files": []
        },
        {
            "name": "Application - Production",
            "target": "app-all.js",
            "compress": true,
            "files": [
                { path: '', name: 'all-classes.js' },
                { path: '', name: 'app.js' }
            ]
        }
    ],
    "resources": []
};

function cleanPath(path) {
    return path.replace(/\/\.\.\//g, '/');
}

function parseArguments() {
    var args = { targets: [] },
        key = null,
        i, ln, arg, match;

    for (i = 0, ln = phantom.args.length; i < ln; i++) {
        arg = phantom.args[i];

        if (key !== null) {
            if (!arg.match(/^-{1,2}([^-])/i)) {
                args[key] = arg;
                key = null;
                continue;
            }

            args[key] = true;
            key = null;
        }

        if ((match = arg.match(/^--(.+)$/i)) || (match = arg.match(/^-(.+)$/i))) {
            key = match[1];
        }
        else if (match = arg.match(/^--([^=]+)=(.*)$/i)) {
            args[match[1]] = match[2];
        }
        else if (match = arg.match(/^-([\w]+)$/i)) {
            match[1].split('').forEach(function(a) {
                args[a] = true;
            });
        }
        else {
            args.targets.push(arg);
        }
    }

    if (key !== null) {
        args[key] = true;
    }

    return args;
}



function navigateObject(object, target) {
    var ret = object,
        originalTarget =  target,
        expect = function(expected) {
            if (typeof expected === 'string') {
                var ln = expected.length;

                if (target.substring(0, ln) === expected) {
                    target = target.slice(ln);

                    return expected;
                }

                return null;
            }

            var result = target.match(expected);

            if (result !== null) {
                target = target.slice(result[0].length);
                return result[0];
            }

            return null;
        },
        push = function(property) {
            if (!ret.hasOwnProperty(property)) {
                throw new Error("Invalid target property name " + property);
            }

            ret = ret[property];
        },
        name, bracket, dot, quote;

    while (target.length > 0) {
        name = expect(/^[\w]+/i);

        if (name !== null) {
            push(name);
            continue;
        }
        else {
            bracket = expect(/^\[/);

            if (bracket !== null) {
                quote = expect(/^'|"/);

                push(expect(new RegExp('^[^\\]' + (quote ? quote[0] : '') + ']+', 'i')));

                if (quote !== null) {
                    expect(quote[0]);
                }

                expect(/^\]/);

                continue;
            }
            else {
                dot = expect(/^\./);

                if (dot !== null) {
                    push(expect(/^[\w]+/i));
                    continue;
                }
            }
        }

        throw new Error("Malformed target: '" + originalTarget + "', failed parsing from: '" + target + "'");
    }

    return ret;
}

var args = parseArguments(),
    writeTarget = args.target || 'builds[0].files',
    verbose = !!args.verbose,
    appLocation = args['app-entry'],
    jsb3Path = args['project'],
    jsb3Content, jsb3Object, targetObject,
    path, pathParts, fileName;

if (!appLocation) {
    throw new Error("Missing required 'app-entry' argument");
}

if (!jsb3Path) {
    throw new Error("Missing required 'project' argument");
}

if (fs.exists(jsb3Path)) {
    try {
        jsb3Content = fs.read(jsb3Path);
        jsb3Object = JSON.parse(jsb3Content);
    } catch (e) {
        throw new Error("Failed parsing JSB file: " + jsb3Path + ". Please make sure its content is of valid JSON format");
    }
}
else {
    jsb3Object = defaultJsb3Object;
}

targetObject = navigateObject(jsb3Object, writeTarget);
targetObject.length = 0; // Wipe out the target array

var webPage = require('webpage');
var page = webPage.create();

page.open(appLocation, function (status) {

    page.onCallback = function (data) {
        targetObject.push.apply(targetObject, data);

        jsb3Content = JSON.stringify(jsb3Object, null, 4);

        if (verbose) {
            console.log(jsb3Content);
        }

        fs.write(jsb3Path, jsb3Content);

        phantom.exit();
        return;
    };


    page.evaluate(function() {

        function getRelativePath(from, to) {
            var root = '',
                fromParts = from.split('/'),
                toParts = to.split('/'),
                index = null,
                i, ln, match;

            for (i = 0, ln = toParts.length; i < ln; i++) {
                if (toParts[i] !== fromParts[i]) {
                    index = i;
                    break;
                }
            }

            if (index === null || index === 0) {
                return from;
            }

            from = fromParts.slice(index).join('/');

            for (i = 0; i < ln - index - 1; i++) {
                from = '../' + from;
            }

            return from;
        }

        var currentLocation = window.location.href,
            targetObject = [];

        if (typeof Ext === 'undefined') {
            console.log("[ERROR] Ext is not defined, please verify that the library is loaded properly on the application's page");
            phantom.exit();
        }

        Ext.onReady(function() {
            Ext.Loader.history.forEach(function(item) {
                path = Ext.Loader.getPath(item);
                path = getRelativePath(path, currentLocation);
                pathParts = path.split('/');
                fileName = pathParts.pop();
                path = pathParts.join('/');

                if (path !== '') {
                    path += '/';
                }

                targetObject.push({path: path, name: fileName});
            });

            window.callPhantom(targetObject)
        });

    });

});

})();
