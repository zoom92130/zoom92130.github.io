import React, {Component, PropTypes} from 'react';

var ClientOAuth2 = require('client-oauth2')

class GoogleConnect {
    constructor() {
        this.ready = false
        this.gapi = window.gapi
        function started(){
            this.gapi.auth2.getAuthInstance().isSignedIn.listen(this.listenSignedIn.bind(this))
            this.ready = true
            this.callAllCbs(this.readyCbs)
        }
        this.readyCbs = []
        this.loginCbs = []
        this.logoutCbs = []
        function start() {
            // 2. Initialize the JavaScript client library.
            this.gapi.client.init({
                'discoveryDocs': ['https://people.googleapis.com/$discovery/rest'],
                // clientId and scope are optional if auth is not required.
                'clientId': '864956616548-r2fl09btdthmd2bq5oloco4d7ljm4hlh.apps.googleusercontent.com',
                'scope': 'profile',
                'accesstype': 'offline',
            }).then(started.bind(this))
        }
        window.gapi.load("client", start.bind(this))
    }

    callAllCbs(cbs){
        for (var i in cbs){
            cbs[i]()
        }
    }

    registerCallbacks(readyCallback, loginCallback, logoutCallback){
        console.log('cb: ',readyCallback)
        this.readyCbs = this.readyCbs.concat(readyCallback)
        this.loginCbs = this.loginCbs.concat(loginCallback)
        this.logoutCbs = this.logoutCbs.concat(logoutCallback)
    }

    listenSignedIn(signedIn){
        if (signedIn){
            this.callAllCbs(this.loginCbs)
        }else {
            this.callAllCbs(this.logoutCbs)
        }
    }

    login() {
        console.log(window.gapi.auth2.getAuthInstance().isSignedIn.get())
        if (window.gapi.auth2.getAuthInstance().isSignedIn.get()){
            this.user = this.gapi.auth2.getAuthInstance().currentUser.get()
            return
        }
        function loggedIn (user){
            console.log("success", user)
            this.user = user
        }
        function onError (error){
            console.log(error)
        }
        this.gapi.auth2.getAuthInstance().signIn().then(loggedIn.bind(this), onError)
    }

    logout() {
        function loggedOut (){
            console.log("success")
        }
        function onError (error){
            console.log(error)
        }
        this.gapi.auth2.getAuthInstance().signOut().then(loggedOut, onError)
    }
    getName(){
        return this.user.getBasicProfile().getName()
    }
}



class GoogleConnectComponent extends Component{
    constructor(props) {
        super(props)
        this.state = {}
        this.google = this.props.google
        this.google.registerCallbacks(this.onClientReady.bind(this), this.onLogIn.bind(this), this.onLogOut.bind(this))
        this.state.ready = this.google.ready
        console.log(this, this.state)
    }

    onClientReady(){
        console.log('ready', this)
        this.setState({
            ready: true,
        })
    }

    onLogIn(){
        console.log(this.toString())
        this.setState({
            loggedin: true,
            name: this.google.getName(),
        })
    }

    onLogOut(){
        this.setState({
            loggedin: false,
            name: null,
        })
    }

}

class Connect extends GoogleConnectComponent {

    render() {
        console.log(this.state)
        if (!this.state.ready){
            return null
        }
        if (this.state.loggedin){
            return <a className="page-scroll" onClick={function () {
                this.google.logout()
            }.bind(this)}>
                {this.state.name} <i className="fa fa-sign-out" aria-hidden="true"/>
            </a>
        }
        return <a className="page-scroll" onClick={function () {
            this.google.login()
        }.bind(this)}>
            <i className="fa fa-sign-in" aria-hidden="true"/>
        </a>
    }
}
export {GoogleConnectComponent, GoogleConnect}
export default Connect