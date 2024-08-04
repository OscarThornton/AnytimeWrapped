document.addEventListener('DOMContentLoaded', async () => {
    await onPageLoad(); // Ensure onPageLoad is called after clientId and clientSecret are available
});

async function onPageLoad(){
    clientId = await getSpotifyClientId();  // Ensure these are awaited
    clientSecret = await getSpotifyClientSecret();
    if (window.location.search.length > 0) {
        handleRedirect();
    }
}

// spotify developer credentials
let clientId, clientSecret; // Declare variables outside

var access_token = null;

const redirect_uri = 'http://localhost:3000/homePage';  // Adjust this path as necessary

// List of API urls
const AUTHORISE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";
const PROFILETOKEN = 'https://api.spotify.com/v1/me';
const TOPITEMS = 'https://api.spotify.com/v1/me/top/';

async function getSpotifyClientId() {
    const response = await fetch('/api/spotify-client-id');
    const data = await response.json();
    return data.clientId;
}

async function getSpotifyClientSecret() {
    const response = await fetch('/api/spotify-client-secret');
    const data = await response.json();
    return data.clientSecret;
}

async function requestAuthorisation() {
    const clientId = await getSpotifyClientId();
    const redirect_uri = 'http://localhost:3000/homePage';  // Adjust this path as necessary
    localStorage.setItem("client_id", clientId);
    let url = "https://accounts.spotify.com/authorize";
    url += "?client_id=" + clientId;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private user-top-read";
    window.location.href = url;
}

function handleRedirect(){
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);
}

function getCode(){
    let code = null;
    const query = window.location.search;
    if(query.length > 0){
        const urlParams = new URLSearchParams(query);
        code = urlParams.get('code');
    }
    return code;
}

async function fetchAccessToken(code) {
    const clientId = await getSpotifyClientId();
    const clientSecret = await getSpotifyClientSecret();
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + clientId;
    body += "&client_secret=" + clientSecret;
    callAuthorisationApi(body);
}

async function callAuthorisationApi(body){
    const clientId = await getSpotifyClientId();
    const clientSecret = await getSpotifyClientSecret();
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret));
    xhr.send(body);
    xhr.onload = handleAuthorisationResponse;
}

async function handleAuthorisationResponse(){
    const clientId = await getSpotifyClientId();
    const clientSecret = await getSpotifyClientSecret();
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
    } else {
        console.log(this.responseText);
        console.log("hello");
        console.log(clientId)
        alert(clientId);
        alert(clientSecret)
    }
}

function getUsersTopItems() {        
    var type = document.getElementById("type");
    var timeRange = document.getElementById("timeRange");
    var limit = document.getElementById("limit");
    
    var selectedType = type.value;
    var selectedTimeRange = timeRange.value;
    var selectedLimit = limit.value;
    const url = `${TOPITEMS}${selectedType}?time_range=${selectedTimeRange}&limit=${selectedLimit}`;

    if (selectedType == "tracks") {
        callApi('GET', url, null, usersTopTracksAPICall);
    } else {
        callApi('GET', url, null, usersTopArtistsAPICall);
    }
}

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}

function usersTopArtistsAPICall(){
    document.getElementById("listOfArtists").innerHTML = "";
    var limit = document.getElementById("limit");
    var selectedLimit = limit.value;

    var container = document.getElementById("divOfistOfArtists");
    var div = container.querySelector("#listOfArtists");
    div.innerHTML = "";

    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        for (var i = 0; i < selectedLimit; i++) {
            var artistListElement = document.createElement('li');
            artistListElement.textContent = i + 1 + ": " + data.items[i].name + " - ";
            var image = document.createElement("img");
            image.src = data.items[i].images[0].url;
            image.width = data.items[i].images[0].width / 3;
            image.height = data.items[i].images[0].height / 3;
            image.height = 213.33;
            image.width = image.height;
            artistListElement.appendChild(image);
            div.appendChild(artistListElement);
        }
    } else {
        console.log('Request failed with status code ' + this.status);
        console.log(this.message);
    }
}

function usersTopTracksAPICall(){
    document.getElementById("listOfArtists").innerHTML = "";
    var limit = document.getElementById("limit");
    var selectedLimit = limit.value;

    var container = document.getElementById("divOfistOfArtists");
    var div = container.querySelector("#listOfArtists");
    div.innerHTML = "";

    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        for (var i = 0; i < selectedLimit; i++) {
            var artistListElement = document.createElement('li');
            artistListElement.textContent = i + 1 + ": " + data.items[i].name + " - " + data.items[i].artists[0].name;
            var image = document.createElement("img");
            image.src = data.items[i].album.images[0].url;
            image.width = data.items[i].album.images[0].url.width / 3;
            image.height = data.items[i].album.images[0].url.height / 3;
            image.height = 213.33;
            image.width = image.height;
            artistListElement.appendChild(image);
            div.appendChild(artistListElement);
        }
    } else {
        console.log('Request failed with status code ' + this.status);
        console.log(this.message);
    }
}

// clear the list and re-add the filler text
function clearList(){
    document.getElementById("listOfArtists").innerHTML = "";
    var newListItem = document.createElement("li");
    var newHeader = document.createElement("h3");
    newHeader.textContent = "Find your top artists and tracks using the filters above!";
    newListItem.appendChild(newHeader);
    document.getElementById("listOfArtists").appendChild(newListItem);
}
