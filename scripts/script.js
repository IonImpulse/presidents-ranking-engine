const WIKI_API_URL = "https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages|pageterms&piprop=original&pilicense=any&titles=";

async function GetPortrait(pres_wiki_url) {
    const url_to_fetch = WIKI_API_URL + pres_wiki_url.substring(30);

    const response = await fetch(url_to_fetch);
    const wiki_json = await response.json();
    
    return wiki_json.query.pages[0].original.source;
}

async function load_data() {
    return new Promise((resolve, reject) => {
        Papa.parse("https://raw.githubusercontent.com/IonImpulse/presidents-ranking-engine/main/data/USPresidents.csv", {
            download: true,
            dynamicTyping: true,
            worker: true,
            header: true,
            complete (results, file) {
                resolve(results.data)
            },
            error (err, file) {
                reject(err)
            }
        });
    });
}