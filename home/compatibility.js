(function () {
    var notice = document.getElementById("browserCompatibilityNotice");
    if (!notice) {
        return;
    }

    var issues = [];

    function addEvent(target, name, handler, capture) {
        if (target.addEventListener) {
            target.addEventListener(name, handler, capture || false);
        } else if (target.attachEvent) {
            target.attachEvent("on" + name, handler);
        }
    }

    function showIssue(message) {
        if (issues.indexOf(message) !== -1) {
            return;
        }

        issues.push(message);
        notice.textContent = "Compatibility notice: " + issues.join(" ");
        notice.style.display = "block";
    }

    function checkFeatures() {
        var canvases = document.getElementsByTagName("canvas");
        var dialogs = document.getElementsByTagName("dialog");
        var index;

        for (index = 0; index < canvases.length; index += 1) {
            if (typeof canvases[index].getContext !== "function") {
                showIssue("Canvas projects may not work in this browser.");
                break;
            }
        }

        if (
            (document.getElementById("game") || document.getElementById("movingBall")) &&
            !window.requestAnimationFrame
        ) {
            showIssue("Canvas animations may not run in this browser.");
        }

        for (index = 0; index < dialogs.length; index += 1) {
            if (typeof dialogs[index].showModal !== "function") {
                showIssue("Photo or contact dialogs may not open in this browser.");
                break;
            }
        }

        if (document.getElementById("game") && !window.PointerEvent) {
            showIssue("The screwdriver game needs Pointer Events, which this browser does not support.");
        }

        if (!document.querySelector) {
            showIssue("Some interactive features need a newer browser.");
        }
    }

    addEvent(window, "error", function (event) {
        event = event || window.event || {};
        var target = event.target || event.srcElement;
        if (target && target.tagName) {
            var tagName = target.tagName.toLowerCase();
            if (tagName === "script" || tagName === "link" || tagName === "img") {
                showIssue("A page resource failed to load. Some content or interactive features may be unavailable.");
                return;
            }
        }

        if (event.message) {
            showIssue("Some interactive features failed to run. Try updating your browser.");
        }
    }, true);

    function onReady() {
        checkFeatures();
        if (issues.length === 0) {
            notice.style.display = "none";
        }
    }

    if (document.addEventListener) {
        addEvent(document, "DOMContentLoaded", onReady);
    } else {
        addEvent(window, "load", onReady);
    }
}());
