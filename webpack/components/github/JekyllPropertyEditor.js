import React, {Component} from 'react';

var yaml = require('js-yaml');

class JekylParameter extends Component {
    constructor(props) {
        super(props)
        this.state = {
            value: this.props.value,
        }
    }

    onChange(event) {
        this.props.cb(this.props.name, event.target.value)
        this.setState({
            value: event.target.value
        })
    }

    render() {
        return <label>
            {this.props.name}:
            <input type="text" name={this.props.name} value={this.state.value} onChange={this.onChange.bind(this)}/>
        </label>
    }
}

class JekyllProperties extends Component {
    constructor(props) {
        //console.log(props)
        super(props)
        this.state = {
            configs: {},
            bla: 'bli'
        }
        this.props.repo.getContents('_config.yml', this._storeConfig.bind(this))
    }

    _storeConfig(error, data) {
        this.setState({
            configs: yaml.safeLoad(data),
        })
    }

    handleSubmit() {
        this.props.repo.setContents('_config.yml99', yaml.safeDump(this.state.configs))
        return false
    }

    updateConfig(key, value) {
        this.state.configs[key] = value
    }

    render() {
        var labels = []
        for (var key in this.state.configs)
            labels.push(
                <li key={key}>
                    <JekylParameter name={key} value={this.state.configs[key]} cb={this.updateConfig.bind(this)}/>
                </li>
            )
        return (
            <form >
                <ul>
                    {labels}
                </ul>
                <br/>
                <input type="button" value="Submit" onClick={this.handleSubmit.bind(this)}/>
            </form>
        )
    }
}
export default JekyllProperties