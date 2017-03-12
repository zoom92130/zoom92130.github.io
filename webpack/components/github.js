import React, {Component, PropTypes} from 'react';
import Modal from 'react-modal';

import JekyllPropertyEditor from './jekyll/PropertyEditor';
import JekyllPostList from './jekyll/PostList';
import JekyllPostEditor from './jekyll/PostEditor';
import Progress from './progress';
var GitHubAPI = require('github-api');
var normalize = require('normalize-path');

String.prototype.format = function () {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

class Error {
    constructor(message) {
        this.message = message;
    }

    getMessage() {
        return this.message;
    }
}

class Repository {
    constructor(api, user, repo, branch, createMsgCb, postUpdateCb) {
        this.api = api
        this.branch = branch
        this.user = user
        this.repo = repo
        this.createMsgCb = createMsgCb
        this.postUpdateCb = postUpdateCb
        return this
    }

    _callback(cb, refresh=false){
        return function(error, data, request){
            if(error){
                error = new Error(error.message)
            }
            if(cb){
                cb(error, data)
            }
            if(refresh && this.postUpdateCb && !error){
                //setTimeout(this.postUpdateCb, 5000)
            }
        }.bind(this)
    }

    delete(path, cb=null){
        return this.api.getRepo(this.user, this.repo).deleteFile(this.branch, path, this._callback(cb, true))
    }

    getContents(path, cb = null) {
        return this.api.getRepo(this.user, this.repo).getContents(this.branch, path, true, this._callback(cb))
    }

    setContents(path, data, cb = null) {
        function write(error, oldData){
            // if we have an error, the current file is new
            // if we have no error, it is an update
            var message
            var refresh
            if (error != null) {
                refresh = true
                message = "created {0}".format(path)
            } else if (oldData != data) {
                refresh = false
                message = "updated {0}".format(path)
            }
            this.api.getRepo(this.user, this.repo).writeFile(this.branch, path, data, this.createMsgCb(message), this._callback(cb, refresh))
        }
        this.getContents(path, this._callback(write.bind(this)))
    }

    _listFilesInPath(repo, commit, path, cb = null) {
        var slashIndex = path.indexOf("/");
        var searched = null;
        if (path.length == 0) {
            repo.getTree(commit).then(function (response) {
                if (response.status / 200 == 1) {
                    cb(null, response.data.tree.map(function (elt) {
                        return elt.path;
                    }))
                } else {
                    cb(new Error(response.data), null)
                }
            });

        } else {
            if (slashIndex == 0) {
                cb(new Error("Invalid search path"), null);
                return
            } else if (slashIndex == -1) {
                searched = path;
                path = "";
            } else {
                searched = path.substring(0, slashIndex);
                path = path.substring(slashIndex + 1, path.length)
            }
            repo.getTree(commit).then(function (response) {
                if (response.status / 200 == 1) {
                    for (var i in response.data.tree) {
                        var tree = response.data.tree[i];
                        if (tree.path == searched) {
                            this._listFilesInPath(repo, tree.sha, path, cb)
                        }
                    }
                } else {
                    cb(new Error(response.data), null)
                }
            }.bind(this));
        }
    }

    listFilesInPath(path, cb = null) {
        var repo = this.api.getRepo(this.user, this.repo);
        path = normalize(path);
        if (path.startsWith("./")) {
            path = path.substring(2, path.length)
        }
        this._listFilesInPath(repo, this.branch, path, cb);
    }
}

const customStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    },
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        height: '90%',
    }
};

class GitHubEditor extends Component {
    constructor(props) {
        super(props)
        this.GitHubAPI = new GitHubAPI({
            token: null
        })
        this.repo = new Repository(this.GitHubAPI, 'zoom92130', 'zoom92130.github.io', 'master', function (message) {
            return "Thibault Jamet {0} via web interface".format(message)
        }, this.updatePostList.bind(this))

        this.state = {
            modalIsOpen: true,
            mode: 'content',
            progress: {},
            posts: [],
        };

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
    }

    updatePostList(){
        this.setProgressStatus('progress', 'Chargement de la liste des posts...')
        this.repo.listFilesInPath("_posts", this.storePosts.bind(this))
    }

    componentDidMount(){
        this.updatePostList()
    }

    storePosts(error, posts) {
        if (error == null) {
            this.setProgressStatus('success', 'Liste des posts chargée.')
            this.setState({
                posts: posts,
            })
        } else {
            this.setProgressStatus('error', error.message)
        }
    }

    openModal() {
        this.setState({modalIsOpen: true});
    }

    afterOpenModal() {
    }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    switchMode(value) {
        this.setState({
            mode: value
        });
    }

    postSelected(path) {
        this.setState({
            postEdited: path,
        })
    }

    setProgressStatus(status, message=null){
        this.setState({
            progress: {
                status: status,
                message: message,
            },
        })
    }

    onPostListChange(){
        this.setState({
            refreshTime: new Date(),
        })
    }

    render() {
        if (this.state.mode == 'content') {
            var content = <section>
                <JekyllPostList posts={this.state.posts} onChange={this.postSelected.bind(this)}/>
                <a className="btn btn-default" onClick={event => this.postSelected(null)}>
                    <i className="fa fa-plus fa-2x" aria-hidden="true"/>
                </a>
                <JekyllPostEditor  setProgressStatus={this.setProgressStatus.bind(this)} path={this.state.postEdited} loader={this.repo}/>
            </section>

        } else {
            var content = <section>
                <JekyllPropertyEditor setProgressStatus={this.setProgressStatus.bind(this)} loader={this.repo}/>
            </section>
        }
        // <button onClick={this.openModal}>Open Modal</button>
        return (
            <div>
                <Modal
                    isOpen={this.state.modalIsOpen}
                    onAfterOpen={this.afterOpenModal}
                    onRequestClose={this.closeModal}
                    style={customStyles}
                    contentLabel="Content editor"
                >
                    <i className="fa fa-times close" aria-hidden="true" onClick={this.closeModal}/>
                    <div>
                        <input type="button" onClick={function () {
                            this.switchMode('content')
                        }.bind(this)} value="Editer le contenu"/>
                        <input type="button" onClick={function () {
                            this.switchMode('properties')
                        }.bind(this)} value="Configurer"/>
                    </div>
                    {content}
                    <Progress status={this.state.progress}/>
                </Modal>
            </div>

        )
    }
}

export default GitHubEditor;