import React, {Component} from 'react';

class JekyllPostList extends Component {

    onChange(event) {
        var value = event.target.value
        if (value == "None")
            value = null
        if (this.props.onChange) {
            this.props.onChange('_posts/{0}'.format(value));
        }
    }

    render() {
        var posts = this.props.posts.map(function (post) {
            return <option key={post} value={post}>{post}</option>
        })
        return <select defaultValue="None" onChange={this.onChange.bind(this)}>
            <option key="none" disabled className="disabled" value="None">Sélectionnez un post</option>
            {posts}
        </select>
    }

}
export default JekyllPostList