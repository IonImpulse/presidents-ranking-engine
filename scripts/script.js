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
            complete(results, file) {
                resolve(results.data)
            },
            error(err, file) {
                reject(err)
            }
        });
    });
}

async function LoadPresURLS(pres_data) {
    console.log(pres_data);

    let img_holder = document.getElementById("choices-holder");

    let urls = [];

    for (i = 0; i < pres_data.length; i++) {
        urls.push(GetPortrait(pres_data[i].wiki_url));
    }

    urls = await Promise.all(urls);

    return urls;
}


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

var items = [],
    prepItems = function (list) {
        list = list.map(function (item) {
            return [item];
        });
        items = list.sort(function () {
            return Math.random() > 0.5;
        }).reverse();
    };

var listOne = [], listTwo = [], joined = [],
    joinRunningTotal = 0;

function nextItems() {
    const pres_data = JSON.parse(sessionStorage.getItem("pres_data"));
    const urls = JSON.parse(sessionStorage.getItem("pres_urls"));

    let remaining = listOne.length + listTwo.length;

    // If there are items left in the lists we're sorting, queue them up to get sorted
    if (remaining > 0) {
        if (listTwo.length === 0) {
            while (listOne.length > 0) {
                joined.push(listOne.shift());
            }
            items.push(joined);
            joinRunningTotal += joined.length;
            nextItems();
            return;
        } else if (listOne.length === 0) {
            while (listTwo.length) {
                joined.push(listTwo.shift());
            }
            items.push(joined);
            joinRunningTotal += joined.length;
            nextItems();
        } else {
            var e1 = listOne[0],
                e2 = listTwo[0];

            let left_card = document.getElementById("left-button");
            let right_card = document.getElementById("right-button");
            left_card.innerHTML = `<img class="pres-pic" src="${urls[e1]}"/> ${pres_data[e1].name}`;
            right_card.innerHTML = `<img class="pres-pic" src="${urls[e2]}"/> ${pres_data[e2].name}`;
            return;
        }
    } else {
        if (items.length > 1) {
            listOne = items.shift();
            listTwo = items.shift();
            joined = [];
            nextItems();
            return;
        } else {
            // We're done, we only have one array left, and it's sorted

            items = items[0].filter(function (element) {
                return element !== undefined;
            });

            console.log(items);

            document.location = document.location.href + '/' + items.join("+");
            
            start();
        }
    }
}

selected = function (which) {
    switch (which) {
        case 'left':
            joined.push(listTwo.shift());
            break;
        case 'right':
            joined.push(listOne.shift());
            break;
    }

    nextItems();
};

async function start() {
    let show_list = false;
    
    if (document.location.href.contains("+")) {
        const pres_list = document.location.href.split("/").pop().split("+");
        
        document.getElementById("choices-holder").innerHTML = "";
        document.getElementById("pres-table-holder")

        show_list = true;
    }
    
    console.log("Loading data...");

    const pres_data = await LoadData();
    const urls = await LoadPresURLS(pres_data);

    

    let sort_keys = [];
    for (i = 0; i < pres_data.length; i++) {
        sort_keys.push(i);
    }

    sessionStorage.setItem("pres_data", JSON.stringify(pres_data));
    sessionStorage.setItem("pres_urls", JSON.stringify(urls));

    const totalJoin = (function () {
        var arr = [],
            total = 0;

        for (var i = 0; i < pres_data.length; ++i) {
            arr.push(1);
        }

        while (arr.length > 1) {
            var a = arr.pop(),
                b = arr.pop(),
                c = a + b;
            total += c;
            arr.unshift(c);
        }

        return total;
    })();


    console.log("Loaded data!");

    prepItems(sort_keys);

    console.log(sort_keys);

    list = sort_keys;

    nextItems();

    UTIF.replaceIMG();

}

start();