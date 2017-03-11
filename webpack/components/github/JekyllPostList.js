import React, {Component} from 'react';

class JekyllPost extends Component {
    render() {
        return <span>
            <span>{this.props.title}</span>
            <input type="button" value="Supprimer"/>
            </span>
    }
}

class JekyllPostList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            posts: [],
        };
        this.props.repo.listFilesInPath("_posts", this.storePosts.bind(this))
    }

    storePosts(error, posts) {
        if (error == null) {
            this.setState({
                posts: posts,
            })
        }
    }

    render() {
        var posts = this.state.posts.map(function (post) {
            return <li key={post}>
                <JekyllPost title={post} path={post}/>
            </li>
        })
        return <form>
            <ul>
                {posts}
                <input type="button" value="Nouveau"/>
            </ul>
        </form>
    }

}
export default JekyllPostList