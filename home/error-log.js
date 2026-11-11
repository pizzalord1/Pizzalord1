(function () {
    var entries = [];
    var maxEntries = 50;
    var dialog = document.getElementById("siteErrorDialog");
    var list = document.getElementById("siteErrorList");
    var empty = document.getElementById("siteErrorEmpty");
    var closeButton = document.getElementById("siteErrorClose");
    var clearButton = document.getElementById("siteErrorClear");
    var isClosing = false;
    var closeAnimationEnd;

    function render() {
        while (list.firstChild) {
            list.removeChild(list.firstChild);
        }

        empty.hidden = entries.length > 0;
        entries.forEach(function (entry) {
            var item = document.createElement("li");
            item.textContent = entry.time + " — " + entry.category + ": " + entry.message;
            list.appendChild(item);
        });
    }

    function record(category, message) {
        entries.push({
            time: new Date().toLocaleTimeString(),
            category: category,
            message: message
        });
        if (entries.length > maxEntries) {
            entries.shift();
        }
        if (dialog.open) {
            render();
        }
    }

    function safeErrorName(error) {
        var name = error && typeof error.name === "string" ? error.name : "";
        return /^[A-Za-z]{1,30}$/.test(name) ? name : "Unknown";
    }

    function closeDialog() {
        if (!dialog.open || isClosing) {
            return;
        }

        isClosing = true;
        dialog.classList.add("is-closing");
        closeAnimationEnd = function (event) {
            if (event.target !== dialog || event.animationName !== "discord-contact-disappear") {
                return;
            }

            dialog.removeEventListener("animationend", closeAnimationEnd);
            closeAnimationEnd = undefined;
            dialog.classList.remove("is-closing");
            isClosing = false;
            dialog.close();
        };
        dialog.addEventListener("animationend", closeAnimationEnd);
    }

    window.addEventListener("error", function (event) {
        var target = event.target || event.srcElement;
        if (target && target !== window && target.tagName) {
            record("Resource", "A page resource failed to load (" + target.tagName.toLowerCase() + ").");
            return;
        }

        record("Script", "A JavaScript error occurred (" + safeErrorName(event.error) + ").");
    }, true);

    window.addEventListener("unhandledrejection", function (event) {
        record("Async", "An unhandled asynchronous error occurred (" + safeErrorName(event.reason) + ").");
    });

    window.addEventListener("keydown", function (event) {
        var target = event.target;
        var tagName = target && target.tagName ? target.tagName.toLowerCase() : "";
        var isTyping = tagName === "input" || tagName === "textarea" || tagName === "select" ||
            (target && target.isContentEditable);
        var isShortcut = event.ctrlKey && (event.code === "Quote" || event.key === "'");

        if (!isShortcut || event.altKey || event.metaKey || isTyping) {
            return;
        }

        event.preventDefault();
        if (!dialog.open) {
            render();
            dialog.showModal();
        }
    });

    closeButton.addEventListener("click", function () {
        closeDialog();
    });

    dialog.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeDialog();
    });

    dialog.addEventListener("close", function () {
        if (closeAnimationEnd) {
            dialog.removeEventListener("animationend", closeAnimationEnd);
            closeAnimationEnd = undefined;
        }
        dialog.classList.remove("is-closing");
        isClosing = false;
    });

    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
            closeDialog();
        }
    });

    clearButton.addEventListener("click", function () {
        entries = [];
        render();
    });

    window.siteErrorLog = {
        record: record
    };
}());
