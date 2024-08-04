require('dotenv').config()

const redirect_uri = 'http://localhost:3000/homePage';  // Adjust this path as necessary
var encoded_uri = encodeURI(redirect_uri)

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

const auth_url = 'https://accounts.spotify.com/authorize'
const TOKEN = 'https://accounts.spotify.com/api/token'
const PROFILETOKEN = 'https://api.spotify.com/v1/me'

function onPageLoad(){
    if(window.location.search.length > 0){
        // there is an access code
        let code = getCode() 
        console.log(code)  
        fetchAccessToken(code)
       } else{
        // there is no access code and needs to be redirected
        requestAuthorization()
       }
}

function requestAuthorization(){
    let url = auth_url
    url += "?client_id=" + clientId
    url += "&response_type=code"
    url += "&redirect_uri=" + encoded_uri
    url += "&show_dialogue=true"
    url += "&scope=user-read-private user-read-email user-top-read"
    window.location.href = url
}
function getCode(){
    let code = null
    const query = window.location.search
    if(query.length > 0){
        const urlParams = new URLSearchParams(query)
        code = urlParams.get('code')
    }
    return code
}
function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + clientId;
    body += "&client_secret=" + clientSecret;
    callAuthorizationApi(body)
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(clientId + ':' + clientSecret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
  let access_token 
  if (this.status === 200){
    var data = JSON.parse(this.responseText);
    console.log(data);
    access_token = data.access_token;
    let refresh_token = data.refresh_token;
    console.log(access_token)
  }
  else{
    console.log(JSON.parse(this.responseText));
  }
  usersTopItemsAPICall(access_token)
}
function usersTopItemsAPICall(access_token){
    var xhr = new XMLHttpRequest();
  
  xhr.open('GET', 'https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50', true);
  xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
  xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
          // Check the status code to ensure the request was successful
          if (xhr.status == 200) {
              // Parse the JSON response
              var data = JSON.parse(xhr.responseText);
              console.log(data);
              for (let i = 0; i < 50; i++){
                console.log(data.items[i].name)
              }
          } else {
              console.log('Request failed with status code ' + xhr.status);
          }
      }
  };
  xhr.send();
  }
