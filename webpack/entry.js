import React, { Component } from 'react';
import {render} from 'react-dom';
import GitHubEditor from './components/github';


function bootstrap(){
    render(<GitHubEditor />, document.getElementById('github-editor'));
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

