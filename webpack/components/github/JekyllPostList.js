import React, {Component} from 'react';

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
            return <option key={post} value={post}>{post}</option>
        })
        return <form>
            <select>
                {posts}
            </select>
            <input type="button" value="Nouveau"/>
        </form>
    }

}
export default JekyllPostList