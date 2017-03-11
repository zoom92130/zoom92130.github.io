import React, {Component} from 'react';
import Modal from 'react-modal';
import JekyllProperties from './github/JekyllPropertyEditor';
import JekyllPostList from './github/JekyllPostList';
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
    constructor(api, user, repo, branch, createMsgCb) {
        this.api = api;
        this.branch = branch;
        this.user = user;
        this.repo = repo;
        this.createMsgCb = createMsgCb;
        return this
    }

    getContents(path, cb = null) {
        this.api.getRepo(this.user, this.repo).getContents(this.branch, path, true, function (error, data, _) {
            if (cb != null)
                cb(error, data)
        })
    }

    setContents(path, data, cb = null) {
        this.getContents(path, function (error, oldData) {
            if (error != null) {
                if (cb != null) {
                    cb(error)
                }
            } else if (oldData != data) {
                this.api.getRepo(this.user, this.repo).writeFile(this.branch, path, data, this.createMsgCb("updated {0}".format(path)), function (error, data, _) {
                    if (cb != null)
                        cb(error)
                })
            }
        }.bind(this))
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
        })

        this.state = {
            modalIsOpen: false,
            mode: 'content',
        };

        this.openModal = this.openModal.bind(this);
        this.afterOpenModal = this.afterOpenModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    componentWillMount() {
        Modal.setAppElement('body');
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

    render() {
        if (this.state.mode == 'content') {
            var content = <JekyllPostList repo={this.repo}/>
        } else {
            var content = <JekyllProperties repo={this.repo}/>
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
                </Modal>
            </div>

        )
    }
}

export default GitHubEditor;