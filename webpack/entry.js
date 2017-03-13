import React, { Component } from 'react'
import {render} from 'react-dom'
import Connect, {GoogleConnect} from './components/connect'
import GitHubMenu from './components/github'


function bootstrap(){
    var GoogleApi = new GoogleConnect()
    render(<Connect google={GoogleApi}/>, document.getElementById('connect-menu'))
    render(<GitHubMenu google={GoogleApi}/>, document.getElementById('admin-edit'));
}

if(window.attachEvent) {
    window.attachEvent('onload', bootstrap);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function(evt) {
            curronload(evt);
            bootstrap(evt);
        };
        window.onload = newonload;
    } else {
        window.onload = bootstrap;
    }
}

