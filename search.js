// Add new searchable destinations here. Each entry is matched by title, description, and keywords.
var siteSearchItems = [
    {
        title: "My YouTube",
        description: "Visit my YouTube channel and watch my videos.",
        keywords: "youtube videos channel",
        href: "https://www.youtube.com/@Pizzalord01"
    },
    {
        title: "Moving Ball Animation",
        description: "Watch the moving ball animation.",
        keywords: "moving ball animation processing",
        href: "moving-ball.html"
    },
    {
        title: "Screwdriver Game",
        description: "Play the screwdriver project.",
        keywords: "screwdriver game processing",
        href: "screwdriver.html"
    },
    {
        title: "Poké Ball Project",
        description: "View the Poké Ball animation project.",
        keywords: "pokeball pokemon animation processing",
        href: "pokeball.html"
    },
    {
        title: "Minecraft Worlds",
        description: "Download my Java and Bedrock Minecraft worlds.",
        keywords: "minecraft worlds download java bedrock",
        href: "Minecraft Worlds.html"
    },
    {
        title: "My Socials",
        description: "Find my social media accounts.",
        keywords: "socials social media youtube tiktok instagram twitch reddit discord",
        href: "socials.html"
    },
    {
        title: "My TikTok",
        description: "Visit my TikTok profile.",
        keywords: "tiktok videos social",
        href: "https://www.tiktok.com/@callmecircuitbackup"
    },
    {
        title: "My Instagram",
        description: "Visit my Instagram profile.",
        keywords: "instagram photos social",
        href: "https://www.instagram.com/deadmemories4lif/"
    },
    {
        title: "My Twitch",
        description: "Visit my Twitch channel.",
        keywords: "twitch livestream social",
        href: "https://www.twitch.tv/pizzasgrave"
    },
    {
        title: "My Reddit",
        description: "Visit my Reddit profile.",
        keywords: "reddit social",
        href: "https://www.reddit.com/user/Impressive_Taro_1483/"
    },
    {
        title: "About Me",
        description: "Learn more about me.",
        keywords: "about xavier",
        href: "AboutMe.html"
    },
    {
        title: "Link.shrub",
        description: "My Link.shrub page, currently under construction.",
        keywords: "link shrub links under construction",
        href: "linkshrub.html"
    },
    {
        title: "Access Denied",
        description: "Visit the Access Denied page.",
        keywords: "access denied",
        href: "access-denied.html"
    },
    {
        title: "Old Processing Projects",
        description: "Browse my Processing projects and animations.",
        keywords: "processing projects animations games",
        href: "oldprocessinglinks.html"
    }
];

(function () {
    var form = document.getElementById("siteSearchForm");
    var input = document.getElementById("siteSearchInput");
    var results = document.getElementById("siteSearchResults");
    var status = document.getElementById("siteSearchStatus");
    var searchIndex = siteSearchItems.map(function (item) {
        return {
            item: item,
            text: (item.title + " " + item.description + " " + item.keywords).toLowerCase()
        };
    });

    if (!form || !input || !results || !status) {
        return;
    }

    function renderResults() {
        var query = input.value.toLowerCase().replace(/^\s+|\s+$/g, "");
        var terms = query ? query.split(/\s+/) : [];
        var matches = [];
        var index;

        results.textContent = "";
        results.hidden = true;
        status.textContent = "";

        if (terms.length === 0) {
            return;
        }

        searchIndex.forEach(function (searchRecord) {
            var matchesEveryTerm = terms.every(function (term) {
                return searchRecord.text.indexOf(term) !== -1;
            });

            if (matchesEveryTerm) {
                matches.push(searchRecord.item);
            }
        });

        if (matches.length === 0) {
            status.textContent = "nothing found";
            return;
        }

        results.hidden = false;
        status.textContent = matches.length + (matches.length === 1 ? " result found." : " results found.");

        for (index = 0; index < matches.length; index += 1) {
            var item = matches[index];
            var listItem = document.createElement("li");
            var link = document.createElement("a");
            var description = document.createElement("p");

            link.href = item.href;
            link.textContent = item.title;
            description.textContent = item.description;
            link.appendChild(description);
            listItem.appendChild(link);
            results.appendChild(listItem);
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        renderResults();
    });

    input.addEventListener("input", renderResults);
}());