(function () {
    "use strict";

    var entries = [];
    var maxEntries = 50;
    var dialog;
    var report;
    var isClosing = false;
    var closeAnimationEnd;

    function sanitize(value) {
        return String(value || "Unknown")
            .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
            .replace(/https?:\/\/[^\s"'<>]+/gi, "[URL]")
            .replace(/\b(password|token|secret|authorization|api[_-]?key)\s*[:=]\s*\S+/gi, "$1=[redacted]")
            .slice(0, 300);
    }

    function safeErrorName(error) {
        var name = error && typeof error.name === "string" ? error.name : "";
        return /^[A-Za-z]{1,30}$/.test(name) ? name : "Unknown";
    }

    function safeSource(value) {
        if (!value) {
            return "";
        }

        try {
            var url = new URL(value, window.location.href);
            return (url.origin === window.location.origin ? "" : url.origin) + url.pathname;
        } catch (error) {
            return "[source unavailable]";
        }
    }

    function buildReport() {
        var lines = [
            "Website diagnostic report",
            "Time: " + new Date().toISOString(),
            "Page: " + window.location.origin + window.location.pathname,
            "Browser: " + navigator.userAgent,
            "Viewport: " + window.innerWidth + "x" + window.innerHeight,
            "Connection: " + (navigator.onLine ? "online" : "offline"),
            "",
            entries.length ? "Events:" : "No errors or compatibility issues captured."
        ];

        entries.forEach(function (entry, index) {
            var line = (index + 1) + ". " + entry.time + " [" + entry.category + "] " + entry.message;
            if (entry.source) {
                line += "\n   Source: " + entry.source;
                if (entry.line || entry.column) {
                    line += ":" + (entry.line || 0) + ":" + (entry.column || 0);
                }
            } else if (entry.line || entry.column) {
                line += "\n   Location: line " + (entry.line || 0) + ", column " + (entry.column || 0);
            }
            lines.push(line);
        });

        return lines.join("\n");
    }

    function render() {
        report.value = buildReport();
    }

    function record(category, message, source, line, column) {
        entries.push({
            time: new Date().toISOString(),
            category: sanitize(category),
            message: sanitize(message),
            source: safeSource(source),
            line: Number(line) || 0,
            column: Number(column) || 0
        });
        if (entries.length > maxEntries) {
            entries.shift();
        }
        if (dialog && dialog.open) {
            render();
        }
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

    function element(tagName, className, text) {
        var node = document.createElement(tagName);
        if (className) {
            node.className = className;
        }
        if (text) {
            node.textContent = text;
        }
        return node;
    }

    function initializeDialog() {
        var trigger = element("button", "basicButton site-error-trigger", "Error log");
        var content = element("div", "site-error-content");
        var header = element("div", "site-error-header");
        var title = element("h2", "", "Website error log");
        var closeButton = element("button", "basicButton site-error-close", "Close");
        var description = element(
            "p",
            "",
            "Recent errors and compatibility warnings from this page load. The report is created locally and does not include form contents, email addresses, URL query strings, or stack traces."
        );
        var instructions = element("p", "", "Use Ctrl+' on a keyboard or tap Error log on mobile.");
        var copyButton = element("button", "basicButton site-error-copy", "Copy report");
        var clearButton = element("button", "basicButton site-error-clear", "Clear log");
        var actions = element("div", "site-error-actions");
        var copyStatus = element("p", "site-error-copy-status");

        trigger.type = "button";
        trigger.setAttribute("aria-haspopup", "dialog");
        trigger.setAttribute("aria-controls", "siteErrorDialog");
        trigger.setAttribute("aria-keyshortcuts", "Control+Quote");

        dialog = element("dialog", "site-error-dialog");
        dialog.id = "siteErrorDialog";
        dialog.setAttribute("aria-labelledby", "siteErrorTitle");
        title.id = "siteErrorTitle";
        report = element("textarea", "site-error-report");
        report.setAttribute("aria-label", "Copyable website diagnostic report");
        report.readOnly = true;
        report.rows = 10;

        header.appendChild(title);
        header.appendChild(closeButton);
        actions.appendChild(copyButton);
        actions.appendChild(clearButton);
        content.appendChild(header);
        content.appendChild(description);
        content.appendChild(instructions);
        content.appendChild(report);
        content.appendChild(copyStatus);
        content.appendChild(actions);
        dialog.appendChild(content);
        document.body.appendChild(trigger);
        document.body.appendChild(dialog);

        function openDialog() {
            render();
            copyStatus.textContent = "";
            if (!dialog.open) {
                dialog.showModal();
            }
        }

        trigger.addEventListener("click", openDialog);
        closeButton.addEventListener("click", closeDialog);
        copyButton.addEventListener("click", function () {
            render();
            report.focus();
            report.select();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(report.value).then(function () {
                    copyStatus.textContent = "Report copied.";
                }, function () {
                    copyStatus.textContent = "Copy was blocked. The report is selected; use Copy from your browser menu.";
                });
            } else if (document.execCommand("copy")) {
                copyStatus.textContent = "Report copied.";
            } else {
                copyStatus.textContent = "The report is selected; use Copy from your browser menu.";
            }
        });
        clearButton.addEventListener("click", function () {
            entries = [];
            render();
            copyStatus.textContent = "Log cleared.";
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
    }

    window.addEventListener("error", function (event) {
        var target = event.target || event.srcElement;
        if (target && target !== window && target.tagName) {
            var resource = target.src || target.href || "";
            record(
                "Resource",
                "A " + target.tagName.toLowerCase() + " resource failed to load.",
                resource
            );
            return;
        }

        var error = event.error;
        record(
            "JavaScript",
            sanitizeErrorMessage(event.message, error),
            event.filename,
            event.lineno,
            event.colno
        );
    }, true);

    window.addEventListener("unhandledrejection", function (event) {
        var reason = event.reason;
        var message = reason && typeof reason.message === "string"
            ? reason.message
            : typeof reason === "string"
                ? reason
                : "An unhandled asynchronous error occurred.";
        record("Async", safeErrorName(reason) + ": " + message);
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
        if (dialog && dialog.open) {
            closeDialog();
        } else if (dialog) {
            render();
            dialog.showModal();
        }
    });

    function sanitizeErrorMessage(message, error) {
        var detail = message;
        if (!detail && error) {
            detail = safeErrorName(error) + ": " + error.message;
        }
        return detail || "A JavaScript error occurred.";
    }

    window.siteErrorLog = {
        record: record
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeDialog, { once: true });
    } else {
        initializeDialog();
    }
}());
