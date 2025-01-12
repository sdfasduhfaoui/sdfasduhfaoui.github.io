function load(src) {
    return new Promise((resolve, reject) => {
        fetch(`/static/${(src === "/" || !src) ? "home" : src}.html`).then(response => {
            if (!response.ok)
                reject(response.status);
            else {
                response.text()
                    .then(html => {
                        resolve(html);
                    });
            }
        })
    })
}

function loadSinks() {
    return new Promise((resolve, reject) => {
        const sinks = document.querySelectorAll(".sink");
        const promises = [loadPage(source)];

        for (const sink of sinks) {
            promises.push(new Promise((res, rej) => {
                const src = sink.getAttribute("src");
                load(src)
                    .then(body => {
                        sink.outerHTML = body;
                        res();
                    })
                    .catch(() => {
                        rej();
                    })
            }))
        }

        Promise.allSettled(promises)
            .then(results => {
                for (const result of results) {
                    if (result.status !== "fulfilled") {
                        return reject();
                    }
                }
                resolve();
            })
    })
}

function loadButtons() {
    const buttons = document.querySelectorAll(":not(a).link");
    for (const button of buttons) {
        const href = button.getAttribute("href");
        button.onclick = function () {
            moveTo(href);
        }
    }
}

function loadPage(page) {
    new Promise(res => {
        load(page).then(body => {
            document.querySelector("#main").innerHTML = body;
            loadButtons();
            if (page === "/gallery")
                loadGallery();
            
            if (page === "/news" || page === "/gallery")
                loadTimeline();
            res();
        })
    })
}

function loadGallery() {
    fetch("/images/spec.json")
        .then(response => {
            response.json()
                .then(images => {
                    for (const image of images) {
                        const { username } = image;
                        for (const src of image.images) {
                            const display = document.createElement("div");
                            const imageElement = document.createElement("img");
                            imageElement.setAttribute("src", "/images/" + src);
                            display.appendChild(imageElement);
                            document.querySelector("#gallery").appendChild(display);
                        }
                    }
                })
        })
}

function loadTimeline() {

}

function moveTo(url) {
    window.history.pushState({}, "", url);
    loadPage(url);
}

window.onload = function () {
    loadSinks()
        .then(() => {
            loadButtons();
        })
        .catch(() => {
            console.error("error while loading sinks");
        })
}

window.onpopstate = function () {
    loadPage(window.location.pathname);
}