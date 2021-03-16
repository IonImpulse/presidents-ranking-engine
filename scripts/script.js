const WIKI_API_URL = "https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&formatversion=2&prop=pageimages|pageterms&piprop=original&pilicense=any&titles=";

async function GetPortrait(pres_wiki_url) {
    const url_to_fetch = WIKI_API_URL + pres_wiki_url.substring(30);

    const response = await fetch(url_to_fetch);

    const wiki_json = await response.json();
    
    return wiki_json.query.pages[0].original.source;
}

async function LoadData() {
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

async function LoadPresURLS(pres_data) {
    console.log(pres_data);

    let img_holder = document.getElementById("choices-holder");
    
    let urls = [];

    for (i = 0; i < 46; i++) {
        urls.push(GetPortrait(pres_data[i].wiki_url));
    }

    urls = await Promise.all(urls);

    return urls;
}


async function main() {
    const pres_data = await LoadData()
    const urls = await LoadPresURLS(pres_data);

    document.getElementById("left-button").innerHTML = `<img src="${urls[0]}" width=300 /> ${pres_data[0].name}`;
    document.getElementById("right-button").innerHTML = `<img src="${urls[1]}" width=300 /> ${pres_data[1].name}`;
}

main();