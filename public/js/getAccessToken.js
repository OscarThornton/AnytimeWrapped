function onPageLoad(){
    getAccessToken()
}

function getAccessToken(){
let url = 'https://accounts.spotify.com/api/token';

let data = new URLSearchParams();
data.append('client_id', '773444e5eaec4043b0af2bdf16c67711');
data.append('client_secret', '6e2f362e6cd447bd9f376ccf5c7f0b5a');
data.append('grant_type', 'client_credentials');

let xhr = new XMLHttpRequest();
xhr.open('POST', url, true);
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            let access_token = response.access_token;
            console.log(access_token);
        } else {
            console.error(`Error: ${xhr.status} - ${xhr.responseText}`);
        }
    }
};

xhr.send(data);
}
