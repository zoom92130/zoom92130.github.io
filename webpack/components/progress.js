import React, {Component} from 'react';

class Progress extends Component {

    constructor(props) {
        super(props)
        this.state = this.stateFromProps(this.props)
    }

    componentWillReceiveProps(newProps) {
        this.setState(this.stateFromProps(newProps))
    }

    stateFromProps(props) {
        var status
        if (!props.status.status){
            status = 'reset'
        } else {
            status = props.status.status
        }
        var state = {
            status: status,
            className: status,
            message: props.status.message,
            strong:  null,
        }
        if (state.status == 'error') {
            state.className = 'danger'
            if (!state.message) {
                state.message = 'Unknown error'
            }
            state.strong = 'Error';
        } else if (state.status == 'success') {
            state.strong = 'Success!'
        } else if (state.status == 'progress') {
            state.className = 'info'
            state.strong = <i className="fa fa-spinner fa-spin fa-3x fa-fw"/>
            if (!state.message) {
                state.message = 'En cours...'
            }
        }
        if(!state.message){
            state.message = ''
        }
        if (!state.strong){
            state.strong=''
        }
        state.className = "alert alert-" + state.className
        return state
    }

    render() {
        if (this.state.status != 'reset') {
            return <div className={this.state.className}>
                <strong>{this.state.strong}</strong> {this.state.message}
            </div>
        } else {
            return null
        }
    }
}
export default Progress