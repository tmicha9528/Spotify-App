const express = require('express');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
//var client_id = 'ae0c0a2a9f0d4ada95721fc5258f4c7a';
//var client_secret = '713126fb61124da593b1d07a20eb265e';

const app = express();
app.use(cors());

app.get('/albums', function (req, res) {

    const getAuthorization = new Promise(function (resolve, reject) {
        const url = 'https://accounts.spotify.com/api/token';
        return axios.post(url, qs.stringify({ 'grant_type': 'client_credentials' }), {
            headers: {
                'Authorization': 'Basic YWUwYzBhMmE5ZjBkNGFkYTk1NzIxZmM1MjU4ZjRjN2E6NzEzMTI2ZmI2MTEyNGRhNTkzYjFkMDdhMjBlYjI2NWU',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => {
            return resolve(response.data.access_token);
        }).catch((error) => {
            console.log(error);
            reject(error);
        })
    });

    const getArtistId = new Promise(function (resolve, reject) {
        let accessToken;
        return getAuthorization
            .then(access_token => {
                accessToken = access_token;
                return axios.get(`https://api.spotify.com/v1/search?q=${artist}&type=artist`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${access_token}`,
                        'Content-Type': 'application/json'
                    }
                });
            })
            .then((response) => {
                var name = artist.toLowerCase();
                if (response.data.artists.items[0].name.toLowerCase() == name) {
                    listOfAlbums[0] = {
                        'artist': response.data.artists.items[0].name
                    }
                    return resolve({ accessToken: accessToken, artistId: response.data.artists.items[0].id });
                }
                else {
                    for (let i = 0; i < response.data.artists.items.length; i++) {
                        if (response.data.artists.items[i].name.toLowerCase() == name) {
                            listOfAlbums[0] = {
                                'artist': response.data.artists.items[i].name
                            }
                            return resolve({ accessToken: accessToken, artistId: response.data.artists.items[i].id });
                        }
                    }
                    listOfAlbums[0] = {
                        'artist': response.data.artists.items[0].name
                    }
                    return resolve({ accessToken: accessToken, artistId: response.data.artists.items[0].id });
                }
            }).catch((error) => {
                console.log(error);
                reject(error);
            });
    });

    const getAlbums = new Promise((resolve, reject) => {
        return getArtistId
            .then((result) => {
                url = `https://api.spotify.com/v1/artists/${result.artistId}/albums?limit=50`;
                return axios.get(url, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${result.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }).then((response) => {
                    return resolve(JSON.parse(JSON.stringify(response.data)));
                }).catch((error) => {
                    console.log(error);
                    reject(error);
                });
            })
            .catch(error => {
                console.log(error);
                reject(error);
            })
    });

    const formAlbums = function (name, year, url, type, group, id) {
        listOfAlbums[index++] = {
            'name': name,
            'year': year,
            'url': url,
            'type': type,
            'group': group,
            'id': id
        }
        return listOfAlbums;
    }

    listOfAlbums = [];
    index = 1;
    res.set('Content-Type', 'application/json')
    artist = req.query.artist;

    return getAlbums
        .then(albums => {
            for (let i = 0; i < albums.items.length; i++) {
                albumName = albums.items[i].name;
                albumYear = albums.items[i].release_date.substring(0, 4);
                albumImage = albums.items[i].images[0].url;
                albumType = albums.items[i].album_type;
                albumGroup = albums.items[i].album_group;
                albumId = albums.items[i].id;
                formAlbums(albumName, albumYear, albumImage, albumType, albumGroup, albumId);
            }
            res.send(listOfAlbums);
        })
        .catch(error => {
            console.log(error);
            reject(error);
        });
});

app.listen(8000, function () {
    console.log("Running on port 8000");
});