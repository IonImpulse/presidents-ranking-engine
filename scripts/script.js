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

function return_left() {
    sessionStorage.setItem("last_answer", "left");
    main();
}

function return_right() {
    sessionStorage.setItem("last_answer", "right");
    main();
}

function mergeStep(left, right) {
    let arr = []
    // Break out of loop if any one of the array gets empty
    while (left.length && right.length) {
        // Pick the smaller among the smallest element of left and right sub arrays 
        if (sessionStorage.getItem("last_answer") == "left") {
            arr.push(left.shift())  
        } else {
            arr.push(right.shift()) 
        }
    }
    
    // Concatenating the leftover elements
    // (in case we didn't go through the entire left or right array)
    return [ ...arr, ...left, ...right ]
}

function mergeSort(array) {
    const half = array.length / 2
    
    // Base case or terminating case
    if(array.length < 2){
      return array 
    }
    
    const left = array.splice(0, half)
    return merge(mergeSort(left),mergeSort(array))
}


async function main() {
    const pres_data = await LoadData()
    const urls = await LoadPresURLS(pres_data);
    
    document.getElementById("left-button").innerHTML = `<img class="pres-pic" src="${urls[0]}"/> ${pres_data[0].name}`;
    document.getElementById("right-button").innerHTML = `<img class="pres-pic" src="${urls[1]}"/> ${pres_data[1].name}`;
}

main();